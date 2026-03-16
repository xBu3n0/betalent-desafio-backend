import { test } from '@japa/runner'
import Product from '#models/transactions/product'
import { ProductFactory } from '#database/factories/product_factory'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'
import {
  cleanupTransactionsDatabase,
  runAceCommand,
} from '#tests/functional/services/transactions/test_utils'

const PRODUCTS_BASE_URL = '/api/v1/products'
const MISSING_PRODUCT_ID = 999999

test.group('ProductsController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('rejects guests when listing products', async ({ client }) => {
    // given

    // when
    const response = await client.get(PRODUCTS_BASE_URL)

    // then
    response.assertStatus(401)
  })

  test('lists products for authenticated users ordered by name', async ({ client, assert }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const second = await ProductFactory.merge({ name: 'Notebook', amount: '15.50' }).create()
    const first = await ProductFactory.merge({ name: 'Course', amount: '99.90' }).create()

    // when
    const response = await client.get(PRODUCTS_BASE_URL).loginAs(user)

    // then
    response.assertStatus(200)

    const { data: products } = response.body()

    assert.deepEqual(products, [
      {
        id: first.id,
        name: first.name,
        amount: first.amount,
      },
      {
        id: second.id,
        name: second.name,
        amount: second.amount,
      },
    ])
  })

  test('creates a product for managers', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client.post(PRODUCTS_BASE_URL).loginAs(manager).json({
      name: 'Premium Support',
      amount: '249.99',
    })

    // then
    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        name: 'Premium Support',
        amount: '249.99',
      },
    })
  })

  test('rejects regular users when creating a product', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.post(PRODUCTS_BASE_URL).loginAs(user).json({
      name: 'Premium Support',
      amount: '249.99',
    })

    // then
    response.assertStatus(403)
  })

  test('returns validation error when the product payload is invalid', async ({
    client,
    assert,
  }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()

    // when
    const response = await client.post(PRODUCTS_BASE_URL).loginAs(finance).json({
      name: '  ',
      amount: '249.9',
    })

    // then
    response.assertStatus(422)

    const body = response.body() as unknown as {
      errors: Array<{ field?: string }>
    }

    assert.includeMembers(
      body.errors.map((error) => error.field).filter(Boolean),
      ['name', 'amount']
    )
  })

  test('shows a product for authenticated users', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const product = await ProductFactory.merge({ name: 'Notebook', amount: '15.50' }).create()

    // when
    const response = await client.get(`${PRODUCTS_BASE_URL}/${product.id}`).loginAs(user)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: product.id,
        name: product.name,
        amount: product.amount,
      },
    })
  })

  test('updates a product for finance users', async ({ client, assert }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const product = await ProductFactory.merge({ name: 'Notebook', amount: '15.50' }).create()

    // when
    const response = await client.patch(`${PRODUCTS_BASE_URL}/${product.id}`).loginAs(finance).json({
      name: 'Notebook Pro',
      amount: '29.90',
    })

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: product.id,
        name: 'Notebook Pro',
        amount: '29.90',
      },
    })

    const updatedProduct = await Product.findOrFail(product.id)
    assert.equal(updatedProduct.name, 'Notebook Pro')
    assert.equal(updatedProduct.amount, '29.90')
  })

  test('rejects regular users when updating a product', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const product = await ProductFactory.create()

    // when
    const response = await client.patch(`${PRODUCTS_BASE_URL}/${product.id}`).loginAs(user).json({
      name: 'Forbidden Update',
      amount: '19.90',
    })

    // then
    response.assertStatus(403)
  })

  test('returns not found when updating a missing product', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()

    // when
    const response = await client
      .patch(`${PRODUCTS_BASE_URL}/${MISSING_PRODUCT_ID}`)
      .loginAs(finance)
      .json({
        name: 'Notebook Pro',
        amount: '29.90',
      })

    // then
    response.assertStatus(404)
  })

  test('deletes a product for managers', async ({ client, assert }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const product = await ProductFactory.create()

    // when
    const response = await client.delete(`${PRODUCTS_BASE_URL}/${product.id}`).loginAs(manager)

    // then
    response.assertStatus(200)
    response.assertBody({
      message: 'Product removed successfully',
    })
    assert.isNull(await Product.find(product.id))
  })

  test('rejects regular users when deleting a product', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const product = await ProductFactory.create()

    // when
    const response = await client.delete(`${PRODUCTS_BASE_URL}/${product.id}`).loginAs(user)

    // then
    response.assertStatus(403)
  })
})

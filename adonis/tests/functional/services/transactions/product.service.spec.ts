import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import ProductService from '#services/transactions/product.service'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import Product from '#models/transactions/product'
import { ProductFactory } from '#database/factories/product_factory'
import { cleanupTransactionsDatabase, runAceCommand } from './test_utils.js'

const MISSING_PRODUCT_ID = 999999

async function makeService() {
  return app.container.make(ProductService)
}

async function makeProductInput() {
  const product = await ProductFactory.make()

  return {
    name: product.name,
    amount: product.amount,
  }
}

test.group('ProductService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('creates a product', async ({ assert }) => {
    // given
    const service = await makeService()
    const input = await makeProductInput()

    // when
    const created = await service.create(input)

    // then
    assert.equal(created.name.value, input.name)
    assert.equal(created.amount.value, input.amount)
  })

  test('updates an existing product', async ({ assert }) => {
    // given
    const service = await makeService()
    const product = await ProductFactory.create()
    const input = await makeProductInput()

    // when
    const updated = await service.update(product.id, input)

    // then
    assert.equal(updated.id.value, product.id)
    assert.equal(updated.name.value, input.name)
    assert.equal(updated.amount.value, input.amount)
  })

  test('returns not found when trying to update a missing product', async ({ assert }) => {
    // given
    const service = await makeService()
    const input = await makeProductInput()

    // when
    const updateMissingProduct = () => service.update(MISSING_PRODUCT_ID, input)

    // then
    await assert.rejects(updateMissingProduct, ProductNotFoundException)
  })

  test('lists products', async ({ assert }) => {
    // given
    const service = await makeService()
    const first = await ProductFactory.create()
    const second = await ProductFactory.create()

    // when
    const listedProducts = await service.listProducts()
    const listedNames = listedProducts.map((product) => product.name.value)

    // then
    assert.includeMembers(listedNames, [first.name, second.name])
  })

  test('fetches a product by id', async ({ assert }) => {
    // given
    const service = await makeService()
    const product = await ProductFactory.create()

    // when
    const byId = await service.getById(product.id)

    // then
    assert.equal(byId.name.value, product.name)
    assert.equal(byId.amount.value, product.amount)
  })

  test('deletes a product', async ({ assert }) => {
    // given
    const service = await makeService()
    const product = await ProductFactory.create()

    // when
    await service.delete(product.id)

    // then
    const deletedProduct = await Product.find(product.id)
    assert.isNull(deletedProduct)
  })

  test('returns not found when product id does not exist', async ({ assert }) => {
    // given
    const service = await makeService()

    // when
    const getMissingProduct = () => service.getById(MISSING_PRODUCT_ID)

    // then
    await assert.rejects(getMissingProduct, ProductNotFoundException)
  })
})

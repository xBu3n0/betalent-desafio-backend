import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'

const longProductName = 'a'.repeat(256)

test.group('ProductName Primitive', () => {
  test('accepts valid product names')
    .with(['Course', 'Notebook', 'Premium Subscription'])
    .run(({ assert }, validName) => {
      // given
      const input = validName

      // when
      const productName = ProductName.create(input)

      // then
      assert.equal(productName.value, input)
    })

  test('rejects invalid product names')
    .with(['', '   ', longProductName])
    .run(({ assert }, invalidName) => {
      // given
      const input = invalidName

      // when
      const createInvalidProductName = () => ProductName.create(input)

      // then
      assert.throws(createInvalidProductName, InvalidDomainException)
    })
})

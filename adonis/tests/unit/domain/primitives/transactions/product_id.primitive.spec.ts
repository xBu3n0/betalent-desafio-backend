import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'

test.group('ProductId Primitive', () => {
  test('accepts valid product identifiers')
    .with([1, 2, 100, 12345])
    .run(({ assert }, validId) => {
      // given
      const input = validId

      // when
      const productId = ProductId.create(input)

      // then
      assert.equal(productId.value, input)
    })

  test('rejects invalid product identifiers')
    .with([0, 1.2, -1])
    .run(({ assert }, invalidId) => {
      // given
      const input = invalidId

      // when
      const createInvalidProductId = () => ProductId.create(input)

      // then
      assert.throws(createInvalidProductId, InvalidDomainException)
    })
})

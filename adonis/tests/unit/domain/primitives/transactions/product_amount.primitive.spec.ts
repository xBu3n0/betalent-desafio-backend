import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'

test.group('ProductAmount Primitive', () => {
  test('accepts valid product amounts in cents')
    .with([0, 1, 1000, 99999])
    .run(({ assert }, validAmount) => {
      // given
      const input = validAmount

      // when
      const amount = ProductAmount.create(input)

      // then
      assert.equal(amount.value, input)
    })

  test('rejects invalid product amounts')
    .with([-1, 10.5])
    .run(({ assert }, invalidAmount) => {
      // given
      const input = invalidAmount

      // when
      const createInvalidAmount = () => ProductAmount.create(input)

      // then
      assert.throws(createInvalidAmount, InvalidDomainException)
    })
})

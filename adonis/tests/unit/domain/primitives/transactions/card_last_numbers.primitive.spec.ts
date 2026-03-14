import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'

test.group('CardLastNumbers Primitive', () => {
  test('accepts valid last four digits')
    .with(['1234', '0000', '9999'])
    .run(({ assert }, validValue) => {
      // given
      const input = validValue

      // when
      const cardLastNumbers = CardLastNumbers.create(input)

      // then
      assert.equal(cardLastNumbers.value, input)
    })

  test('rejects invalid last four digits')
    .with(['123', '12345', '12a4', 'abcd'])
    .run(({ assert }, invalidValue) => {
      // given
      const input = invalidValue

      // when
      const createInvalidCardLastNumbers = () => CardLastNumbers.create(input)

      // then
      assert.throws(createInvalidCardLastNumbers, InvalidDomainException)
    })
})

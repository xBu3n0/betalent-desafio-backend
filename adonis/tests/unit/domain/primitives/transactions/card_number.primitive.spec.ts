import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { CardNumber } from '#domain/primitives/transactions/card_number.primitive'

test.group('CardNumber Primitive', () => {
  test('accepts valid card numbers')
    .with(['4111111111111111', '5569000000006063'])
    .run(({ assert }, validValue) => {
      // given
      const input = validValue

      // when
      const cardNumber = CardNumber.create(input)

      // then
      assert.equal(cardNumber.value, input)
    })

  test('rejects invalid card numbers')
    .with(['411111111111111', '41111111111111111', '411111111111111a'])
    .run(({ assert }, invalidValue) => {
      // given
      const input = invalidValue

      // when
      const createInvalidCardNumber = () => CardNumber.create(input)

      // then
      assert.throws(createInvalidCardNumber, InvalidDomainException)
    })

  test('returns the last four digits of the card number', ({ assert }) => {
    // given
    const cardNumber = CardNumber.create('5569000000006063')

    // when
    const lastFourDigits = cardNumber.lastFourDigits()

    // then
    assert.equal(lastFourDigits, '6063')
  })

  test('masks the card number when converted to string', ({ assert }) => {
    // given
    const cardNumber = CardNumber.create('5569000000006063')

    // when
    const maskedValue = cardNumber.toString()

    // then
    assert.equal(maskedValue, '****')
  })
})

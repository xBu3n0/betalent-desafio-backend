import { test } from '@japa/runner'
import { CardNumber } from '#domain/primitives/transactions/card_number.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('CardNumber Primitive', () => {
  runPrimitiveTests({
    primitive: CardNumber,
    accepts: {
      title: 'accepts valid card numbers',
      values: ['4111111111111111', '5569000000006063'],
    },
    rejects: {
      title: 'rejects invalid card numbers',
      values: ['411111111111111', '41111111111111111', '411111111111111a'],
    },
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

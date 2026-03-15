import { test } from '@japa/runner'
import { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('CardLastNumbers Primitive', () => {
  runPrimitiveTests({
    primitive: CardLastNumbers,
    accepts: {
      title: 'accepts valid last four digits',
      values: ['1234', '0000', '9999'],
    },
    rejects: {
      title: 'rejects invalid last four digits',
      values: ['123', '12345', '12a4', 'abcd'],
    },
  })
})

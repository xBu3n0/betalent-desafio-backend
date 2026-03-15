import { test } from '@japa/runner'
import { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import { runIdPrimitiveTests } from '#tests/unit/domain/primitives/shared/id_primitive.spec_helper'

test.group('TransactionId Primitive', () => {
  runIdPrimitiveTests({
    primitive: TransactionId,
    accepts: {
      title: 'accepts valid transaction identifiers',
      values: [1, 2, 100, 12345],
    },
    rejects: {
      title: 'rejects invalid transaction identifiers',
      values: [0, -1, 1.2],
    },
  })
})

import { test } from '@japa/runner'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

const longExternalTransactionId = 'a'.repeat(256)

test.group('ExternalTransactionId Primitive', () => {
  runPrimitiveTests({
    primitive: ExternalTransactionId,
    accepts: {
      title: 'accepts valid external transaction identifiers',
      values: ['tx_123', 'external-payment-id', 'abc123'],
    },
    rejects: {
      title: 'rejects invalid external transaction identifiers',
      values: ['', '   ', longExternalTransactionId],
    },
  })
})

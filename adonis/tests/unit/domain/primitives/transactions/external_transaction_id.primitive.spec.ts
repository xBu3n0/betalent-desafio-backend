import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'

const longExternalTransactionId = 'a'.repeat(256)

test.group('ExternalTransactionId Primitive', () => {
  test('accepts valid external transaction identifiers')
    .with(['tx_123', 'external-payment-id', 'abc123'])
    .run(({ assert }, validValue) => {
      // given
      const input = validValue

      // when
      const externalTransactionId = ExternalTransactionId.create(input)

      // then
      assert.equal(externalTransactionId.value, input)
    })

  test('rejects invalid external transaction identifiers')
    .with(['', '   ', longExternalTransactionId])
    .run(({ assert }, invalidValue) => {
      // given
      const input = invalidValue

      // when
      const createInvalidExternalTransactionId = () => ExternalTransactionId.create(input)

      // then
      assert.throws(createInvalidExternalTransactionId, InvalidDomainException)
    })
})

import { test } from '@japa/runner'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('TransactionStatus Primitive', () => {
  runPrimitiveTests({
    primitive: TransactionStatus,
    accepts: {
      title: 'accepts valid transaction statuses',
      values: Object.values(TransactionStatusEnum),
    },
    rejects: {
      title: 'rejects invalid transaction statuses',
      values: ['processing', 'completed', ''],
    },
  })

  test('creates the pending status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.pending()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.PENDING)
  })

  test('creates the authorized status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.authorized()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.AUTHORIZED)
  })

  test('creates the failed status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.failed()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.FAILED)
  })

  test('creates the refunded status', ({ assert }) => {
    // given

    // when
    const transactionStatus = TransactionStatus.refunded()

    // then
    assert.equal(transactionStatus.value, TransactionStatusEnum.REFUNDED)
  })

  test('matches the provided status', ({ assert }) => {
    // given
    const transactionStatus = TransactionStatus.authorized()

    // when
    const matchesStatus = transactionStatus.is(TransactionStatusEnum.AUTHORIZED)

    // then
    assert.isTrue(matchesStatus)
  })
})

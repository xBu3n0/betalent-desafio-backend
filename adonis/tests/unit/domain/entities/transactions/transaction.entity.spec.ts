import { test } from '@japa/runner'
import TransactionEntity from '#domain/entities/shared/transaction.entity'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'

test('builds a transaction entity from stored data', ({ assert }) => {
  // given
  const record = {
    id: 1,
    clientId: 2,
    gatewayId: 3,
    externalId: '7ee72724-8a8b-42da-b33c-bd6077f54d6f',
    status: TransactionStatusEnum.PENDING,
    amount: 2599,
    cardLastNumbers: '4242',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // when
  const entity = TransactionEntity.fromRecord(record)

  // then
  assert.equal(entity.id.value, 1)
  assert.equal(entity.clientId.value, 2)
  assert.equal(entity.gatewayId.value, 3)
  assert.equal(entity.externalId.value, record.externalId)
  assert.equal(entity.status.value, TransactionStatusEnum.PENDING)
  assert.equal(entity.amount.toDecimalString(), '25.99')
  assert.equal(entity.cardLastNumbers.value, '4242')
})

test('authorizes a transaction immutably', ({ assert }) => {
  // given
  const entity = TransactionEntity.fromRecord({
    id: 1,
    clientId: 2,
    gatewayId: 3,
    externalId: '7ee72724-8a8b-42da-b33c-bd6077f54d6f',
    status: TransactionStatusEnum.PENDING,
    amount: 2599,
    cardLastNumbers: '4242',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const authorized = entity.authorize(
    ExternalTransactionId.create('0a87036b-1080-4f87-a9ca-8bbfbe7d1aa8'),
    GatewayId.create(7)
  )

  // then
  assert.equal(entity.status.value, TransactionStatusEnum.PENDING)
  assert.equal(entity.externalId.value, '7ee72724-8a8b-42da-b33c-bd6077f54d6f')
  assert.equal(entity.gatewayId.value, 3)
  assert.equal(authorized.status.value, TransactionStatusEnum.AUTHORIZED)
  assert.equal(authorized.externalId.value, '0a87036b-1080-4f87-a9ca-8bbfbe7d1aa8')
  assert.equal(authorized.gatewayId.value, 7)
  assert.equal(authorized.clientId.value, entity.clientId.value)
  assert.equal(authorized.amount.toDecimalString(), entity.amount.toDecimalString())
  assert.notStrictEqual(entity, authorized)
})

test('fails a transaction immutably', ({ assert }) => {
  // given
  const entity = TransactionEntity.fromRecord({
    id: 1,
    clientId: 2,
    gatewayId: 3,
    externalId: '7ee72724-8a8b-42da-b33c-bd6077f54d6f',
    status: TransactionStatusEnum.PENDING,
    amount: 2599,
    cardLastNumbers: '4242',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const failed = entity.fail(GatewayId.create(9))

  // then
  assert.equal(entity.status.value, TransactionStatusEnum.PENDING)
  assert.equal(entity.gatewayId.value, 3)
  assert.equal(failed.status.value, TransactionStatusEnum.FAILED)
  assert.equal(failed.gatewayId.value, 9)
  assert.equal(failed.externalId.value, entity.externalId.value)
  assert.equal(failed.amount.toDecimalString(), entity.amount.toDecimalString())
  assert.notStrictEqual(entity, failed)
})

test('refunds a transaction immutably', ({ assert }) => {
  // given
  const entity = TransactionEntity.fromRecord({
    id: 1,
    clientId: 2,
    gatewayId: 3,
    externalId: '7ee72724-8a8b-42da-b33c-bd6077f54d6f',
    status: TransactionStatusEnum.AUTHORIZED,
    amount: 2599,
    cardLastNumbers: '4242',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const refunded = entity.refund()

  // then
  assert.equal(entity.status.value, TransactionStatusEnum.AUTHORIZED)
  assert.equal(refunded.status.value, TransactionStatusEnum.REFUNDED)
  assert.equal(refunded.gatewayId.value, entity.gatewayId.value)
  assert.equal(refunded.externalId.value, entity.externalId.value)
  assert.equal(refunded.cardLastNumbers.value, entity.cardLastNumbers.value)
  assert.notStrictEqual(entity, refunded)
})

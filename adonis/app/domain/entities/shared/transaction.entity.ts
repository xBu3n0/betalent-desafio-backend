import { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

export interface TransactionRecord {
  id: number
  clientId: number
  gatewayId: number
  externalId: string
  status: string
  amount: number
  cardLastNumbers: string
  createdAt?: Date
  updatedAt?: Date
}

export default class TransactionEntity {
  private constructor(
    readonly id: TransactionId,
    readonly clientId: ClientId,
    readonly gatewayId: GatewayId,
    readonly externalId: ExternalTransactionId,
    readonly status: TransactionStatus,
    readonly amount: ProductAmount,
    readonly cardLastNumbers: CardLastNumbers
  ) {}

  static fromRecord(record: TransactionRecord) {
    return new TransactionEntity(
      TransactionId.create(record.id),
      ClientId.create(record.clientId),
      GatewayId.create(record.gatewayId),
      ExternalTransactionId.create(record.externalId),
      TransactionStatus.create(record.status),
      ProductAmount.create(record.amount),
      CardLastNumbers.create(record.cardLastNumbers)
    )
  }

  authorize(externalId: ExternalTransactionId, gatewayId: GatewayId) {
    return new TransactionEntity(
      this.id,
      this.clientId,
      gatewayId,
      externalId,
      TransactionStatus.authorized(),
      this.amount,
      this.cardLastNumbers
    )
  }

  fail(gatewayId: GatewayId) {
    return new TransactionEntity(
      this.id,
      this.clientId,
      gatewayId,
      this.externalId,
      TransactionStatus.failed(),
      this.amount,
      this.cardLastNumbers
    )
  }

  refund() {
    return new TransactionEntity(
      this.id,
      this.clientId,
      this.gatewayId,
      this.externalId,
      TransactionStatus.refunded(),
      this.amount,
      this.cardLastNumbers
    )
  }
}

import type { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import type { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import type { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

export default class NewTransactionEntity {
  private constructor(
    readonly clientId: ClientId,
    readonly gatewayId: GatewayId,
    readonly externalId: ExternalTransactionId,
    readonly status: TransactionStatus,
    readonly amount: ProductAmount,
    readonly cardLastNumbers: CardLastNumbers
  ) {}

  static create(
    clientId: ClientId,
    gatewayId: GatewayId,
    externalId: ExternalTransactionId,
    amount: ProductAmount,
    cardLastNumbers: CardLastNumbers,
    status = TransactionStatus.pending()
  ) {
    return new NewTransactionEntity(
      clientId,
      gatewayId,
      externalId,
      status,
      amount,
      cardLastNumbers
    )
  }
}

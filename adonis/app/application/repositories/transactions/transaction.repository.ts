import type ClientEntity from '#domain/entities/shared/client.entity'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import type ProductEntity from '#domain/entities/shared/product.entity'
import type TransactionEntity from '#domain/entities/shared/transaction.entity'
import type NewTransactionEntity from '#domain/entities/transactions/new_transaction.entity'
import type { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import type { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import type { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import type { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import type { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

export interface TransactionItemRecord {
  product: ProductEntity
  quantity: ProductQuantity
  subtotal: ProductAmount
}

export interface TransactionDetails {
  transaction: TransactionEntity
  client: ClientEntity
  gateway: GatewayEntity
  items: TransactionItemRecord[]
}

export interface CreateTransactionDraftPayload {
  transaction: NewTransactionEntity
  items: Array<{
    productId: ProductId
    quantity: ProductQuantity
  }>
}

export interface ListTransactionsFilters {
  status?: TransactionStatus
  clientId?: ClientId
  gatewayId?: GatewayId
}

export default abstract class TransactionRepositoryInterface {
  abstract createDraftWithItems(payload: CreateTransactionDraftPayload): Promise<TransactionEntity>

  abstract update(entity: TransactionEntity): Promise<TransactionEntity>

  abstract findById(id: TransactionId): Promise<TransactionEntity | null>

  abstract findDetailedById(id: TransactionId): Promise<TransactionDetails | null>

  abstract listDetailed(filters?: ListTransactionsFilters): Promise<TransactionDetails[]>

  abstract listDetailedByClientId(clientId: ClientId): Promise<TransactionDetails[]>
}

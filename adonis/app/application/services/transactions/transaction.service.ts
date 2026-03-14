import { inject } from '@adonisjs/core'
import type { ListTransactionsFilters } from '#repositories/transactions/transaction.repository'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import ProductRepositoryInterface from '#repositories/transactions/product.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'
import NewClientEntity from '#domain/entities/transactions/new_client.entity'
import NewTransactionEntity from '#domain/entities/transactions/new_transaction.entity'
import TransactionRefundNotAllowedException from '#domain/exceptions/transactions/transaction_refund_not_allowed.exception'
import NoActiveGatewayException from '#domain/exceptions/transactions/no_active_gateway.exception'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import TransactionNotFoundException from '#domain/exceptions/transactions/transaction_not_found.exception'
import TransactionPaymentFailedException from '#domain/exceptions/transactions/transaction_payment_failed.exception'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { Email } from '#domain/primitives/shared/email.primitive'
import { UserId } from '#domain/primitives/auth/user_id.primitive'
import { CardLastNumbers } from '#domain/primitives/transactions/card_last_numbers.primitive'
import { CardNumber } from '#domain/primitives/transactions/card_number.primitive'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'
import { Cvv } from '#domain/primitives/transactions/cvv.primitive'
import { ExternalTransactionId } from '#domain/primitives/transactions/external_transaction_id.primitive'
import { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { TransactionId } from '#domain/primitives/transactions/transaction_id.primitive'
import { TransactionStatus } from '#domain/primitives/transactions/transaction_status.primitive'

export interface PurchaseInput {
  userId: number
  name: string
  email: string
  cardNumber: string
  cvv: string
  items: Array<{
    productId: number
    quantity: number
  }>
}

export interface TransactionFiltersInput {
  status?: TransactionStatusEnum
  clientId?: number
  gatewayId?: number
}

@inject()
export default class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepositoryInterface,
    private readonly productRepository: ProductRepositoryInterface,
    private readonly clientRepository: ClientRepositoryInterface,
    private readonly gatewayRepository: GatewayRepositoryInterface,
    private readonly gatewayProcessorRegistry: GatewayProcessorRegistry
  ) {}

  async purchase(input: PurchaseInput) {
    const userId = UserId.create(input.userId)
    const email = Email.create(input.email)
    const clientName = ClientName.create(input.name)
    const cardNumber = CardNumber.create(input.cardNumber)
    const cvv = Cvv.create(input.cvv)
    const items = this.normalizeItems(input.items)

    const products = await this.fetchProducts(items.map((item) => item.productId))

    const totalAmount = ProductAmount.create(
      items.reduce((total, item) => {
        const product = products.find((candidate) => candidate.id.value === item.productId.value)!
        return total + item.quantity.multiply(product.amount.value)
      }, 0)
    )

    const client =
      (await this.clientRepository.findByEmail(email)) ??
      (await this.clientRepository.create(NewClientEntity.create(userId, clientName, email)))

    const gateways = await this.gatewayRepository.listActiveByPriority()
    if (gateways.length === 0) {
      throw new NoActiveGatewayException('No active gateway is available to process the purchase.')
    }

    for (const item of items) {
      const product = products.find((candidate) => candidate.id.value === item.productId.value)!
      if (product.amount.value < item.quantity.value) {
        throw new ProductNotFoundException(
          `Product '${product.id.value}' does not have enough quantity. Requested: ${item.quantity.value}, Available: ${product.amount.value}`
        )
      }
    }

    const draft = await this.transactionRepository.createDraftWithItems({
      transaction: NewTransactionEntity.create(
        client.id,
        gateways[0].id,
        ExternalTransactionId.create(`pending-${crypto.randomUUID()}`),
        totalAmount,
        CardLastNumbers.create(cardNumber.lastFourDigits())
      ),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })

    let lastGatewayId = gateways[0].id

    for (const gateway of gateways) {
      lastGatewayId = gateway.id

      try {
        const processor = this.gatewayProcessorRegistry.getFor(gateway)
        const result = await processor.charge({
          amount: totalAmount.value,
          name: clientName.value,
          email: email.value,
          cardNumber: cardNumber.value,
          cvv: cvv.value,
        })

        const authorized = await this.transactionRepository.update(
          draft.authorize(ExternalTransactionId.create(result.externalId), gateway.id)
        )

        return this.getById(authorized.id.value)
      } catch (error) {
        void error
      }
    }

    await this.transactionRepository.update(draft.fail(lastGatewayId))

    throw new TransactionPaymentFailedException(
      'The purchase could not be authorized by any active gateway.'
    )
  }

  async listTransactions(filters: TransactionFiltersInput = {}) {
    const resolvedFilters: ListTransactionsFilters = {}

    if (filters.status) {
      resolvedFilters.status = TransactionStatus.create(filters.status)
    }

    if (typeof filters.clientId === 'number') {
      resolvedFilters.clientId = this.ensureClientId(filters.clientId)
    }

    if (typeof filters.gatewayId === 'number') {
      resolvedFilters.gatewayId = this.ensureGatewayId(filters.gatewayId)
    }

    return this.transactionRepository.listDetailed(resolvedFilters)
  }

  async getById(id: number) {
    const transactionId = TransactionId.create(id)
    const transaction = await this.transactionRepository.findDetailedById(transactionId)

    if (!transaction) {
      throw new TransactionNotFoundException(`Transaction '${transactionId.value}' was not found.`)
    }

    return transaction
  }

  async refund(id: number) {
    const transactionId = TransactionId.create(id)
    const transaction = await this.transactionRepository.findById(transactionId)

    if (!transaction) {
      throw new TransactionNotFoundException(`Transaction '${transactionId.value}' was not found.`)
    }

    if (!transaction.status.is(TransactionStatusEnum.AUTHORIZED)) {
      throw new TransactionRefundNotAllowedException(
        `Transaction '${transactionId.value}' cannot be refunded from status '${transaction.status.value}'.`
      )
    }

    const gateway = await this.gatewayRepository.findById(transaction.gatewayId)
    if (!gateway) {
      throw new NoActiveGatewayException(
        `Gateway '${transaction.gatewayId.value}' was not found for refund processing.`
      )
    }

    const processor = this.gatewayProcessorRegistry.getFor(gateway)
    await processor.refund(transaction.externalId.value)
    await this.transactionRepository.update(transaction.refund())

    return this.getById(transactionId.value)
  }

  private normalizeItems(input: PurchaseInput['items']) {
    const aggregated = new Map<number, ProductQuantity>()

    for (const item of input) {
      const productId = ProductId.create(item.productId)
      const quantity = ProductQuantity.create(item.quantity)
      const current = aggregated.get(productId.value)
      const nextQuantity = current ? current.value + quantity.value : quantity.value

      aggregated.set(productId.value, ProductQuantity.create(nextQuantity))
    }

    return [...aggregated.entries()].map(([productId, quantity]) => ({
      productId: ProductId.create(productId),
      quantity,
    }))
  }

  private async fetchProducts(productIds: ProductId[]) {
    const products = await this.productRepository.findByIds(productIds)
    const foundIds = new Set(products.map((product) => product.id.value))
    const missingProductId = productIds.find((productId) => !foundIds.has(productId.value))

    if (missingProductId) {
      throw new ProductNotFoundException(`Product '${missingProductId.value}' was not found.`)
    }

    return products
  }

  private ensureClientId(id: number) {
    return ClientId.create(id)
  }

  private ensureGatewayId(id: number) {
    return GatewayId.create(id)
  }
}

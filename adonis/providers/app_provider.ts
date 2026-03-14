import type { ApplicationService } from '@adonisjs/core/types'
import UserRepositoryInterface from '#repositories/auth/user.repository'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'
import ProductRepositoryInterface from '#repositories/transactions/product.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    this.app.container.singleton(UserRepositoryInterface, async () => {
      const { default: LucidUserRepository } =
        await import('#infrastructure/repositories/auth/user.repository')

      return new LucidUserRepository()
    })

    this.app.container.singleton(GatewayRepositoryInterface, async () => {
      const { default: LucidGatewayRepository } =
        await import('#infrastructure/repositories/transactions/gateway.repository')

      return new LucidGatewayRepository()
    })

    this.app.container.singleton(ProductRepositoryInterface, async () => {
      const { default: LucidProductRepository } =
        await import('#infrastructure/repositories/transactions/product.repository')

      return new LucidProductRepository()
    })

    this.app.container.singleton(ClientRepositoryInterface, async () => {
      const { default: LucidClientRepository } =
        await import('#infrastructure/repositories/transactions/client.repository')

      return new LucidClientRepository()
    })

    this.app.container.singleton(TransactionRepositoryInterface, async () => {
      const { default: LucidTransactionRepository } =
        await import('#infrastructure/repositories/transactions/transaction.repository')

      return new LucidTransactionRepository()
    })

    this.app.container.singleton(GatewayProcessorRegistry, async () => {
      return new GatewayProcessorRegistry()
    })
  }
}

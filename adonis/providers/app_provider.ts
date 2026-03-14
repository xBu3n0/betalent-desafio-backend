import type { ApplicationService } from '@adonisjs/core/types'
import UserRepositoryInterface from '#repositories/auth/user.repository'
import GatewayRepositoryInterface from '#repositories/transactions/gateway.repository'

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
  }
}

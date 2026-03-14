import type { ApplicationService } from '@adonisjs/core/types'
import UserRepositoryInterface from '#repositories/auth/user.repository'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    this.app.container.singleton(UserRepositoryInterface, async () => {
      const { default: LucidUserRepository } =
        await import('#infrastructure/repositories/auth/user.repository')

      return new LucidUserRepository()
    })
  }
}

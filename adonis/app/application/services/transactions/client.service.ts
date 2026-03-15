import { inject } from '@adonisjs/core'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import ClientNotFoundException from '#domain/exceptions/transactions/client_not_found.exception'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type UserEntity from '#domain/entities/shared/user.entity'
import NewClientEntity from '#domain/entities/transactions/new_client.entity'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'

@inject()
export default class ClientService {
  constructor(
    private readonly clientRepository: ClientRepositoryInterface,
    private readonly transactionRepository: TransactionRepositoryInterface
  ) {}

  async listClients() {
    return this.clientRepository.list()
  }

  async ensureForUser(user: UserEntity) {
    const existingClient = await this.clientRepository.findByUserId(user.id)

    if (existingClient) {
      return existingClient
    }

    return this.clientRepository.create(
      NewClientEntity.create(user.id, ClientName.create(user.email.value), user.email)
    )
  }

  async syncForUser(user: UserEntity) {
    const existingClient = await this.clientRepository.findByUserId(user.id)

    if (!existingClient) {
      return this.ensureForUser(user)
    }

    if (
      existingClient.email.value === user.email.value &&
      existingClient.name.value === user.email.value
    ) {
      return existingClient
    }

    const updatedClient = await this.clientRepository.updateByUserId(user.id, {
      name: ClientName.create(user.email.value),
      email: user.email,
    })

    return updatedClient ?? this.ensureForUser(user)
  }

  async getById(id: number) {
    const clientId = ClientId.create(id)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new ClientNotFoundException(`Client '${clientId.value}' was not found.`)
    }

    const transactions = await this.transactionRepository.listDetailedByClientId(clientId)

    return {
      client,
      transactions,
    }
  }

  async deleteByUserId(userId: UserId) {
    await this.clientRepository.deleteByUserId(userId)
  }
}

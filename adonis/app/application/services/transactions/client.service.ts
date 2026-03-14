import { inject } from '@adonisjs/core'
import ClientRepositoryInterface from '#repositories/transactions/client.repository'
import TransactionRepositoryInterface from '#repositories/transactions/transaction.repository'
import ClientNotFoundException from '#domain/exceptions/transactions/client_not_found.exception'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'

@inject()
export default class ClientService {
  constructor(
    private readonly clientRepository: ClientRepositoryInterface,
    private readonly transactionRepository: TransactionRepositoryInterface
  ) {}

  async listClients() {
    return this.clientRepository.list()
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
}

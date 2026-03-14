import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ClientService from '#services/transactions/client.service'
import ClientTransformer from '#transformers/client_transformer'
import TransactionTransformer from '#transformers/transaction_transformer'

@inject()
export default class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  async index({ serialize }: HttpContext) {
    const clients = await this.clientService.listClients()

    return serialize(ClientTransformer.transform(clients))
  }

  async show({ params, serialize }: HttpContext) {
    const result = await this.clientService.getById(Number(params.id))

    return serialize({
      ...ClientTransformer.transform(result.client),
      transactions: TransactionTransformer.transform(result.transactions),
    })
  }
}

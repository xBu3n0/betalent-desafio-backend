import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ClientService from '#services/transactions/client.service'
import ClientTransformer from '#transformers/client_transformer'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'

@inject()
export default class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * @index
   * @summary List clients
   * @tag Clients
   * @responseBody 200 - <ClientCollectionResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   */
  async index({ serialize }: HttpContext) {
    const clients = await this.clientService.listClients()

    return serialize(ClientTransformer.transform(clients))
  }

  /**
   * @show
   * @summary Show a client with transaction history
   * @tag Clients
   * @paramPath id - Client id - @type(number) @required
   * @responseBody 200 - <ClientDetailsResource>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async show({ params, serialize }: HttpContext) {
    const result = await this.clientService.getById(Number(params.id))
    const serializedClient = await serialize(ClientTransformer.transform(result.client))
    const serializedTransactions = await serialize(
      TransactionDetailsTransformer.transform(result.transactions)
    )

    return serialize({
      ...serializedClient.data,
      transactions: serializedTransactions.data,
    })
  }
}

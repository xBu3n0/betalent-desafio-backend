import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TransactionService from '#services/transactions/transaction.service'
import TransactionTransformer from '#transformers/transaction_transformer'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'
import { listTransactionsValidator } from '#validators/transaction'

@inject()
export default class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * @index
   * @summary List transactions
   * @tag Transactions
   * @paramQuery status - Filter by transaction status - @type(string)
   * @paramQuery clientId - Filter by client id - @type(number)
   * @paramQuery gatewayId - Filter by gateway id - @type(number)
   * @responseBody 200 - <TransactionCollectionResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async index({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listTransactionsValidator, {
      data: request.qs(),
    })
    const transactions = await this.transactionService.listTransactions(filters)

    return serialize(TransactionTransformer.transform(transactions))
  }

  /**
   * @show
   * @summary Show transaction details by id
   * @tag Transactions
   * @paramPath id - Transaction id - @type(number) @required
   * @responseBody 200 - <TransactionDetailsResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async show({ params, serialize }: HttpContext) {
    const transaction = await this.transactionService.getById(Number(params.id))

    return serialize(TransactionDetailsTransformer.transform(transaction))
  }

  /**
   * @refund
   * @summary Refund an authorized transaction
   * @tag Transactions
   * @paramPath id - Transaction id - @type(number) @required
   * @responseBody 200 - <TransactionDetailsResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async refund({ params, serialize }: HttpContext) {
    const transaction = await this.transactionService.refund(Number(params.id))

    return serialize(TransactionDetailsTransformer.transform(transaction))
  }
}

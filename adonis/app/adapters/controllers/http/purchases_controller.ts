import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TransactionService from '#services/transactions/transaction.service'
import TransactionDetailsTransformer from '#transformers/transaction_details_transformer'
import { createPurchaseValidator } from '#validators/purchase'

@inject()
export default class PurchasesController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * @store
   * @summary Create a public purchase
   * @tag Purchases
   * @requestBody <createPurchaseValidator>
   * @responseBody 200 - <TransactionDetailsResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createPurchaseValidator)

    const transaction = await this.transactionService.purchase(payload)

    const serializedTransaction = await serialize(
      TransactionDetailsTransformer.transform(transaction)
    )

    return {
      data: {
        ...serializedTransaction.data,
      },
    }
  }
}

import { TransactionProductSchema } from '#database/schema'
import Product from '#models/transactions/product'
import Transaction from '#models/transactions/transaction'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class TransactionProduct extends TransactionProductSchema {
  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}

import { TransactionSchema } from '#database/schema'
import Client from '#models/transactions/client'
import Gateway from '#models/transactions/gateway'
import Product from '#models/transactions/product'
import TransactionProduct from '#models/transactions/transaction_product'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Transaction extends TransactionSchema {
  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  @hasMany(() => TransactionProduct)
  declare transactionProducts: HasMany<typeof TransactionProduct>

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
    pivotTimestamps: true,
  })
  declare products: ManyToMany<typeof Product>
}

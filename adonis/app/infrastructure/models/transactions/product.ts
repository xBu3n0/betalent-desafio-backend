import { ProductSchema } from '#database/schema'
import Transaction from '#models/transactions/transaction'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Product extends ProductSchema {
  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
    pivotTimestamps: true,
  })
  declare transactions: ManyToMany<typeof Transaction>
}

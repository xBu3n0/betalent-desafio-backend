import factory from '@adonisjs/lucid/factories'
import TransactionProduct from '#models/transactions/transaction_product'
import { ProductFactory } from '#database/factories/product_factory'
import { TransactionFactory } from '#database/factories/transaction_factory'

export const TransactionProductFactory = factory
  .define(TransactionProduct, async ({ faker }) => {
    const transaction = await TransactionFactory.create()
    const product = await ProductFactory.create()

    return {
      transactionId: transaction.id,
      productId: product.id,
      quantity: faker.number.int({ min: 1, max: 10 }),
    }
  })
  .build()

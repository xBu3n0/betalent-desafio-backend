import factory from '@adonisjs/lucid/factories'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import Transaction from '#models/transactions/transaction'
import { ClientFactory } from '#database/factories/client_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'

export const TransactionFactory = factory
  .define(Transaction, async ({ faker }) => {
    const client = await ClientFactory.create()
    const gateway = await GatewayFactory.create()

    return {
      clientId: client.id,
      gatewayId: gateway.id,
      externalId: `tx-${faker.string.alphanumeric(16).toLowerCase()}`,
      status: faker.helpers.arrayElement(Object.values(TransactionStatusEnum)),
      amount: faker.number.int({ min: 0, max: 100_000 }),
      cardLastNumbers: faker.string.numeric(4),
    }
  })
  .build()

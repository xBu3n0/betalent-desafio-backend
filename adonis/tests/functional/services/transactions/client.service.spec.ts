import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import ClientService from '#services/transactions/client.service'
import ClientNotFoundException from '#domain/exceptions/transactions/client_not_found.exception'
import { ClientFactory } from '#database/factories/client_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { TransactionFactory } from '#database/factories/transaction_factory'
import { TransactionProductFactory } from '#database/factories/transaction_product_factory'
import { cleanupTransactionsDatabase, runAceCommand } from './test_utils.js'

test.group('ClientService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('lists clients', async ({ assert }) => {
    // given
    const service = await app.container.make(ClientService)
    const client = await ClientFactory.create()

    // when
    const clients = await service.listClients()

    // then
    assert.lengthOf(clients, 1)
    assert.equal(clients[0].id.value, client.id)
  })

  test('returns a client with purchase history', async ({ assert }) => {
    // given
    const client = await ClientFactory.create()
    const gateway = await GatewayFactory.merge({ priority: 1, isActive: true }).create()
    const product = await ProductFactory.merge({ amount: 1000 }).create()
    const transaction = await TransactionFactory.merge({
      clientId: client.id,
      gatewayId: gateway.id,
      externalId: 'tx-1',
      status: 'authorized',
      amount: 1000,
      cardLastNumbers: '6063',
    }).create()
    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: product.id,
      quantity: 1,
    }).create()
    const service = await app.container.make(ClientService)

    // when
    const result = await service.getById(client.id)

    // then
    assert.equal(result.client.email.value, client.email)
    assert.lengthOf(result.transactions, 1)
    assert.equal(result.transactions[0].transaction.externalId.value, 'tx-1')
  })

  test('returns not found when the client id does not exist', async ({ assert }) => {
    // given
    const service = await app.container.make(ClientService)

    // when
    const getMissingClient = () => service.getById(999999)

    // then
    await assert.rejects(getMissingClient, ClientNotFoundException)
  })
})

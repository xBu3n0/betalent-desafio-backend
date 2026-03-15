import { test } from '@japa/runner'
import Client from '#models/transactions/client'
import Transaction from '#models/transactions/transaction'
import type User from '#models/auth/user'
import ClientNotFoundException from '#domain/exceptions/transactions/client_not_found.exception'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import TransactionPaymentFailedException from '#domain/exceptions/transactions/transaction_payment_failed.exception'
import TransactionNotFoundException from '#domain/exceptions/transactions/transaction_not_found.exception'
import UserEntity from '#domain/entities/shared/user.entity'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import ClientService from '#services/transactions/client.service'
import {
  cleanupTransactionsDatabase,
  FakeGatewayProcessor,
  makeTransactionService,
  runAceCommand,
} from './test_utils.js'

async function syncClientForUser(user: User) {
  const clientService = await app.container.make(ClientService)
  await clientService.ensureForUser(UserEntity.fromRecord(user.toRecord()))

  return user
}

test.group('TransactionService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupTransactionsDatabase()
  })

  group.each.timeout(10000)

  test('authorizes a purchase on the first successful gateway', async ({ assert }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const firstProduct = await ProductFactory.merge({ quantity: 10 }).create()
    const secondProduct = await ProductFactory.merge({ quantity: 5 }).create()
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const processor = new FakeGatewayProcessor('Gateway 1', { externalId: 'gw-1-tx' })
    const service = await makeTransactionService([processor])

    // when
    const purchase = await service.purchase({
      userId: user.id,
      name: 'Jane Doe',
      email: 'jane@betalent.tech',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [
        { productId: firstProduct.id, quantity: 2, price: '10.00' },
        { productId: secondProduct.id, quantity: 1, price: '5.00' },
      ],
    })

    // then
    assert.equal(processor.chargeCalls.length, 1)
    assert.equal(purchase.transaction.amount.value, 2500n)
    assert.equal(purchase.transaction.externalId.value, 'gw-1-tx')
    assert.equal(purchase.gateway.id.value, gateway.id)

    const persistedClient = await Client.findByOrFail('userId', user.id)
    const persistedTransaction = await Transaction.findOrFail(purchase.transaction.id.value)
    const persistedClients = await Client.query().where('user_id', user.id)
    assert.equal(persistedClient.userId, user.id)
    assert.lengthOf(persistedClients, 1)
    assert.equal(persistedTransaction.gatewayId, gateway.id)
  })

  test('uses the existing user payment client instead of creating one from purchase payload data', async ({
    assert,
  }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    await GatewayFactory.merge({
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const originalClient = await Client.findByOrFail('userId', user.id)
    const service = await makeTransactionService([
      new FakeGatewayProcessor('Gateway 1', { externalId: 'gw-existing-client' }),
    ])

    // when
    const purchase = await service.purchase({
      userId: user.id,
      name: 'Different Name',
      email: 'different@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1, price: '10.00' }],
    })

    // then
    const persistedClients = await Client.query().where('user_id', user.id)
    const paymentClientFromPurchasePayload = await Client.findBy('email', 'different@example.com')

    assert.equal(purchase.client.id.value, originalClient.id)
    assert.equal(purchase.client.email.value, user.email)
    assert.equal(purchase.client.name.value, user.email)
    assert.lengthOf(persistedClients, 1)
    assert.isNull(paymentClientFromPurchasePayload)
  })

  test('falls back to the next active gateway when a gateway charge fails', async ({ assert }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    await GatewayFactory.merge({ name: 'Gateway 1', priority: 1, isActive: true }).create()
    const secondGateway = await GatewayFactory.merge({
      name: 'Gateway 2',
      priority: 2,
      isActive: true,
    }).create()
    const failingGateway = new FakeGatewayProcessor('Gateway 1', new Error('fail'))
    const successfulGateway = new FakeGatewayProcessor('Gateway 2', { externalId: 'gw-2-tx' })
    const service = await makeTransactionService([failingGateway, successfulGateway])

    // when
    const purchase = await service.purchase({
      userId: user.id,
      name: 'John Doe',
      email: 'john@betalent.tech',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1, price: '10.00' }],
    })

    // then
    assert.equal(failingGateway.chargeCalls.length, 1)
    assert.equal(successfulGateway.chargeCalls.length, 1)
    assert.equal(purchase.gateway.id.value, secondGateway.id)
    assert.equal(purchase.transaction.externalId.value, 'gw-2-tx')
  })

  test('rejects a purchase when one of the requested products does not exist', async ({
    assert,
  }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    const processor = new FakeGatewayProcessor('Gateway 1', { externalId: 'gw-1-tx' })
    const service = await makeTransactionService([processor])

    // when
    const purchaseWithMissingProduct = () =>
      service.purchase({
        userId: user.id,
        name: 'Jane Missing Product',
        email: 'jane-missing@betalent.tech',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [
          { productId: product.id, quantity: 1, price: '10.00' },
          { productId: 999999, quantity: 1, price: '10.00' },
        ],
      })

    // then
    await assert.rejects(purchaseWithMissingProduct, ProductNotFoundException)
    assert.equal(processor.chargeCalls.length, 0)

    const persistedTransaction = await Transaction.query().where('gateway_id', gateway.id)
    assert.lengthOf(persistedTransaction, 0)
  })

  test('refunds an authorized transaction using the stored gateway', async ({ assert }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    await GatewayFactory.merge({ name: 'Gateway 1', priority: 1, isActive: true }).create()
    await GatewayFactory.merge({ name: 'Gateway 2', priority: 2, isActive: true }).create()
    const successfulGateway = new FakeGatewayProcessor('Gateway 2', { externalId: 'gw-2-tx' })
    const service = await makeTransactionService([
      new FakeGatewayProcessor('Gateway 1', new Error('fail')),
      successfulGateway,
    ])
    const purchase = await service.purchase({
      userId: user.id,
      name: 'John Doe',
      email: 'john@betalent.tech',
      cardNumber: '5569000000006063',
      cvv: '010',
      items: [{ productId: product.id, quantity: 1, price: '10.00' }],
    })

    // when
    const refunded = await service.refund(purchase.transaction.id.value)

    // then
    assert.equal(successfulGateway.refundCalls[0], 'gw-2-tx')
    assert.equal(refunded.transaction.status.value, 'refunded')
  })

  test('does not persist a transaction when all active gateways reject the charge', async ({
    assert,
  }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    await GatewayFactory.merge({ name: 'Gateway 1', priority: 1, isActive: true }).create()
    await GatewayFactory.merge({ name: 'Gateway 2', priority: 2, isActive: true }).create()
    const firstGateway = new FakeGatewayProcessor('Gateway 1', new Error('fail'))
    const secondGateway = new FakeGatewayProcessor('Gateway 2', new Error('fail'))
    const service = await makeTransactionService([firstGateway, secondGateway])

    // when
    const rejectedPurchase = () =>
      service.purchase({
        userId: user.id,
        name: 'No Gateway Success',
        email: 'nogateway@betalent.tech',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [{ productId: product.id, quantity: 1, price: '10.00' }],
      })

    // then
    await assert.rejects(rejectedPurchase, TransactionPaymentFailedException)
    assert.equal(firstGateway.chargeCalls.length, 1)
    assert.equal(secondGateway.chargeCalls.length, 1)

    const persistedTransaction = await Transaction.all()
    const persistedClient = await Client.findBy('userId', user.id)

    assert.lengthOf(persistedTransaction, 0)
    assert.isNotNull(persistedClient)
  })

  test('does not create a client during purchase when the user client is missing', async ({
    assert,
  }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const product = await ProductFactory.merge({ quantity: 10 }).create()
    await GatewayFactory.merge({
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    await Client.query().where('user_id', user.id).delete()
    const processor = new FakeGatewayProcessor('Gateway 1', { externalId: 'gw-missing-client' })
    const service = await makeTransactionService([processor])

    // when
    const purchaseWithoutClient = () =>
      service.purchase({
        userId: user.id,
        name: 'Missing Client',
        email: 'missing-client@example.com',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [{ productId: product.id, quantity: 1, price: '10.00' }],
      })

    // then
    await assert.rejects(purchaseWithoutClient, ClientNotFoundException)
    assert.equal(processor.chargeCalls.length, 1)
    assert.isNull(await Client.findBy('userId', user.id))
    assert.isNull(await Client.findBy('email', 'missing-client@example.com'))
    assert.lengthOf(await Transaction.all(), 0)
  })

  test('returns not found when the transaction id does not exist', async ({ assert }) => {
    // given
    const service = await makeTransactionService([])

    // when
    const getMissingTransaction = () => service.getById(999999)

    // then
    await assert.rejects(getMissingTransaction, TransactionNotFoundException)
  })
})

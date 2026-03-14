import { test } from '@japa/runner'
import Client from '#models/transactions/client'
import Transaction from '#models/transactions/transaction'
import type TransactionService from '#services/transactions/transaction.service'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import TransactionNotFoundException from '#domain/exceptions/transactions/transaction_not_found.exception'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { UserFactory } from '#database/factories/user_factory'
import {
  cleanupTransactionsDatabase,
  FakeGatewayProcessor,
  makeTransactionService,
  runAceCommand,
} from './test_utils.js'

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
    const user = await UserFactory.create()
    const firstProduct = await ProductFactory.merge({ amount: 1000 }).create()
    const secondProduct = await ProductFactory.merge({ amount: 500 }).create()
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
        { productId: firstProduct.id, quantity: 2 },
        { productId: secondProduct.id, quantity: 1 },
      ],
    })

    // then
    assert.equal(processor.chargeCalls.length, 1)
    assert.equal(purchase.transaction.amount.value, 2500)
    assert.equal(purchase.transaction.externalId.value, 'gw-1-tx')
    assert.equal(purchase.gateway.id.value, gateway.id)

    const persistedClient = await Client.findByOrFail('email', 'jane@betalent.tech')
    const persistedTransaction = await Transaction.findOrFail(purchase.transaction.id.value)
    assert.equal(persistedClient.userId, user.id)
    assert.equal(persistedTransaction.gatewayId, gateway.id)
  })

  test('falls back to the next active gateway when a gateway charge fails', async ({ assert }) => {
    // given
    const user = await UserFactory.create()
    const product = await ProductFactory.merge({ amount: 1000 }).create()
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
      items: [{ productId: product.id, quantity: 1 }],
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
    const user = await UserFactory.create()
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 1',
      priority: 1,
      isActive: true,
    }).create()
    const product = await ProductFactory.merge({ amount: 1000 }).create()
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
          { productId: product.id, quantity: 1 },
          { productId: 999999, quantity: 1 },
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
    const user = await UserFactory.create()
    const product = await ProductFactory.merge({ amount: 1000 }).create()
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
      items: [{ productId: product.id, quantity: 1 }],
    })

    // when
    const refunded = await service.refund(purchase.transaction.id.value)

    // then
    assert.equal(successfulGateway.refundCalls[0], 'gw-2-tx')
    assert.equal(refunded.transaction.status.value, 'refunded')
  })

  test('returns not found when the transaction id does not exist', async ({ assert }) => {
    // given
    const service = (await makeTransactionService([])) as TransactionService

    // when
    const getMissingTransaction = () => service.getById(999999)

    // then
    await assert.rejects(getMissingTransaction, TransactionNotFoundException)
  })
})

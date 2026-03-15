import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import type { InferData } from '@adonisjs/http-transformers/types'
import db from '@adonisjs/lucid/services/db'
import type { ChargeGatewayInput, GatewayChargeResult } from '#application/gateways/payment_gateway'
import type PaymentGateway from '#application/gateways/payment_gateway'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { UserFactory } from '#database/factories/user_factory'
import { ClientFactory } from '#database/factories/client_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { TransactionFactory } from '#database/factories/transaction_factory'
import { TransactionProductFactory } from '#database/factories/transaction_product_factory'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'
import Transaction from '#models/transactions/transaction'
import type TransactionDetailsTransformer from '#transformers/transaction_details_transformer'

const TRANSACTIONS_BASE_URL = '/api/v1/transactions'

type TransactionDetailsResponseBody = {
  data: InferData<TransactionDetailsTransformer>
}

class SpyGatewayProcessor implements PaymentGateway {
  readonly chargeCalls: ChargeGatewayInput[] = []
  readonly refundCalls: string[] = []
  setupCalls = 0

  constructor(private readonly gatewayName: string) {}

  supports(gateway: GatewayEntity) {
    return gateway.name.value === this.gatewayName
  }

  async setup() {
    this.setupCalls += 1
  }

  async charge(input: ChargeGatewayInput): Promise<GatewayChargeResult> {
    this.chargeCalls.push(input)

    return {
      externalId: `${this.gatewayName.toLowerCase().replaceAll(' ', '-')}-test-transaction`,
    }
  }

  async refund(externalId: string) {
    this.refundCalls.push(externalId)
  }
}

async function runAceCommand(commandName: string, args: string[]) {
  const ace = await app.container.make('ace')
  const command = await ace.exec(commandName, args)

  if (!command.exitCode) {
    return
  }

  if (command.error) {
    throw command.error
  }

  throw new Error(
    `Could not run "${commandName}". Check database connectivity and migration configuration.`
  )
}

async function cleanupTransactions() {
  await db.from('transaction_products').delete()
  await db.from('transactions').delete()
  await db.from('products').delete()
  await db.from('gateways').delete()
  await db.from('clients').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('TransactionsController | functional', (group) => {
  let gatewayOneProcessor: SpyGatewayProcessor
  let gatewayTwoProcessor: SpyGatewayProcessor

  group.setup(async () => {
    app.container.swap(
      GatewayProcessorRegistry,
      () => new GatewayProcessorRegistry([gatewayOneProcessor, gatewayTwoProcessor])
    )
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return async () => {
      app.container.restore(GatewayProcessorRegistry)
      await runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
    }
  })

  group.each.setup(async () => {
    gatewayOneProcessor = new SpyGatewayProcessor('Gateway 1')
    gatewayTwoProcessor = new SpyGatewayProcessor('Gateway 2')
    await cleanupTransactions()
  })

  group.each.timeout(10000)

  test('lists only transaction data', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const transaction = await TransactionFactory.merge({
      status: TransactionStatusEnum.AUTHORIZED,
    }).create()

    // when
    const response = await client.get(TRANSACTIONS_BASE_URL).loginAs(finance)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: [
        {
          id: transaction.id,
          clientId: transaction.clientId,
          gatewayId: transaction.gatewayId,
          externalId: transaction.externalId,
          status: TransactionStatusEnum.AUTHORIZED,
          amount: transaction.amount / 100,
          cardLastNumbers: transaction.cardLastNumbers,
        },
      ],
    })
  })

  test('shows a transaction with all related data', async ({ client, assert }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const clientRecord = await ClientFactory.create()
    const gateway = await GatewayFactory.merge({ isActive: true, priority: 1 }).create()
    const firstProduct = await ProductFactory.merge({ quantity: 10 }).create()
    const secondProduct = await ProductFactory.merge({ quantity: 5 }).create()
    const transaction = await TransactionFactory.merge({
      clientId: clientRecord.id,
      gatewayId: gateway.id,
      externalId: 'tx-show-1',
      status: TransactionStatusEnum.AUTHORIZED,
      amount: 2000,
      cardLastNumbers: '6063',
    }).create()

    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: firstProduct.id,
      quantity: 1,
    }).create()

    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: secondProduct.id,
      quantity: 2,
    }).create()

    // when
    const response = await client.get(`${TRANSACTIONS_BASE_URL}/${transaction.id}`).loginAs(finance)

    // then
    response.assertStatus(200)
    assert.deepEqual(response.body() as TransactionDetailsResponseBody, {
      data: {
        id: transaction.id,
        externalId: 'tx-show-1',
        status: TransactionStatusEnum.AUTHORIZED,
        amount: 20,
        cardLastNumbers: '6063',
        client: {
          id: clientRecord.id,
          userId: clientRecord.userId,
          name: clientRecord.name,
          email: clientRecord.email,
        },
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
        },
        items: [
          {
            product: {
              id: firstProduct.id,
              name: firstProduct.name,
            },
            quantity: 1,
          },
          {
            product: {
              id: secondProduct.id,
              name: secondProduct.name,
            },
            quantity: 2,
          },
        ],
      },
    })
  })

  test('refunds an authorized transaction using the stored gateway processor', async ({
    client,
    assert,
  }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const clientRecord = await ClientFactory.create()
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 2',
      isActive: true,
      priority: 1,
    }).create()
    const transaction = await TransactionFactory.merge({
      clientId: clientRecord.id,
      gatewayId: gateway.id,
      externalId: 'gw-2-refund-1',
      status: TransactionStatusEnum.AUTHORIZED,
      amount: 2000,
      cardLastNumbers: '6063',
    }).create()

    // when
    const response = await client
      .post(`${TRANSACTIONS_BASE_URL}/${transaction.id}/refund`)
      .loginAs(finance)

    // then
    response.assertStatus(200)
    assert.deepEqual(response.body() as TransactionDetailsResponseBody, {
      data: {
        id: transaction.id,
        externalId: 'gw-2-refund-1',
        status: TransactionStatusEnum.REFUNDED,
        amount: 20,
        cardLastNumbers: '6063',
        client: {
          id: clientRecord.id,
          userId: clientRecord.userId,
          name: clientRecord.name,
          email: clientRecord.email,
        },
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
        },
        items: [],
      },
    })

    assert.equal(gatewayOneProcessor.setupCalls, 0)
    assert.deepEqual(gatewayOneProcessor.refundCalls, [])
    assert.equal(gatewayTwoProcessor.setupCalls, 1)
    assert.deepEqual(gatewayTwoProcessor.refundCalls, ['gw-2-refund-1'])

    const refundedTransaction = await Transaction.findOrFail(transaction.id)
    assert.equal(refundedTransaction.status, TransactionStatusEnum.REFUNDED)
  })

  test('does not call the gateway when the transaction cannot be refunded', async ({
    client,
    assert,
  }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 1',
      isActive: true,
      priority: 1,
    }).create()
    const transaction = await TransactionFactory.merge({
      gatewayId: gateway.id,
      status: TransactionStatusEnum.REFUNDED,
    }).create()

    // when
    const response = await client
      .post(`${TRANSACTIONS_BASE_URL}/${transaction.id}/refund`)
      .loginAs(finance)

    // then
    response.assertStatus(422)
    assert.equal(gatewayOneProcessor.setupCalls, 0)
    assert.deepEqual(gatewayOneProcessor.refundCalls, [])
    assert.equal(gatewayTwoProcessor.setupCalls, 0)
    assert.deepEqual(gatewayTwoProcessor.refundCalls, [])
  })
})

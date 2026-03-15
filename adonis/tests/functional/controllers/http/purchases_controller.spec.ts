import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import type { InferData } from '@adonisjs/http-transformers/types'
import type { ChargeGatewayInput, GatewayChargeResult } from '#application/gateways/payment_gateway'
import type PaymentGateway from '#application/gateways/payment_gateway'
import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import UserEntity from '#domain/entities/shared/user.entity'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { UserFactory } from '#database/factories/user_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'
import ClientService from '#services/transactions/client.service'
import type TransactionDetailsTransformer from '#transformers/transaction_details_transformer'
import Client from '#models/transactions/client'
import Transaction from '#models/transactions/transaction'
import type User from '#models/auth/user'

const PURCHASES_BASE_URL = '/api/v1/purchases'

type PurchaseResponseBody = {
  data: Omit<InferData<TransactionDetailsTransformer>, 'items'> & {
    items: Array<
      InferData<TransactionDetailsTransformer>['items'][number] & { parcial_price: number }
    >
    total_price: number
  }
}

class SpyGatewayProcessor implements PaymentGateway {
  readonly chargeCalls: ChargeGatewayInput[] = []
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

  async refund(_externalId: string) {}
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

async function syncClientForUser(user: User) {
  const clientService = await app.container.make(ClientService)
  await clientService.ensureForUser(UserEntity.fromRecord(user.toRecord()))

  return user
}

test.group('PurchasesController | functional', (group) => {
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

  test('creates a purchase, reuses the user payment client, and returns the serialized transaction details', async ({
    client,
    assert,
  }) => {
    // given
    const user = await syncClientForUser(await UserFactory.create())
    const gateway = await GatewayFactory.merge({
      name: 'Gateway 1',
      isActive: true,
      priority: 1,
    }).create()
    const product = await ProductFactory.merge({
      name: 'Keyboard',
      quantity: 10,
    }).create()

    // when
    const response = await client
      .post(PURCHASES_BASE_URL)
      .loginAs(user)
      .json({
        name: 'Jane Doe',
        email: 'jane@betalent.tech',
        cardNumber: '5569000000006063',
        cvv: '010',
        items: [{ productId: product.id, quantity: 2, price: '10.00' }],
      })

    // then
    response.assertStatus(200)

    const createdClient = await Client.findByOrFail('userId', user.id)
    const createdTransaction = await Transaction.findByOrFail(
      'external_id',
      'gateway-1-test-transaction'
    )
    const body = response.body() as PurchaseResponseBody
    const persistedClients = await Client.query().where('user_id', user.id)
    const paymentClientFromPurchasePayload = await Client.findBy('email', 'jane@betalent.tech')

    assert.deepEqual(body, {
      data: {
        id: createdTransaction.id,
        externalId: 'gateway-1-test-transaction',
        status: TransactionStatusEnum.AUTHORIZED,
        amount: 20,
        cardLastNumbers: '6063',
        client: {
          id: createdClient.id,
          userId: user.id,
          name: user.email,
          email: user.email,
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
              id: product.id,
              name: product.name,
            },
            quantity: 2,
            parcial_price: 20,
          },
        ],
        total_price: 20,
      },
    })

    assert.equal(gatewayOneProcessor.setupCalls, 1)
    assert.deepEqual(gatewayOneProcessor.chargeCalls, [
      {
        amount: 2000,
        name: 'Jane Doe',
        email: 'jane@betalent.tech',
        cardNumber: '5569000000006063',
        cvv: '010',
      },
    ])
    assert.equal(gatewayTwoProcessor.setupCalls, 0)
    assert.deepEqual(gatewayTwoProcessor.chargeCalls, [])
    assert.equal(createdClient.userId, user.id)
    assert.lengthOf(persistedClients, 1)
    assert.isNull(paymentClientFromPurchasePayload)
    assert.equal(createdTransaction.gatewayId, gateway.id)
    assert.equal(createdTransaction.status, TransactionStatusEnum.AUTHORIZED)
  })
})

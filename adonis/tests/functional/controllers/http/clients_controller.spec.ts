import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { ClientFactory } from '#database/factories/client_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { TransactionFactory } from '#database/factories/transaction_factory'
import { TransactionProductFactory } from '#database/factories/transaction_product_factory'
import { TransactionStatusEnum } from '#domain/enums/transactions/transaction_status.enum'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const CLIENTS_BASE_URL = '/api/v1/clients'

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

async function cleanupClients() {
  await db.from('transaction_products').delete()
  await db.from('transactions').delete()
  await db.from('products').delete()
  await db.from('gateways').delete()
  await db.from('clients').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('ClientsController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupClients()
  })

  group.each.timeout(10000)

  test('rejects guests when listing clients', async ({ client }) => {
    // given
    await ClientFactory.create()

    // when
    const response = await client.get(CLIENTS_BASE_URL)

    // then
    response.assertStatus(401)
  })

  test('lists clients for authenticated users', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    await ClientFactory.create()

    // when
    const response = await client.get(CLIENTS_BASE_URL).loginAs(user)

    // then
    response.assertStatus(200)
  })

  test('lists clients for finance users', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    await ClientFactory.create()

    // when
    const response = await client.get(CLIENTS_BASE_URL).loginAs(finance)

    // then
    response.assertStatus(200)
  })

  test('shows a client with serialized transactions only', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const clientRecord = await ClientFactory.create()
    const gateway = await GatewayFactory.merge({
      name: 'gateway 2',
      isActive: true,
      priority: 2,
    }).create()
    const product = await ProductFactory.merge({
      name: 'Produto A',
      amount: '10.00',
    }).create()
    const transaction = await TransactionFactory.merge({
      clientId: clientRecord.id,
      gatewayId: gateway.id,
      externalId: 'ada5ec8d-b01f-4e0c-8a1e-cbdd8a8261df',
      status: TransactionStatusEnum.AUTHORIZED,
      amount: 2000,
      cardLastNumbers: '6063',
    }).create()

    await TransactionProductFactory.merge({
      transactionId: transaction.id,
      productId: product.id,
      quantity: 2,
    }).create()

    // when
    const response = await client.get(`${CLIENTS_BASE_URL}/${clientRecord.id}`).loginAs(user)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: clientRecord.id,
        name: clientRecord.name,
        email: clientRecord.email,
        transactions: [
          {
            id: transaction.id,
            externalId: 'ada5ec8d-b01f-4e0c-8a1e-cbdd8a8261df',
            status: TransactionStatusEnum.AUTHORIZED,
            amount: '20.00',
            cardLastNumbers: '6063',
            client: {
              id: clientRecord.id,
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
                quantity: 2,
                product: {
                  id: product.id,
                  name: product.name,
                  amount: '10.00',
                },
              },
            ],
          },
        ],
      },
    })
  })

  test('shows a client for finance users', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()
    const clientRecord = await ClientFactory.create()

    // when
    const response = await client.get(`${CLIENTS_BASE_URL}/${clientRecord.id}`).loginAs(finance)

    // then
    response.assertStatus(200)
  })
})

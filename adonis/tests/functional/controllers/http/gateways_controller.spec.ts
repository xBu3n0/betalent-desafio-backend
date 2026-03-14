import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import Gateway from '#models/transactions/gateway'
import { UserFactory } from '#database/factories/user_factory'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const GATEWAYS_BASE_URL = '/api/v1/gateways'
const MISSING_GATEWAY_ID = 999999

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

async function cleanupGateways() {
  await db.from('gateways').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('GatewaysController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupGateways()
  })

  group.each.timeout(10000)

  test('rejects guests when listing gateways', async ({ client }) => {
    // given

    // when
    const response = await client.get(GATEWAYS_BASE_URL)

    // then
    response.assertStatus(401)
  })

  test('lists gateways for authenticated users', async ({ client, assert }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const first = await GatewayFactory.merge({ priority: 2, isActive: true }).create()
    const second = await GatewayFactory.merge({ priority: 1, isActive: false }).create()

    // when
    const response = await client.get(GATEWAYS_BASE_URL).loginAs(user)

    // then
    response.assertStatus(200)

    const { data: gateways } = response.body()

    assert.deepEqual(gateways, [
      {
        id: second.id,
        name: second.name,
        isActive: false,
        priority: 1,
      },
      {
        id: first.id,
        name: first.name,
        isActive: true,
        priority: 2,
      },
    ])
  })

  test('rejects non-admin users when updating gateway status', async ({ client }) => {
    // given
    const user = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const gateway = await GatewayFactory.merge({ priority: 1, isActive: true }).create()

    // when
    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${gateway.id}/status`)
      .loginAs(user)
      .json({
        isActive: false,
      })

    // then
    response.assertStatus(403)
  })

  test('updates gateway status for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const gateway = await GatewayFactory.merge({ priority: 1, isActive: true }).create()

    // when
    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${gateway.id}/status`)
      .loginAs(admin)
      .json({
        isActive: false,
      })

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: gateway.id,
        name: gateway.name,
        isActive: false,
        priority: 1,
      },
    })

    const updatedGateway = await Gateway.findOrFail(gateway.id)
    assert.isFalse(updatedGateway.isActive)
  })

  test('updates gateway priority for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const first = await GatewayFactory.merge({ priority: 1, isActive: true }).create()
    const second = await GatewayFactory.merge({ priority: 2, isActive: true }).create()

    // when
    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${second.id}/priority`)
      .loginAs(admin)
      .json({
        priority: 1,
      })

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: second.id,
        name: second.name,
        isActive: true,
        priority: 1,
      },
    })

    // when
    const gateways = await Gateway.query().orderBy('priority', 'asc').orderBy('id', 'asc')

    // then
    assert.deepEqual(
      gateways.map((gateway) => ({ id: gateway.id, priority: gateway.priority })),
      [
        { id: first.id, priority: 1 },
        { id: second.id, priority: 1 },
      ]
    )
  })

  test('returns validation error when gateway priority is invalid', async ({ client }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const gateway = await GatewayFactory.merge({ priority: 1, isActive: true }).create()

    // when
    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${gateway.id}/priority`)
      .loginAs(admin)
      .json({
        priority: 0,
      })

    // then
    response.assertStatus(422)
  })

  test('returns not found when updating a missing gateway', async ({ client }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()

    // when
    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${MISSING_GATEWAY_ID}/status`)
      .loginAs(admin)
      .json({
        isActive: false,
      })

    // then
    response.assertStatus(404)
  })
})

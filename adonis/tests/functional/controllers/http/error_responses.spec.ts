import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { GatewayFactory } from '#database/factories/gateway_factory'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const GATEWAYS_BASE_URL = '/api/v1/gateways'
const LOGIN_URL = '/api/v1/auth/login'
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

async function cleanupData() {
  await db.from('transaction_products').delete()
  await db.from('transactions').delete()
  await db.from('products').delete()
  await db.from('gateways').delete()
  await db.from('clients').delete()
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('Error responses | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupData()
  })

  test('returns guest authentication failures inside an errors array', async ({
    client,
    assert,
  }) => {
    const response = await client.get(GATEWAYS_BASE_URL)

    response.assertStatus(401)

    const body = response.body() as unknown as {
      errors: Array<{ message: string }>
    }

    assert.isArray(body.errors)
    assert.lengthOf(body.errors, 1)
    assert.property(body.errors[0], 'message')
  })

  test('returns validation failures inside an errors array', async ({ client, assert }) => {
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const gateway = await GatewayFactory.merge({ priority: 1, isActive: true }).create()

    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${gateway.id}/priority`)
      .loginAs(manager)
      .json({
        priority: 0,
      })

    response.assertStatus(422)

    const body = response.body() as unknown as {
      errors: Array<{ message: string; field?: string; rule?: string }>
    }

    assert.isArray(body.errors)
    assert.isAtLeast(body.errors.length, 1)
    assert.include(
      body.errors.map((error) => error.field),
      'priority'
    )
  })

  test('returns domain exceptions inside an errors array', async ({ client, assert }) => {
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    const response = await client
      .patch(`${GATEWAYS_BASE_URL}/${MISSING_GATEWAY_ID}/status`)
      .loginAs(user)
      .json({
        isActive: false,
      })

    response.assertStatus(404)

    const body = response.body() as unknown as {
      errors: Array<{ message: string }>
    }

    assert.isArray(body.errors)
    assert.lengthOf(body.errors, 1)
    assert.include(body.errors[0].message, 'was not found')
  })

  test('returns login failures inside an errors array', async ({ client, assert }) => {
    await UserFactory.merge({
      email: 'admin@example.com',
      role: RoleEnum.ADMIN,
    }).create()

    const response = await client.post(LOGIN_URL).json({
      email: 'admin@example.com',
      password: 'wrong-password',
    })

    response.assertStatus(401)

    const body = response.body() as unknown as {
      errors: Array<{ message: string }>
    }

    assert.isArray(body.errors)
    assert.lengthOf(body.errors, 1)
    assert.property(body.errors[0], 'message')
  })
})

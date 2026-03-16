import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const LOGIN_URL = '/api/v1/auth/login'

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

async function cleanupUsers() {
  await db.from('auth_access_tokens').delete()
  await db.from('users').delete()
}

test.group('AccessTokenController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupUsers()
  })

  group.each.timeout(10000)

  test('authenticates a user and returns a serialized token response', async ({
    client,
    assert,
  }) => {
    // given
    const user = await UserFactory.merge({
      email: 'admin@example.com',
      password: 'password123',
      role: RoleEnum.ADMIN,
    }).create()

    // when
    const response = await client.post(LOGIN_URL).json({
      email: user.email,
      password: 'password123',
    })

    // then
    response.assertStatus(200)

    const body = response.body() as unknown as {
      data: {
        user: {
          id: number
          email: string
          role: RoleEnum
        }
        token: string
      }
    }

    assert.deepEqual(body.data.user, {
      id: user.id,
      email: user.email,
      role: user.role,
    })
    assert.isString(body.data.token)
    assert.isNotEmpty(body.data.token)
    assert.notProperty(body.data.user, 'password')

    const persistedTokens = await db
      .from('auth_access_tokens')
      .where('tokenable_id', user.id)
      .count('* as total')

    assert.equal(Number(persistedTokens[0].total), 1)
  })

  test('returns validation errors for an invalid login payload', async ({ client, assert }) => {
    // given

    // when
    const response = await client.post(LOGIN_URL).json({
      email: 'invalid-email',
    })

    // then
    response.assertStatus(422)

    const body = response.body() as unknown as {
      errors: Array<{ field?: string }>
    }

    assert.includeMembers(
      body.errors.map((error) => error.field).filter(Boolean),
      ['email', 'password']
    )
  })
})

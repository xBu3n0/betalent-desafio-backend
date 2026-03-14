import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import User from '#models/auth/user'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const USERS_BASE_URL = '/api/v1/users'
const MISSING_USER_ID = 999999

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

test.group('UsersController | functional', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(async () => {
    await cleanupUsers()
  })

  test('rejects guests when listing users', async ({ client }) => {
    // when
    const response = await client.get(USERS_BASE_URL)

    // then
    response.assertStatus(401)
  })

  test('rejects non-admin users when creating a user', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client.post(USERS_BASE_URL).loginAs(manager).json({
      email: 'created-user@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      role: RoleEnum.USER,
    })

    // then
    response.assertStatus(403)
  })

  test('creates a user for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()

    // when
    const response = await client.post(USERS_BASE_URL).loginAs(admin).json({
      email: 'created-user@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      role: RoleEnum.USER,
    })

    // then
    response.assertStatus(200)
    const { data: user } = response.body()
    response.assertBodyContains({
      data: {
        user: {
          email: 'created-user@example.com',
          role: RoleEnum.USER,
        },
      },
    })
    response.assertBodyNotContains({
      data: {
        user: {
          password: 'password123',
        },
      },
    })
    assert.notProperty(user, 'password')
  })

  test('lists users for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const first = await UserFactory.merge({ role: RoleEnum.USER }).create()
    const second = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()

    // when
    const response = await client.get(USERS_BASE_URL).loginAs(admin)

    // then
    response.assertStatus(200)

    const { data: users } = response.body()

    assert.lengthOf(users as { id: number; email: string; role: RoleEnum }[], 3)
    assert.deepInclude(users, { id: admin.id, email: admin.email, role: admin.role })
    assert.deepInclude(users, { id: first.id, email: first.email, role: first.role })
    assert.deepInclude(users, { id: second.id, email: second.email, role: second.role })
  })

  test('shows a user for admins', async ({ client }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.get(`${USERS_BASE_URL}/${user.id}`).loginAs(admin)

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  })

  test('returns not found when the requested user does not exist', async ({ client }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()

    // when
    const response = await client.get(`${USERS_BASE_URL}/${MISSING_USER_ID}`).loginAs(admin)

    // then
    response.assertStatus(404)
  })

  test('updates a user for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.patch(`${USERS_BASE_URL}/${user.id}`).loginAs(admin).json({
      email: 'updated-user@example.com',
      role: RoleEnum.MANAGER,
    })

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: user.id,
        email: 'updated-user@example.com',
        role: RoleEnum.MANAGER,
      },
    })

    const updatedUser = await User.findOrFail(user.id)
    assert.equal(updatedUser.email, 'updated-user@example.com')
    assert.equal(updatedUser.role, RoleEnum.MANAGER)
  })

  test('deletes a user for admins', async ({ client, assert }) => {
    // given
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.delete(`${USERS_BASE_URL}/${user.id}`).loginAs(admin)

    // then
    response.assertStatus(200)
    response.assertBody({
      message: 'User removed successfully',
    })
    assert.isNull(await User.find(user.id))
  })
})

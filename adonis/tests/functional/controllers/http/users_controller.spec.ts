import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import User from '#models/auth/user'
import Client from '#models/transactions/client'
import ClientService from '#services/transactions/client.service'
import UserEntity from '#domain/entities/shared/user.entity'
import { UserFactory } from '#database/factories/user_factory'
import { RoleEnum } from '#enums/auth/role.enum'

const USERS_BASE_URL = '/api/v1/users'
const MISSING_USER_ID = 999999
type CreatedUserResponseBody = {
  data: {
    user: {
      id: number
      email: string
      role: RoleEnum
    }
    token: string
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

async function cleanupUsers() {
  await db.from('auth_access_tokens').delete()
  await db.from('clients').delete()
  await db.from('users').delete()
}

async function syncClientForUser(user: User) {
  const clientService = await app.container.make(ClientService)
  await clientService.ensureForUser(UserEntity.fromRecord(user.toRecord()))

  return user
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
    // given

    // when
    const response = await client.get(USERS_BASE_URL)

    // then
    response.assertStatus(401)
  })

  test('rejects finance users when creating a user', async ({ client }) => {
    // given
    const finance = await UserFactory.merge({ role: RoleEnum.FINANCE }).create()

    // when
    const response = await client.post(USERS_BASE_URL).loginAs(finance).json({
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
    const {
      data: { user },
    } = response.body() as CreatedUserResponseBody
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

    const createdClient = await Client.findByOrFail('email', 'created-user@example.com')
    assert.equal(createdClient.userId, user.id)
    assert.equal(createdClient.name, 'created-user@example.com')
  })

  test('creates a user for managers', async ({ client, assert }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client.post(USERS_BASE_URL).loginAs(manager).json({
      email: 'created-by-manager@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      role: RoleEnum.USER,
    })

    // then
    response.assertStatus(200)
    const {
      data: { user },
    } = response.body() as CreatedUserResponseBody
    response.assertBodyContains({
      data: {
        user: {
          email: 'created-by-manager@example.com',
          role: RoleEnum.USER,
        },
      },
    })
    assert.notProperty(user, 'password')

    const createdClient = await Client.findByOrFail('email', 'created-by-manager@example.com')
    assert.equal(createdClient.userId, user.id)
  })

  test('rejects managers when creating an admin user', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client.post(USERS_BASE_URL).loginAs(manager).json({
      email: 'created-admin@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      role: RoleEnum.ADMIN,
    })

    // then
    response.assertStatus(403)
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

  test('shows a user for managers', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.get(`${USERS_BASE_URL}/${user.id}`).loginAs(manager)

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
    const user = await syncClientForUser(await UserFactory.merge({ role: RoleEnum.USER }).create())

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
    const syncedClient = await Client.findByOrFail('userId', user.id)
    assert.equal(updatedUser.email, 'updated-user@example.com')
    assert.equal(updatedUser.role, RoleEnum.MANAGER)
    assert.equal(syncedClient.email, 'updated-user@example.com')
    assert.equal(syncedClient.name, 'updated-user@example.com')
  })

  test('updates a non-admin user for managers', async ({ client, assert }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const user = await syncClientForUser(await UserFactory.merge({ role: RoleEnum.USER }).create())

    // when
    const response = await client.patch(`${USERS_BASE_URL}/${user.id}`).loginAs(manager).json({
      email: 'updated-by-manager@example.com',
      role: RoleEnum.FINANCE,
    })

    // then
    response.assertStatus(200)
    response.assertBody({
      data: {
        id: user.id,
        email: 'updated-by-manager@example.com',
        role: RoleEnum.FINANCE,
      },
    })

    const updatedUser = await User.findOrFail(user.id)
    const syncedClient = await Client.findByOrFail('userId', user.id)
    assert.equal(updatedUser.email, 'updated-by-manager@example.com')
    assert.equal(updatedUser.role, RoleEnum.FINANCE)
    assert.equal(syncedClient.email, 'updated-by-manager@example.com')
    assert.equal(syncedClient.name, 'updated-by-manager@example.com')
  })

  test('rejects managers when updating an admin', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()

    // when
    const response = await client.patch(`${USERS_BASE_URL}/${admin.id}`).loginAs(manager).json({
      email: 'blocked-update@example.com',
    })

    // then
    response.assertStatus(403)
  })

  test('rejects managers when updating another manager', async ({ client }) => {
    // given
    const actingManager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const targetManager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client
      .patch(`${USERS_BASE_URL}/${targetManager.id}`)
      .loginAs(actingManager)
      .json({
        email: 'blocked-manager-update@example.com',
      })

    // then
    response.assertStatus(403)
  })

  test('rejects managers when promoting a user to admin', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.patch(`${USERS_BASE_URL}/${user.id}`).loginAs(manager).json({
      role: RoleEnum.ADMIN,
    })

    // then
    response.assertStatus(403)
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
    assert.isNull(await Client.findBy('userId', user.id))
  })

  test('deletes a non-admin user for managers', async ({ client, assert }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const user = await UserFactory.merge({ role: RoleEnum.USER }).create()

    // when
    const response = await client.delete(`${USERS_BASE_URL}/${user.id}`).loginAs(manager)

    // then
    response.assertStatus(200)
    response.assertBody({
      message: 'User removed successfully',
    })
    assert.isNull(await User.find(user.id))
    assert.isNull(await Client.findBy('userId', user.id))
  })

  test('rejects managers when deleting an admin', async ({ client }) => {
    // given
    const manager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const admin = await UserFactory.merge({ role: RoleEnum.ADMIN }).create()

    // when
    const response = await client.delete(`${USERS_BASE_URL}/${admin.id}`).loginAs(manager)

    // then
    response.assertStatus(403)
  })

  test('rejects managers when deleting another manager', async ({ client }) => {
    // given
    const actingManager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()
    const targetManager = await UserFactory.merge({ role: RoleEnum.MANAGER }).create()

    // when
    const response = await client
      .delete(`${USERS_BASE_URL}/${targetManager.id}`)
      .loginAs(actingManager)

    // then
    response.assertStatus(403)
  })
})

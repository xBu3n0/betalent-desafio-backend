import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import UserService from '#services/auth/user.service'
import ClientService from '#services/transactions/client.service'
import { RoleEnum } from '#enums/auth/role.enum'
import UserNotFoundException from '#domain/exceptions/auth/user_not_found.exception'
import User from '#models/auth/user'
import Client from '#models/transactions/client'
import UserEntity from '#domain/entities/shared/user.entity'
import { UserFactory } from '#database/factories/user_factory'
import InvalidCredentialsException from '#domain/exceptions/auth/invalid_credentials.exception'
import hash from '@adonisjs/core/services/hash'

const MISSING_USER_ID = 999999

async function makeService() {
  return app.container.make(UserService)
}

async function syncClientForUser(user: User) {
  const clientService = await app.container.make(ClientService)
  await clientService.ensureForUser(UserEntity.fromRecord(user.toRecord()))

  return user
}

async function makeUserInput(role?: RoleEnum) {
  const user = role ? await UserFactory.merge({ role }).make() : await UserFactory.make()
  return {
    email: user.email,
    password: user.password,
    role: user.role as RoleEnum,
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

test.group('UserService integration (real database)', (group) => {
  group.setup(async () => {
    await runAceCommand('migration:run', ['--compact-output', '--no-schema-generate'])

    return () => runAceCommand('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.each.setup(() => {
    hash.fake()

    return () => hash.restore()
  })

  group.each.timeout(10000)

  test('registers a new user, returns an access token, and creates one synced client', async ({
    assert,
  }) => {
    // given
    const service = await makeService()
    const input = await makeUserInput(RoleEnum.USER)

    // when
    const output = await service.create(input)

    // then
    assert.equal(output.user.email.value, input.email)
    assert.equal(output.user.role.value, input.role)
    assert.isString(output.token)
    assert.isAbove(output.token.length, 0)

    const createdClient = await Client.findByOrFail('userId', output.user.id.value)
    const createdClients = await Client.query().where('user_id', output.user.id.value)
    assert.equal(createdClient.email, input.email)
    assert.equal(createdClient.name, input.email)
    assert.lengthOf(createdClients, 1)
  })

  test('logs in with valid credentials', async ({ assert }) => {
    // given
    const service = await makeService()
    const password = 'password123'
    const seeded = await UserFactory.merge({
      role: RoleEnum.MANAGER,
      password,
    }).create()

    // when
    const output = await service.login({
      email: seeded.email,
      password,
    })

    // then
    assert.equal(output.user.email.value, seeded.email)
    assert.equal(output.user.role.value, seeded.role)
    assert.isString(output.token)
    assert.isAbove(output.token.length, 0)
  })

  test('returns a friendly error when credentials are invalid', async ({ assert }) => {
    // given
    const service = await makeService()
    const seeded = await UserFactory.merge({
      password: 'password123',
    }).create()

    // when
    const loginWithWrongPassword = () =>
      service.login({
        email: seeded.email,
        password: 'wrongpassword123',
      })

    // then
    await assert.rejects(loginWithWrongPassword, InvalidCredentialsException)
  })

  test('updates the email and role of an existing user without creating another client', async ({
    assert,
  }) => {
    // given
    const service = await makeService()
    const created = await syncClientForUser(
      await UserFactory.merge({
        role: RoleEnum.USER,
      }).create()
    )
    const originalClient = await Client.findByOrFail('userId', created.id)

    const newUser = await makeUserInput()
    const newEmail = newUser.email

    // when
    const updated = await service.update(created.id, {
      email: newEmail,
      role: RoleEnum.ADMIN,
    })

    // then
    assert.equal(updated.id.value, created.id)
    assert.equal(updated.email.value, newEmail)
    assert.equal(updated.role.value, RoleEnum.ADMIN)

    const syncedClient = await Client.findByOrFail('userId', created.id)
    const syncedClients = await Client.query().where('user_id', created.id)
    assert.equal(syncedClient.email, newEmail)
    assert.equal(syncedClient.name, newEmail)
    assert.equal(syncedClient.id, originalClient.id)
    assert.lengthOf(syncedClients, 1)
  })

  test('returns not found when trying to update a missing user', async ({ assert }) => {
    // given
    const service = await makeService()

    const newUser = await makeUserInput()
    const input = { email: newUser.email }

    // when
    const updateMissingUser = () => service.update(MISSING_USER_ID, input)

    // then
    await assert.rejects(updateMissingUser, UserNotFoundException)
  })

  test('lists users', async ({ assert }) => {
    // given
    const service = await makeService()
    const first = await UserFactory.merge({
      role: RoleEnum.USER,
    }).create()
    const second = await UserFactory.merge({
      role: RoleEnum.FINANCE,
    }).create()

    // when
    const listedUsers = await service.listUsers()
    const listedEmails = listedUsers.map((user) => user.email.value)

    // then
    assert.includeMembers(listedEmails, [first.email, second.email])
  })

  test('fetches a user by id', async ({ assert }) => {
    // given
    const service = await makeService()
    const user = await UserFactory.merge({
      role: RoleEnum.USER,
    }).create()

    // when
    const byId = await service.getById(user.id)

    // then
    assert.equal(byId.email.value, user.email)
  })

  test('fetches a user by email', async ({ assert }) => {
    // given
    const service = await makeService()
    const user = await UserFactory.merge({
      role: RoleEnum.FINANCE,
    }).create()

    // when
    const byEmail = await service.findByEmail(user.email)

    // then
    assert.isNotNull(byEmail)
    assert.equal(byEmail!.id.value, user.id)
  })

  test('deletes a user', async ({ assert }) => {
    // given
    const service = await makeService()
    const user = await UserFactory.merge({
      role: RoleEnum.USER,
    }).create()

    // when
    await service.delete(user.id)

    // then
    const deletedUser = await service.findByEmail(user.email)
    assert.isNull(deletedUser)
    assert.isNull(await Client.findBy('userId', user.id))
  })

  test('stores access tokens in the database', async ({ assert }) => {
    // given
    const user = await UserFactory.create()

    // when
    const token = await User.accessTokens.create(user, ['*'])
    const tokenValue = token.value!.release()

    // then
    assert.match(tokenValue, /^oat_/)
    assert.equal(token.tokenableId, user.id)
  })

  test('returns not found when user id does not exist', async ({ assert }) => {
    // given
    const service = await makeService()

    // when
    const getMissingUser = () => service.getById(MISSING_USER_ID)

    // then
    await assert.rejects(getMissingUser, UserNotFoundException)
  })
})

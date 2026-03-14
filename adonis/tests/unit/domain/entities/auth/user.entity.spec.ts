import { test } from '@japa/runner'
import UserEntity from '#domain/entities/shared/user.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import { Email } from '#domain/primitives/shared/email.primitive'

test('builds a user entity from stored data', ({ assert }) => {
  // given
  const record = {
    id: 1,
    email: 'dev@betalent.tech',
    role: RoleEnum.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // when
  const entity = UserEntity.fromRecord(record)

  // then
  assert.equal(entity.id.value, 1)
  assert.equal(entity.email.value, record.email)
  assert.equal(entity.role.value, record.role)
})

test('updates the email while keeping other data intact', ({ assert }) => {
  // given
  const record = {
    id: 3,
    email: 'user2@betalent.tech',
    role: RoleEnum.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const entity = UserEntity.fromRecord(record)
  const updatedEmail = Email.create('updated@betalent.tech')

  // when
  const updated = entity.changeEmail(updatedEmail)

  // then
  assert.equal(entity.email.value, 'user2@betalent.tech')
  assert.equal(updated.email.value, updatedEmail.value)
  assert.equal(updated.role.value, entity.role.value)
  assert.notStrictEqual(entity, updated)
})

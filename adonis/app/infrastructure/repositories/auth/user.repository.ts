import type { Email } from '#domain/primitives/shared/email.primitive'
import type { Password } from '#domain/primitives/auth/password.primitive'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'
import type { CreateUserPayload } from '#repositories/auth/user.payload'

import type NewUserEntity from '#domain/entities/auth/new_user.entity'
import UserEntity from '#domain/entities/shared/user.entity'
import User from '#models/auth/user'
import type UserRepositoryInterface from '#repositories/auth/user.repository'

export default class LucidUserRepository implements UserRepositoryInterface {
  async list() {
    const users = await User.all()
    return users.map((user) => UserEntity.fromRecord(user.toRecord()))
  }

  async findById(id: UserId) {
    const user = await User.find(id.value)
    if (!user) {
      return null
    }

    return UserEntity.fromRecord(user.toRecord())
  }

  async findByEmail(email: Email) {
    const user = await User.findBy('email', email.value)
    if (!user) {
      return null
    }

    return UserEntity.fromRecord(user.toRecord())
  }

  async create(newUser: NewUserEntity, payload: CreateUserPayload) {
    const user = await User.create({
      email: newUser.email.value,
      password: payload.password.value,
      role: newUser.role.value,
    })

    return UserEntity.fromRecord(user.toRecord())
  }

  async update(entity: UserEntity): Promise<UserEntity> {
    const user = await User.findOrFail(entity.id.value)

    user.email = entity.email.value
    user.role = entity.role.value

    await user.save()

    return UserEntity.fromRecord(user.toRecord())
  }

  async delete(id: UserId): Promise<void> {
    const user = await User.findOrFail(id.value)

    await user.delete()
  }

  async verifyCredentials(email: Email, password: Password) {
    const user = await User.verifyCredentials(email.value, password.value)
    return UserEntity.fromRecord(user.toRecord())
  }

  async issueAccessToken(userId: UserId) {
    const user = await User.findOrFail(userId.value)
    const token = await User.accessTokens.create(user)
    return token.value!.release()
  }
}

import type UserEntity from '#domain/entities/shared/user.entity'
import type { Email } from '#domain/primitives/shared/email.primitive'
import type { Password } from '#domain/primitives/auth/password.primitive'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'
import type { CreateUserPayload } from './user.payload.ts'
import type NewUserEntity from '#domain/entities/auth/new_user.entity'

export default abstract class UserRepositoryInterface {
  abstract list(): Promise<UserEntity[]>
  abstract findById(id: UserId): Promise<UserEntity | null>
  abstract findByEmail(email: Email): Promise<UserEntity | null>
  abstract create(newUser: NewUserEntity, payload: CreateUserPayload): Promise<UserEntity>
  abstract update(entity: UserEntity): Promise<UserEntity>
  abstract delete(id: UserId): Promise<void>
  abstract verifyCredentials(email: Email, password: Password): Promise<UserEntity>
  abstract issueAccessToken(userId: UserId): Promise<string>
}

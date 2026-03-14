import type UserEntity from '#domain/entities/shared/user.entity'
import type { Password } from '#domain/primitives/auth/password.primitive'

export interface CreateUserPayload {
  password: Password
}

export type UpdateUserPayload = Partial<Omit<UserEntity, 'id'>> & {
  password?: Password
}

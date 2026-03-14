import type UserEntity from '#domain/entities/shared/user.entity'

export interface AuthenticationOutput {
  user: UserEntity
  token: string
}

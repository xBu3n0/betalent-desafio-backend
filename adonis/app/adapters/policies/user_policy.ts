import type UserEntity from '#domain/entities/shared/user.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  create(user: User): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }

  readAll(user: User): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }

  read(user: User, _accessedUser: UserEntity): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }

  update(user: User, _accessedUser: UserEntity): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }

  delete(user: User, _accessedUser: UserEntity): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }
}

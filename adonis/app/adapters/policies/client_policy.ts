import { RoleEnum } from '#enums/auth/role.enum'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type User from '#models/auth/user'

export default class ClientPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  readAll(user: User): AuthorizerResponse {
    return user.role === RoleEnum.USER
  }

  read(user: User): AuthorizerResponse {
    return user.role === RoleEnum.USER
  }
}

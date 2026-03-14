import { RoleEnum } from '#enums/auth/role.enum'
import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class GatewayPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  readAll(_user: User): AuthorizerResponse {
    return true
  }

  update(user: User): AuthorizerResponse {
    return user.role === RoleEnum.ADMIN
  }
}

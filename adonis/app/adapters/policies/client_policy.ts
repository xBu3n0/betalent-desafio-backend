import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type User from '#models/auth/user'

export default class ClientPolicy extends BasePolicy {
  readAll(_user: User): AuthorizerResponse {
    return true
  }

  read(_user: User): AuthorizerResponse {
    return true
  }
}

import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  before(user: User | null, _action: string, ..._params: any[]): AuthorizerResponse {
    return user ? true : false
  }
}

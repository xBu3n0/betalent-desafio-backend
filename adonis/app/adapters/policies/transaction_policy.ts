import type TransactionEntity from '#domain/entities/shared/transaction.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class TransactionPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  readAll(user: User): AuthorizerResponse {
    return user.role === RoleEnum.FINANCE
  }

  read(user: User, _transaction: TransactionEntity): AuthorizerResponse {
    return user.role === RoleEnum.FINANCE
  }

  refund(user: User, _transaction: TransactionEntity): AuthorizerResponse {
    return user.role === RoleEnum.FINANCE
  }
}

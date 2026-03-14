import type ProductEntity from '#domain/entities/shared/product.entity'
import { RoleEnum } from '#enums/auth/role.enum'
import type User from '#models/auth/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ProductPolicy extends BasePolicy {
  before(user: User) {
    if (user.role === RoleEnum.ADMIN) {
      return true
    }
  }

  create(user: User): AuthorizerResponse {
    return [RoleEnum.MANAGER, RoleEnum.FINANCE].includes(user.role as RoleEnum)
  }

  readAll(_user: User): AuthorizerResponse {
    return true
  }

  read(_user: User, _product: ProductEntity): AuthorizerResponse {
    return true
  }

  update(user: User, _product: ProductEntity): AuthorizerResponse {
    return [RoleEnum.MANAGER, RoleEnum.FINANCE].includes(user.role as RoleEnum)
  }

  delete(user: User, _product: ProductEntity): AuthorizerResponse {
    return [RoleEnum.MANAGER, RoleEnum.FINANCE].includes(user.role as RoleEnum)
  }
}

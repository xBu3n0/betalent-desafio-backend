import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { UserRecord } from '#domain/entities/shared/user.entity'
import type { RoleEnum } from '#enums/auth/role.enum'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  toRecord(): UserRecord {
    return {
      id: this.id,
      email: this.email,
      role: this.role as RoleEnum,
    }
  }
}

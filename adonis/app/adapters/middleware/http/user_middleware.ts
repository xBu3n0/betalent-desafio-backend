import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import { inject } from '@adonisjs/core'
import PermissionDeniedException from '#domain/exceptions/shared/permission_denied_exception'
import UserService from '#services/auth/user.service'
import UserPolicy from '#policies/user_policy'
import UserEntity from '#domain/entities/shared/user.entity'

/**
 * Middleware to handle user authentication and authorization based on specified guards and abilities.
 */
@inject()
export default class UserMiddleware {
  constructor(private readonly userService: UserService) {}

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      abilities?: ('create' | 'readAll' | 'read' | 'update' | 'delete')[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)

    let refUser: UserEntity | null = null

    for (const ability of options.abilities || []) {
      switch (ability) {
        case 'create':
          if (await ctx.bouncer.with(UserPolicy).denies(ability)) {
            throw new PermissionDeniedException()
          }
          break
        case 'readAll':
          if (await ctx.bouncer.with(UserPolicy).denies(ability)) {
            throw new PermissionDeniedException()
          }
          break
        default:
          if (!refUser) {
            refUser = await this.userService.getById(Number(ctx.params.id))
          }

          if (await ctx.bouncer.with(UserPolicy).denies(ability, refUser)) {
            throw new PermissionDeniedException()
          }
      }
    }

    return next()
  }
}

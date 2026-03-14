import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import PermissionDeniedException from '#domain/exceptions/shared/permission_denied_exception'
import GatewayPolicy from '#policies/gateway_policy'

export default class GatewayMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      abilities?: ('readAll' | 'update')[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)
    const gatewayAuthorizer = ctx.bouncer.with(GatewayPolicy) as {
      denies(ability: 'readAll' | 'update'): Promise<boolean>
    }

    for (const ability of options.abilities || []) {
      if (await gatewayAuthorizer.denies(ability)) {
        throw new PermissionDeniedException()
      }
    }

    return next()
  }
}

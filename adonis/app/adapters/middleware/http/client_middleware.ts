import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import PermissionDeniedException from '#domain/exceptions/shared/permission_denied.exception'
import ClientPolicy from '#policies/client_policy'

export default class ClientMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      abilities?: ('readAll' | 'read')[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)
    const clientAuthorizer = ctx.bouncer.with(ClientPolicy) as {
      denies(ability: 'readAll' | 'read'): Promise<boolean>
    }

    for (const ability of options.abilities || []) {
      if (await clientAuthorizer.denies(ability)) {
        throw new PermissionDeniedException()
      }
    }

    return next()
  }
}

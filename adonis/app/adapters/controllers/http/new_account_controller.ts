import { createUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import UserService from '#services/auth/user.service'
import { inject } from '@adonisjs/core'

@inject()
export default class NewAccountController {
  constructor(private readonly userService: UserService) {}

  async store({ request, serialize }: HttpContext) {
    const { email, password, role } = await request.validateUsing(createUserValidator)

    const { user, token } = await this.userService.create({ email, password, role })

    return serialize({
      user: UserTransformer.transform(user),
      token,
    })
  }
}

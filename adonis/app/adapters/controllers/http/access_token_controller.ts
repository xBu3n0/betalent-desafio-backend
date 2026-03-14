import User from '#models/auth/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import type UserService from '#services/auth/user.service'

export default class AccessTokenController {
  constructor(private readonly userService: UserService) {}

  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const { user, token } = await this.userService.login({ email, password })

    return serialize({
      user: UserTransformer.transform(user),
      token,
    })
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}

import User from '#models/auth/user'
import { loginValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import UserService from '#services/auth/user.service'

@inject()
export default class AccessTokenController {
  constructor(private readonly userService: UserService) {}

  /**
   * @store
   * @summary Authenticate a user and issue an access token
   * @tag Authentication
   * @requestBody <loginValidator>
   * @responseBody 200 - <AuthResponse>
   * @responseBody 401 - <ErrorResponse>
   */
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const { user, token } = await this.userService.login({ email, password })

    return serialize({
      user: UserTransformer.transform(user),
      token,
    })
  }

  /**
   * @destroy
   * @summary Revoke the current access token
   * @tag Authentication
   * @responseBody 200 - <MessageResponse>
   * @responseBody 401 - <ErrorResponse>
   */
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

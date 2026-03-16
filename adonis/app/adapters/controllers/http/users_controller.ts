import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { createUserValidator, updateUserValidator } from '#validators/user'
import UserService from '#services/auth/user.service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class UsersController {
  constructor(private readonly userService: UserService) {}

  /**
   * @store
   * @summary Create a new user
   * @tag Users
   * @requestBody <createUserValidator>
   * @responseBody 200 - <AuthResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const { user, token } = await this.userService.create(payload)

    return serialize({
      user: UserTransformer.transform(user),
      token: token,
    })
  }

  /**
   * @index
   * @summary List users
   * @tag Users
   * @responseBody 200 - <UserCollectionResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   */
  async index({ serialize }: HttpContext) {
    const users = await this.userService.listUsers()

    return serialize(UserTransformer.transform(users))
  }

  /**
   * @show
   * @summary Show a user by id
   * @tag Users
   * @paramPath id - User id - @type(number) @required
   * @responseBody 200 - <UserResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async show({ params, serialize }: HttpContext) {
    const user = await this.userService.getById(Number(params.id))

    return serialize(UserTransformer.transform(user))
  }

  /**
   * @update
   * @summary Update a user by id
   * @tag Users
   * @paramPath id - User id - @type(number) @required
   * @requestBody <updateUserValidator>
   * @responseBody 200 - <UserResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const updatedUser = await this.userService.update(Number(params.id), payload)

    return serialize(UserTransformer.transform(updatedUser))
  }

  /**
   * @destroy
   * @summary Delete a user by id
   * @tag Users
   * @paramPath id - User id - @type(number) @required
   * @responseBody 200 - <MessageResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async destroy({ params }: HttpContext) {
    await this.userService.delete(Number(params.id))

    return {
      message: 'User removed successfully',
    }
  }
}

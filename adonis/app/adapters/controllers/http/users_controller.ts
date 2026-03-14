import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { createUserValidator, updateUserValidator } from '#validators/user'
import UserService from '#services/auth/user.service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class UsersController {
  constructor(private readonly userService: UserService) {}

  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const { user, token } = await this.userService.create(payload)

    return serialize({
      user: UserTransformer.transform(user),
      token: token,
    })
  }

  async index({ serialize }: HttpContext) {
    const users = await this.userService.listUsers()

    return serialize(UserTransformer.transform(users))
  }

  async show({ params, serialize }: HttpContext) {
    const user = await this.userService.getById(Number(params.id))

    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const updatedUser = await this.userService.update(Number(params.id), payload)

    return serialize(UserTransformer.transform(updatedUser))
  }

  async destroy({ params }: HttpContext) {
    await this.userService.delete(Number(params.id))

    return {
      message: 'User removed successfully',
    }
  }
}

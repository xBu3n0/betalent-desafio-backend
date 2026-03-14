import type UserEntity from '#domain/entities/shared/user.entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<UserEntity> {
  toObject() {
    const { id, email, role } = this.resource

    return {
      id: id.value,
      email: email.value,
      role: role.value,
    }
  }
}

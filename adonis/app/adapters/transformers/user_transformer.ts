import type User from '../../infrastructure/models/auth/user.ts'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'fullName', 'email', 'createdAt', 'updatedAt'])
  }
}

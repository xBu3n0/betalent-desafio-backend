import { Exception } from '@adonisjs/core/exceptions'

export default class UserNotFoundException extends Exception {
  static status = 404
}

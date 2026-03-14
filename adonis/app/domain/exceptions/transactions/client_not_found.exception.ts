import { Exception } from '@adonisjs/core/exceptions'

export default class ClientNotFoundException extends Exception {
  static status = 404
}

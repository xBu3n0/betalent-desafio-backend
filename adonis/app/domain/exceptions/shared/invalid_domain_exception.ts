import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidDomainException extends Exception {
  static status = 400
}

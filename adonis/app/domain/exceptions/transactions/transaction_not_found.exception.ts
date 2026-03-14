import { Exception } from '@adonisjs/core/exceptions'

export default class TransactionNotFoundException extends Exception {
  static status = 404
}

import { Exception } from '@adonisjs/core/exceptions'

export default class TransactionPaymentFailedException extends Exception {
  static status = 422
}

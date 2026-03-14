import { Exception } from '@adonisjs/core/exceptions'

export default class TransactionRefundNotAllowedException extends Exception {
  static status = 422
}

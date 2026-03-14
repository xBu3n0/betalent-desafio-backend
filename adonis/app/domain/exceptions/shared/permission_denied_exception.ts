import { Exception } from '@adonisjs/core/exceptions'

export default class PermissionDeniedException extends Exception {
  static status = 403
  public message = 'You do not have permission to perform this action.'
}

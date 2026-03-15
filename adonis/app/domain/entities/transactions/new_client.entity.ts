import type { Email } from '#domain/primitives/shared/email.primitive'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'
import type { ClientName } from '#domain/primitives/transactions/client_name.primitive'

export default class NewClientEntity {
  private constructor(
    readonly userId: UserId,
    readonly name: ClientName,
    readonly email: Email
  ) {}

  static create(userId: UserId, name: ClientName, email: Email) {
    return new NewClientEntity(userId, name, email)
  }
}

import type { Email } from '#domain/primitives/shared/email.primitive'
import type { Role } from '#domain/primitives/auth/role.primitive'

export default class NewUserEntity {
  private constructor(
    readonly email: Email,
    readonly role: Role
  ) {}

  static create(email: Email, role: Role) {
    return new NewUserEntity(email, role)
  }
}

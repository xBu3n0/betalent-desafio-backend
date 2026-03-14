import { Email } from '#domain/primitives/shared/email.primitive'
import type { Password } from '#domain/primitives/auth/password.primitive'
import { Role } from '#domain/primitives/auth/role.primitive'
import { UserId } from '#domain/primitives/auth/user_id.primitive'

export interface UserRecord {
  id: number
  email: string
  role: string
}

export default class UserEntity {
  private constructor(
    readonly id: UserId,
    readonly email: Email,
    readonly role: Role
  ) {}

  static fromRecord(record: UserRecord) {
    return new UserEntity(
      UserId.create(record.id),
      Email.create(record.email),
      Role.create(record.role)
    )
  }

  changeEmail(email: Email) {
    return new UserEntity(this.id, email, this.role)
  }

  changePassword(password: Password) {
    void password
    return new UserEntity(this.id, this.email, this.role)
  }

  changeRole(role: Role) {
    return new UserEntity(this.id, this.email, role)
  }
}

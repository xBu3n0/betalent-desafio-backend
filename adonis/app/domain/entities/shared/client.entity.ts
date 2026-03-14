import { Email } from '#domain/primitives/shared/email.primitive'
import { UserId } from '#domain/primitives/auth/user_id.primitive'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'

export interface ClientRecord {
  id: number
  userId: number
  name: string
  email: string
  createdAt?: Date
  updatedAt?: Date
}

export default class ClientEntity {
  private constructor(
    readonly id: ClientId,
    readonly userId: UserId,
    readonly name: ClientName,
    readonly email: Email
  ) {}

  static fromRecord(record: ClientRecord) {
    return new ClientEntity(
      ClientId.create(record.id),
      UserId.create(record.userId),
      ClientName.create(record.name),
      Email.create(record.email)
    )
  }
}

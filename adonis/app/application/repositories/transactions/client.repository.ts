import type ClientEntity from '#domain/entities/shared/client.entity'
import type NewClientEntity from '#domain/entities/transactions/new_client.entity'
import type { UserId } from '#domain/primitives/auth/user_id.primitive'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type { ClientName } from '#domain/primitives/transactions/client_name.primitive'
import type { Email } from '#domain/primitives/shared/email.primitive'

export default abstract class ClientRepositoryInterface {
  abstract list(): Promise<ClientEntity[]>

  abstract findById(id: ClientId): Promise<ClientEntity | null>

  abstract findByUserId(userId: UserId): Promise<ClientEntity | null>

  abstract findByEmail(email: Email): Promise<ClientEntity | null>

  abstract create(newClient: NewClientEntity): Promise<ClientEntity>

  abstract updateByUserId(
    userId: UserId,
    data: { name: ClientName; email: Email }
  ): Promise<ClientEntity | null>

  abstract deleteByUserId(userId: UserId): Promise<void>
}

import type { Email } from '#domain/primitives/shared/email.primitive'
import type { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import type NewClientEntity from '#domain/entities/transactions/new_client.entity'
import ClientEntity from '#domain/entities/shared/client.entity'
import type ClientRepositoryInterface from '#repositories/transactions/client.repository'
import Client from '#models/transactions/client'

export default class LucidClientRepository implements ClientRepositoryInterface {
  async list() {
    const clients = await Client.query().orderBy('name', 'asc')
    return clients.map((client) =>
      ClientEntity.fromRecord({
        id: client.id,
        userId: client.userId,
        name: client.name,
        email: client.email,
      })
    )
  }

  async findById(id: ClientId) {
    const client = await Client.find(id.value)
    if (!client) {
      return null
    }

    return ClientEntity.fromRecord({
      id: client.id,
      userId: client.userId,
      name: client.name,
      email: client.email,
    })
  }

  async findByEmail(email: Email) {
    const client = await Client.findBy('email', email.value)
    if (!client) {
      return null
    }

    return ClientEntity.fromRecord({
      id: client.id,
      userId: client.userId,
      name: client.name,
      email: client.email,
    })
  }

  async create(newClient: NewClientEntity) {
    const client = await Client.create({
      userId: newClient.userId.value,
      name: newClient.name.value,
      email: newClient.email.value,
    })

    return ClientEntity.fromRecord({
      id: client.id,
      userId: client.userId,
      name: client.name,
      email: client.email,
    })
  }
}

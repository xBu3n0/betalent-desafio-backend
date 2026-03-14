import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { GatewayName } from '#domain/primitives/transactions/gateway_name.primitive'
import { GatewayPriority } from '#domain/primitives/transactions/gateway_priority.primitive'
import { GatewayStatus } from '#domain/primitives/transactions/gateway_status.primitive'

export interface GatewayRecord {
  id: number
  name: string
  isActive: boolean
  priority: number
  createdAt?: Date
  updatedAt?: Date
}

export default class GatewayEntity {
  private constructor(
    readonly id: GatewayId,
    readonly name: GatewayName,
    readonly status: GatewayStatus,
    readonly priority: GatewayPriority
  ) {}

  static fromRecord(record: GatewayRecord) {
    return new GatewayEntity(
      GatewayId.create(record.id),
      GatewayName.create(record.name),
      record.isActive ? GatewayStatus.active() : GatewayStatus.inactive(),
      GatewayPriority.create(record.priority)
    )
  }

  activate() {
    return new GatewayEntity(this.id, this.name, GatewayStatus.active(), this.priority)
  }

  deactivate() {
    return new GatewayEntity(this.id, this.name, GatewayStatus.inactive(), this.priority)
  }

  changeName(name: GatewayName) {
    return new GatewayEntity(this.id, name, this.status, this.priority)
  }

  changePriority(priority: GatewayPriority | number) {
    const nextPriority =
      priority instanceof GatewayPriority ? priority : GatewayPriority.create(priority)

    return new GatewayEntity(this.id, this.name, this.status, nextPriority)
  }
}

import type { GatewayName } from '#domain/primitives/transactions/gateway_name.primitive'
import type { GatewayPriority } from '#domain/primitives/transactions/gateway_priority.primitive'
import { GatewayStatus } from '#domain/primitives/transactions/gateway_status.primitive'

export default class NewGatewayEntity {
  private constructor(
    readonly name: GatewayName,
    readonly priority: GatewayPriority,
    readonly status: GatewayStatus
  ) {}

  static create(name: GatewayName, priority: GatewayPriority, status = GatewayStatus.active()) {
    return new NewGatewayEntity(name, priority, status)
  }
}

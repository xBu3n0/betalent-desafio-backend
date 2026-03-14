import type GatewayEntity from '#domain/entities/shared/gateway.entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class GatewayTransformer extends BaseTransformer<GatewayEntity> {
  toObject() {
    const { id, name, status, priority } = this.resource

    return {
      id: id.value,
      name: name.value,
      isActive: status.value,
      priority: priority.value,
    }
  }
}

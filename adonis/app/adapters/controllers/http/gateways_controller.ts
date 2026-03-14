import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import GatewayService from '#services/transactions/gateway.service'
import GatewayTransformer from '#transformers/gateway_transformer'
import { updateGatewayPriorityValidator, updateGatewayStatusValidator } from '#validators/gateway'

@inject()
export default class GatewaysController {
  constructor(private readonly gatewayService: GatewayService) {}

  async index({ serialize }: HttpContext) {
    const gateways = await this.gatewayService.listGateways()

    return serialize(GatewayTransformer.transform(gateways))
  }

  async updateStatus({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayStatusValidator)
    const gateway = await this.gatewayService.updateStatus(Number(params.id), payload.isActive)

    return serialize(GatewayTransformer.transform(gateway))
  }

  async updatePriority({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayPriorityValidator)
    const gateway = await this.gatewayService.updatePriority(Number(params.id), payload.priority)

    return serialize(GatewayTransformer.transform(gateway))
  }
}

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import GatewayService from '#services/transactions/gateway.service'
import GatewayTransformer from '#transformers/gateway_transformer'
import { updateGatewayPriorityValidator, updateGatewayStatusValidator } from '#validators/gateway'

@inject()
export default class GatewaysController {
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * @index
   * @summary List gateways
   * @tag Gateways
   * @responseBody 200 - <GatewayCollectionResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   */
  async index({ serialize }: HttpContext) {
    const gateways = await this.gatewayService.listGateways()

    return serialize(GatewayTransformer.transform(gateways))
  }

  /**
   * @updateStatus
   * @summary Update the activation status of a gateway
   * @tag Gateways
   * @paramPath id - Gateway id - @type(number) @required
   * @requestBody <updateGatewayStatusValidator>
   * @responseBody 200 - <GatewayResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async updateStatus({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayStatusValidator)
    const gateway = await this.gatewayService.updateStatus(Number(params.id), payload.isActive)

    return serialize(GatewayTransformer.transform(gateway))
  }

  /**
   * @updatePriority
   * @summary Update the priority of a gateway
   * @tag Gateways
   * @paramPath id - Gateway id - @type(number) @required
   * @requestBody <updateGatewayPriorityValidator>
   * @responseBody 200 - <GatewayResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async updatePriority({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayPriorityValidator)
    const gateway = await this.gatewayService.updatePriority(Number(params.id), payload.priority)

    return serialize(GatewayTransformer.transform(gateway))
  }
}

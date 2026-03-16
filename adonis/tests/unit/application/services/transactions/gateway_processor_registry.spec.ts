import { test } from '@japa/runner'
import type {
  ChargeGatewayInput,
  GatewayChargeResult,
} from '#application/gateways/payment_gateway'
import type PaymentGateway from '#application/gateways/payment_gateway'
import GatewayEntity from '#domain/entities/shared/gateway.entity'
import GatewayProcessorNotConfiguredException from '#domain/exceptions/transactions/gateway_processor_not_configured.exception'
import GatewayProcessorRegistry from '#services/transactions/gateway_processor_registry'

class FakeGatewayProcessor implements PaymentGateway {
  constructor(readonly provider: string) {}

  async setup() {}

  matchesGatewayProvider(gateway: GatewayEntity) {
    return gateway.provider === this.provider
  }

  async charge(_input: ChargeGatewayInput): Promise<GatewayChargeResult> {
    return {
      externalId: 'external-id',
    }
  }

  async refund(_externalId: string) {}
}

test.group('GatewayProcessorRegistry', () => {
  test('returns the processor that matches the gateway provider', ({ assert }) => {
    // given
    const firstProcessor = new FakeGatewayProcessor('gateway_one')
    const secondProcessor = new FakeGatewayProcessor('gateway_two')
    const registry = new GatewayProcessorRegistry([firstProcessor, secondProcessor])
    const gateway = GatewayEntity.fromRecord({
      id: 1,
      provider: 'gateway_two',
      name: 'Gateway Two',
      isActive: true,
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // when
    const processor = registry.getFor(gateway)

    // then
    assert.strictEqual(processor, secondProcessor)
  })

  test('throws when no processor is configured for the gateway provider', ({ assert }) => {
    // given
    const registry = new GatewayProcessorRegistry([new FakeGatewayProcessor('gateway_one')])
    const gateway = GatewayEntity.fromRecord({
      id: 1,
      provider: 'gateway_three',
      name: 'Gateway Three',
      isActive: true,
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // when
    const getMissingProcessor = () => registry.getFor(gateway)

    // then
    assert.throws(getMissingProcessor, GatewayProcessorNotConfiguredException)
  })
})

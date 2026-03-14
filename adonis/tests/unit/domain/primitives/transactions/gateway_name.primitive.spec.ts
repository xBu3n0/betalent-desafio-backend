import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { GatewayName } from '#domain/primitives/transactions/gateway_name.primitive'

const longGatewayName = 'a'.repeat(256)

test.group('GatewayName Primitive', () => {
  test('accepts valid gateway names')
    .with(['Gateway 1', 'Gateway 2', 'PIX Processor'])
    .run(({ assert }, validName) => {
      // given
      const input = validName

      // when
      const gatewayName = GatewayName.create(input)

      // then
      assert.equal(gatewayName.value, input)
    })

  test('rejects invalid gateway names')
    .with(['', '   ', longGatewayName])
    .run(({ assert }, invalidName) => {
      // given
      const input = invalidName

      // when
      const createInvalidGatewayName = () => GatewayName.create(input)

      // then
      assert.throws(createInvalidGatewayName, InvalidDomainException)
    })
})

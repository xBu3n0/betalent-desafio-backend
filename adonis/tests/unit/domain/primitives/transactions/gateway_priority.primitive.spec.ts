import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { GatewayPriority } from '#domain/primitives/transactions/gateway_priority.primitive'

test.group('GatewayPriority Primitive', () => {
  test('accepts valid gateway priorities')
    .with([1, 2, 100])
    .run(({ assert }, validPriority) => {
      // given
      const input = validPriority

      // when
      const priority = GatewayPriority.create(input)

      // then
      assert.equal(priority.value, input)
    })

  test('rejects invalid gateway priorities')
    .with([-1, 0, 1.2])
    .run(({ assert }, invalidPriority) => {
      // given
      const input = invalidPriority

      // when
      const createInvalidPriority = () => GatewayPriority.create(input)

      // then
      assert.throws(createInvalidPriority, InvalidDomainException)
    })
})

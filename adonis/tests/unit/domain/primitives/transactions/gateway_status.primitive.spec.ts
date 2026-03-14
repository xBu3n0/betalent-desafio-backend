import { test } from '@japa/runner'
import { GatewayStatusEnum } from '#domain/enums/transactions/gateway_status.enum'
import { GatewayStatus } from '#domain/primitives/transactions/gateway_status.primitive'

test.group('GatewayStatus Primitive', () => {
  test('creates an active status from the enum value')
    .with([GatewayStatusEnum.ACTIVE])
    .run(({ assert }, input) => {
      // given

      // when
      const status = GatewayStatus.create(input)

      // then
      assert.equal(status.value, GatewayStatusEnum.ACTIVE)
      assert.isTrue(status.isActive())
      assert.isFalse(status.isInactive())
    })

  test('creates an inactive status from the enum value')
    .with([GatewayStatusEnum.INACTIVE])
    .run(({ assert }, input) => {
      // given

      // when
      const status = GatewayStatus.create(input)

      // then
      assert.equal(status.value, GatewayStatusEnum.INACTIVE)
      assert.isFalse(status.isActive())
      assert.isTrue(status.isInactive())
    })

  test('creates an active status from the semantic factory', ({ assert }) => {
    // given

    // when
    const active = GatewayStatus.active()

    // then
    assert.isTrue(active.isActive())
    assert.isFalse(active.isInactive())
  })

  test('creates an inactive status from the semantic factory', ({ assert }) => {
    // given

    // when
    const inactive = GatewayStatus.inactive()

    // then
    assert.isTrue(inactive.isInactive())
    assert.isFalse(inactive.isActive())
  })
})

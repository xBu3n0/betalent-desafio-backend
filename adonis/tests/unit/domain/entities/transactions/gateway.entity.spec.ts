import { test } from '@japa/runner'
import GatewayEntity from '#domain/entities/shared/gateway.entity'
import { GatewayStatusEnum } from '#domain/enums/transactions/gateway_status.enum'

test('builds a gateway entity from stored data', ({ assert }) => {
  // given
  const record = {
    id: 1,
    name: 'Gateway 1',
    isActive: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // when
  const entity = GatewayEntity.fromRecord(record)

  // then
  assert.equal(entity.id.value, 1)
  assert.equal(entity.name.value, record.name)
  assert.isTrue(entity.status.isActive())
  assert.equal(entity.priority.value, record.priority)
})

test('deactivates a gateway immutably', ({ assert }) => {
  // given
  const entity = GatewayEntity.fromRecord({
    id: 2,
    name: 'Gateway 2',
    isActive: true,
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const disabled = entity.deactivate()

  // then
  assert.isTrue(entity.status.isActive())
  assert.equal(entity.status.value, GatewayStatusEnum.ACTIVE)
  assert.isTrue(disabled.status.isInactive())
  assert.equal(disabled.status.value, GatewayStatusEnum.INACTIVE)
  assert.notStrictEqual(entity, disabled)
})

test('activates a gateway immutably', ({ assert }) => {
  // given
  const entity = GatewayEntity.fromRecord({
    id: 2,
    name: 'Gateway 2',
    isActive: false,
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const enabled = entity.activate()

  // then
  assert.isTrue(entity.status.isInactive())
  assert.equal(entity.status.value, GatewayStatusEnum.INACTIVE)
  assert.isTrue(enabled.status.isActive())
  assert.equal(enabled.status.value, GatewayStatusEnum.ACTIVE)
  assert.notStrictEqual(entity, enabled)
})

test('changes the priority while keeping other data intact', ({ assert }) => {
  // given
  const entity = GatewayEntity.fromRecord({
    id: 3,
    name: 'Gateway Fallback',
    isActive: true,
    priority: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // when
  const updated = entity.changePriority(1)

  // then
  assert.equal(entity.priority.value, 3)
  assert.equal(updated.priority.value, 1)
  assert.equal(updated.name.value, entity.name.value)
  assert.equal(updated.id.value, entity.id.value)
  assert.notStrictEqual(entity, updated)
})

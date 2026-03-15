import { test } from '@japa/runner'
import { GatewayPriority } from '#domain/primitives/transactions/gateway_priority.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('GatewayPriority Primitive', () => {
  runPrimitiveTests({
    primitive: GatewayPriority,
    accepts: {
      title: 'accepts valid gateway priorities',
      values: [1, 2, 100],
    },
    rejects: {
      title: 'rejects invalid gateway priorities',
      values: [-1, 0, 1.2],
    },
  })
})

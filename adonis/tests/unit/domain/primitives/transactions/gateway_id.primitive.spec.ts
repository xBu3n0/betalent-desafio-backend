import { test } from '@japa/runner'
import { GatewayId } from '#domain/primitives/transactions/gateway_id.primitive'
import { runIdPrimitiveTests } from '#tests/unit/domain/primitives/shared/id_primitive.spec_helper'

test.group('GatewayId Primitive', () => {
  runIdPrimitiveTests({
    primitive: GatewayId,
    accepts: {
      title: 'accepts valid gateway identifiers',
      values: [1, 2, 100, 12345],
    },
    rejects: {
      title: 'rejects invalid gateway identifiers',
      values: [0, -1, 1.2],
    },
  })
})

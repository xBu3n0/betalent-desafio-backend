import { test } from '@japa/runner'
import { GatewayName } from '#domain/primitives/transactions/gateway_name.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

const longGatewayName = 'a'.repeat(256)

test.group('GatewayName Primitive', () => {
  runPrimitiveTests({
    primitive: GatewayName,
    accepts: {
      title: 'accepts valid gateway names',
      values: ['Gateway 1', 'Gateway 2', 'PIX Processor'],
    },
    rejects: {
      title: 'rejects invalid gateway names',
      values: ['', '   ', longGatewayName],
    },
  })
})

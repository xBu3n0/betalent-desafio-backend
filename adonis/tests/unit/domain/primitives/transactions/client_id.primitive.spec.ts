import { test } from '@japa/runner'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'
import { runIdPrimitiveTests } from '#tests/unit/domain/primitives/shared/id_primitive.spec_helper'

test.group('ClientId Primitive', () => {
  runIdPrimitiveTests({
    primitive: ClientId,
    accepts: {
      title: 'accepts valid client identifiers',
      values: [1, 2, 100, 12345],
    },
    rejects: {
      title: 'rejects invalid client identifiers',
      values: [0, -1, 1.2],
    },
  })
})

import { test } from '@japa/runner'
import { UserId } from '#domain/primitives/auth/user_id.primitive'
import { runIdPrimitiveTests } from '#tests/unit/domain/primitives/shared/id_primitive.spec_helper'

test.group('UserId Primitive', () => {
  runIdPrimitiveTests({
    primitive: UserId,
    accepts: {
      title: 'accepts valid user identifiers',
      values: [1, 2, 100, 12345],
    },
    rejects: {
      title: 'rejects invalid user identifiers',
      values: [0, -1, 1.2],
    },
  })
})

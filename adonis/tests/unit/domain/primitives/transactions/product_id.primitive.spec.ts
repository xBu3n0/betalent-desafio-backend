import { test } from '@japa/runner'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { runIdPrimitiveTests } from '#tests/unit/domain/primitives/shared/id_primitive.spec_helper'

test.group('ProductId Primitive', () => {
  runIdPrimitiveTests({
    primitive: ProductId,
    accepts: {
      title: 'accepts valid product identifiers',
      values: [1, 2, 100, 12345],
    },
    rejects: {
      title: 'rejects invalid product identifiers',
      values: [0, -1, 1.2],
    },
  })
})

import { test } from '@japa/runner'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

const longProductName = 'a'.repeat(256)

test.group('ProductName Primitive', () => {
  runPrimitiveTests({
    primitive: ProductName,
    accepts: {
      title: 'accepts valid product names',
      values: ['Course', 'Notebook', 'Premium Subscription'],
    },
    rejects: {
      title: 'rejects invalid product names',
      values: ['', '   ', longProductName],
    },
  })
})

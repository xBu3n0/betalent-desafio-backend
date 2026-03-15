import { test } from '@japa/runner'
import { ProductQuantity } from '#domain/primitives/transactions/product_quantity.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('ProductQuantity Primitive', () => {
  runPrimitiveTests({
    primitive: ProductQuantity,
    accepts: {
      title: 'accepts valid product quantities',
      values: [1, 2, 10, 999],
    },
    rejects: {
      title: 'rejects invalid product quantities',
      values: [0, -1, 1.5],
    },
  })

  test('multiplies the quantity by the product amount')
    .with([
      { quantity: 1, amount: 1000, expected: 1000 },
      { quantity: 3, amount: 2500, expected: 7500 },
    ])
    .run(({ assert }, scenario) => {
      // given
      const productQuantity = ProductQuantity.create(scenario.quantity)

      // when
      const totalAmount = productQuantity.multiply(scenario.amount)

      // then
      assert.equal(totalAmount, scenario.expected)
    })
})

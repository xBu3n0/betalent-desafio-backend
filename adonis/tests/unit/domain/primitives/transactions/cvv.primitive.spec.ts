import { test } from '@japa/runner'
import { Cvv } from '#domain/primitives/transactions/cvv.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('Cvv Primitive', () => {
  runPrimitiveTests({
    primitive: Cvv,
    accepts: {
      title: 'accepts valid cvvs',
      values: ['123', '000', '999'],
    },
    rejects: {
      title: 'rejects invalid cvvs',
      values: ['12', '1234', '12a'],
    },
  })

  test('masks the cvv when converted to string', ({ assert }) => {
    // given
    const cvv = Cvv.create('123')

    // when
    const maskedValue = cvv.toString()

    // then
    assert.equal(maskedValue, '****')
  })
})

import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { Cvv } from '#domain/primitives/transactions/cvv.primitive'

test.group('Cvv Primitive', () => {
  test('accepts valid cvvs')
    .with(['123', '000', '999'])
    .run(({ assert }, validValue) => {
      // given
      const input = validValue

      // when
      const cvv = Cvv.create(input)

      // then
      assert.equal(cvv.value, input)
    })

  test('rejects invalid cvvs')
    .with(['12', '1234', '12a'])
    .run(({ assert }, invalidValue) => {
      // given
      const input = invalidValue

      // when
      const createInvalidCvv = () => Cvv.create(input)

      // then
      assert.throws(createInvalidCvv, InvalidDomainException)
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

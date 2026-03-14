import util from 'node:util'
import { test } from '@japa/runner'
import SensitivePrimitive from '#domain/primitives/shared/sensitive.primitive'

class TestSensitivePrimitive extends SensitivePrimitive {
  constructor(public readonly value: string) {
    super()
  }
}

test.group('SensitivePrimitive', () => {
  test('masks the value when converted to string', ({ assert }) => {
    // given
    const primitive = new TestSensitivePrimitive('secret')

    // when
    const maskedValue = primitive.toString()

    // then
    assert.equal(maskedValue, '****')
  })

  test('masks the value when converted to json', ({ assert }) => {
    // given
    const primitive = new TestSensitivePrimitive('secret')

    // when
    const serializedValue = primitive.toJSON()

    // then
    assert.equal(serializedValue, '****')
  })

  test('masks the value when inspected', ({ assert }) => {
    // given
    const primitive = new TestSensitivePrimitive('secret')

    // when
    const inspectedValue = util.inspect(primitive)

    // then
    assert.equal(inspectedValue, "{ value: '****' }")
  })
})

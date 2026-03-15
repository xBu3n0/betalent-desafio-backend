import { test } from '@japa/runner'
import { Password } from '#domain/primitives/auth/password.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'
import util from 'node:util'

const longPassword = 'a'.repeat(33)

test.group('Password Primitive', () => {
  runPrimitiveTests({
    primitive: Password,
    accepts: {
      title: 'accepts passwords within the allowed length',
      values: ['password1', 'longerPassword123', '0123456789abcdef'],
    },
    rejects: {
      title: 'rejects passwords outside the allowed length',
      values: ['', 'short', longPassword],
    },
  })

  test('does not reveal the password value when converted to string', ({ assert }) => {
    // given
    const passwordValue = 'secretPassword'
    const password = Password.create(passwordValue)

    // when
    const directString = String(password)

    // then
    assert.notInclude(directString, passwordValue)
  })

  test('does not reveal the password value when inspected', ({ assert }) => {
    // given
    const passwordValue = 'secretPassword'
    const password = Password.create(passwordValue)

    // when
    const stringified = util.inspect(password)

    // then
    assert.notInclude(stringified, passwordValue)
  })

  test('does not reveal the password value when converted to json', ({ assert }) => {
    // given
    const passwordValue = 'secretPassword'
    const password = Password.create(passwordValue)

    // when
    const jsonStringified = JSON.stringify(password)

    // then
    assert.notInclude(jsonStringified, passwordValue)
  })
})

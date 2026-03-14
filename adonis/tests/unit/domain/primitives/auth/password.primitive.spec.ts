import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { Password } from '#domain/primitives/auth/password.primitive'
import util from 'node:util'

const longPassword = 'a'.repeat(33)

test.group('Password Primitive', () => {
  test('accepts passwords within the allowed length')
    .with(['password1', 'longerPassword123', '0123456789abcdef'])
    .run(({ assert }, validPassword) => {
      // given
      const input = validPassword

      // when
      const password = Password.create(input)

      // then
      assert.equal(password.value, input)
    })

  test('rejects passwords outside the allowed length')
    .with(['', 'short', longPassword])
    .run(({ assert }, invalidPassword) => {
      // given
      const input = invalidPassword

      // when
      const createInvalidPassword = () => Password.create(input)

      // then
      assert.throws(createInvalidPassword, InvalidDomainException)
    })

  test('does not reveal the password value when converted to string or inspected', ({ assert }) => {
    // given
    const passwordValue = 'secretPassword'
    const password = Password.create(passwordValue)

    // when
    const directString = String(password)
    const stringified = util.inspect(password)
    const jsonStringified = JSON.stringify(password)

    // then
    assert.notInclude(directString, passwordValue)
    assert.notInclude(stringified, passwordValue)
    assert.notInclude(jsonStringified, passwordValue)
  })
})

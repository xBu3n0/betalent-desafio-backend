import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { Email } from '#domain/primitives/shared/email.primitive'
import { MAX_EMAIL_LENGTH } from '#domain/shared/consts'

const longEmail = `${'a'.repeat(MAX_EMAIL_LENGTH)}@example.com`

test.group('Email Primitive', () => {
  test('creates an email value for valid input')
    .with(['developer@betalent.tech', 'USER+alias@Example.COM'])
    .run(({ assert }, validEmail) => {
      // given
      const input = validEmail

      // when
      const email = Email.create(input)

      // then
      assert.equal(email.value, input)
    })

  test('throws InvalidDomainException for invalid emails')
    .with(['', 'not-an-email', 'user@', '@example.com', '  user@example.com  ', longEmail])
    .run(({ assert }, invalidEmail) => {
      // given
      const input = invalidEmail

      // when
      const createInvalidEmail = () => Email.create(input)

      // then
      assert.throws(createInvalidEmail, InvalidDomainException)
    })
})

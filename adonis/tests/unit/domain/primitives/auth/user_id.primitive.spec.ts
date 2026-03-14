import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { UserId } from '#domain/primitives/auth/user_id.primitive'

test.group('UserId Primitive', () => {
  test('accepts valid user identifiers')
    .with([1, 2, 100, 12345])
    .run(({ assert }, validId) => {
      // given
      const input = validId

      // when
      const userId = UserId.create(input)

      // then
      assert.equal(userId.value, input)
    })

  test('rejects invalid user identifiers')
    .with([0, 1.2, -1])
    .run(({ assert }, invalidId) => {
      // given
      const input = invalidId

      // when
      const createInvalidUserId = () => UserId.create(input)

      // then
      assert.throws(createInvalidUserId, InvalidDomainException)
    })
})

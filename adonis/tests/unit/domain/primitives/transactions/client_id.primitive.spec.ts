import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'
import { ClientId } from '#domain/primitives/transactions/client_id.primitive'

test.group('ClientId Primitive', () => {
  test('accepts valid client identifiers')
    .with([1, 2, 100, 12345])
    .run(({ assert }, validId) => {
      // given
      const input = validId

      // when
      const clientId = ClientId.create(input)

      // then
      assert.equal(clientId.value, input)
    })

  test('rejects invalid client identifiers')
    .with([0, -1, 1.2])
    .run(({ assert }, invalidId) => {
      // given
      const input = invalidId

      // when
      const createInvalidClientId = () => ClientId.create(input)

      // then
      assert.throws(createInvalidClientId, InvalidDomainException)
    })
})

import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { Role } from '#domain/primitives/auth/role.primitive'
import { RoleEnum } from '#domain/enums/auth/role.enum'

test.group('Role Primitive', () => {
  test('recognizes every valid role')
    .with(Object.values(RoleEnum))
    .run(({ assert }, validRole) => {
      // given
      const input = validRole

      // when
      const rolePrimitive = Role.create(input)

      // then
      assert.equal(rolePrimitive.value, input)
    })

  test('rejects roles that are not allowed')
    .with([...Object.values(RoleEnum).map((s) => s.toLowerCase()), 'invalidRole', ''])
    .run(({ assert }, invalidRole) => {
      // given
      const input = invalidRole

      // when
      const createInvalidRole = () => Role.create(input)

      // then
      assert.throws(createInvalidRole, InvalidDomainException)
    })

  test('can check if it has a specific role', ({ assert }) => {
    // given
    const role = Role.create(RoleEnum.ADMIN)

    // when
    const hasAdminRole = role.is(RoleEnum.ADMIN)
    const hasUserRole = role.is(RoleEnum.USER)

    // then
    assert.isTrue(hasAdminRole)
    assert.isFalse(hasUserRole)
  })
})

import { test } from '@japa/runner'
import { Role } from '#domain/primitives/auth/role.primitive'
import { RoleEnum } from '#domain/enums/auth/role.enum'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

test.group('Role Primitive', () => {
  runPrimitiveTests({
    primitive: Role,
    accepts: {
      title: 'recognizes every valid role',
      values: Object.values(RoleEnum),
    },
    rejects: {
      title: 'rejects roles that are not allowed',
      values: [...Object.values(RoleEnum).map((role) => role.toLowerCase()), 'invalidRole', ''],
    },
  })

  test('can check if it has the requested role', ({ assert }) => {
    // given
    const role = Role.create(RoleEnum.ADMIN)

    // when
    const hasAdminRole = role.is(RoleEnum.ADMIN)

    // then
    assert.isTrue(hasAdminRole)
  })

  test('returns false when checking a different role', ({ assert }) => {
    // given
    const role = Role.create(RoleEnum.ADMIN)

    // when
    const hasUserRole = role.is(RoleEnum.USER)

    // then
    assert.isFalse(hasUserRole)
  })
})

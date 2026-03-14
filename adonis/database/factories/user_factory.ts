import factory from '@adonisjs/lucid/factories'
import User from '#models/auth/user'
import { RoleEnum } from '#enums/auth/role.enum'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: `${faker.string.alphanumeric(12).toLowerCase()}@example.com`,
      password: 'password123',
      role: faker.helpers.arrayElement(Object.values(RoleEnum)),
    }
  })
  .build()

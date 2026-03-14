import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { RoleEnum } from '#enums/auth/role.enum'
import User from '#models/auth/user'

const DEFAULT_INITIAL_USER_EMAIL = 'admin@example.com'
const DEFAULT_INITIAL_USER_PASSWORD = 'password123'

export default class extends BaseSeeder {
  async run() {
    const email = resolveInitialUserEmail()
    const password = resolveInitialUserPassword()

    await User.firstOrCreate(
      {
        email,
      },
      {
        email,
        password,
        role: RoleEnum.ADMIN,
      }
    )
  }
}

function resolveInitialUserEmail() {
  const value = process.env.INITIAL_USER_EMAIL?.trim()
  return value && value.length > 0 ? value : DEFAULT_INITIAL_USER_EMAIL
}

function resolveInitialUserPassword() {
  const value = process.env.INITIAL_USER_PASSWORD?.trim()
  return value && value.length > 0 ? value : DEFAULT_INITIAL_USER_PASSWORD
}

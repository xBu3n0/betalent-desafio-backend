import type { RoleEnum } from '#enums/auth/role.enum'

export interface RegisterUserInput {
  email: string
  password: string
  role: RoleEnum
}

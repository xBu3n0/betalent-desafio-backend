import type { RoleEnum } from '#enums/auth/role.enum'

export interface UpdateUserInput {
  email?: string
  password?: string
  role?: RoleEnum
}

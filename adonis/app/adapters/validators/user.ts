import vine from '@vinejs/vine'
import { RoleEnum } from '#enums/auth/role.enum'
import {
  MAX_EMAIL_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../domain/shared/consts.ts'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(MAX_EMAIL_LENGTH)
const password = () => vine.string().minLength(PASSWORD_MIN_LENGTH).maxLength(PASSWORD_MAX_LENGTH)

/**
 * Validator to use when performing self-signup
 */
export const createUserValidator = vine.create({
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
  role: vine.enum(Object.values(RoleEnum)),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const updateUserValidator = vine.create({
  email: email().optional(),
  password: password().optional(),
  role: vine.enum(Object.values(RoleEnum)).optional(),
})

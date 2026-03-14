import { Email } from '#domain/primitives/shared/email.primitive'
import InvalidCredentialsException from '#domain/exceptions/auth/invalid_credentials_exception'
import { Role } from '#domain/primitives/auth/role.primitive'
import { Password } from '#domain/primitives/auth/password.primitive'
import UserNotFoundException from '#domain/exceptions/auth/user_not_found_exception'
import UserEntity from '#domain/entities/shared/user.entity'
import UserRepositoryInterface from '#repositories/auth/user.repository'
import type {
  AuthenticationInput,
  AuthenticationOutput,
  RegisterUserInput,
  RegisterUserOutput,
  UpdateUserInput,
  UpdateUserOutput,
} from '../../dtos/auth/index.ts'
import { UserId } from '#domain/primitives/auth/user_id.primitive'
import { inject } from '@adonisjs/core'
import AuthUserEntity from '#domain/entities/auth/new_user.entity'

@inject()
export default class UserService {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async create(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email)
    const role = Role.create(input.role)
    const password = Password.create(input.password)

    const authUser = AuthUserEntity.create(email, role)

    const user = await this.userRepository.create(authUser, {
      password,
    })

    const token = await this.issueToken(user)
    return { user, token }
  }

  async login(credentials: AuthenticationInput): Promise<AuthenticationOutput> {
    const email = Email.create(credentials.email)
    const password = Password.create(credentials.password)

    let user: UserEntity
    try {
      user = await this.userRepository.verifyCredentials(email, password)
    } catch (error) {
      throw new InvalidCredentialsException()
    }

    const token = await this.issueToken(user)
    return { user, token }
  }

  async listUsers() {
    return this.userRepository.list()
  }

  async update(id: number, input: UpdateUserInput): Promise<UpdateUserOutput> {
    const userId = UserId.create(id)

    let user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundException(`User '${userId.value}' was not found.`)
    }

    if (input.email) {
      user = user.changeEmail(Email.create(input.email))
    }

    if (input.password) {
      user = user.changePassword(Password.create(input.password))
    }

    if (input.role) {
      user = user.changeRole(Role.create(input.role))
    }

    return this.userRepository.update(user)
  }

  async getById(id: number) {
    const userId = UserId.create(id)

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundException(`User '${userId.value}' was not found.`)
    }

    return user
  }

  async findByEmail(email: string) {
    const validatedEmail = Email.create(email)
    return this.userRepository.findByEmail(validatedEmail)
  }

  async delete(id: number) {
    const userId = UserId.create(id)

    await this.userRepository.delete(userId)
  }

  private async issueToken(user: UserEntity) {
    return this.userRepository.issueAccessToken(user.id)
  }
}

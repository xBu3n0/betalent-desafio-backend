import InvalidDomainException from '../../exceptions/shared/invalid_domain_exception.ts'
import { RoleEnum } from '../../enums/auth/role.enum.ts'

export class Role {
  private constructor(public readonly value: RoleEnum) {}

  public static create(value: string): Role {
    if (!(value in RoleEnum)) {
      throw new InvalidDomainException(`${value} is not a valid Role`)
    }

    return new Role(value as RoleEnum)
  }

  public is(role: RoleEnum): boolean {
    return this.value === role
  }
}

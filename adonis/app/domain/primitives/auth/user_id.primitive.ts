import InvalidDomainException from '../../exceptions/shared/invalid_domain_exception.ts'

export class UserId {
  private constructor(public readonly value: number) {}

  public static create(value: number): UserId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid UserId`)
    }

    return new UserId(value)
  }
}

import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#domain/shared/consts'
import SensitivePrimitive from '#domain/primitives/shared/sensitive.primitive'

export class Password extends SensitivePrimitive {
  private constructor(public readonly value: string) {
    super()
  }

  public static create(value: string): Password {
    if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      throw new InvalidDomainException(`${value} is not a valid Password`)
    }

    return new Password(value)
  }
}

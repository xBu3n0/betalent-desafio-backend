import InvalidDomainException from '../../exceptions/shared/invalid_domain_exception.ts'
import { EMAIL_FORMAT_REGEX, MAX_EMAIL_LENGTH } from '../../shared/consts.ts'

export class Email {
  private constructor(public readonly value: string) {}

  public static create(value: string): Email {
    if (value.length === 0 || value.length > MAX_EMAIL_LENGTH || !EMAIL_FORMAT_REGEX.test(value)) {
      throw new InvalidDomainException(`${value} is not a valid Email`)
    }

    return new Email(value)
  }
}

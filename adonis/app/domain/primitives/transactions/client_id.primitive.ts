import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export class ClientId {
  private constructor(public readonly value: number) {}

  public static create(value: number): ClientId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid ClientId`)
    }

    return new ClientId(value)
  }
}

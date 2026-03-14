import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

export class GatewayPriority {
  private constructor(public readonly value: number) {}

  public static create(value: number): GatewayPriority {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid GatewayPriority`)
    }

    return new GatewayPriority(value)
  }
}

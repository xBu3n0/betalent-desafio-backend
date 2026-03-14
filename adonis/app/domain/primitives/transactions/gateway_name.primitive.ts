import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

const GATEWAY_NAME_MAX_LENGTH = 255

export class GatewayName {
  private constructor(public readonly value: string) {}

  public static create(value: string): GatewayName {
    if (value.trim().length === 0 || value.length > GATEWAY_NAME_MAX_LENGTH) {
      throw new InvalidDomainException(`${value} is not a valid GatewayName`)
    }

    return new GatewayName(value)
  }
}

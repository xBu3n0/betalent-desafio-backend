import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

export class ProductAmount {
  private constructor(public readonly value: number) {}

  public static create(value: number): ProductAmount {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidDomainException(`${value} is not a valid ProductAmount`)
    }

    return new ProductAmount(value)
  }
}

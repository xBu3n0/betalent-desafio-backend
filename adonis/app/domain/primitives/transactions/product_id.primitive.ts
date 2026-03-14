import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

export class ProductId {
  private constructor(public readonly value: number) {}

  public static create(value: number): ProductId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid ProductId`)
    }

    return new ProductId(value)
  }
}

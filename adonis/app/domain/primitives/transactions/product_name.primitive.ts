import InvalidDomainException from '#domain/exceptions/shared/invalid_domain_exception'

const PRODUCT_NAME_MAX_LENGTH = 255

export class ProductName {
  private constructor(public readonly value: string) {}

  public static create(value: string): ProductName {
    if (value.trim().length === 0 || value.length > PRODUCT_NAME_MAX_LENGTH) {
      throw new InvalidDomainException(`${value} is not a valid ProductName`)
    }

    return new ProductName(value)
  }
}

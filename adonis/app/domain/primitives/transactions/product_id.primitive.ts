import IdPrimitive from '#domain/primitives/shared/id.primitive'

export class ProductId extends IdPrimitive {
  private constructor(value: number) {
    super(value)
  }

  public static create(value: number): ProductId {
    return this.createId(value, this.name, (domainValidatedValue) => new ProductId(domainValidatedValue))
  }
}

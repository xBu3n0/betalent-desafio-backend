import IdPrimitive from '#domain/primitives/shared/id.primitive'

export class TransactionId extends IdPrimitive {
  private constructor(value: number) {
    super(value)
  }

  public static create(value: number): TransactionId {
    return this.createId(value, this.name, (domainValidatedValue) => new TransactionId(domainValidatedValue))
  }
}

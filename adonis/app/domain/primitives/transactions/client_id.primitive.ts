import IdPrimitive from '#domain/primitives/shared/id.primitive'

export class ClientId extends IdPrimitive {
  private constructor(value: number) {
    super(value)
  }

  public static create(value: number): ClientId {
    return this.createId(value, this.name, (domainValidatedValue) => new ClientId(domainValidatedValue))
  }
}

import IdPrimitive from '#domain/primitives/shared/id.primitive'

export class GatewayId extends IdPrimitive {
  private constructor(value: number) {
    super(value)
  }

  public static create(value: number): GatewayId {
    return this.createId(value, this.name, (domainValidatedValue) => new GatewayId(domainValidatedValue))
  }
}

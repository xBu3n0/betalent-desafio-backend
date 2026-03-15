import IdPrimitive from '#domain/primitives/shared/id.primitive'

export class UserId extends IdPrimitive {
  private constructor(value: number) {
    super(value)
  }

  public static create(value: number): UserId {
    return this.createId(value, this.name, (domainValidatedValue) => new UserId(domainValidatedValue))
  }
}

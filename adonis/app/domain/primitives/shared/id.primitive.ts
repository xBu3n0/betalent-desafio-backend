import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

export default abstract class IdPrimitive {
  protected constructor(public readonly value: number) {}

  protected static createId<T extends IdPrimitive>(
    value: number,
    primitiveName: string,
    instantiate: (domainValidatedValue: number) => T
  ): T {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidDomainException(`${value} is not a valid ${primitiveName}`)
    }

    return instantiate(value)
  }
}

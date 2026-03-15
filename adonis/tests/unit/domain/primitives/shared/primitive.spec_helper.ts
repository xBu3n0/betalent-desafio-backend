import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

type PrimitiveInstance<TValue> = {
  value: TValue
}

type PrimitiveFactory<TInput, TPrimitive extends PrimitiveInstance<TInput>> = {
  create(value: TInput): TPrimitive
}

type PrimitiveSpecConfig<TInput, TPrimitive extends PrimitiveInstance<TInput>> = {
  primitive: PrimitiveFactory<TInput, TPrimitive>
  accepts: {
    title: string
    values: TInput[]
  }
  rejects: {
    title: string
    values: TInput[]
  }
}

export function runPrimitiveTests<TInput, TPrimitive extends PrimitiveInstance<TInput>>(
  { primitive, accepts, rejects }: PrimitiveSpecConfig<TInput, TPrimitive>
) {
  test(accepts.title)
    .with(accepts.values)
    .run(({ assert }, validValue) => {
      const createdPrimitive = primitive.create(validValue)

      assert.equal(createdPrimitive.value, validValue)
    })

  test(rejects.title)
    .with(rejects.values)
    .run(({ assert }, invalidValue) => {
      assert.throws(() => primitive.create(invalidValue), InvalidDomainException)
    })
}

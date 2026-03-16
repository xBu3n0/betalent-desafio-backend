import { test } from '@japa/runner'
import InvalidDomainException from '#domain/exceptions/shared/invalid_domain.exception'

type IdPrimitiveInstance = {
  value: number
}

type IdPrimitiveFactory<T extends IdPrimitiveInstance> = {
  create(value: number): T
}

type IdPrimitiveSpecConfig<T extends IdPrimitiveInstance> = {
  primitive: IdPrimitiveFactory<T>
  accepts: {
    title: string
    values: number[]
  }
  rejects: {
    title: string
    values: number[]
  }
}

export function runIdPrimitiveTests<T extends IdPrimitiveInstance>({
  primitive,
  accepts,
  rejects,
}: IdPrimitiveSpecConfig<T>) {
  test(accepts.title)
    .with(accepts.values)
    .run(({ assert }, validId) => {
      // given

      // when
      const id = primitive.create(validId)

      // then
      assert.equal(id.value, validId)
    })

  test(rejects.title)
    .with(rejects.values)
    .run(({ assert }, invalidId) => {
      // given

      // when
      const createPrimitive = () => primitive.create(invalidId)

      // then
      assert.throws(createPrimitive, InvalidDomainException)
    })
}

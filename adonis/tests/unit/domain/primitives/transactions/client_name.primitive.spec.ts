import { test } from '@japa/runner'
import { ClientName } from '#domain/primitives/transactions/client_name.primitive'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

const longClientName = 'a'.repeat(256)

test.group('ClientName Primitive', () => {
  runPrimitiveTests({
    primitive: ClientName,
    accepts: {
      title: 'accepts valid client names',
      values: ['John Doe', 'Ana', 'Maria da Silva'],
    },
    rejects: {
      title: 'rejects invalid client names',
      values: ['', '   ', longClientName],
    },
  })
})

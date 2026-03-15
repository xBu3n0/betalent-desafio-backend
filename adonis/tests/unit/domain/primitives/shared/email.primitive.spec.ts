import { test } from '@japa/runner'
import { Email } from '#domain/primitives/shared/email.primitive'
import { MAX_EMAIL_LENGTH } from '#domain/shared/consts'
import { runPrimitiveTests } from '#tests/unit/domain/primitives/shared/primitive.spec_helper'

const longEmail = `${'a'.repeat(MAX_EMAIL_LENGTH)}@example.com`

test.group('Email Primitive', () => {
  runPrimitiveTests({
    primitive: Email,
    accepts: {
      title: 'accepts valid email addresses',
      values: ['developer@betalent.tech', 'USER+alias@Example.COM'],
    },
    rejects: {
      title: 'rejects invalid email formats',
      values: ['', 'not-an-email', 'user@', '@example.com', '  user@example.com  ', longEmail],
    },
  })
})

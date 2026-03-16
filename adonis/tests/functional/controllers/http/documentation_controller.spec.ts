import { test } from '@japa/runner'

test.group('Documentation routes | functional', () => {
  test('serves the OpenAPI yaml document', async ({ client, assert }) => {
    // given

    // when
    const response = await client.get('/swagger')

    // then
    response.assertStatus(200)
    assert.equal(response.type(), 'text/yaml')
    assert.include(response.text(), 'openapi: "3.0.0"')
    assert.include(response.text(), '/api/v1/auth/login:')
  })

  test('serves the Swagger UI page', async ({ client, assert }) => {
    // given

    // when
    const response = await client.get('/docs')

    // then
    response.assertStatus(200)
    assert.equal(response.type(), 'text/html')
    assert.include(response.text(), 'SwaggerUIBundle')
    assert.include(response.text(), '/swagger')
  })
})

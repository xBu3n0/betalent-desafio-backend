import AutoSwagger from 'adonis-autoswagger'
import router from '@adonisjs/core/services/router'
import swagger from '#config/swagger'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function normalizeSchema(schema: unknown): void {
  if (!schema || typeof schema !== 'object') {
    return
  }

  if (Array.isArray(schema)) {
    for (const item of schema) {
      normalizeSchema(item)
    }
    return
  }

  const typedSchema = schema as Record<string, unknown>

  if (Array.isArray(typedSchema.choices) && !Array.isArray(typedSchema.enum)) {
    typedSchema.enum = typedSchema.choices
    delete typedSchema.choices
  }

  if (Array.isArray(typedSchema.enum) && typedSchema.enum.length > 0) {
    const enumValues = typedSchema.enum

    if (enumValues.every((value) => typeof value === 'string')) {
      typedSchema.type = 'string'
      typedSchema.example = enumValues[0]
    }

    if (enumValues.every((value) => typeof value === 'number')) {
      typedSchema.type = 'number'
      typedSchema.example = enumValues[0]
    }
  }

  if (typedSchema.type === 'array' && typedSchema.items) {
    normalizeSchema(typedSchema.items)

    if (Array.isArray(typedSchema.example) && typedSchema.example.length > 0) {
      const itemSchema = typedSchema.items as Record<string, unknown>

      typedSchema.example = typedSchema.example.map((item) => {
        if (itemSchema.type === 'object' && item && typeof item === 'object') {
          return normalizeExampleObject(
            item as Record<string, unknown>,
            itemSchema.properties as Record<string, Record<string, unknown>> | undefined
          )
        }

        return item
      })
    }
  }

  if (
    typedSchema.type === 'object' &&
    typedSchema.properties &&
    !Array.isArray(typedSchema.properties)
  ) {
    const required = new Set(Array.isArray(typedSchema.required) ? typedSchema.required : [])
    const properties = typedSchema.properties as Record<string, Record<string, unknown>>

    for (const [name, property] of Object.entries(properties)) {
      normalizeSchema(property)

      if (property.required === true) {
        required.add(name)
        delete property.required
      }
    }

    if (required.size > 0) {
      typedSchema.required = [...required]
    } else {
      delete typedSchema.required
    }

    if (
      typedSchema.example &&
      typeof typedSchema.example === 'object' &&
      !Array.isArray(typedSchema.example)
    ) {
      typedSchema.example = normalizeExampleObject(
        typedSchema.example as Record<string, unknown>,
        properties
      )
    }
  }
}

function normalizeExampleObject(
  example: Record<string, unknown>,
  properties?: Record<string, Record<string, unknown>>
) {
  if (!properties) {
    return example
  }

  const normalized = { ...example }

  for (const [name, property] of Object.entries(properties)) {
    if (!(name in normalized)) {
      continue
    }

    if (Array.isArray(property.enum) && property.enum.length > 0) {
      normalized[name] = property.example ?? property.enum[0]
      continue
    }

    if (property.type === 'object' && normalized[name] && typeof normalized[name] === 'object') {
      normalized[name] = normalizeExampleObject(
        normalized[name] as Record<string, unknown>,
        property.properties as Record<string, Record<string, unknown>> | undefined
      )
      continue
    }

    if (property.type === 'array' && Array.isArray(normalized[name]) && property.items) {
      const itemSchema = property.items as Record<string, unknown>

      normalized[name] = normalized[name].map((item) => {
        if (itemSchema.type === 'object' && item && typeof item === 'object') {
          return normalizeExampleObject(
            item as Record<string, unknown>,
            itemSchema.properties as Record<string, Record<string, unknown>> | undefined
          )
        }

        return item
      })
    }
  }

  return normalized
}

export async function generateSwaggerJson() {
  router.commit()

  const document = await AutoSwagger.default.json(
    {
      root: Object.values(router.toJSON()).flat(),
    },
    swagger
  )

  const schemas = document.components?.schemas
  if (schemas && typeof schemas === 'object') {
    for (const schema of Object.values(schemas)) {
      normalizeSchema(schema)
    }
  }

  const paths = document.paths
  if (paths && typeof paths === 'object' && schemas && typeof schemas === 'object') {
    for (const pathItem of Object.values(paths as Record<string, Record<string, unknown>>)) {
      for (const operation of Object.values(pathItem)) {
        if (!operation || typeof operation !== 'object') {
          continue
        }

        normalizeOperationExamples(operation as Record<string, unknown>, schemas)
      }
    }
  }

  return document
}

export async function generateSwaggerYaml() {
  const staticSwagger = await readStaticSwaggerYaml()
  if (staticSwagger) {
    return staticSwagger
  }

  const document = await generateSwaggerJson()
  return AutoSwagger.default.jsonToYaml(document)
}

async function readStaticSwaggerYaml() {
  const currentFilePath = fileURLToPath(import.meta.url)
  const isBuildRuntime = currentFilePath.includes(`${path.sep}build${path.sep}`)

  if (!isBuildRuntime) {
    return null
  }

  const rootPath = path.resolve(path.dirname(currentFilePath), '..')
  const swaggerFilePath = path.join(rootPath, 'swagger.yml')

  try {
    await access(swaggerFilePath)
    return await readFile(swaggerFilePath, 'utf8')
  } catch {
    return null
  }
}

function normalizeOperationExamples(
  operation: Record<string, unknown>,
  schemas: Record<string, unknown>
) {
  const requestBody = operation.requestBody as Record<string, unknown> | undefined
  const requestJsonContent = getJsonContent(requestBody)
  normalizeContentExample(requestJsonContent, schemas)

  const responses = operation.responses as Record<string, unknown> | undefined
  if (!responses) {
    return
  }

  for (const response of Object.values(responses)) {
    if (!response || typeof response !== 'object') {
      continue
    }

    normalizeContentExample(getJsonContent(response as Record<string, unknown>), schemas)
  }
}

function getJsonContent(container: Record<string, unknown> | undefined) {
  if (!container) {
    return undefined
  }

  const content = container.content as Record<string, unknown> | undefined
  if (!content || typeof content !== 'object') {
    return undefined
  }

  return content['application/json'] as Record<string, unknown> | undefined
}

function normalizeContentExample(
  content: Record<string, unknown> | undefined,
  schemas: Record<string, unknown>
) {
  if (!content) {
    return
  }

  const schema = content.schema as Record<string, unknown> | undefined
  const example = content.example

  if (!schema || !example || typeof example !== 'object' || Array.isArray(example)) {
    return
  }

  const resolvedSchema = resolveSchemaReference(schema, schemas)
  if (!resolvedSchema) {
    return
  }

  normalizeSchema(resolvedSchema)

  if (
    resolvedSchema.type === 'object' &&
    resolvedSchema.properties &&
    typeof resolvedSchema.properties === 'object' &&
    !Array.isArray(resolvedSchema.properties)
  ) {
    content.example = normalizeExampleObject(
      example as Record<string, unknown>,
      resolvedSchema.properties as Record<string, Record<string, unknown>>
    )
  }
}

function resolveSchemaReference(schema: Record<string, unknown>, schemas: Record<string, unknown>) {
  if (typeof schema.$ref !== 'string') {
    return schema
  }

  const refName = schema.$ref.replace('#/components/schemas/', '')
  const resolved = schemas[refName]

  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return undefined
  }

  return resolved as Record<string, unknown>
}

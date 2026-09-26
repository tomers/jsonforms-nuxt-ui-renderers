import { Resolve } from '@jsonforms/core'

type SchemaRecord = Record<string, unknown>

export interface ResolvedNullableSchema {
  schema: SchemaRecord
  nullable: boolean
}

function isSchemaRecord(value: unknown): value is SchemaRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullSchema(schema: unknown): schema is SchemaRecord {
  if (!isSchemaRecord(schema)) return false

  return (
    schema.type === 'null' ||
    (Array.isArray(schema.type) &&
      schema.type.length === 1 &&
      schema.type[0] === 'null')
  )
}

function resolveReference(
  schema: SchemaRecord,
  rootSchema: unknown,
  visitedRefs: Set<string>,
): SchemaRecord | undefined {
  if (typeof schema.$ref !== 'string') return schema
  if (
    !isSchemaRecord(rootSchema) ||
    !schema.$ref.startsWith('#/') ||
    visitedRefs.has(schema.$ref)
  ) {
    return undefined
  }

  const annotations = new Set([
    '$comment',
    'deprecated',
    'description',
    'examples',
    'readOnly',
    'title',
    'writeOnly',
  ])
  if (
    Object.keys(schema).some(
      (key) => key !== '$ref' && !annotations.has(key),
    )
  ) {
    return undefined
  }

  visitedRefs.add(schema.$ref)
  let referenced: unknown
  try {
    referenced = Resolve.schema(rootSchema as any, schema.$ref, rootSchema as any)
  } catch {
    return undefined
  }
  if (!isSchemaRecord(referenced)) return undefined

  return resolveReference(referenced, rootSchema, visitedRefs)
}

/**
 * Resolve local references and unwrap only unambiguous nullable schemas.
 * General unions and unresolved or unsupported references remain unmatched.
 */
export function resolveNullableSchema(
  schema: unknown,
  rootSchema?: unknown,
): ResolvedNullableSchema | undefined {
  if (!isSchemaRecord(schema)) return undefined

  let current = schema
  let nullable = false
  const visitedRefs = new Set<string>()

  for (;;) {
    const resolved = resolveReference(current, rootSchema, visitedRefs)
    if (!resolved) return undefined
    current = resolved

    const hasAnyOf = Object.prototype.hasOwnProperty.call(current, 'anyOf')
    const hasOneOf = Object.prototype.hasOwnProperty.call(current, 'oneOf')

    if (hasAnyOf && hasOneOf) return undefined

    if (Array.isArray(current.type) && current.type.includes('null')) {
      const nonNullTypes = current.type.filter(
        (type): type is string => typeof type === 'string' && type !== 'null',
      )
      if (nonNullTypes.length !== 1 || current.type.length !== 2) return undefined
      current = { ...current, type: nonNullTypes[0] }
      nullable = true
      continue
    }

    if (!hasAnyOf && !hasOneOf) return { schema: current, nullable }

    const alternatives = hasAnyOf ? current.anyOf : current.oneOf
    if (!Array.isArray(alternatives)) return undefined

    const nullVariants = alternatives.filter(isNullSchema)
    if (nullVariants.length === 0) return { schema: current, nullable }
    if (hasOneOf && nullVariants.length !== 1) return undefined

    const nonNullVariants = alternatives.filter((variant) => !isNullSchema(variant))
    if (nonNullVariants.length !== 1 || !isSchemaRecord(nonNullVariants[0])) {
      return undefined
    }

    current = nonNullVariants[0]
    nullable = true
  }
}

export function unwrapNullableSchema(
  schema: unknown,
  rootSchema?: unknown,
): SchemaRecord | undefined {
  return resolveNullableSchema(schema, rootSchema)?.schema
}

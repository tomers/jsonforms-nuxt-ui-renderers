type SchemaRecord = Record<string, unknown>

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

/**
 * Unwrap only unambiguous nullable schemas. General unions and malformed or
 * multi-type unions are left unmatched so a renderer cannot guess incorrectly.
 */
export function unwrapNullableSchema(schema: unknown): SchemaRecord | undefined {
  if (!isSchemaRecord(schema)) return undefined

  let current = schema
  for (;;) {
    const hasAnyOf = Object.prototype.hasOwnProperty.call(current, 'anyOf')
    const hasOneOf = Object.prototype.hasOwnProperty.call(current, 'oneOf')

    if (hasAnyOf && hasOneOf) return undefined

    if (Array.isArray(current.type) && current.type.includes('null')) {
      const nonNullTypes = current.type.filter(
        (type): type is string => typeof type === 'string' && type !== 'null',
      )
      if (nonNullTypes.length !== 1 || current.type.length !== 2) return undefined
      current = { ...current, type: nonNullTypes[0] }
      continue
    }

    if (!hasAnyOf && !hasOneOf) return current

    const alternatives = hasAnyOf ? current.anyOf : current.oneOf
    if (!Array.isArray(alternatives)) return undefined

    const nullVariants = alternatives.filter(isNullSchema)
    if (nullVariants.length === 0) return current
    if (hasOneOf && nullVariants.length !== 1) return undefined

    const nonNullVariants = alternatives.filter((variant) => !isNullSchema(variant))
    if (nonNullVariants.length !== 1 || !isSchemaRecord(nonNullVariants[0])) {
      return undefined
    }

    current = nonNullVariants[0]
  }
}

export function isNullableSchema(schema: unknown): boolean {
  const unwrapped = unwrapNullableSchema(schema)
  return unwrapped !== undefined && unwrapped !== schema
}

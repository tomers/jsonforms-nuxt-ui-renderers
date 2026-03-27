import { describe, expect, it } from 'vitest'

import {
  controlDescription,
  controlTextInputAttrs,
  getDocsPathFromSchema,
  isSchemaReadOnly,
} from '../src/renderers/util'

describe('controlDescription', () => {
  it('returns control.description when set', () => {
    expect(
      controlDescription({ description: 'Control hint' }),
    ).toBe('Control hint')
  })

  it('returns schema.description when control.description is absent', () => {
    expect(
      controlDescription({
        schema: { description: 'Schema hint' },
      }),
    ).toBe('Schema hint')
  })

  it('prefers control.description over schema.description', () => {
    expect(
      controlDescription({
        description: 'Control hint',
        schema: { description: 'Schema hint' },
      }),
    ).toBe('Control hint')
  })

  it('returns undefined when neither has description', () => {
    expect(controlDescription({})).toBeUndefined()
    expect(controlDescription({ schema: {} })).toBeUndefined()
  })

  it('trims whitespace from control.description', () => {
    expect(
      controlDescription({ description: '  trimmed  ' }),
    ).toBe('trimmed')
  })

  it('trims whitespace from schema.description', () => {
    expect(
      controlDescription({
        schema: { description: '  schema trimmed  ' },
      }),
    ).toBe('schema trimmed')
  })

  it('returns undefined for whitespace-only strings', () => {
    expect(controlDescription({ description: '   ' })).toBeUndefined()
    expect(
      controlDescription({ schema: { description: '   ' } }),
    ).toBeUndefined()
  })

  it('ignores non-string schema.description', () => {
    expect(
      controlDescription({
        schema: { description: 123 as unknown as string },
      }),
    ).toBeUndefined()
  })
})

describe('isSchemaReadOnly', () => {
  it('is true only when readOnly is boolean true', () => {
    expect(isSchemaReadOnly({ type: 'string', readOnly: true })).toBe(true)
    expect(isSchemaReadOnly({ type: 'string', readOnly: false })).toBe(false)
    expect(isSchemaReadOnly({ type: 'string' })).toBe(false)
    expect(isSchemaReadOnly(null)).toBe(false)
  })
})

describe('controlTextInputAttrs', () => {
  it('uses readonly for pure schema readOnly', () => {
    expect(
      controlTextInputAttrs(
        {
          enabled: false,
          schema: { type: 'string', readOnly: true },
          uischema: { type: 'Control', scope: '#/properties/x' },
          config: {},
        },
        {},
      ),
    ).toEqual({ readonly: true, disabled: false })
  })

  it('uses disabled when JsonForms is in readonly mode', () => {
    expect(
      controlTextInputAttrs(
        {
          enabled: false,
          schema: { type: 'string', readOnly: true },
          uischema: { type: 'Control', scope: '#/properties/x' },
          config: {},
        },
        { readonly: true },
      ),
    ).toEqual({ readonly: false, disabled: true })
  })
})

describe('getDocsPathFromSchema', () => {
  it('returns path when x-docs-path is valid', () => {
    expect(
      getDocsPathFromSchema({
        type: 'string',
        'x-docs-path': '/docs/integrations/waveshare/#hardware-device-id-required',
      }),
    ).toBe('/docs/integrations/waveshare/#hardware-device-id-required')
  })

  it('returns null when x-docs-path is absent', () => {
    expect(getDocsPathFromSchema({ type: 'string' })).toBeNull()
    expect(getDocsPathFromSchema({})).toBeNull()
  })

  it('returns null when x-docs-path does not start with /', () => {
    expect(
      getDocsPathFromSchema({ type: 'string', 'x-docs-path': 'relative' }),
    ).toBeNull()
    expect(
      getDocsPathFromSchema({ type: 'string', 'x-docs-path': 'https://example.com' }),
    ).toBeNull()
  })

  it('returns null for invalid schema', () => {
    expect(getDocsPathFromSchema(null)).toBeNull()
    expect(getDocsPathFromSchema(undefined)).toBeNull()
    expect(getDocsPathFromSchema([])).toBeNull()
  })
})

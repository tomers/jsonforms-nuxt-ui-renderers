import { describe, expect, it } from 'vitest'

import { controlDescription } from '../src/renderers/util'

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

import type { VNode } from 'vue'
import { h } from 'vue'
import { computed, type ComputedRef } from 'vue'

/**
 * Extract x-docs-path from a JSON Schema property.
 * Returns the path when present and valid (starts with /), otherwise null.
 */
export function getDocsPathFromSchema(schema: unknown): string | null {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema))
    return null
  const s = schema as Record<string, unknown>
  const path = s['x-docs-path']
  if (typeof path === 'string' && path.startsWith('/')) return path
  return null
}

/**
 * Render a docs link hint for UFormField when schema has x-docs-path.
 * Returns a slot render function or undefined when no docs URL.
 */
export function renderDocsHintSlot(
  schema: unknown,
  label: string,
  docsUrl: ((path: string) => string) | undefined,
  resolveComponent: (name: string) => unknown,
): (() => VNode) | undefined {
  const path = getDocsPathFromSchema(schema)
  if (!path || !docsUrl) return undefined
  const ULink = resolveComponent('ULink')
  const UIcon = resolveComponent('UIcon')
  if (!ULink || !UIcon) return undefined
  const href = docsUrl(path)
  return () =>
    h(
      ULink as any,
      {
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'inline-flex items-center text-muted hover:text-primary',
        'aria-label': `${label} docs`,
        title: `${label} docs`,
      },
      () => h(UIcon as any, { name: 'i-heroicons-information-circle' }),
    )
}

export function trimmedOrUndefined(input: string | undefined): string | undefined {
  const v = input?.trim()
  return v ? v : undefined
}

/**
 * Resolves the control's description for the label/field.
 * Uses control.description when set, otherwise falls back to schema.description.
 */
export function controlDescription(control: {
  description?: string
  schema?: { description?: string }
}): string | undefined {
  const d = control.description?.trim()
  if (d) return d
  const sd = (control.schema as { description?: string } | undefined)?.description
  return typeof sd === 'string' && sd.trim() ? sd.trim() : undefined
}

export function errorFromControl(
  control: ComputedRef<{ errors: string }>,
): ComputedRef<string | undefined> {
  return computed(() => trimmedOrUndefined(control.value.errors))
}


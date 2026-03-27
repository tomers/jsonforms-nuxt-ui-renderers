import type { ControlElement } from '@jsonforms/core'
import { hasEnableRule } from '@jsonforms/core'
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

/** True when the resolved control schema marks the field read-only (JSON Schema `readOnly`). */
export function isSchemaReadOnly(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return false
  return (schema as { readOnly?: unknown }).readOnly === true
}

type JsonformsInjected = { readonly?: boolean } | undefined

type ControlForInputAttrs = {
  enabled: boolean
  schema?: unknown
  uischema?: ControlElement
  config?: { readonly?: boolean; readOnly?: boolean }
}

/**
 * Nuxt UI text inputs: use native `readonly` only when JSON Schema `readOnly` is why the control
 * is not enabled. Other causes (global JsonForms readonly, UI schema / config readonly, enable
 * rules, etc.) keep `disabled` so behavior stays unchanged.
 */
export function controlTextInputAttrs(
  control: ControlForInputAttrs,
  jsonforms: JsonformsInjected,
): { readonly: boolean; disabled: boolean } {
  const schemaRO = isSchemaReadOnly(control.schema)
  if (!schemaRO) {
    return { readonly: false, disabled: !control.enabled }
  }

  if (jsonforms?.readonly === true) {
    return { readonly: false, disabled: !control.enabled }
  }

  const ui = control.uischema
  if (typeof ui?.options?.readonly === 'boolean' && ui.options.readonly) {
    return { readonly: false, disabled: !control.enabled }
  }
  if (typeof ui?.options?.readOnly === 'boolean' && ui.options.readOnly) {
    return { readonly: false, disabled: !control.enabled }
  }

  const cfg = control.config
  if (typeof cfg?.readonly === 'boolean' && cfg.readonly) {
    return { readonly: false, disabled: !control.enabled }
  }
  if (typeof cfg?.readOnly === 'boolean' && cfg.readOnly) {
    return { readonly: false, disabled: !control.enabled }
  }

  if (ui && hasEnableRule(ui) && !control.enabled) {
    return { readonly: false, disabled: true }
  }

  return { readonly: true, disabled: false }
}


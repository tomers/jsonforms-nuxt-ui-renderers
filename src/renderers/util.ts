import { computed, type ComputedRef } from 'vue'

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


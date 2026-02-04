import { computed, type ComputedRef } from 'vue'

export function trimmedOrUndefined(input: string | undefined): string | undefined {
  const v = input?.trim()
  return v ? v : undefined
}

export function errorFromControl(
  control: ComputedRef<{ errors: string }>,
): ComputedRef<string | undefined> {
  return computed(() => trimmedOrUndefined(control.value.errors))
}


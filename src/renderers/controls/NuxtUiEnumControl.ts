import type { ControlElement, JsonSchema } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, resolveComponent } from 'vue'

import { controlDescription, trimmedOrUndefined } from '../util'

type EnumOption = { label: string; value: unknown }
export type LocaleDirection = 'ltr' | 'rtl'

function schemaEnumOptions(schema: JsonSchema | undefined): EnumOption[] {
  if (!schema) return []

  if (Array.isArray(schema.enum)) {
    return schema.enum.map((v) => ({ label: String(v), value: v }))
  }

  const oneOf = (schema as unknown as { oneOf?: unknown }).oneOf
  if (!Array.isArray(oneOf)) return []

  const out: EnumOption[] = []
  for (const entry of oneOf) {
    if (typeof entry !== 'object' || entry === null) continue
    const maybe = entry as Record<string, unknown>
    if (!('const' in maybe)) continue
    out.push({
      value: maybe.const,
      label:
        typeof maybe.title === 'string' && maybe.title.trim()
          ? maybe.title
          : String(maybe.const),
    })
  }
  return out
}

export function createNuxtUiEnumControl(localeDirection: LocaleDirection = 'ltr') {
  return defineComponent({
    name: 'NuxtUiEnumControl',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(
        props as unknown as Parameters<typeof useJsonFormsControl>[0],
      )

      const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))
      const options = computed<EnumOption[]>(() =>
        schemaEnumOptions(control.value.schema),
      )

      const selectedValue = computed<unknown>({
        get: () => control.value.data,
        set: (v: unknown) => handleChange(control.value.path, v),
      })

      return () => {
        if (!control.value.visible) return null

        const UFormField = resolveComponent('UFormField')

        return h(
          'div',
          {},
          h(
            UFormField as any,
            {
              label: control.value.label,
              description: controlDescription(control.value),
              required: control.value.required,
              error: errorMessage.value,
            },
            {
              default: () => {
                if (options.value.length >= 2 && options.value.length <= 4) {
                  const UFieldGroup = resolveComponent('UFieldGroup')
                  const UButton = resolveComponent('UButton')

                  return h(
                    UFieldGroup as any,
                    {
                      dir: 'ltr',
                      role: 'group',
                      'aria-label': String(control.value.label ?? ''),
                      'aria-invalid': Boolean(errorMessage.value),
                    },
                    {
                      default: () =>
                        options.value.map((option) => {
                          const selected = Object.is(
                            selectedValue.value,
                            option.value,
                          )
                          return h(
                            UButton as any,
                            {
                              type: 'button',
                              disabled: !control.value.enabled,
                              color: errorMessage.value
                                ? 'error'
                                : selected
                                  ? 'primary'
                                  : 'neutral',
                              variant: selected ? 'solid' : 'outline',
                              'aria-pressed': selected,
                              onClick: () => {
                                selectedValue.value = option.value
                              },
                            },
                            {
                              default: () =>
                                h(
                                  'span',
                                  { dir: localeDirection },
                                  option.label,
                                ),
                            },
                          )
                        }),
                    },
                  )
                }

                const USelectMenu = resolveComponent('USelectMenu')
                return h(USelectMenu as any, {
                  modelValue: selectedValue.value,
                  items: options.value,
                  valueKey: 'value',
                  labelKey: 'label',
                  disabled: !control.value.enabled,
                  color: errorMessage.value ? 'error' : undefined,
                  'aria-invalid': Boolean(errorMessage.value),
                  placeholder: 'Select...',
                  'onUpdate:modelValue': (v: unknown) => {
                    selectedValue.value = v
                  },
                })
              },
            },
          ),
        )
      }
    },
  })
}

export const NuxtUiEnumControl = createNuxtUiEnumControl()

import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, inject, resolveComponent } from 'vue'

import { controlDescription, controlTextInputAttrs, trimmedOrUndefined } from '../util'

/** See {@link NuxtUiIntegerControl}: native input so each `input` event updates JsonForms core. */
export const NuxtUiNumberControl = defineComponent({
  name: 'NuxtUiNumberControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )
    const jsonforms = inject<{ readonly?: boolean }>('jsonforms')

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

    const modelValue = computed(() => {
      const v = control.value.data
      return v === null || v === undefined ? '' : String(v)
    })

    function applyRawString(raw: string) {
      const trimmed = raw.trim()
      if (trimmed === '') {
        handleChange(control.value.path, undefined)
        return
      }
      const parsed = Number(trimmed)
      handleChange(control.value.path, Number.isFinite(parsed) ? parsed : undefined)
    }

    return () => {
      if (!control.value.visible) return null

      const UFormField = resolveComponent('UFormField')
      const { readonly, disabled } = controlTextInputAttrs(control.value, jsonforms)

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
            default: () =>
              h('input', {
                type: 'number',
                inputmode: 'decimal',
                class: [
                  'jf-input-native',
                  errorMessage.value ? 'jf-input-native--error' : '',
                ]
                  .filter(Boolean)
                  .join(' '),
                value: modelValue.value,
                readonly,
                disabled,
                'aria-invalid': Boolean(errorMessage.value),
                onInput: (e: Event) => {
                  applyRawString((e.target as HTMLInputElement).value)
                },
              }),
          },
        ),
      )
    }
  },
})


import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, resolveComponent } from 'vue'

import { trimmedOrUndefined } from '../util'

export const NuxtUiNumberControl = defineComponent({
  name: 'NuxtUiNumberControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

    const modelValue = computed(() => {
      const v = control.value.data
      return v === null || v === undefined ? '' : String(v)
    })

    function onUpdate(raw: unknown) {
      const trimmed = String(raw ?? '').trim()
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
      const UInput = resolveComponent('UInput')

      return h(
        'div',
        {},
        h(
          UFormField as any,
          {
            label: control.value.label,
            description: control.value.description,
            required: control.value.required,
            error: errorMessage.value,
          },
          {
            default: () =>
              h(UInput as any, {
                type: 'number',
                inputmode: 'decimal',
                modelValue: modelValue.value,
                disabled: !control.value.enabled,
                color: errorMessage.value ? 'error' : undefined,
                'aria-invalid': Boolean(errorMessage.value),
                'onUpdate:modelValue': onUpdate,
              }),
          },
        ),
      )
    }
  },
})


import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, resolveComponent } from 'vue'

import { trimmedOrUndefined } from '../util'

export const NuxtUiBooleanControl = defineComponent({
  name: 'NuxtUiBooleanControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

    const modelValue = computed<boolean>({
      get: () => Boolean(control.value.data),
      set: (v: boolean) => handleChange(control.value.path, v),
    })

    return () => {
      if (!control.value.visible) return null

      const UFormField = resolveComponent('UFormField')
      const USwitch = resolveComponent('USwitch')

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
              h(
                'div',
                { class: 'flex items-center justify-between gap-3' },
                h(USwitch as any, {
                  modelValue: modelValue.value,
                  disabled: !control.value.enabled,
                  'aria-invalid': Boolean(errorMessage.value),
                  'onUpdate:modelValue': (v: boolean) => {
                    modelValue.value = v
                  },
                }),
              ),
          },
        ),
      )
    }
  },
})


import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import {
  computed,
  defineComponent,
  h,
  resolveComponent,
} from 'vue'

import { trimmedOrUndefined } from '../util'

export const NuxtUiStringControl = defineComponent({
  name: 'NuxtUiStringControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

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
                modelValue: control.value.data ?? '',
                class: 'w-full',
                disabled: !control.value.enabled,
                color: errorMessage.value ? 'error' : undefined,
                'aria-invalid': Boolean(errorMessage.value),
                'onUpdate:modelValue': (v: unknown) =>
                  handleChange(control.value.path, v),
              }),
          },
        ),
      )
    }
  },
})


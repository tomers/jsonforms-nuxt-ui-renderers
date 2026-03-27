import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, inject, resolveComponent } from 'vue'

import { controlDescription, controlTextInputAttrs, trimmedOrUndefined } from '../util'

export const NuxtUiTextareaControl = defineComponent({
  name: 'NuxtUiTextareaControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )
    const jsonforms = inject<{ readonly?: boolean }>('jsonforms')

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

    return () => {
      if (!control.value.visible) return null

      const UFormField = resolveComponent('UFormField')
      const UTextarea = resolveComponent('UTextarea')
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
              h(UTextarea as any, {
                modelValue: control.value.data ?? '',
                class: 'w-full',
                readonly,
                disabled,
                color: errorMessage.value ? 'error' : undefined,
                'aria-invalid': Boolean(errorMessage.value),
                rows: 5,
                'onUpdate:modelValue': (v: unknown) =>
                  handleChange(control.value.path, v),
              }),
          },
        ),
      )
    }
  },
})


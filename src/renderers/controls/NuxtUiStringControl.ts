import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import {
  computed,
  defineComponent,
  h,
  inject,
  resolveComponent,
} from 'vue'

import {
  controlDescription,
  controlTextInputAttrs,
  renderDocsHintSlot,
  trimmedOrUndefined,
} from '../util'

export function createNuxtUiStringControl(
  docsUrl?: (path: string) => string,
) {
  return defineComponent({
    name: 'NuxtUiStringControl',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(
        props as unknown as Parameters<typeof useJsonFormsControl>[0],
      )
      const jsonforms = inject<{ readonly?: boolean }>('jsonforms')

      const errorMessage = computed(() =>
        trimmedOrUndefined(control.value.errors),
      )

      return () => {
        if (!control.value.visible) return null

        const UFormField = resolveComponent('UFormField')
        const UInput = resolveComponent('UInput')
        const { readonly, disabled } = controlTextInputAttrs(
          control.value,
          jsonforms,
        )

        const slots: Record<string, () => ReturnType<typeof h>> = {
          default: () =>
            h(UInput as any, {
              modelValue: control.value.data ?? '',
              class: 'w-full',
              readonly,
              disabled,
              color: errorMessage.value ? 'error' : undefined,
              'aria-invalid': Boolean(errorMessage.value),
              'onUpdate:modelValue': (v: unknown) =>
                handleChange(control.value.path, v),
            }),
        }
        const hintSlot = renderDocsHintSlot(
          control.value.schema,
          control.value.label ?? '',
          docsUrl,
          resolveComponent,
        )
        if (hintSlot) slots.hint = hintSlot

        return h(
          'div',
          {},
          h(UFormField as any, {
            label: control.value.label,
            description: controlDescription(control.value),
            required: control.value.required,
            error: errorMessage.value,
          }, slots),
        )
      }
    },
  })
}



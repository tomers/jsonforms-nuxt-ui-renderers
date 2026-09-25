import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { defineComponent, h, resolveComponent, type Component } from 'vue'

import { isNullableSchema, unwrapNullableSchema } from '../nullableSchema'

export function createNuxtUiNullableControl(renderer: Component) {
  return defineComponent({
    name: 'NuxtUiNullableControl',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(
        props as unknown as Parameters<typeof useJsonFormsControl>[0],
      )

      return () => {
        if (!control.value.visible) return null

        const schema = control.value.schema as Record<string, unknown> | undefined
        const resolvedSchema = unwrapNullableSchema(schema)
        const renderedControl = h(renderer, props)
        if (!isNullableSchema(schema) || !resolvedSchema) return renderedControl

        const UButton = resolveComponent('UButton')
        const readOnly =
          schema?.readOnly === true || resolvedSchema.readOnly === true

        return h(
          'div',
          { class: 'jf-nullable-control' },
          [
            h('div', { class: 'jf-nullable-control__value' }, [renderedControl]),
            h(
              UButton as any,
              {
                type: 'button',
                color: 'neutral',
                variant: 'ghost',
                disabled: !control.value.enabled || readOnly,
                'aria-label': `Clear ${control.value.label || 'value'}`,
                onClick: () => {
                  handleChange(control.value.path, null)
                },
              },
              () => 'Clear',
            ),
          ],
        )
      }
    },
  })
}

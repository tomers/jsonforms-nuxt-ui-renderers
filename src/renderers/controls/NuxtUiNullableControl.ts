import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { defineComponent, h, resolveComponent, type Component } from 'vue'

import { resolveNullableSchema } from '../nullableSchema'

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
        const nullableSchema = resolveNullableSchema(
          schema,
          control.value.rootSchema,
        )
        const renderedControl = h(renderer, props)
        if (!nullableSchema?.nullable) return renderedControl

        const UButton = resolveComponent('UButton')
        const readOnly =
          schema?.readOnly === true || nullableSchema.schema.readOnly === true
        const isNull = control.value.data === null

        return h(
          'div',
          { class: 'jf-nullable-control' },
          [
            h('div', { class: 'jf-nullable-control__value' }, [renderedControl]),
            isNull
              ? h(
                  'span',
                  {
                    class: 'jf-nullable-control__null-indicator',
                    role: 'status',
                    'aria-label': `${control.value.label || 'Value'} is null`,
                  },
                  'Null',
                )
              : h(
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

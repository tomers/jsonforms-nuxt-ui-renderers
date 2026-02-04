import type { ControlElement, JsonSchema, UISchemaElement } from '@jsonforms/core'
import {
  Resolve,
  composePaths,
  createDefaultValue,
  findUISchema,
  getFirstPrimitiveProp,
} from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsArrayControl } from '@jsonforms/vue'
import { computed, defineComponent, h, resolveComponent } from 'vue'

import { trimmedOrUndefined } from '../util'

export const NuxtUiArrayListRenderer = defineComponent({
  name: 'NuxtUiArrayListRenderer',
  components: { DispatchRenderer },
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, addItem, removeItems, moveUp, moveDown } =
      useJsonFormsArrayControl(
        props as unknown as Parameters<typeof useJsonFormsArrayControl>[0],
      )

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))

    const items = computed<unknown[]>(() =>
      Array.isArray(control.value.data) ? control.value.data : [],
    )

    const arraySchema = computed<JsonSchema | undefined>(() => {
      try {
        return Resolve.schema(
          props.schema,
          control.value.uischema.scope,
          control.value.rootSchema,
        )
      } catch {
        return undefined
      }
    })

    const maxItemsReached = computed(() => {
      const max = arraySchema.value?.maxItems
      return typeof max === 'number' ? items.value.length >= max : false
    })

    const minItemsReached = computed(() => {
      const min = arraySchema.value?.minItems
      return typeof min === 'number' ? items.value.length <= min : false
    })

    const childUiSchema = computed<UISchemaElement>(() =>
      findUISchema(
        control.value.uischemas,
        control.value.schema,
        control.value.uischema.scope,
        control.value.path,
        undefined,
        control.value.uischema,
        control.value.rootSchema,
      ),
    )

    function childLabelForIndex(index: number): string {
      const childLabelProp =
        getChildLabelPropFromUiSchemaOptions(control.value.uischema.options) ??
        getFirstPrimitiveProp(control.value.schema)

      if (!childLabelProp) return `${index}`

      const labelValue = Resolve.data(
        control.value.data,
        composePaths(`${index}`, childLabelProp),
      )
      if (
        labelValue === undefined ||
        labelValue === null ||
        Number.isNaN(labelValue as any)
      ) {
        return ''
      }
      return String(labelValue)
    }

    function getChildLabelPropFromUiSchemaOptions(options: unknown): string | undefined {
      if (!options || typeof options !== 'object') return undefined
      const value = (options as Record<string, unknown>).childLabelProp
      return typeof value === 'string' ? value : undefined
    }

    function addButtonClick() {
      addItem(
        control.value.path,
        createDefaultValue(control.value.schema, control.value.rootSchema),
      )()
    }

    return () => {
      if (!control.value.visible) return null

      const UFormField = resolveComponent('UFormField')
      const UButton = resolveComponent('UButton')

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
              h('div', { class: 'flex flex-col gap-3' }, [
                h('div', { class: 'flex items-center justify-between gap-3' }, [
                  h(
                    'div',
                    { class: 'text-xs text-gray-500' },
                    `${items.value.length} items`,
                  ),
                  h(
                    UButton as any,
                    {
                      type: 'button',
                      size: 'xs',
                      variant: 'soft',
                      color: 'neutral',
                      disabled: !control.value.enabled || maxItemsReached.value,
                      onClick: addButtonClick,
                    },
                    { default: () => 'Add' },
                  ),
                ]),

                items.value.length === 0
                  ? h(
                      'div',
                      { class: 'text-sm text-gray-500' },
                      'No items.',
                    )
                  : null,

                ...items.value.map((_item, index) =>
                  h(
                    'div',
                    { key: `${control.value.path}-${index}`, class: 'rounded border p-3' },
                    [
                      h(
                        'div',
                        { class: 'mb-3 flex items-start justify-between gap-3' },
                        [
                          h('div', { class: 'min-w-0' }, [
                            h(
                              'div',
                              {
                                class:
                                  'text-xs font-semibold text-gray-700 dark:text-gray-200',
                              },
                              [
                                `Item ${index + 1}`,
                                childLabelForIndex(index)
                                  ? h(
                                      'span',
                                      {
                                        class:
                                          'font-normal text-gray-500',
                                      },
                                      ` — ${childLabelForIndex(index)}`,
                                    )
                                  : null,
                              ],
                            ),
                          ]),
                          h('div', { class: 'flex flex-none items-center gap-1' }, [
                            h(
                              UButton as any,
                              {
                                type: 'button',
                                size: 'xs',
                                variant: 'ghost',
                                color: 'neutral',
                                disabled: !control.value.enabled || index === 0,
                                onClick: () => moveUp?.(control.value.path, index)(),
                              },
                              { default: () => 'Up' },
                            ),
                            h(
                              UButton as any,
                              {
                                type: 'button',
                                size: 'xs',
                                variant: 'ghost',
                                color: 'neutral',
                                disabled:
                                  !control.value.enabled ||
                                  index >= items.value.length - 1,
                                onClick: () => moveDown?.(control.value.path, index)(),
                              },
                              { default: () => 'Down' },
                            ),
                            h(
                              UButton as any,
                              {
                                type: 'button',
                                size: 'xs',
                                variant: 'ghost',
                                color: 'error',
                                disabled: !control.value.enabled || minItemsReached.value,
                                onClick: () =>
                                  removeItems?.(control.value.path, [index])(),
                              },
                              { default: () => 'Remove' },
                            ),
                          ]),
                        ],
                      ),

                      h(DispatchRenderer as any, {
                        schema: control.value.schema,
                        uischema: childUiSchema.value,
                        path: composePaths(control.value.path, `${index}`),
                        enabled: control.value.enabled,
                        renderers: control.value.renderers,
                        cells: control.value.cells,
                      }),
                    ],
                  ),
                ),
              ]),
          },
        ),
      )
    }
  },
})


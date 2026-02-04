import type { ControlElement, GroupLayout, UISchemaElement } from '@jsonforms/core'
import { Generate, findUISchema } from '@jsonforms/core'
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsControlWithDetail,
} from '@jsonforms/vue'
import { computed, defineComponent, h } from 'vue'

export const NuxtUiObjectRenderer = defineComponent({
  name: 'NuxtUiObjectRenderer',
  components: { DispatchRenderer },
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control } = useJsonFormsControlWithDetail(
      props as unknown as Parameters<typeof useJsonFormsControlWithDetail>[0],
    )

    const detailUiSchema = computed<UISchemaElement>(() => {
      const uiSchemaGenerator = () => {
        const uiSchema = Generate.uiSchema(
          control.value.schema,
          'Group',
          undefined,
          control.value.rootSchema,
        )

        if (!control.value.path) {
          uiSchema.type = 'VerticalLayout'
        } else {
          ;(uiSchema as GroupLayout).label = control.value.label
        }
        return uiSchema
      }

      return findUISchema(
        control.value.uischemas,
        control.value.schema,
        control.value.uischema.scope,
        control.value.path,
        uiSchemaGenerator,
        control.value.uischema,
        control.value.rootSchema,
      )
    })

    return () => {
      if (!control.value.visible) return null

      return h(DispatchRenderer as any, {
        visible: control.value.visible,
        enabled: control.value.enabled,
        schema: control.value.schema,
        uischema: detailUiSchema.value,
        path: control.value.path,
        renderers: control.value.renderers,
        cells: control.value.cells,
      })
    }
  },
})


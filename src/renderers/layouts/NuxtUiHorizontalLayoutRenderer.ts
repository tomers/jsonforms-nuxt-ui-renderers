import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'
import { defineComponent, h } from 'vue'

export const NuxtUiHorizontalLayoutRenderer = defineComponent({
  name: 'NuxtUiHorizontalLayoutRenderer',
  components: { DispatchRenderer },
  props: rendererProps<Layout>(),
  setup(props) {
    const { layout } = useJsonFormsLayout(
      props as unknown as Parameters<typeof useJsonFormsLayout>[0],
    )

    return () => {
      if (!layout.value.visible) return null

      const elements = layout.value.uischema.elements ?? []

      return h(
        'div',
        { class: 'flex flex-col gap-3 md:flex-row md:flex-wrap' },
        elements.map((element, index) =>
          h(
            'div',
            { key: `${layout.value.path}-${index}`, class: 'min-w-0 flex-1' },
            h(DispatchRenderer as any, {
              schema: layout.value.schema,
              uischema: element,
              path: layout.value.path,
              enabled: layout.value.enabled,
              renderers: layout.value.renderers,
              cells: layout.value.cells,
            }),
          ),
        ),
      )
    }
  },
})


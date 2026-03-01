import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'
import type { NuxtUiRenderersTheme } from '../theme'
import { defineComponent, h } from 'vue'

export function createNuxtUiHorizontalLayoutRenderer(
  theme: NuxtUiRenderersTheme,
) {
  return defineComponent({
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
          { class: theme.layoutHorizontal },
          elements.map((element, index) =>
            h(
              'div',
              {
                key: `${layout.value.path}-${index}`,
                class: theme.layoutHorizontalItem,
              },
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
}

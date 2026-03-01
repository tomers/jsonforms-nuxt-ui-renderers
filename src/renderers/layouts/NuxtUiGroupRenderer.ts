import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'
import type { NuxtUiRenderersTheme } from '../theme'
import { defineComponent, h } from 'vue'

export function createNuxtUiGroupRenderer(theme: NuxtUiRenderersTheme) {
  return defineComponent({
    name: 'NuxtUiGroupRenderer',
    components: { DispatchRenderer },
    props: rendererProps<Layout>(),
    setup(props) {
      const { layout } = useJsonFormsLayout(
        props as unknown as Parameters<typeof useJsonFormsLayout>[0],
      )

      return () => {
        if (!layout.value.visible) return null

        const elements = layout.value.uischema.elements ?? []
        const isNested = layout.value.path?.includes('.') ?? false
        const containerClass = isNested ? theme.groupNested : theme.panel

        return h(
          'div',
          { class: containerClass },
          [
            layout.value.label
              ? h('div', { class: theme.labelSectionSpaced }, layout.value.label)
              : null,
            h(
              'div',
              { class: theme.layoutVertical },
              elements.map((element, index) =>
                h(
                  'div',
                  { key: `${layout.value.path}-${index}` },
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
            ),
          ],
        )
      }
    },
  })
}

import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'
import { defineComponent, h } from 'vue'

export const NuxtUiCategoryRenderer = defineComponent({
  name: 'NuxtUiCategoryRenderer',
  components: { DispatchRenderer },
  props: rendererProps<Layout>(),
  setup(props) {
    const { layout } = useJsonFormsLayout(
      props as unknown as Parameters<typeof useJsonFormsLayout>[0],
    )

    return () => {
      if (!layout.value.visible) return null

      const elements = layout.value.uischema.elements ?? []

      return h('div', { class: 'flex flex-col gap-3' }, [
        layout.value.label
          ? h('div', { class: 'text-sm font-semibold' }, layout.value.label)
          : null,
        h(
          'div',
          { class: 'flex flex-col gap-3' },
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
      ])
    }
  },
})


import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsCategorization } from '@jsonforms/vue'
import { defineComponent, h } from 'vue'

export const NuxtUiCategorizationRenderer = defineComponent({
  name: 'NuxtUiCategorizationRenderer',
  components: { DispatchRenderer },
  props: rendererProps<Layout>(),
  setup(props) {
    const { layout, categories } = useJsonFormsCategorization(
      props as unknown as Parameters<typeof useJsonFormsCategorization>[0],
    )

    return () => {
      if (!layout.value.visible) return null

      return h(
        'div',
        { class: 'flex flex-col gap-6' },
        categories.map((categoryRef, catIndex) => {
          const category = categoryRef.value
          const elements = category.uischema.elements ?? []

          return h(
            'div',
            { key: `${layout.value.path}-cat-${catIndex}`, class: 'flex flex-col gap-3' },
            [
              category.label
                ? h('div', { class: 'text-sm font-semibold' }, category.label)
                : null,
              h(
                'div',
                { class: 'flex flex-col gap-3' },
                elements.map((element, index) =>
                  h(
                    'div',
                    { key: `${category.path}-${index}` },
                    h(DispatchRenderer as any, {
                      schema: category.schema,
                      uischema: element,
                      path: category.path,
                      enabled: category.enabled,
                      renderers: category.renderers,
                      cells: category.cells,
                    }),
                  ),
                ),
              ),
            ],
          )
        }),
      )
    }
  },
})


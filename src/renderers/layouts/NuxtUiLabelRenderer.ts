import type { LabelElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsLabel } from '@jsonforms/vue'
import type { NuxtUiRenderersTheme } from '../theme'
import { defineComponent, h } from 'vue'

export function createNuxtUiLabelRenderer(theme: NuxtUiRenderersTheme) {
  return defineComponent({
    name: 'NuxtUiLabelRenderer',
    props: rendererProps<LabelElement>(),
    setup(props) {
      const { label } = useJsonFormsLabel(
        props as unknown as Parameters<typeof useJsonFormsLabel>[0],
      )

      return () => {
        if (!label.value.visible) return null
        return h('div', { class: theme.textLabel }, label.value.text)
      }
    },
  })
}

import type { LabelElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsLabel } from '@jsonforms/vue'
import { defineComponent, h } from 'vue'

export const NuxtUiLabelRenderer = defineComponent({
  name: 'NuxtUiLabelRenderer',
  props: rendererProps<LabelElement>(),
  setup(props) {
    const { label } = useJsonFormsLabel(
      props as unknown as Parameters<typeof useJsonFormsLabel>[0],
    )

    return () => {
      if (!label.value.visible) return null
      return h(
        'div',
        { class: 'text-sm text-gray-600 dark:text-gray-300' },
        label.value.text,
      )
    }
  },
})


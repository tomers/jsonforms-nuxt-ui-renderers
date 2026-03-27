import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { computed, defineComponent, h, inject, ref, resolveComponent } from 'vue'

import { controlDescription, controlTextInputAttrs, trimmedOrUndefined } from '../util'

export const NuxtUiPasswordControl = defineComponent({
  name: 'NuxtUiPasswordControl',
  props: rendererProps<ControlElement>(),
  setup(props) {
    const { control, handleChange } = useJsonFormsControl(
      props as unknown as Parameters<typeof useJsonFormsControl>[0],
    )
    const jsonforms = inject<{ readonly?: boolean }>('jsonforms')

    const errorMessage = computed(() => trimmedOrUndefined(control.value.errors))
    const showPassword = ref(false)

    const inputType = computed(() => (showPassword.value ? 'text' : 'password'))

    return () => {
      if (!control.value.visible) return null

      const UFormField = resolveComponent('UFormField')
      const UInput = resolveComponent('UInput')
      const UButton = resolveComponent('UButton')
      const { readonly, disabled } = controlTextInputAttrs(control.value, jsonforms)

      return h(
        'div',
        {},
        h(
          UFormField as any,
          {
            label: control.value.label,
            description: controlDescription(control.value),
            required: control.value.required,
            error: errorMessage.value,
          },
          {
            default: () =>
              h(
                UInput as any,
                {
                  modelValue: control.value.data ?? '',
                  class: 'w-full',
                  type: inputType.value,
                  autocomplete: 'current-password',
                  readonly,
                  disabled,
                  color: errorMessage.value ? 'error' : undefined,
                  'aria-invalid': Boolean(errorMessage.value),
                  'onUpdate:modelValue': (v: unknown) =>
                    handleChange(control.value.path, v),
                },
                {
                  trailing: () =>
                    h(UButton as any, {
                      type: 'button',
                      color: 'neutral',
                      variant: 'ghost',
                      square: true,
                      icon: showPassword.value
                        ? 'i-heroicons-eye-slash'
                        : 'i-heroicons-eye',
                      'aria-pressed': showPassword.value,
                      'aria-label': showPassword.value
                        ? 'Hide password'
                        : 'Show password',
                      disabled,
                      onClick: () => {
                        showPassword.value = !showPassword.value
                      },
                    }),
                },
              ),
          },
        ),
      )
    }
  },
})

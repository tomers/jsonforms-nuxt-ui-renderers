import { defineComponent, h } from 'vue'

export const UiStubs = {
  UFormField: defineComponent({
    name: 'UFormField',
    props: {
      label: { type: String, default: '' },
      description: { type: String, default: '' },
      required: { type: Boolean, default: false },
      error: { type: String, default: '' },
    },
    setup(props, { slots }) {
      return () =>
        h(
          'div',
          {
            'data-uformfield': props.label,
            'data-error': props.error ?? '',
          },
          slots.default ? slots.default() : [],
        )
    },
  }),

  UInput: defineComponent({
    name: 'UInput',
    props: {
      modelValue: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      type: { type: String, default: 'text' },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          value: props.modelValue,
          disabled: props.disabled,
          type: props.type,
          onInput: (e: Event) => {
            emit('update:modelValue', (e.target as HTMLInputElement).value)
          },
        })
    },
  }),

  UTextarea: defineComponent({
    name: 'UTextarea',
    props: {
      modelValue: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      rows: { type: Number, default: 3 },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('textarea', {
          value: props.modelValue,
          disabled: props.disabled,
          rows: props.rows,
          onInput: (e: Event) => {
            emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
          },
        })
    },
  }),

  USelectMenu: defineComponent({
    name: 'USelectMenu',
    props: {
      modelValue: { type: null, default: undefined },
      items: { type: Array, default: () => [] },
      valueKey: { type: String, default: '' },
      labelKey: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      placeholder: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    setup(props) {
      return () =>
        h('div', {
          'data-uselectmenu-items': Array.isArray(props.items)
            ? props.items.length
            : 0,
          'data-disabled': props.disabled ? '1' : '0',
        })
    },
  }),

  USwitch: defineComponent({
    name: 'USwitch',
    props: {
      modelValue: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          type: 'checkbox',
          checked: props.modelValue,
          disabled: props.disabled,
          onChange: (e: Event) => {
            emit('update:modelValue', (e.target as HTMLInputElement).checked)
          },
        })
    },
  }),

  UButton: defineComponent({
    name: 'UButton',
    props: {
      disabled: { type: Boolean, default: false },
      type: { type: String, default: 'button' },
    },
    emits: ['click'],
    setup(props, { slots, emit }) {
      return () =>
        h(
          'button',
          {
            type: props.type,
            disabled: props.disabled,
            onClick: () => emit('click'),
          },
          slots.default ? slots.default() : [],
        )
    },
  }),
}


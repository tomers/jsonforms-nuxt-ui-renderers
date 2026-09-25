import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { JsonForms } from '@jsonforms/vue'

import {
  createNuxtUiRenderers,
  nuxtUiRenderers,
} from '../src/nuxtUiRenderers'
import { UiStubs } from './stubs'

describe('jsonforms-nuxt-ui-renderers', () => {
  it('uses native readonly (not disabled) for schema readOnly string fields', () => {
    const schema = {
      type: 'object',
      properties: {
        discovered_label: { type: 'string', readOnly: true },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/discovered_label',
      label: 'Discovered label',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { discovered_label: 'PalGate device' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).readOnly).toBe(true)
    expect((input.element as HTMLInputElement).disabled).toBe(false)
  })

  it('keeps disabled for schema readOnly when JsonForms readonly mode is on', () => {
    const schema = {
      type: 'object',
      properties: {
        discovered_label: { type: 'string', readOnly: true },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/discovered_label',
      label: 'Discovered label',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { discovered_label: 'x' },
        renderers: nuxtUiRenderers,
        readonly: true,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).readOnly).toBe(false)
    expect((input.element as HTMLInputElement).disabled).toBe(true)
  })

  it('renders a string control via Nuxt UI stubs', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/name',
      label: 'Name',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { name: 'Alice' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('Alice')
  })

  it.each([
    {
      name: 'string inside anyOf',
      schema: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      data: 'text',
      component: 'UInput',
    },
    {
      name: 'number inside oneOf',
      schema: { oneOf: [{ type: 'number' }, { type: 'null' }] },
      data: 12.5,
      inputMode: 'decimal',
    },
    {
      name: 'integer inside anyOf',
      schema: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
      data: 12,
      inputMode: 'numeric',
    },
    {
      name: 'boolean inside oneOf',
      schema: { oneOf: [{ type: 'boolean' }, { type: 'null' }] },
      data: true,
      component: 'USwitch',
    },
  ])(
    'selects the correct renderer for nullable $name',
    ({ schema, data, component, inputMode }) => {
      const wrapper = mount(JsonForms as any, {
        props: {
          schema: {
            type: 'object',
            properties: { nullable_value: schema },
          },
          uischema: {
            type: 'Control',
            scope: '#/properties/nullable_value',
            label: 'Nullable value',
          },
          data: { nullable_value: data },
          renderers: nuxtUiRenderers,
        },
        global: { components: UiStubs },
      })

      if (component) {
        expect(wrapper.findComponent({ name: component }).exists()).toBe(true)
      } else {
        expect(wrapper.find('input').attributes('inputmode')).toBe(inputMode)
      }
    },
  )

  it('uses options and titles from nullable enum variants only', () => {
    const wrapper = mount(JsonForms as any, {
      props: {
        schema: {
          type: 'object',
          properties: {
            generation: {
              anyOf: [
                { type: 'string', enum: ['gen3', 'gen4'] },
                { type: 'null' },
              ],
            },
            mode: {
              oneOf: [
                {
                  type: 'string',
                  oneOf: [
                    { const: 'manual', title: 'Manual mode' },
                    { const: 'automatic', title: 'Automatic mode' },
                  ],
                },
                { type: 'null' },
              ],
            },
          },
        },
        uischema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/generation',
              label: 'Generation',
            },
            { type: 'Control', scope: '#/properties/mode', label: 'Mode' },
          ],
        },
        data: { generation: 'gen3', mode: 'manual' },
        renderers: nuxtUiRenderers,
      },
      global: { components: UiStubs },
    })

    const groups = wrapper.findAllComponents({ name: 'UFieldGroup' })
    expect(groups).toHaveLength(2)
    expect(groups[0]?.findAll('button').map((button) => button.text())).toEqual([
      'gen3',
      'gen4',
    ])
    expect(groups[1]?.findAll('button').map((button) => button.text())).toEqual([
      'Manual mode',
      'Automatic mode',
    ])
    expect(wrapper.text()).not.toContain('null')
  })

  it('does not match a nullable union with multiple non-null types', () => {
    const wrapper = mount(JsonForms as any, {
      props: {
        schema: {
          type: 'object',
          properties: {
            ambiguous: {
              anyOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'null' },
              ],
            },
          },
        },
        uischema: {
          type: 'Control',
          scope: '#/properties/ambiguous',
          label: 'Ambiguous',
        },
        data: { ambiguous: 'value' },
        renderers: nuxtUiRenderers,
      },
      global: { components: UiStubs },
    })

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'USwitch' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'USelectMenu' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'UFieldGroup' }).exists()).toBe(false)
  })

  it('keeps enums with more than four options in a select', () => {
    const schema = {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['video', 'video,audio', 'audio', 'data', 'other'],
        },
      },
      required: ['mode'],
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/mode',
      label: 'WebRTC media',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { mode: 'video' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    expect(wrapper.findComponent({ name: 'USelectMenu' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'UFieldGroup' }).exists()).toBe(false)
    // Ensure the generic string renderer didn't win.
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('renders enums with two through four options as button groups', () => {
    for (const values of [
      ['small', 'large'],
      ['small', 'medium', 'large', 'extra-large'],
    ]) {
      const wrapper = mount(JsonForms as any, {
        props: {
          schema: {
            type: 'object',
            properties: { size: { type: 'string', enum: values } },
          },
          uischema: {
            type: 'Control',
            scope: '#/properties/size',
            label: 'Size',
          },
          data: { size: values[0] },
          renderers: nuxtUiRenderers,
        },
        global: { components: UiStubs },
      })

      expect(wrapper.findComponent({ name: 'UFieldGroup' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'USelectMenu' }).exists()).toBe(false)
      expect(wrapper.findAll('button')).toHaveLength(values.length)
      expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
      wrapper.unmount()
    }
  })

  it.each(['ltr', 'rtl'] as const)(
    'keeps the button group LTR while option labels use %s direction',
    (localeDirection) => {
      const renderers = createNuxtUiRenderers({ localeDirection })
      const wrapper = mount(JsonForms as any, {
        props: {
          schema: {
            type: 'object',
            properties: {
              choice: {
                type: 'string',
                oneOf: [
                  { const: 'first', title: 'First option' },
                  { const: 'second', title: 'Second option' },
                ],
              },
            },
          },
          uischema: {
            type: 'Control',
            scope: '#/properties/choice',
            label: 'Choice label',
          },
          data: { choice: 'first' },
          renderers,
        },
        global: { components: UiStubs },
      })

      const group = wrapper.findComponent({ name: 'UFieldGroup' })
      expect(group.attributes('dir')).toBe('ltr')
      expect(group.attributes('aria-label')).toBe('Choice label')
      expect(
        wrapper.findAll('button span').map((span) => span.attributes('dir')),
      ).toEqual([localeDirection, localeDirection])
      expect(wrapper.findAll('button')[0]?.attributes('aria-pressed')).toBe('true')
      expect(wrapper.findAll('button')[1]?.attributes('aria-pressed')).toBe('false')
    },
  )

  it('updates selection and disables small-enum buttons in readonly mode', async () => {
    const wrapper = mount(JsonForms as any, {
      props: {
        schema: {
          type: 'object',
          properties: { mode: { type: 'string', enum: ['first', 'second'] } },
        },
        uischema: {
          type: 'Control',
          scope: '#/properties/mode',
          label: 'Mode',
        },
        data: { mode: 'first' },
        renderers: nuxtUiRenderers,
      },
      global: { components: UiStubs },
    })

    await wrapper.findAll('button')[1]?.trigger('click')
    expect(wrapper.findAll('button')[0]?.attributes('aria-pressed')).toBe('false')
    expect(wrapper.findAll('button')[1]?.attributes('aria-pressed')).toBe('true')
    wrapper.unmount()

    const readonlyWrapper = mount(JsonForms as any, {
      props: {
        schema: {
          type: 'object',
          properties: { mode: { type: 'string', enum: ['first', 'second'] } },
        },
        uischema: {
          type: 'Control',
          scope: '#/properties/mode',
          label: 'Mode',
        },
        data: { mode: 'first' },
        renderers: nuxtUiRenderers,
        readonly: true,
      },
      global: { components: UiStubs },
    })
    expect(
      readonlyWrapper
        .findAll('button')
        .every((button) => (button.element as HTMLButtonElement).disabled),
    ).toBe(true)
  })

  it('renders a oneOf enum control as a select (not a freeform input)', () => {
    const schema = {
      type: 'object',
      properties: {
        nvr_format: {
          type: 'string',
          oneOf: [
            { const: 'hikvision', title: 'Hikvision / HiWatch' },
            { const: 'dahua', title: 'Dahua / Amcrest / Lorex' },
            { const: 'custom', title: 'Custom' },
            { const: 'axis', title: 'Axis' },
            { const: 'other', title: 'Other' },
          ],
          default: 'hikvision',
        },
      },
      required: ['nvr_format'],
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/nvr_format',
      label: 'NVR format',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { nvr_format: 'dahua' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    expect(wrapper.findComponent({ name: 'USelectMenu' }).exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('renders a multi-enum control as a multi-select', () => {
    const schema = {
      type: 'object',
      properties: {
        tracks: { type: 'array', items: { type: 'string', enum: ['video', 'audio'] } },
      },
      required: ['tracks'],
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/tracks',
      label: 'Tracks',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { tracks: ['video'] },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const select = wrapper.findComponent({ name: 'USelectMenu' })
    expect(select.exists()).toBe(true)
    expect(select.attributes('data-multiple')).toBe('1')
    // Ensure the generic array renderer didn't win.
    expect(wrapper.text()).not.toContain('No items.')
  })

  it('renders a password-formatted string as a password input with toggle', async () => {
    const schema = {
      type: 'object',
      properties: {
        nvr_password: { type: 'string', format: 'password' },
      },
      required: ['nvr_password'],
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/nvr_password',
      label: 'NVR password',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { nvr_password: 'secret' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('password')

    const toggle = wrapper.find('button')
    expect(toggle.exists()).toBe(true)

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('renders a vertical layout with two controls', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    }

    const uischema = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/a', label: 'A' },
        { type: 'Control', scope: '#/properties/b', label: 'B' },
      ],
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { a: 'x', b: 'y' },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    expect(wrapper.findAll('input').length).toBe(2)
  })

  it('integer control uses native number input and updates JsonForms data on input', async () => {
    const schema = {
      type: 'object',
      properties: {
        port: { type: 'integer' },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/port',
      label: 'Port',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: {},
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)

    await input.setValue('2')
    await input.trigger('input')
    await wrapper.vm.$nextTick()

    const changes = wrapper.emitted('change') as unknown[][] | undefined
    expect(changes?.length).toBeGreaterThan(0)
    const lastBatch = changes!.at(-1)
    expect(lastBatch).toBeDefined()
    const payload = lastBatch![0]! as { data: { port?: number } }
    expect(payload.data?.port).toBe(2)
  })

  it('number control uses native number input and updates JsonForms data on input', async () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'number' },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/x',
      label: 'X',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: {},
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)

    await input.setValue('3.25')
    await input.trigger('input')
    await wrapper.vm.$nextTick()

    const changes = wrapper.emitted('change') as unknown[][] | undefined
    expect(changes?.length).toBeGreaterThan(0)
    const lastBatch = changes!.at(-1)
    expect(lastBatch).toBeDefined()
    const payload = lastBatch![0]! as { data: { x?: number } }
    expect(payload.data?.x).toBe(3.25)
  })

  it('renders schema description in form field', () => {
    const schema = {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Your email address' },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/email',
      label: 'Email',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: {},
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const field = wrapper.find('[data-uformfield="Email"]')
    expect(field.exists()).toBe(true)
    expect(field.attributes('data-description')).toBe('Your email address')
  })

  it('renders control without description when schema has none', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/name',
      label: 'Name',
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: {},
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const field = wrapper.find('[data-uformfield="Name"]')
    expect(field.exists()).toBe(true)
    expect(field.attributes('data-description')).toBe('')
  })

  it('renders an array control and can add an item', async () => {
    const schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
    }

    const uischema = {
      type: 'Control',
      scope: '#/properties/items',
      label: 'Items',
      options: { detail: 'GENERATE' },
    }

    const wrapper = mount(JsonForms as any, {
      props: {
        schema,
        uischema,
        data: { items: [] },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    expect(wrapper.text()).toContain('No items.')
    const addBtn = wrapper.find('button')
    expect(addBtn.exists()).toBe(true)

    await addBtn.trigger('click')
    // after adding one object item, we expect one nested input
    expect(wrapper.findAll('input').length).toBe(1)
  })

  describe('theme overrides', () => {
    it('uses semantic classes by default (jf-panel for top-level Group)', () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      }
      const uischema = {
        type: 'Group',
        label: 'Test group',
        elements: [
          { type: 'Control', scope: '#/properties/name', label: 'Name' },
        ],
      }

      const wrapper = mount(JsonForms as any, {
        props: {
          schema,
          uischema,
          data: { name: 'x' },
          renderers: nuxtUiRenderers,
        },
        global: { components: UiStubs },
      })

      const groupEl = wrapper.find('.jf-panel')
      expect(groupEl.exists()).toBe(true)
      expect(groupEl.text()).toContain('Test group')
    })

    it('createNuxtUiRenderers applies theme overrides to Group panel', () => {
      const customRenderers = createNuxtUiRenderers({
        theme: { panel: 'custom-panel-class' },
      })

      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      }
      const uischema = {
        type: 'Group',
        label: 'Custom themed',
        elements: [
          { type: 'Control', scope: '#/properties/name', label: 'Name' },
        ],
      }

      const wrapper = mount(JsonForms as any, {
        props: {
          schema,
          uischema,
          data: { name: 'x' },
          renderers: customRenderers,
        },
        global: { components: UiStubs },
      })

      expect(wrapper.find('.jf-panel').exists()).toBe(false)
      const customEl = wrapper.find('.custom-panel-class')
      expect(customEl.exists()).toBe(true)
      expect(customEl.text()).toContain('Custom themed')
    })

    it('createNuxtUiRenderers applies theme overrides to array item panels', () => {
      const customRenderers = createNuxtUiRenderers({
        theme: { panel: 'my-array-item-panel' },
      })

      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'object', properties: { x: { type: 'string' } } },
          },
        },
      }
      const uischema = {
        type: 'Control',
        scope: '#/properties/items',
        label: 'Items',
        options: { detail: 'GENERATE' },
      }

      const wrapper = mount(JsonForms as any, {
        props: {
          schema,
          uischema,
          data: { items: [{ x: 'a' }] },
          renderers: customRenderers,
        },
        global: { components: UiStubs },
      })

      expect(wrapper.find('.my-array-item-panel').exists()).toBe(true)
      expect(wrapper.find('.jf-panel').exists()).toBe(false)
    })
  })
})

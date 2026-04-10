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

  it('renders an enum control as a select (not a freeform input)', () => {
    const schema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['video', 'video,audio'] },
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
    // Ensure the generic string renderer didn't win.
    expect(wrapper.find('input').exists()).toBe(false)
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
    const last = changes![changes!.length - 1][0] as { data: { port?: number } }
    expect(last.data?.port).toBe(2)
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
    const last = changes![changes!.length - 1][0] as { data: { x?: number } }
    expect(last.data?.x).toBe(3.25)
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

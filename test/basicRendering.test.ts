import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { JsonForms } from '@jsonforms/vue'

import { nuxtUiRenderers } from '../src/nuxtUiRenderers'
import { UiStubs } from './stubs'

describe('jsonforms-nuxt-ui-renderers', () => {
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

  it('does not crash when UInput emits a number for integer controls', async () => {
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
        data: { port: 0 },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const uinput = wrapper.findComponent({ name: 'UInput' })
    expect(uinput.exists()).toBe(true)

    // Nuxt UI can emit numbers for `type="number"`.
    expect(() => uinput.vm.$emit('update:modelValue', 2)).not.toThrow()
    await wrapper.vm.$nextTick()
  })

  it('does not crash when UInput emits a number for number controls', async () => {
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
        data: { x: 1.5 },
        renderers: nuxtUiRenderers,
      },
      global: {
        components: UiStubs,
      },
    })

    const uinput = wrapper.findComponent({ name: 'UInput' })
    expect(uinput.exists()).toBe(true)

    expect(() => uinput.vm.$emit('update:modelValue', 3.25)).not.toThrow()
    await wrapper.vm.$nextTick()
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
})


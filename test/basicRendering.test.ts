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


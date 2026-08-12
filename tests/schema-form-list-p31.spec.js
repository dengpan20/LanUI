// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiSchemaForm from '../src/components/UiSchemaForm.vue'

afterEach(() => { document.body.innerHTML = '' })

const listSchema = overrides => [{
  key: 'contacts',
  name: 'contacts',
  type: 'list',
  label: 'Contacts',
  min: 1,
  max: 4,
  columns: 2,
  defaultValue: ({ index }) => ({ name: `Contact ${index + 1}`, email: '' }),
  fields: [
    { name: 'name', label: 'Name', required: true, rules: [{ required: true }] },
    { name: 'email', label: 'Email', rules: [{ type: 'email' }] },
  ],
  ...overrides,
}]

describe('P31 repeatable schema field groups', () => {
  it('renders list nodes as full-width repeatable groups with bound nested paths', async () => {
    const model = reactive({ contacts: [{ name: 'Ada', email: 'ada@example.com' }, { name: 'Lin', email: 'lin@example.com' }] })
    const instance = ref(); const onFieldChange = vi.fn()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiSchemaForm, { ref: instance, model, schema: listSchema(), columns: 2, onFieldChange }) }))
    expect(wrapper.findAll('.ui-schema-form-section')).toHaveLength(1)
    expect(wrapper.findAll('.ui-schema-form-list-item')).toHaveLength(2)
    expect(wrapper.get('.ui-schema-form-field').attributes('style')).toContain('span 2')
    expect(wrapper.findAll('.ui-schema-form-list-grid')).toHaveLength(2)
    expect(instance.value.getFieldDefinition('contacts.1.email')).toMatchObject({ label: 'Email', name: ['contacts', 1, 'email'] })
    expect(instance.value.getVisibleFields()).toHaveLength(5)
    await wrapper.findAll('input')[2].setValue('Lin UI')
    expect(model.contacts[1].name).toBe('Lin UI')
    expect(onFieldChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'contacts.1.name', previous: 'Lin', value: 'Lin UI' }))
    wrapper.unmount()
  })

  it('adds, moves and removes items with previous values and structured list events', async () => {
    const model = reactive({ contacts: [{ name: 'A', email: '' }, { name: 'B', email: '' }] })
    const onListChange = vi.fn(); const onFieldChange = vi.fn()
    const wrapper = mount(UiSchemaForm, { props: { model, schema: listSchema(), onListChange, onFieldChange } })
    await wrapper.get('.ui-schema-form-list-footer button').trigger('click')
    expect(model.contacts.map(item => item.name)).toEqual(['A', 'B', 'Contact 3'])
    expect(onListChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'contacts', change: expect.objectContaining({ type: 'add', previous: [{ name: 'A', email: '' }, { name: 'B', email: '' }] }) }))
    expect(onFieldChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'contacts', previous: expect.any(Array), value: expect.any(Array) }))
    const thirdActions = wrapper.findAll('.ui-schema-form-list-item-actions')[2].findAll('button')
    await thirdActions[0].trigger('click')
    expect(model.contacts.map(item => item.name)).toEqual(['A', 'Contact 3', 'B'])
    const secondActions = wrapper.findAll('.ui-schema-form-list-item-actions')[1].findAll('button')
    await secondActions[2].trigger('click')
    expect(model.contacts.map(item => item.name)).toEqual(['A', 'B'])
    expect(onListChange.mock.calls.map(call => call[0].change.type)).toEqual(['add', 'move', 'remove'])
    wrapper.unmount()
  })

  it('resolves per-item visibility, props and relative dependencies against list context', async () => {
    const model = reactive({ contacts: [{ channel: 'email', value: '' }, { channel: 'phone', value: '' }] })
    const instance = ref()
    const schema = listSchema({ fields: [
      { name: 'channel', label: 'Channel' },
      { name: 'value', label: 'Address', dependencies: ['channel'], visible: (_model, context) => context.item.channel === 'email', props: (_model, context) => ({ placeholder: `Email ${context.index + 1}` }), rules: [{ required: true }] },
    ] })
    const wrapper = mount(defineComponent({ setup: () => () => h(UiSchemaForm, { ref: instance, model, schema }) }))
    expect(wrapper.findAll('input')).toHaveLength(3)
    expect(wrapper.findAll('input')[1].attributes('placeholder')).toBe('Email 1')
    expect(instance.value.getFieldState('contacts.1.value')).toBeNull()
    model.contacts[1].channel = 'email'
    await nextTick()
    expect(wrapper.findAll('input')).toHaveLength(4)
    expect(instance.value.getFieldDefinition('contacts[1].value')?.name).toEqual(['contacts', 1, 'value'])
    expect(await instance.value.validateField('contacts.1.value')).toBe(false)
    model.contacts[1].channel = 'phone'
    await nextTick(); await flushPromises()
    expect(instance.value.getFieldState('contacts.1.value')).toBeNull()
    wrapper.unmount()
  })

  it('exposes list mutation APIs and reports min/max limits', async () => {
    const model = reactive({ contacts: [{ name: 'A', email: '' }] })
    const instance = ref(); const onListLimit = vi.fn()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiSchemaForm, { ref: instance, model, schema: listSchema({ max: 2 }), onListLimit }) }))
    expect(instance.value.addListItem('contacts', { name: 'B', email: '' })).toMatchObject({ type: 'add', index: 1 })
    expect(instance.value.addListItem('contacts', { name: 'C', email: '' })).toBe(false)
    expect(onListLimit).toHaveBeenCalledWith(expect.objectContaining({ name: 'contacts', limit: { action: 'add', min: 1, max: 2, length: 2 } }))
    expect(instance.value.moveListItem('contacts', 1, 0)).toMatchObject({ type: 'move' })
    expect(instance.value.getListValue('contacts').map(item => item.name)).toEqual(['B', 'A'])
    expect(instance.value.replaceListItems('contacts', [{ name: 'Only', email: '' }])).toMatchObject({ type: 'replace' })
    expect(instance.value.removeListItem('contacts', 0)).toBe(false)
    expect(instance.value.getListValue('missing')).toBeNull()
    wrapper.unmount()
  })

  it('honors global readonly and per-item action resolvers', async () => {
    const model = reactive({ contacts: [{ name: 'Owner', email: '' }, { name: 'Editor', email: '' }] })
    const schema = listSchema({
      reorderable: false,
      addable: false,
      removable: (_model, context) => context.index > 0,
    })
    const wrapper = mount(UiSchemaForm, { props: { model, schema } })
    expect(wrapper.find('.ui-schema-form-list-footer').exists()).toBe(false)
    expect(wrapper.findAll('.ui-schema-form-list-item-actions button')).toHaveLength(2)
    expect(wrapper.findAll('.ui-schema-form-list-item-actions button')[0].attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('.ui-schema-form-list-item-actions button')[1].attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ readonly: true })
    expect(wrapper.findAll('input').every(input => input.attributes('readonly') !== undefined)).toBe(true)
    expect(wrapper.findAll('.ui-schema-form-list-item-actions button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    wrapper.unmount()
  })

  it('supports reusable list-child, item and empty scoped slots', async () => {
    const childModel = reactive({ contacts: [{ name: 'Slot', email: 'slot@example.com' }] })
    const child = mount(UiSchemaForm, {
      props: { model: childModel, schema: listSchema() },
      slots: { 'field-contacts-email': ({ index, value, update }) => h('button', { type: 'button', class: 'child-slot', onClick: () => update(`${index}:${value}`) }, value) },
    })
    await child.get('.child-slot').trigger('click')
    expect(childModel.contacts[0].email).toBe('0:slot@example.com')
    child.unmount()

    const emptyModel = reactive({ contacts: [] })
    const empty = mount(UiSchemaForm, {
      props: { model: emptyModel, schema: listSchema({ min: 0 }) },
      slots: { 'list-contacts-empty': ({ add }) => h('button', { type: 'button', class: 'empty-slot', onClick: () => add({ name: 'From slot', email: '' }) }, 'Create') },
    })
    await empty.get('.empty-slot').trigger('click')
    expect(emptyModel.contacts[0].name).toBe('From slot')
    empty.unmount()
  })

  it('contains and deduplicates default-item resolver failures', async () => {
    const model = reactive({ contacts: [] }); const onSchemaError = vi.fn()
    const wrapper = mount(UiSchemaForm, { props: { model, schema: listSchema({ min: 0, defaultValue: () => { throw new Error('factory failed') } }), onSchemaError } })
    await wrapper.get('.ui-schema-form-list-empty button').trigger('click')
    await nextTick(); await flushPromises()
    expect(model.contacts).toEqual([{}])
    expect(onSchemaError).toHaveBeenCalledWith(expect.objectContaining({ kind: 'default-value', name: 'contacts' }))
    await wrapper.get('.ui-schema-form-list-footer button').trigger('click')
    await nextTick(); await flushPromises()
    expect(onSchemaError).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('renders deterministic repeatable field groups during SSR', async () => {
    const component = defineComponent({ setup: () => () => h(UiSchemaForm, {
      model: { contacts: [{ name: 'Ada', email: 'ada@example.com' }] },
      schema: listSchema(),
    }) })
    const first = await renderToString(h(component)); const second = await renderToString(h(component))
    expect(first).toBe(second)
    expect(first).toContain('ui-schema-form-list-item')
    expect(first).toContain('value="Ada"')
    expect(first).toContain('ada@example.com')
  })
})

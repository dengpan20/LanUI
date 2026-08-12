// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiButton from '../src/components/UiButton.vue'
import UiForm from '../src/components/UiForm.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiFormList from '../src/components/UiFormList.vue'
import UiInput from '../src/components/UiInput.vue'

afterEach(() => { document.body.innerHTML = '' })

function standaloneList(options = {}) {
  const items = ref([{ id: 'a' }, { id: 'b' }])
  const list = ref()
  const wrapper = mount(defineComponent({
    setup: () => () => h(UiFormList, {
      ref: list,
      modelValue: items.value,
      'onUpdate:modelValue': value => { items.value = value },
      ...options,
    }, { default: ({ fields }) => fields.map(field => h('span', { 'data-key': field.key }, String(field.value?.id ?? field.value))) }),
  }))
  return { wrapper, items, list }
}

describe('P29 dynamic form list and dependencies', () => {
  it('adds, removes and moves rows while preserving stable keys', async () => {
    const { wrapper, items, list } = standaloneList({ defaultValue: () => ({ id: 'new' }) })
    const originalKeys = wrapper.findAll('[data-key]').map(node => node.attributes('data-key'))
    list.value.add()
    await nextTick()
    expect(items.value.map(item => item.id)).toEqual(['a', 'b', 'new'])
    const addedKeys = wrapper.findAll('[data-key]').map(node => node.attributes('data-key'))
    expect(addedKeys.slice(0, 2)).toEqual(originalKeys)
    list.value.move(2, 0)
    await nextTick()
    expect(items.value.map(item => item.id)).toEqual(['new', 'a', 'b'])
    expect(wrapper.findAll('[data-key]').map(node => node.attributes('data-key'))).toEqual([addedKeys[2], originalKeys[0], originalKeys[1]])
    list.value.remove(1)
    await nextTick()
    expect(items.value.map(item => item.id)).toEqual(['new', 'b'])
    expect(wrapper.findAll('[data-key]').map(node => node.attributes('data-key'))).toEqual([addedKeys[2], originalKeys[1]])
    wrapper.unmount()
  })

  it('enforces min/max limits and emits structured operations', async () => {
    const onLimit = vi.fn(); const onChange = vi.fn()
    const { wrapper, items, list } = standaloneList({ min: 1, max: 2, onLimit, onChange })
    expect(list.value.add({ id: 'blocked' })).toBe(false)
    expect(onLimit).toHaveBeenLastCalledWith({ action: 'add', min: 1, max: 2, length: 2 })
    list.value.remove(0)
    await nextTick(); await flushPromises()
    expect(items.value).toEqual([{ id: 'b' }])
    expect(list.value.remove(0)).toBe(false)
    expect(onLimit).toHaveBeenLastCalledWith({ action: 'remove', min: 1, max: 2, length: 1 })
    expect(onChange.mock.calls[0][0]).toMatchObject({ type: 'remove', indices: [0], removed: [{ id: 'a' }] })
    expect(list.value.replace([])).toBe(false)
    wrapper.unmount()
  })

  it('supports controlled replacement and defensive snapshots', async () => {
    const { wrapper, items, list } = standaloneList({ max: 4 })
    const source = [{ id: 'x' }]
    list.value.replace(source)
    await nextTick()
    source[0].id = 'mutated'
    expect(items.value[0].id).toBe('mutated')
    const snapshot = list.value.getValue()
    snapshot[0].id = 'snapshot-only'
    expect(items.value[0].id).toBe('mutated')
    wrapper.unmount()
  })

  it('reindexes registered nested fields and restores the initial array', async () => {
    const model = reactive({ contacts: [{ email: '' }, { email: 'owner@example.com' }] })
    const form = ref(); const list = ref()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiForm, { ref: form, model }, { default: () => [
      h(UiFormItem, { name: 'contacts', label: 'Contacts', rules: [{ type: 'array', min: 1 }] }, { default: () => h(UiFormList, { ref: list, name: 'contacts', min: 1 }, {
        default: ({ fields }) => fields.map(field => h(UiFormItem, { key: field.key, name: [...field.name, 'email'], label: `Email ${field.index + 1}`, rules: [{ required: true }, { type: 'email' }] }, { default: () => h(UiInput, {
          modelValue: model.contacts[field.index].email,
          'onUpdate:modelValue': value => { model.contacts[field.index].email = value },
        }) })),
      }) }),
      h(UiButton, { type: 'submit' }, { default: () => 'Submit' }),
    ] }) }))
    expect(await form.value.validate()).toBe(false)
    expect(form.value.getFieldState('contacts.0.email')).toMatchObject({ status: 'error' })
    list.value.remove(0)
    await nextTick(); await flushPromises()
    expect(model.contacts).toEqual([{ email: 'owner@example.com' }])
    expect(form.value.getFieldState('contacts.0.email')).toMatchObject({ label: 'Email 1' })
    expect(form.value.getFieldState('contacts.1.email')).toBeNull()
    expect(await form.value.validate()).toBe(true)
    form.value.reset()
    await nextTick()
    expect(model.contacts).toEqual([{ email: '' }, { email: 'owner@example.com' }])
    expect(form.value.getFieldState('contacts.1.email')).not.toBeNull()
    wrapper.unmount()
  })

  it('revalidates touched dependent fields with field getters in validator context', async () => {
    const model = reactive({ password: 'secret', confirm: 'secret' })
    const form = ref(); const validator = vi.fn((value, _model, context) => value === context.getFieldValue('password') || 'Passwords differ')
    const wrapper = mount(defineComponent({ setup: () => () => h(UiForm, { ref: form, model }, { default: () => [
      h(UiFormItem, { name: 'password', label: 'Password' }, { default: () => h(UiInput, { modelValue: model.password, 'onUpdate:modelValue': value => { model.password = value } }) }),
      h(UiFormItem, { name: 'confirm', label: 'Confirm', dependencies: ['password'], rules: [{ validator }] }, { default: () => h(UiInput, { modelValue: model.confirm, 'onUpdate:modelValue': value => { model.confirm = value } }) }),
    ] }) }))
    expect(await form.value.validateField('confirm')).toBe(true)
    form.value.setFieldValue('password', 'changed')
    await nextTick(); await flushPromises()
    expect(form.value.getFieldError('confirm')).toEqual(['Passwords differ'])
    expect(validator.mock.calls.at(-1)[2]).toMatchObject({ trigger: 'dependency', name: 'confirm' })
    wrapper.unmount()
  })

  it('supports conditional rules and dependency validation opt-out', async () => {
    const model = reactive({ requiresCode: false, code: '' })
    const form = ref()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiForm, { ref: form, model }, { default: () => h(UiFormItem, {
      name: 'code', label: 'Code', dependencies: ['requiresCode'], validateOnDependencyChange: false,
      rules: [{ required: true, when: current => current.requiresCode }],
    }, { default: () => h(UiInput, { modelValue: model.code, 'onUpdate:modelValue': value => { model.code = value } }) }) }) }))
    expect(await form.value.validate()).toBe(true)
    model.requiresCode = true
    await nextTick(); await flushPromises()
    expect(form.value.getFieldError('code')).toEqual([])
    expect(await form.value.validate()).toBe(false)
    wrapper.unmount()
  })

  it('renders deterministic SSR output for list fields', async () => {
    const component = defineComponent({ setup: () => () => h(UiFormList, { modelValue: [{ id: 'a' }, { id: 'b' }], ariaLabel: 'Contacts' }, {
      default: ({ fields }) => fields.map(field => h('span', { key: field.key }, `${field.index}:${field.value.id}`)),
    }) })
    const render = () => renderToString(h(component))
    const first = await render(); const second = await render()
    expect(first).toBe(second)
    expect(first).toContain('role="group"')
    expect(first).toContain('0:a')
  })
})

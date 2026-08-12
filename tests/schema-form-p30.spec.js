// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiButton from '../src/components/UiButton.vue'
import UiSchemaForm from '../src/components/UiSchemaForm.vue'

afterEach(() => { document.body.innerHTML = '' })

describe('P30 schema-driven forms', () => {
  it('renders flat schema fields and updates nested model paths with typed payloads', async () => {
    const model = reactive({ profile: { name: 'Lan' }, note: '' })
    const onFieldChange = vi.fn()
    const wrapper = mount(UiSchemaForm, {
      props: {
        model,
        schema: [
          { name: 'profile.name', label: 'Name', props: { clearable: true } },
          { name: 'note', label: 'Note', type: 'textarea', normalize: value => value.trimStart() },
        ],
        onFieldChange,
      },
    })
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Lan UI')
    await wrapper.find('textarea').setValue('  documented')
    expect(model).toMatchObject({ profile: { name: 'Lan UI' }, note: 'documented' })
    expect(onFieldChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'note', value: 'documented', previous: '' }))
    wrapper.unmount()
  })

  it('supports sections, responsive columns, spans and section headers', () => {
    const model = reactive({ name: '', region: '', summary: '' })
    const wrapper = mount(UiSchemaForm, { props: { model, columns: 3, gap: 12, schema: [{
      key: 'account', title: 'Account details', description: 'Core identity', columns: 3,
      fields: [{ name: 'name', label: 'Name' }, { name: 'region', label: 'Region', type: 'select', options: ['East', 'West'] }, { name: 'summary', label: 'Summary', fullWidth: true }],
    }] } })
    expect(wrapper.get('.ui-schema-form-section').attributes('aria-labelledby')).toMatch(/^ui-schema-section-0-account$/)
    expect(wrapper.get('.ui-schema-form-section h3').text()).toBe('Account details')
    expect(wrapper.get('.ui-schema-form-grid').attributes('style')).toContain('--ui-schema-columns: 3')
    expect(wrapper.findAll('.ui-schema-form-field')[2].attributes('style')).toContain('span 3')
    wrapper.unmount()
  })

  it('mounts and unregisters conditionally visible fields before validation', async () => {
    const model = reactive({ business: false, taxId: '' })
    const instance = ref()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiSchemaForm, {
      ref: instance,
      model,
      schema: [{ name: 'taxId', label: 'Tax ID', visible: current => current.business, required: true, rules: [{ required: true }] }],
    }) }))
    expect(instance.value.getVisibleFields()).toHaveLength(0)
    expect(instance.value.getFieldDefinition('taxId')?.label).toBe('Tax ID')
    expect(await instance.value.validate()).toBe(true)
    model.business = true
    await nextTick()
    expect(instance.value.getVisibleFields()).toHaveLength(1)
    expect(await instance.value.validate()).toBe(false)
    model.business = false
    await nextTick(); await flushPromises()
    expect(instance.value.getFieldState('taxId')).toBeNull()
    expect(await instance.value.validate()).toBe(true)
    wrapper.unmount()
  })

  it('resolves dynamic props, options, disabled and readonly state from the model', async () => {
    const model = reactive({ locked: false, plan: 'basic', title: 'Draft' })
    const schema = [
      { name: 'plan', label: 'Plan', type: 'select', options: current => current.locked ? ['basic'] : ['basic', 'pro'], disabled: current => current.locked },
      { name: 'title', label: 'Title', readonly: current => current.locked, props: current => ({ placeholder: current.plan, disabled: current.plan === 'pro' }) },
    ]
    const wrapper = mount(UiSchemaForm, { props: { model, schema } })
    expect(wrapper.get('.ui-select-trigger').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('input').attributes('placeholder')).toBe('basic')
    model.plan = 'pro'
    await nextTick()
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    model.plan = 'basic'
    model.locked = true
    await nextTick()
    expect(wrapper.get('.ui-select-trigger').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    model.locked = false
    await wrapper.setProps({ readonly: true })
    expect(wrapper.get('.ui-select-trigger').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    wrapper.unmount()
  })

  it('supports custom component registries and per-field scoped slots', async () => {
    const CustomControl = defineComponent({
      props: { modelValue: String }, emits: ['update:modelValue'],
      setup: (props, { emit }) => () => h('button', { type: 'button', class: 'custom-control', onClick: () => emit('update:modelValue', `${props.modelValue}!`) }, props.modelValue),
    })
    const model = reactive({ code: 'A', special: 'slot' })
    const wrapper = mount(UiSchemaForm, {
      props: { model, components: { custom: CustomControl }, schema: [{ name: 'code', type: 'custom' }, { key: 'special', name: 'special' }] },
      slots: { 'field-special': ({ value, update }) => h('button', { type: 'button', class: 'slot-control', onClick: () => update(value.toUpperCase()) }, value) },
    })
    await wrapper.get('.custom-control').trigger('click')
    await wrapper.get('.slot-control').trigger('click')
    expect(model).toMatchObject({ code: 'A!', special: 'SLOT' })
    wrapper.unmount()
  })

  it('contains consumer resolver errors and reports unknown components once', async () => {
    const onSchemaError = vi.fn()
    const model = reactive({ value: '' })
    const wrapper = mount(UiSchemaForm, { props: {
      model,
      schema: [{ name: 'value', type: 'missing', props: () => { throw new Error('props failed') } }],
      onSchemaError,
    } })
    await nextTick(); await flushPromises()
    expect(wrapper.findComponent({ name: 'UiInput' }).exists() || wrapper.find('input').exists()).toBe(true)
    expect(onSchemaError.mock.calls.map(call => call[0].kind).sort()).toEqual(['component', 'props'])
    await wrapper.vm.$forceUpdate(); await nextTick()
    expect(onSchemaError).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('forwards managed-form APIs, events and action slot state', async () => {
    const model = reactive({ email: '' })
    const instance = ref(); const onInvalid = vi.fn(); const onSubmit = vi.fn()
    const wrapper = mount(defineComponent({ setup: () => () => h(UiSchemaForm, {
      ref: instance, model, showErrorSummary: true,
      schema: [{ name: 'email', label: 'Email', required: true, rules: [{ required: true }, { type: 'email' }] }],
      onInvalid, onSubmit,
    }, { actions: ({ errors }) => h(UiButton, { type: 'submit' }, { default: () => `Save ${errors.length}` }) }) }))
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(onInvalid).toHaveBeenCalledWith(expect.objectContaining({ email: '' }), expect.anything(), expect.any(Array))
    instance.value.setFieldValue('email', 'owner@example.com')
    expect(instance.value.getFieldDefinition('email')?.label).toBe('Email')
    await instance.value.submit()
    expect(onSubmit).toHaveBeenCalledWith({ email: 'owner@example.com' }, undefined)
    wrapper.unmount()
  })

  it('renders deterministic schema sections and controls during SSR', async () => {
    const component = defineComponent({ setup: () => () => h(UiSchemaForm, {
      model: { name: 'Lan UI', region: 'East' },
      schema: [{ key: 'identity', title: 'Identity', fields: [{ name: 'name', label: 'Name' }, { name: 'region', label: 'Region', type: 'select', options: ['East', 'West'] }] }],
    }) })
    const first = await renderToString(h(component)); const second = await renderToString(h(component))
    expect(first).toBe(second)
    expect(first).toContain('Identity')
    expect(first).toContain('Lan UI')
    expect(first).toContain('role="combobox"')
  })
})

// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiButton from '../src/components/UiButton.vue'
import UiForm from '../src/components/UiForm.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiInput from '../src/components/UiInput.vue'

afterEach(() => { document.body.innerHTML = '' })

function nestedForm(options = {}) {
  const { itemRules = [{ required: true }, { type: 'email' }], ...formOptions } = options
  const model = reactive({ user: { profile: { email: '' } }, role: 'viewer' })
  const wrapper = mount(defineComponent({
    setup() {
      const form = ref()
      return () => h(UiForm, { ref: form, model, ...formOptions }, { default: () => [
        h(UiFormItem, { name: 'user.profile.email', label: 'Email', rules: itemRules }, { default: () => h(UiInput, {
          modelValue: model.user.profile.email,
          'onUpdate:modelValue': value => { model.user.profile.email = value },
        }) }),
        h(UiButton, { type: 'submit' }, { default: () => 'Submit' }),
      ] })
    },
  }), { attachTo: document.body })
  return { wrapper, model, form: wrapper.getComponent(UiForm) }
}

describe('P28 managed form orchestration', () => {
  it('validates nested field paths and resets selected fields to their initial values', async () => {
    const { wrapper, model, form } = nestedForm()
    expect(await form.vm.validate()).toBe(false)
    expect(form.vm.getFieldError('user.profile.email')[0]).toContain('Email')
    await wrapper.get('input').setValue('owner@example.com')
    expect(await form.vm.validateField('user.profile.email')).toBe(true)
    expect(form.vm.getFieldValue('user.profile.email')).toBe('owner@example.com')
    form.vm.setFieldValue('role', 'admin')
    form.vm.resetFields('user.profile.email')
    expect(model.user.profile.email).toBe('')
    expect(model.role).toBe('admin')
    wrapper.unmount()
  })

  it('keeps only the newest async validation result and aborts the stale request', async () => {
    const pending = []
    const validator = vi.fn((value, _model, context) => new Promise(resolve => {
      pending.push({ value, signal: context.signal, resolve })
    }))
    const { wrapper, model, form } = nestedForm({ itemRules: [{ validator }] })
    model.user.profile.email = 'first@example.com'
    const first = form.vm.validateField('user.profile.email')
    model.user.profile.email = 'latest@example.com'
    const latest = form.vm.validateField('user.profile.email')
    expect(pending[0].signal.aborted).toBe(true)
    pending[1].resolve(true)
    await expect(latest).resolves.toBe(true)
    pending[0].resolve('Stale failure')
    await expect(first).resolves.toBe(true)
    expect(form.vm.getFieldError('user.profile.email')).toEqual([])
    wrapper.unmount()
  })

  it('accepts server errors and exposes field state/value APIs', async () => {
    const { wrapper, form } = nestedForm()
    form.vm.setFields([{ name: 'user.profile.email', value: 'taken@example.com', errors: ['Email is already registered'], touched: true }])
    await nextTick()
    expect(form.vm.getFieldsValue(['user.profile.email'])).toEqual({ user: { profile: { email: 'taken@example.com' } } })
    expect(form.vm.getFieldState('user.profile.email')).toMatchObject({ status: 'error', touched: true, dirty: true })
    expect(wrapper.get('[role="alert"]').text()).toContain('already registered')
    form.vm.clearValidate('user.profile.email')
    expect(form.vm.getFieldsError()).toEqual([])
    wrapper.unmount()
  })

  it('renders an actionable localized error summary after submit', async () => {
    const invalid = vi.fn()
    const { wrapper } = nestedForm({ showErrorSummary: true, onInvalid: invalid })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    const summary = wrapper.get('.ui-form-error-summary')
    expect(summary.text()).toContain('Email')
    expect(invalid).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object) }), expect.anything(), expect.any(Array))
    await summary.get('button').trigger('click')
    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })

  it('supports type, length, enum and whitespace rules', async () => {
    const model = reactive({ code: '   ', tier: 'unknown', count: '3' })
    const rules = {
      code: [{ whitespace: true }, { len: 4 }],
      tier: { enum: ['basic', 'pro'] },
      count: { type: 'number' },
    }
    const wrapper = mount(UiForm, { props: { model, rules }, slots: { default: () => Object.keys(model).map(name => h(UiFormItem, { name, label: name })) } })
    expect(await wrapper.vm.validate()).toBe(false)
    expect(wrapper.vm.getFieldsError().map(state => state.name)).toEqual(['code', 'tier', 'count'])
    wrapper.unmount()
  })

  it('honors initialValues and native reset without replacing the reactive model', async () => {
    const model = reactive({ account: { name: 'Current' }, transient: true })
    const initialValues = { account: { name: 'Initial' } }
    const wrapper = mount(UiForm, { props: { model, initialValues }, slots: { default: () => h(UiFormItem, { name: 'account.name' }) } })
    const identity = model
    await wrapper.trigger('reset')
    expect(model).toBe(identity)
    expect(model).toEqual({ account: { name: 'Initial' } })
    wrapper.unmount()
  })

  it('renders nested validation fields and summaries deterministically on the server', async () => {
    const model = { account: { email: '' } }
    const html = await renderToString(h(UiForm, { model, showErrorSummary: true }, { default: () => h(UiFormItem, { name: 'account.email', label: 'Email', required: true }, { default: () => h(UiInput, { modelValue: '' }) }) }))
    expect(html).toContain('class="ui-form"')
    expect(html).toContain('Email')
    expect(html).not.toContain('ui-form-error-summary')
  })
})

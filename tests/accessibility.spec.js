// @vitest-environment happy-dom
import fs from 'node:fs'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiCascader from '../src/components/UiCascader.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiInput from '../src/components/UiInput.vue'
import UiNumberInput from '../src/components/UiNumberInput.vue'
import UiMultiSelect from '../src/components/UiMultiSelect.vue'
import UiSelect from '../src/components/UiSelect.vue'
import UiSwitch from '../src/components/UiSwitch.vue'
import UiTreeSelect from '../src/components/UiTreeSelect.vue'

const options = [
  { label: '华东区域', value: 'east' },
  { label: '华南区域', value: 'south' },
  { label: '禁用区域', value: 'disabled', disabled: true },
]

describe('form semantics', () => {
  it('connects the visible label and help text to the input', () => {
    const wrapper = mount(UiFormItem, {
      props: { label: '客户名称', help: '至少输入两个字符' },
      slots: { default: () => h(UiInput, { modelValue: '' }) },
    })
    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('.field-help').attributes('id'))
  })

  it('gives switches a stable accessible name', () => {
    const fallback = mount(UiSwitch, { props: { modelValue: false } })
    const explicit = mount(UiSwitch, { props: { modelValue: true, ariaLabel: '通知开关' } })
    expect(fallback.get('[role="switch"]').attributes('aria-label')).toBe('开关')
    expect(explicit.get('[role="switch"]').attributes('aria-label')).toBe('通知开关')
  })

  it('lets an explicit accessible name override a shared form-item label', () => {
    const textWrapper = mount(UiFormItem, { props: { label: 'Shared label' }, slots: { default: () => h(UiInput, { modelValue: 'read only', 'aria-label': 'Readonly text input' }) } })
    const numberWrapper = mount(UiFormItem, { props: { label: 'Shared label' }, slots: { default: () => h(UiNumberInput, { modelValue: 120, 'aria-label': 'Invalid numeric input' }) } })
    const input = textWrapper.get('[aria-label="Readonly text input"]')
    const spinbutton = numberWrapper.get('[aria-label="Invalid numeric input"]')
    expect(input.attributes('aria-labelledby')).toBeUndefined()
    expect(spinbutton.attributes('aria-labelledby')).toBeUndefined()
  })
})

describe('combobox keyboard interaction', () => {
  it('navigates and selects a single option', async () => {
    const wrapper = mount(UiSelect, { props: { options, modelValue: '' }, attrs: { class: 'consumer-width', 'aria-label': '区域' } })
    const trigger = wrapper.get('[role="combobox"]')
    expect(wrapper.get('.ui-select').classes()).toContain('consumer-width')
    expect(trigger.classes()).not.toContain('consumer-width')
    expect(trigger.attributes('aria-label')).toBe('区域')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const first = trigger.attributes('aria-activedescendant')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).not.toBe(first)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['south'])
  })

  it('supports active-descendant navigation in multi select', async () => {
    const wrapper = mount(UiMultiSelect, { props: { options, modelValue: [] } })
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    const first = trigger.attributes('aria-activedescendant')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).not.toBe(first)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['south']])
  })

  it('expands a tree and selects a child with the keyboard', async () => {
    const tree = [{ label: '浙江省', value: 'zj', children: [{ label: '杭州市', value: 'hz' }] }]
    const wrapper = mount(UiTreeSelect, { props: { options: tree } })
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['hz'])
  })

  it('moves across cascader columns and selects a leaf', async () => {
    const tree = [{ label: '浙江省', value: 'zj', children: [{ label: '杭州市', value: 'hz' }] }]
    const wrapper = mount(UiCascader, { props: { options: tree, modelValue: [] } })
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(trigger.attributes('aria-activedescendant')).toContain('-1-0')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['zj', 'hz']])
  })
})

describe('visual accessibility contracts', () => {
  it('keeps normal helper text readable and pointer targets large enough', () => {
    const tokens = fs.readFileSync('tokens.css', 'utf8')
    const styles = fs.readFileSync('styles.css', 'utf8')
    expect(tokens).toContain('--text-tertiary: #64748b')
    expect(tokens).toContain('--control-icon-sm: 28px')
    expect(styles).not.toMatch(/font-size:\s*(?:8|9|10|11)px/)
    expect(styles).toContain('.ui-input-action { width: var(--control-icon-sm); height: var(--control-icon-sm);')
    expect(styles).toContain('.ui-date-action { position: absolute; z-index: 1; inset-inline-end: 5px; width: var(--control-icon-sm); height: var(--control-icon-sm);')
    expect(styles).toContain('.ui-multi-tag>button{width:24px;height:24px;')
    expect(styles).toContain('.ui-table-filter{width:28px;height:28px;')
  })
})

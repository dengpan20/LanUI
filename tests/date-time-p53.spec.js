// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDateTimePicker from '../src/components/UiDateTimePicker.vue'
import UiDateTimeRangePicker from '../src/components/UiDateTimeRangePicker.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import { enUS } from '../src/config.js'

function controlled(component, modelValue, extra = {}) {
  let wrapper
  wrapper = mount(component, {
    props: {
      modelValue,
      'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
      ...extra,
    },
  })
  return wrapper
}

describe('P53 date-time public adapters', () => {
  it('renders a dedicated single datetime-local control', () => {
    const wrapper = mount(UiDateTimePicker, { props: { modelValue: '2026-08-20T10:30' }, attrs: { 'aria-label': 'Publish at' } })
    expect(wrapper.classes()).toContain('ui-date-time-picker')
    expect(wrapper.classes()).toContain('ui-date-picker')
    expect(wrapper.get('input').attributes('type')).toBe('datetime-local')
    expect(wrapper.get('input').attributes('aria-label')).toBe('Publish at')
    expect(wrapper.get('input').element.value).toBe('2026-08-20T10:30')
  })

  it('updates controlled string values without exposing a mode prop', async () => {
    const change = vi.fn()
    const wrapper = controlled(UiDateTimePicker, '2026-08-20T10:30', { onChange: change })
    await wrapper.get('input').setValue('2026-08-21T16:45'); await nextTick()
    expect(wrapper.props('modelValue')).toBe('2026-08-21T16:45')
    expect(change).toHaveBeenLastCalledWith('2026-08-21T16:45')
    expect(wrapper.props()).not.toHaveProperty('mode')
  })

  it('round-trips Date instants with explicit UTC precision', async () => {
    const wrapper = controlled(UiDateTimePicker, new Date('2026-08-20T10:30:15.000Z'), {
      valueType: 'date', timeZone: 'UTC', precision: 'second', step: 1,
    })
    expect(wrapper.get('input').element.value).toBe('2026-08-20T10:30:15')
    await wrapper.get('input').setValue('2026-08-21T16:45:30'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual(new Date('2026-08-21T16:45:30.000Z'))
    expect(wrapper.attributes('data-time-zone')).toBe('UTC')
    expect(wrapper.attributes('data-value-type')).toBe('date')
  })

  it('forwards constraints, focus, blur and clear contracts', async () => {
    const focus = vi.fn(), blur = vi.fn(), clear = vi.fn()
    const wrapper = controlled(UiDateTimePicker, '2026-08-20T10:30', {
      min: '2026-08-20T08:00', max: '2026-08-20T22:00', step: 60,
      onFocus: focus, onBlur: blur, onClear: clear,
    })
    const input = wrapper.get('input')
    expect(input.attributes()).toMatchObject({ min: '2026-08-20T08:00', max: '2026-08-20T22:00', step: '60' })
    await input.trigger('focus'); await input.trigger('blur')
    expect(focus).toHaveBeenCalledOnce(); expect(blur).toHaveBeenCalledOnce()
    await wrapper.get('.ui-date-action').trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toBe('')
    expect(clear).toHaveBeenCalledOnce()
  })

  it('inherits FormItem linkage and localized datetime placeholder text', () => {
    const wrapper = mount(UiConfigProvider, {
      props: { locale: enUS },
      slots: { default: () => h(UiFormItem, { label: 'Publish at', help: 'UTC release instant', error: 'Required' }, () => h(UiDateTimePicker)) },
    })
    const item = wrapper.get('.ui-form-item'), input = wrapper.get('input')
    expect(input.attributes('aria-labelledby')).toBe(item.get('.field-label').attributes('id'))
    expect(input.attributes('aria-describedby')).toBeTruthy()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('placeholder')).toBe('Select date and time')
  })

  it('renders a named dedicated datetime range', () => {
    const wrapper = mount(UiDateTimeRangePicker, { props: { modelValue: ['2026-08-20T09:00', '2026-08-20T17:30'] }, attrs: { 'aria-label': 'Release window' } })
    const root = wrapper.get('.ui-date-time-range-picker')
    expect(root.classes()).toContain('ui-date-range-picker')
    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('aria-label')).toBe('Release window')
    expect(root.findAll('input').map(input => input.attributes('type'))).toEqual(['datetime-local', 'datetime-local'])
  })

  it('updates range endpoints and opposite native constraints atomically', async () => {
    const change = vi.fn()
    const wrapper = controlled(UiDateTimeRangePicker, ['2026-08-20T09:00', '2026-08-20T17:30'], {
      min: '2026-08-20T08:00', max: '2026-08-20T22:00', step: 60, onChange: change,
    })
    let inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('max')).toBe('2026-08-20T17:30')
    expect(inputs[1].attributes('min')).toBe('2026-08-20T09:00')
    await inputs[0].setValue('2026-08-20T10:15'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual(['2026-08-20T10:15', '2026-08-20T17:30'])
    expect(change).toHaveBeenLastCalledWith({ value: ['2026-08-20T10:15', '2026-08-20T17:30'], valid: true })
    inputs = wrapper.findAll('input')
    expect(inputs[1].attributes('min')).toBe('2026-08-20T10:15')
  })

  it('reports an inverted unconstrained datetime range', async () => {
    const invalid = vi.fn()
    const wrapper = controlled(UiDateTimeRangePicker, ['2026-08-20T09:00', '2026-08-20T17:30'], { constrain: false, onInvalid: invalid })
    await wrapper.findAll('input')[1].setValue('2026-08-19T17:30'); await nextTick()
    expect(wrapper.get('.ui-date-time-range-picker').attributes('aria-invalid')).toBe('true')
    expect(invalid).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'range-order' }))
  })

  it('round-trips Date range endpoints and clears their representation', async () => {
    const wrapper = controlled(UiDateTimeRangePicker, [new Date('2026-08-20T09:00:00.000Z'), new Date('2026-08-20T17:00:00.000Z')], {
      valueType: 'date', timeZone: 'UTC', precision: 'second', step: 1,
    })
    expect(wrapper.findAll('input').map(input => input.element.value)).toEqual(['2026-08-20T09:00', '2026-08-20T17:00'])
    await wrapper.findAll('input')[1].setValue('2026-08-20T18:15:30'); await nextTick()
    expect(wrapper.props('modelValue')[1]).toEqual(new Date('2026-08-20T18:15:30.000Z'))
    await wrapper.get('.ui-date-action').trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual([null, null])
  })

  it('forwards range focus metadata and disabled state', async () => {
    const focus = vi.fn()
    const wrapper = mount(UiDateTimeRangePicker, { props: { modelValue: [], onFocus: focus } })
    await wrapper.findAll('input')[1].trigger('focus')
    expect(focus).toHaveBeenCalledWith(expect.objectContaining({ index: 1, event: expect.any(Event) }))
    await wrapper.setProps({ disabled: true })
    expect(wrapper.findAll('input').every(input => input.attributes('disabled') !== undefined)).toBe(true)
  })

  it('renders deterministic single and range datetime semantics during SSR', async () => {
    const app = createSSRApp({ render: () => h('div', [
      h(UiDateTimePicker, { modelValue: '2026-08-20T10:30', 'aria-label': 'Publish at' }),
      h(UiDateTimeRangePicker, { modelValue: ['2026-08-20T09:00', '2026-08-20T17:30'], 'aria-label': 'Release window' }),
    ]) })
    const html = await renderToString(app)
    expect(html).toContain('ui-date-time-picker')
    expect(html).toContain('ui-date-time-range-picker')
    expect(html.match(/type="datetime-local"/g)).toHaveLength(3)
    expect(html).toContain('aria-label="Release window"')
  })
})

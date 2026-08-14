// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiSchemaForm from '../src/components/UiSchemaForm.vue'
import UiTimeRangePicker from '../src/components/UiTimeRangePicker.vue'

function controlled(extra = {}) {
  let wrapper
  wrapper = mount(UiTimeRangePicker, {
    props: {
      modelValue: ['09:00', '17:30'],
      'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
      ...extra,
    },
  })
  return wrapper
}

describe('P52 UiTimeRangePicker', () => {
  it('renders a named time-only range with discoverable public styling', () => {
    const wrapper = mount(UiTimeRangePicker, { props: { modelValue: ['09:00', '17:30'] }, attrs: { 'aria-label': 'Service window' } })
    const root = wrapper.get('.ui-time-range-picker')
    expect(root.classes()).toContain('ui-date-range-picker')
    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('aria-label')).toBe('Service window')
    expect(root.findAll('input').map(input => input.attributes('type'))).toEqual(['time', 'time'])
    expect(root.findAll('input').map(input => input.element.value)).toEqual(['09:00', '17:30'])
  })

  it('updates controlled string endpoints and opposite constraints atomically', async () => {
    const change = vi.fn()
    const wrapper = controlled({ min: '08:00', max: '22:00', step: 900, onChange: change })
    let inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('min')).toBe('08:00')
    expect(inputs[0].attributes('max')).toBe('17:30')
    expect(inputs[1].attributes('min')).toBe('09:00')
    expect(inputs[1].attributes('max')).toBe('22:00')
    expect(inputs[0].attributes('step')).toBe('900')
    await inputs[0].setValue('10:00'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual(['10:00', '17:30'])
    expect(change).toHaveBeenLastCalledWith({ value: ['10:00', '17:30'], valid: true })
    inputs = wrapper.findAll('input')
    expect(inputs[1].attributes('min')).toBe('10:00')
  })

  it('reports inverted unconstrained ranges without discarding the update', async () => {
    const invalid = vi.fn()
    const wrapper = controlled({ constrain: false, onInvalid: invalid })
    await wrapper.findAll('input')[1].setValue('08:30'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual(['09:00', '08:30'])
    expect(wrapper.get('.ui-time-range-picker').classes()).toContain('invalid')
    expect(wrapper.get('[role="alert"]').text()).toBeTruthy()
    expect(invalid).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'range-order', value: ['09:00', '08:30'] }))
  })

  it('clears both endpoints using the active model representation', async () => {
    const clear = vi.fn()
    const wrapper = controlled({ onClear: clear })
    await wrapper.get('.ui-date-action').trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toEqual([])
    expect(clear).toHaveBeenCalledOnce()

    const dates = controlled({
      modelValue: [new Date('2026-08-12T09:00:00.000Z'), new Date('2026-08-12T17:00:00.000Z')],
      valueType: 'date', timeZone: 'UTC', referenceDate: '2026-08-12',
    })
    await dates.get('.ui-date-action').trigger('click'); await nextTick()
    expect(dates.props('modelValue')).toEqual([null, null])
  })

  it('round-trips Date values through the strict time-zone adapter', async () => {
    const wrapper = controlled({
      modelValue: [new Date('2026-08-12T09:00:00.000Z'), new Date('2026-08-12T17:00:00.000Z')],
      valueType: 'date', timeZone: 'UTC', referenceDate: '2026-08-12', precision: 'second', step: 1,
    })
    expect(wrapper.findAll('input').map(input => input.element.value)).toEqual(['09:00', '17:00'])
    await wrapper.findAll('input')[1].setValue('18:15:30'); await nextTick()
    expect(wrapper.props('modelValue')[1]).toEqual(new Date('2026-08-12T18:15:30.000Z'))
    expect(wrapper.attributes('data-time-zone')).toBe('UTC')
    expect(wrapper.attributes('data-value-type')).toBe('date')
  })

  it('forwards endpoint focus and blur metadata', async () => {
    const focus = vi.fn(), blur = vi.fn()
    const wrapper = mount(UiTimeRangePicker, { props: { modelValue: [], onFocus: focus, onBlur: blur } })
    await wrapper.findAll('input')[1].trigger('focus')
    expect(focus).toHaveBeenCalledWith(expect.objectContaining({ index: 1, event: expect.any(Event) }))
    await wrapper.findAll('input')[1].trigger('blur')
    expect(blur).toHaveBeenCalledWith(expect.objectContaining({ index: 1, event: expect.any(Event) }))
  })

  it('inherits FormItem label, description, invalid and disabled semantics', () => {
    const wrapper = mount(UiFormItem, {
      props: { label: 'Service window', help: 'Local office hours', error: 'Select a valid range', composite: true },
      slots: { default: () => h(UiTimeRangePicker, { modelValue: ['18:00', '09:00'], constrain: false, disabled: true }) },
    })
    const root = wrapper.get('.ui-time-range-picker')
    expect(root.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(root.attributes('aria-describedby')).toBeTruthy()
    expect(root.attributes('aria-invalid')).toBe('true')
    expect(root.findAll('input').every(input => input.attributes('disabled') !== undefined)).toBe(true)
  })

  it('adds time-range, datetime and datetime-range Schema Form presets', () => {
    const model = reactive({ window: ['09:00', '18:00'], publishAt: '2026-08-20T10:00', freeze: ['2026-08-20T10:00', '2026-08-20T12:00'] })
    const wrapper = mount(UiSchemaForm, { props: { model, schema: [
      { name: 'window', label: 'Window', type: 'time-range' },
      { name: 'publishAt', label: 'Publish', type: 'datetime' },
      { name: 'freeze', label: 'Freeze', type: 'datetime-range' },
    ] } })
    expect(wrapper.get('.ui-time-range-picker').findAll('input').map(input => input.attributes('type'))).toEqual(['time', 'time'])
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
    expect(wrapper.findAll('.ui-date-range-picker')[1].findAll('input').map(input => input.attributes('type'))).toEqual(['datetime-local', 'datetime-local'])
  })

  it('allows explicit Schema Form props to override datetime presets', () => {
    const model = reactive({ day: '2026-08-20', days: ['2026-08-20', '2026-08-22'] })
    const wrapper = mount(UiSchemaForm, { props: { model, schema: [
      { name: 'day', type: 'datetime', props: { mode: 'date' } },
      { name: 'days', type: 'datetime-range', props: { mode: 'date' } },
    ] } })
    expect(wrapper.findAll('input').map(input => input.attributes('type'))).toEqual(['date', 'date', 'date'])
  })

  it('renders deterministic time-range semantics during SSR', async () => {
    const app = createSSRApp({ render: () => h(UiTimeRangePicker, { modelValue: ['09:00', '17:30'], 'aria-label': 'Service window' }) })
    const html = await renderToString(app)
    expect(html).toContain('ui-time-range-picker')
    expect(html.match(/type="time"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="Service window"')
    expect(html).toContain('09:00')
  })
})

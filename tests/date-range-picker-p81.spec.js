// @vitest-environment happy-dom
import { readFileSync } from 'node:fs'
import { createSSRApp, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import UiDateRangePicker from '../src/components/UiDateRangePicker.vue'
import UiTimeRangePicker from '../src/components/UiTimeRangePicker.vue'
import UiDateTimeRangePicker from '../src/components/UiDateTimeRangePicker.vue'

function controlled(modelValue, extra = {}) {
  let wrapper
  wrapper = mount(UiDateRangePicker, { props: { modelValue, appendToBody: false, 'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }), ...extra } })
  return wrapper
}

describe('UiDateRangePicker P81 production contracts', () => {
  it('supports default-owned and controlled value/open/view state', async () => {
    const uncontrolled = mount(UiDateRangePicker, { props: { defaultValue: ['2026-08-10', '2026-08-12'], defaultOpen: true, defaultViewDate: '2026-08-01', appendToBody: false } })
    await nextTick()
    expect(uncontrolled.get('.ui-date-range-native').element.value).toBe('2026-08-10')
    expect(uncontrolled.find('.ui-calendar').exists()).toBe(true)
    expect(uncontrolled.vm.getState()).toMatchObject({ value: ['2026-08-10', '2026-08-12'], open: true, complete: true })
    const wrapper = controlled(['2026-08-10', '2026-08-12'], { open: false, viewDate: '2026-08-01' })
    await wrapper.vm.show('api')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('.ui-calendar').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    await nextTick()
    expect(wrapper.find('.ui-calendar').exists()).toBe(true)
  })

  it('keeps the date panel open after start selection and closes after complete range', async () => {
    const wrapper = mount(UiDateRangePicker, { props: { defaultOpen: true, defaultViewDate: '2026-08-01', appendToBody: false } })
    await nextTick()
    await wrapper.get('[data-date="2026-08-10"]').trigger('click')
    await flushPromises()
    expect(wrapper.vm.getState()).toMatchObject({ displayValue: ['2026-08-10', ''], open: true, complete: false })
    await wrapper.get('[data-date="2026-08-12"]').trigger('click')
    await flushPromises()
    expect(wrapper.vm.getState()).toMatchObject({ value: ['2026-08-10', '2026-08-12'], open: false, complete: true })
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toMatchObject({ source: 'calendar', complete: true, valid: true })
    expect(wrapper.emitted('close')?.at(-1)?.[0]).toMatchObject({ source: 'selection' })
  })

  it('validates order, min/max and disabled dates before model mutation', async () => {
    const disabledDate = vi.fn((_date, context) => context.date === '2026-08-16')
    const wrapper = mount(UiDateRangePicker, { props: { defaultValue: ['2026-08-10', '2026-08-12'], min: '2026-08-10', max: '2026-08-20', disabledDate, appendToBody: false } })
    await wrapper.vm.select(['2026-08-11', '2026-08-09'], 'api')
    await wrapper.vm.select(['2026-08-09', '2026-08-11'], 'api')
    await wrapper.vm.select(['2026-08-11', '2026-08-16'], 'api')
    expect(wrapper.vm.getState().value).toEqual(['2026-08-10', '2026-08-12'])
    expect(wrapper.emitted('invalid')?.map(args => args[0].code)).toEqual(['range-order', 'date-before-min', 'date-disabled'])
    expect(disabledDate).toHaveBeenCalled()
  })

  it('serializes asynchronous value and open guards with rejection metadata', async () => {
    let resolveChange
    const beforeChange = vi.fn(() => new Promise(resolve => { resolveChange = resolve }))
    const beforeOpenChange = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const wrapper = mount(UiDateRangePicker, { props: { defaultValue: ['2026-08-10', '2026-08-12'], beforeChange, beforeOpenChange, appendToBody: false } })
    const pending = wrapper.vm.select(['2026-08-11', '2026-08-13'], 'api')
    expect(wrapper.vm.pending.change.value).toBe(true)
    expect(wrapper.vm.select(['2026-08-12', '2026-08-14'], 'api')).toBe(false)
    resolveChange(true)
    await pending
    expect(wrapper.vm.getState().value).toEqual(['2026-08-11', '2026-08-13'])
    expect((await wrapper.vm.show('api'))).toBe(false)
    expect((await wrapper.vm.show('api'))).toMatchObject({ open: true, source: 'api' })
    expect(wrapper.emitted('invalid')?.some(args => args[0].code === 'guard-rejected')).toBe(true)
  })

  it('supports computed presets, clear, slots and instance methods', async () => {
    const wrapper = mount(UiDateRangePicker, { props: { defaultOpen: true, presets: [{ key: 'release', label: 'Release', value: () => ['2026-08-20', '2026-08-24'] }], appendToBody: false }, slots: { prefix: () => h('b', { class: 'custom-prefix' }, 'P'), calendar: () => h('i', { class: 'custom-calendar' }, 'Calendar') } })
    await nextTick()
    expect(wrapper.find('.custom-prefix').exists()).toBe(true)
    expect(wrapper.find('.custom-calendar').exists()).toBe(true)
    await wrapper.get('.ui-date-range-presets button').trigger('click')
    await flushPromises()
    expect(wrapper.vm.getState().value).toEqual(['2026-08-20', '2026-08-24'])
    expect(wrapper.vm.getState().open).toBe(false)
    expect(wrapper.vm.setViewDate('2026-09-01')).toBe('2026-09-01')
    await wrapper.vm.clear('api')
    expect(wrapper.vm.getState().value).toEqual([])
  })

  it('preserves native time/datetime semantics and wrapper API parity', async () => {
    const time = mount(UiTimeRangePicker, { props: { defaultValue: ['09:00', '17:30'], appendToBody: false } })
    const datetime = mount(UiDateTimeRangePicker, { props: { defaultValue: ['2026-08-20T09:00', '2026-08-20T17:30'], appendToBody: false } })
    await nextTick()
    expect(time.findAll('input').map(input => input.attributes('type'))).toEqual(['time', 'time'])
    expect(datetime.findAll('input').map(input => input.attributes('type'))).toEqual(['datetime-local', 'datetime-local'])
    expect(time.find('input').attributes('aria-haspopup')).toBeUndefined()
    expect(typeof time.vm.show).toBe('function')
    expect(typeof datetime.vm.getState).toBe('function')
  })

  it('keeps wrapper generated events and slots exactly aligned with the date range contract', () => {
    const manifest = JSON.parse(readFileSync('api-manifest.json', 'utf8'))
    const expectedEmits = ['blur', 'change', 'clear', 'close', 'focus', 'guard-error', 'input', 'invalid', 'keydown', 'open', 'open-change', 'panel-change', 'preset-select', 'select', 'update:modelValue', 'update:open', 'update:viewDate', 'view-change']
    const expectedSlots = ['calendar', 'cell', 'clear', 'endInput', 'footer', 'header', 'panel', 'prefix', 'preset', 'separator', 'startInput', 'suffix', 'toggle', 'year']
    const dateRange = manifest.components.find(component => component.name === 'UiDateRangePicker')
    expect(dateRange.emits).toEqual(expectedEmits)
    expect(dateRange.slots).toEqual(expectedSlots)
    for (const name of ['UiTimeRangePicker', 'UiDateTimeRangePicker']) {
      const wrapper = manifest.components.find(component => component.name === name)
      expect(wrapper.emits).toEqual(expectedEmits)
      expect(wrapper.slots).toEqual(expectedSlots)
    }
  })

  it('supports readonly inspection, Escape close and focus restoration semantics', async () => {
    const wrapper = mount(UiDateRangePicker, { attachTo: document.body, props: { defaultValue: ['2026-08-10', '2026-08-12'], defaultOpen: true, defaultViewDate: '2026-08-01', readonly: true, appendToBody: false } })
    await nextTick()
    expect(wrapper.find('.ui-calendar').exists()).toBe(true)
    expect(await wrapper.vm.select(['2026-08-11', '2026-08-13'], 'api')).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.vm.getState().open).toBe(false)
    wrapper.unmount()
  })

  it('renders deterministic SSR markup for closed date and native adapters', async () => {
    const app = createSSRApp({ render: () => h('div', [h(UiDateRangePicker, { modelValue: ['2026-08-10', '2026-08-12'], 'aria-label': 'Release window' }), h(UiTimeRangePicker, { modelValue: ['09:00', '17:30'] })]) })
    const html = await renderToString(app)
    expect(html).toContain('ui-date-range-picker')
    expect(html).toContain('aria-label="开始日期"')
    expect(html).toContain('type="time"')
    expect(html).not.toContain('[object Object]')
  })
})

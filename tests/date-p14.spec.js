// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDatePicker from '../src/components/UiDatePicker.vue'
import UiDateRangePicker from '../src/components/UiDateRangePicker.vue'
import UiTimePicker from '../src/components/UiTimePicker.vue'
import { compareDateValues, dateValueToDate, formatDateValue, fromDateValue, parseDateValue, resolveTimeZone, toDateValue } from '../src/date.js'

describe('maturity P14 date value adapter',()=>{
  it('strictly parses calendar, time and datetime values',()=>{
    expect(parseDateValue('2024-02-29','date')?.day).toBe(29)
    expect(parseDateValue('2023-02-29','date')).toBeNull()
    expect(parseDateValue('24:00',{mode:'time'})).toBeNull()
    expect(parseDateValue('2026-08-12T09:30:45.120',{mode:'datetime'})?.precision).toBe('millisecond')
    expect(parseDateValue('2026-08-12 09:30',{mode:'datetime'})).toBeNull()
  })

  it('round-trips instants through explicit IANA time zones',()=>{
    const instant=dateValueToDate('2026-08-12T09:30',{mode:'datetime',timeZone:'Asia/Shanghai'})
    expect(instant?.toISOString()).toBe('2026-08-12T01:30:00.000Z')
    expect(formatDateValue(instant,{mode:'datetime',timeZone:'America/New_York'})).toBe('2026-08-11T21:30')
    expect(resolveTimeZone('UTC')).toBe('UTC')
    expect(()=>resolveTimeZone('Invalid/Zone')).toThrow()
  })

  it('handles daylight-saving gaps and overlaps explicitly',()=>{
    const rejected=dateValueToDate('2026-03-08T02:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'reject'})
    const compatible=dateValueToDate('2026-03-08T02:30',{mode:'datetime',timeZone:'America/New_York'})
    const earlier=dateValueToDate('2026-11-01T01:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'earlier'})
    const later=dateValueToDate('2026-11-01T01:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'later'})
    expect(rejected).toBeNull()
    expect(compatible?.toISOString()).toBe('2026-03-08T07:30:00.000Z')
    expect(earlier?.toISOString()).toBe('2026-11-01T05:30:00.000Z')
    expect(later?.toISOString()).toBe('2026-11-01T06:30:00.000Z')
  })

  it('supports Date, timestamp and time-only values with a stable reference date',()=>{
    const options={mode:'time',timeZone:'Asia/Shanghai',referenceDate:'2026-08-12'}
    expect(fromDateValue('09:30',{...options,valueType:'timestamp'})).toBe(Date.parse('2026-08-12T01:30:00.000Z'))
    expect(toDateValue(new Date('2026-08-12T01:30:45.123Z'),{...options,precision:'millisecond'})).toBe('09:30:45.123')
    expect(compareDateValues('09:30','18:00',options)).toBe(-1)
    expect(toDateValue('bad-value',options)).toBe('')
  })
})

describe('maturity P14 date components',()=>{
  it('maps Date values through a zone and emits Date values atomically',async()=>{
    const model=new Date('2026-08-12T01:30:00.000Z')
    const wrapper=mount(UiDatePicker,{props:{modelValue:model,mode:'datetime',valueType:'date',timeZone:'Asia/Shanghai'}})
    const input=wrapper.get('input')
    expect(input.element.value).toBe('2026-08-12T09:30')
    await input.setValue('2026-08-12T10:45')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(new Date('2026-08-12T02:45:00.000Z'))
    expect(wrapper.attributes('data-time-zone')).toBe('Asia/Shanghai')
    expect(wrapper.attributes('data-value-type')).toBe('date')
  })

  it('rejects nonexistent zoned wall times before updating the model',async()=>{
    const wrapper=mount(UiDatePicker,{props:{modelValue:null,mode:'datetime',valueType:'date',timeZone:'America/New_York',disambiguation:'reject'}})
    await wrapper.get('input').setValue('2026-03-08T02:30')
    expect(wrapper.emitted('invalid')?.[0]?.[0]).toEqual({code:'invalid-date-value',value:'2026-03-08T02:30'})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('preserves typed range constraints and ordering payloads',async()=>{
    const wrapper=mount(UiDateRangePicker,{props:{modelValue:[new Date('2026-08-01T00:00:00.000Z'),new Date('2026-08-11T00:00:00.000Z')],valueType:'date',timeZone:'UTC'}})
    const inputs=wrapper.findAll('input')
    expect(inputs[0].element.value).toBe('2026-08-01')
    expect(inputs[0].attributes('max')).toBe('2026-08-11')
    await inputs[1].setValue('2026-07-31')
    expect(wrapper.emitted('change')?.at(-1)?.[0].valid).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0].code).toBe('range-order')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0].every(value=>value instanceof Date)).toBe(true)
  })

  it('provides a localized named time picker with seconds precision',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiTimePicker,{modelValue:'09:30:15',precision:'second',step:1})}})
    const control=wrapper.get('.ui-time-picker')
    expect(control.get('input').attributes('type')).toBe('time')
    expect(control.get('input').element.value).toBe('09:30:15')
    expect(control.get('.ui-date-action').attributes('aria-label')).toBe('Clear date or time')
  })
})

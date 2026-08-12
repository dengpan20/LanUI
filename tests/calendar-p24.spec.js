// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiCalendar from '../src/components/UiCalendar.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

const day=(wrapper,value)=>wrapper.get(`[data-date="${value}"]`)

describe('maturity P24 calendar',()=>{
  it('renders a localized fixed six-week grid and emits string selection metadata',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiCalendar,{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-12',showWeekNumbers:true})}})
    const calendar=wrapper.findComponent(UiCalendar)
    expect(calendar.get('[role="grid"]').attributes('aria-label')).toContain('August')
    expect(calendar.findAll('.ui-calendar-day')).toHaveLength(42)
    expect(calendar.findAll('.ui-calendar-week-number')).toHaveLength(7)
    expect(day(calendar,'2026-08-12').classes()).toEqual(expect.arrayContaining(['selected','today']))
    await day(calendar,'2026-08-20').trigger('click')
    expect(calendar.emitted('update:modelValue')?.at(-1)).toEqual(['2026-08-20'])
    expect(calendar.emitted('change')?.at(-1)).toEqual(['2026-08-20',{source:'pointer',selectionMode:'single',date:'2026-08-20'}])
  })

  it('provides roving keyboard navigation, page switching and selection',async()=>{
    const wrapper=mount(UiCalendar,{props:{modelValue:'2026-08-31',viewDate:'2026-08-01',today:'2026-08-01',firstDayOfWeek:1}})
    const active=day(wrapper,'2026-08-31')
    expect(active.attributes('tabindex')).toBe('0')
    await active.trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.emitted('update:viewDate')?.at(-1)).toEqual(['2026-09-01'])
    expect(day(wrapper,'2026-09-01').attributes('tabindex')).toBe('0')
    await day(wrapper,'2026-09-01').trigger('keydown',{key:'End'})
    expect(day(wrapper,'2026-09-06').attributes('tabindex')).toBe('0')
    await day(wrapper,'2026-09-06').trigger('keydown',{key:'PageDown',shiftKey:true})
    expect(wrapper.emitted('update:viewDate')?.at(-1)).toEqual(['2027-09-01'])
    await day(wrapper,'2027-09-06').trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2027-09-06'])
  })

  it('mirrors horizontal Arrow keys in RTL while vertical movement stays chronological',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{direction:'rtl'},slots:{default:()=>h(UiCalendar,{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-01'})}})
    const calendar=wrapper.findComponent(UiCalendar)
    await day(calendar,'2026-08-12').trigger('keydown',{key:'ArrowRight'})
    expect(day(calendar,'2026-08-11').attributes('tabindex')).toBe('0')
    await day(calendar,'2026-08-11').trigger('keydown',{key:'ArrowDown'})
    expect(day(calendar,'2026-08-18').attributes('tabindex')).toBe('0')
    expect(calendar.attributes('dir')).toBe('rtl')
  })

  it('keeps a focusable current-month cell and scopes focus to each calendar instance',async()=>{
    const mismatch=mount(UiCalendar,{props:{modelValue:'2027-01-10',viewDate:'2026-08-01',today:'2026-09-01',showOutsideDays:false}})
    expect(day(mismatch,'2026-08-01').attributes('tabindex')).toBe('0')
    const pair=mount({render:()=>h('div',[h(UiCalendar,{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-01',ariaLabel:'First'}),h(UiCalendar,{modelValue:'2026-08-20',viewDate:'2026-08-01',today:'2026-08-01',ariaLabel:'Second'})])},{attachTo:document.body})
    const calendars=pair.findAllComponents(UiCalendar)
    await day(calendars[1],'2026-08-20').trigger('keydown',{key:'PageDown'})
    expect(calendars[1].element.contains(document.activeElement)).toBe(true)
    expect(calendars[0].element.contains(document.activeElement)).toBe(false)
    pair.unmount()
  })

  it('enforces min, max and disabledDate without leaking consumer errors',async()=>{
    const disabledDate=(date,{date:key})=>key==='2026-08-15'
    const wrapper=mount(UiCalendar,{props:{modelValue:'',viewDate:'2026-08-01',today:'2026-08-12',min:'2026-08-10',max:'2026-08-20',disabledDate}})
    for(const key of ['2026-08-09','2026-08-15','2026-08-21'])expect(day(wrapper,key).attributes('aria-disabled')).toBe('true')
    await day(wrapper,'2026-08-15').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    const contained=mount(UiCalendar,{props:{viewDate:'2026-08-01',today:'2026-08-12',disabledDate:()=>{throw new Error('consumer')}}})
    expect(day(contained,'2026-08-12').attributes('aria-disabled')).toBeUndefined()
  })

  it('models range start, preview, completion and normalized output',async()=>{
    const wrapper=mount(UiCalendar,{props:{modelValue:['2026-08-10'],selectionMode:'range',viewDate:'2026-08-01',today:'2026-08-01'}})
    expect(day(wrapper,'2026-08-10').classes()).toEqual(expect.arrayContaining(['range-start','range-pending']))
    await day(wrapper,'2026-08-14').trigger('mouseenter')
    expect(day(wrapper,'2026-08-12').classes()).toContain('range-preview')
    expect(day(wrapper,'2026-08-10').classes()).toContain('range-start')
    expect(day(wrapper,'2026-08-14').classes()).toEqual(expect.arrayContaining(['range-end','range-preview']))
    await day(wrapper,'2026-08-08').trigger('mouseenter')
    expect(day(wrapper,'2026-08-08').classes()).toEqual(expect.arrayContaining(['range-start','range-preview']))
    expect(day(wrapper,'2026-08-10').classes()).toEqual(expect.arrayContaining(['range-end','selected']))
    expect(day(wrapper,'2026-08-09').classes()).toEqual(expect.arrayContaining(['in-range','range-preview']))
    await day(wrapper,'2026-08-08').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['2026-08-08','2026-08-10']])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toEqual({source:'pointer',selectionMode:'range',date:'2026-08-08'})
  })

  it('supports multiple selection toggling and a hard selection cap',async()=>{
    const remove=mount(UiCalendar,{props:{modelValue:['2026-08-10','2026-08-12'],selectionMode:'multiple',viewDate:'2026-08-01',today:'2026-08-01'}})
    await day(remove,'2026-08-10').trigger('click')
    expect(remove.emitted('update:modelValue')?.at(-1)).toEqual([['2026-08-12']])
    const capped=mount(UiCalendar,{props:{modelValue:['2026-08-10','2026-08-12'],selectionMode:'multiple',maxSelections:2,viewDate:'2026-08-01',today:'2026-08-01'}})
    await day(capped,'2026-08-14').trigger('click')
    expect(capped.emitted('update:modelValue')).toBeUndefined()
  })

  it('switches year ranges and preserves the active month/day when choosing a year',async()=>{
    const wrapper=mount(UiCalendar,{props:{modelValue:'2026-08-31',viewDate:'2026-08-01',today:'2026-08-01'}})
    await wrapper.get('.ui-calendar-title').trigger('click')
    expect(wrapper.get('.ui-calendar-years').attributes('role')).toBe('grid')
    expect(wrapper.emitted('panel-change')?.at(-1)).toEqual(['year'])
    await wrapper.findAll('.ui-calendar-nav')[1].trigger('click')
    expect(wrapper.get('.ui-calendar-title').text()).toContain('2028–2039')
    const year=wrapper.findAll('.ui-calendar-year').find(item=>item.text().trim()==='2036')
    await year.trigger('click')
    expect(wrapper.emitted('update:viewDate')?.at(-1)).toEqual(['2036-08-01'])
    expect(wrapper.emitted('panel-change')?.at(-1)).toEqual(['month'])
  })

  it('converts selected values to Date and timestamp output types',async()=>{
    const asDate=mount(UiCalendar,{props:{modelValue:new Date('2026-08-12T00:00:00Z'),valueType:'date',timeZone:'UTC',viewDate:'2026-08-01',today:'2026-08-01'}})
    await day(asDate,'2026-08-20').trigger('click')
    expect(asDate.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(new Date('2026-08-20T00:00:00.000Z'))
    const asTimestamp=mount(UiCalendar,{props:{modelValue:0,valueType:'timestamp',timeZone:'UTC',viewDate:'2026-08-01',today:'2026-08-01'}})
    await day(asTimestamp,'2026-08-20').trigger('click')
    expect(asTimestamp.emitted('update:modelValue')?.at(-1)?.[0]).toBe(Date.UTC(2026,7,20))
  })

  it('clears through keyboard while disabled and readonly calendars stay immutable',async()=>{
    const clearable=mount(UiCalendar,{props:{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-01'}})
    await day(clearable,'2026-08-12').trigger('keydown',{key:'Delete'})
    expect(clearable.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(clearable.emitted('clear')?.at(-1)).toEqual([{source:'keyboard'}])
    for(const prop of ['disabled','readonly']){
      const wrapper=mount(UiCalendar,{props:{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-01',[prop]:true}})
      await day(wrapper,'2026-08-20').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    }
  })

  it('exposes header, day, year and footer slot contracts without losing grid semantics',async()=>{
    const wrapper=mount(UiCalendar,{props:{modelValue:'2026-08-12',viewDate:'2026-08-01',today:'2026-08-01'},slots:{header:scope=>h('strong',{class:'custom-header'},scope.label),cell:scope=>h('span',{class:'custom-cell'},scope.date),footer:()=>h('small',{class:'custom-footer'},'Footer'),year:scope=>h('em',{class:'custom-year'},scope.year)}})
    expect(wrapper.get('.custom-header').text()).toContain('2026')
    expect(wrapper.findAll('.custom-cell')).toHaveLength(42)
    expect(wrapper.get('[role="gridcell"]').attributes('aria-label')).toBeTruthy()
    expect(wrapper.get('.custom-footer').text()).toBe('Footer')
  })
})

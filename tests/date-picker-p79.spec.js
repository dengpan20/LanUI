// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import UiDatePicker from '../src/components/UiDatePicker.vue'

function controlled(modelValue='',extra={}){
  let wrapper
  wrapper=mount(UiDatePicker,{props:{modelValue,'onUpdate:modelValue':value=>wrapper.setProps({modelValue:value}),appendToBody:false,...extra}})
  return wrapper
}

describe('UiDatePicker P79 production contracts',()=>{
  it('supports controlled and default-owned values without changing native date semantics',async()=>{
    const uncontrolled=mount(UiDatePicker,{props:{defaultValue:'2026-08-24',min:'2026-08-01',max:'2026-08-31',appendToBody:false}})
    expect(uncontrolled.get('input').element.value).toBe('2026-08-24')
    expect(uncontrolled.get('input').attributes()).toMatchObject({type:'date',min:'2026-08-01',max:'2026-08-31'})
    await uncontrolled.get('input').setValue('2026-08-25')
    expect(uncontrolled.vm.getState()).toMatchObject({value:'2026-08-25',nativeValue:'2026-08-25'})
    const wrapper=controlled('2026-08-24')
    await wrapper.get('input').setValue('2026-08-26');await nextTick()
    expect(wrapper.props('modelValue')).toBe('2026-08-26')
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'input',previous:'2026-08-24',raw:'2026-08-26'})
  })

  it('supports controlled and default-owned open state with structured metadata',async()=>{
    const uncontrolled=mount(UiDatePicker,{props:{appendToBody:false}})
    await uncontrolled.get('.calendar-action').trigger('click');await nextTick()
    expect(uncontrolled.get('.ui-date-picker').classes()).toContain('open')
    expect(uncontrolled.find('.ui-calendar').exists()).toBe(true)
    expect(uncontrolled.emitted('open-change')?.[0]).toEqual([true,expect.objectContaining({source:'button',previous:false})])
    const wrapper=mount(UiDatePicker,{props:{open:false,appendToBody:false}})
    await wrapper.get('.calendar-action').trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('.ui-calendar').exists()).toBe(false)
    await wrapper.setProps({open:true});await nextTick()
    expect(wrapper.find('.ui-calendar').exists()).toBe(true)
  })

  it('selects from the calendar and closes atomically',async()=>{
    const wrapper=mount(UiDatePicker,{props:{defaultValue:'2026-08-24',defaultOpen:true,defaultViewDate:'2026-08-01',appendToBody:false}})
    await nextTick()
    await wrapper.get('[data-date="2026-08-25"]').trigger('click');await flushPromises()
    expect(wrapper.vm.getState().value).toBe('2026-08-25')
    expect(wrapper.emitted('select')?.at(-1)?.[1]).toMatchObject({source:'calendar',raw:'2026-08-25'})
    expect(wrapper.emitted('close')?.at(-1)?.[0]).toMatchObject({source:'selection',open:false})
    expect(wrapper.find('.ui-calendar').exists()).toBe(false)
  })

  it('rejects min, max and disabled dates before model mutation',async()=>{
    const disabledDate=vi.fn((_date,context)=>context.date==='2026-08-16')
    const wrapper=mount(UiDatePicker,{props:{defaultValue:'2026-08-15',min:'2026-08-10',max:'2026-08-20',disabledDate,appendToBody:false}})
    await wrapper.get('input').setValue('2026-08-09')
    await wrapper.get('input').setValue('2026-08-21')
    await wrapper.get('input').setValue('2026-08-16')
    expect(wrapper.vm.getState().value).toBe('2026-08-15')
    expect(wrapper.emitted('invalid')?.map(args=>args[0].code)).toEqual(['date-before-min','date-after-max','date-disabled'])
    expect(disabledDate).toHaveBeenCalled()
  })

  it('serializes asynchronous value guards and exposes pending state',async()=>{
    let resolve
    const beforeChange=vi.fn(()=>new Promise(done=>{resolve=done}))
    const wrapper=mount(UiDatePicker,{props:{defaultValue:'2026-08-24',beforeChange,appendToBody:false}})
    const pending=wrapper.vm.select('2026-08-25')
    expect(wrapper.vm.pending.change.value).toBe(true)
    expect(wrapper.vm.select('2026-08-26')).toBe(false)
    resolve(true);await pending;await nextTick()
    expect(wrapper.vm.getState().value).toBe('2026-08-25')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({code:'pending',kind:'change'})
  })

  it('supports asynchronous open guards, rejection and retry',async()=>{
    const beforeOpenChange=vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const wrapper=mount(UiDatePicker,{props:{beforeOpenChange,appendToBody:false}})
    expect(await wrapper.vm.show('api')).toBe(false)
    expect(wrapper.vm.getState().open).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({code:'guard-rejected',kind:'open'})
    expect(await wrapper.vm.show('api')).toMatchObject({open:true,source:'api'})
    expect(wrapper.vm.getState().open).toBe(true)
  })

  it('supports static and computed presets with close-on-select',async()=>{
    const presets=[{key:'today',label:'Release day',value:'2026-08-24'},{key:'next',label:'Next day',value:()=>new Date('2026-08-25T00:00:00.000Z')}]
    const wrapper=mount(UiDatePicker,{props:{defaultOpen:true,presets,timeZone:'UTC',appendToBody:false}})
    await nextTick()
    await wrapper.findAll('.ui-date-picker-presets button')[1].trigger('click');await flushPromises()
    expect(wrapper.vm.getState().value).toBe('2026-08-25')
    expect(wrapper.emitted('preset-select')?.at(-1)?.[0]).toMatchObject({key:'next'})
    expect(wrapper.vm.getState().open).toBe(false)
  })

  it('opens by keyboard and closes with Escape while restoring trigger semantics',async()=>{
    const wrapper=mount(UiDatePicker,{attachTo:document.body,props:{appendToBody:false}})
    const input=wrapper.get('input')
    await input.trigger('keydown',{key:'ArrowDown',altKey:false});await nextTick()
    expect(wrapper.get('.calendar-action').attributes()).toMatchObject({'aria-expanded':'true','aria-haspopup':'dialog'})
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await nextTick()
    expect(wrapper.vm.getState().open).toBe(false)
    expect(wrapper.emitted('close')?.at(-1)?.[0]).toMatchObject({source:'escape'})
    wrapper.unmount()
  })

  it('publishes controlled view navigation without duplicate view-change events',async()=>{
    const wrapper=mount(UiDatePicker,{props:{open:true,viewDate:'2026-08-01',appendToBody:false}})
    await nextTick()
    await wrapper.get('.ui-calendar-next-icon').trigger('click');await nextTick()
    expect(wrapper.emitted('update:viewDate')?.at(-1)).toEqual(['2026-09-01'])
    expect(wrapper.emitted('view-change')).toHaveLength(1)
    expect(wrapper.emitted('view-change')?.[0]?.[0]).toMatchObject({value:'2026-09-01',previous:'2026-08-01',source:'button'})
  })

  it('allows readonly inspection while blocking value mutations',async()=>{
    const wrapper=mount(UiDatePicker,{props:{defaultValue:'2026-08-24',readonly:true,appendToBody:false}})
    await wrapper.get('input').trigger('click');await nextTick()
    expect(wrapper.vm.getState().open).toBe(true)
    expect(wrapper.vm.select('2026-08-25')).toBe(false)
    expect(wrapper.vm.getState().value).toBe('2026-08-24')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({code:'blocked',kind:'change'})
  })

  it('preserves Date and timestamp representations for clear and preset operations',async()=>{
    const date=mount(UiDatePicker,{props:{defaultValue:new Date('2026-08-24T00:00:00.000Z'),valueType:'date',timeZone:'UTC',appendToBody:false}})
    await date.vm.clear('api')
    expect(date.emitted('update:modelValue')?.at(-1)).toEqual([null])
    const timestamp=mount(UiDatePicker,{props:{defaultValue:Date.parse('2026-08-24T00:00:00.000Z'),valueType:'timestamp',timeZone:'UTC',defaultOpen:true,presets:[{label:'Next',value:Date.parse('2026-08-25T00:00:00.000Z')}],appendToBody:false}})
    await nextTick();await timestamp.get('.ui-date-picker-presets button').trigger('click');await flushPromises()
    expect(timestamp.vm.getState().value).toBe(Date.parse('2026-08-25T00:00:00.000Z'))
  })

  it('exposes focus, open, selection, view and state instance APIs',async()=>{
    const wrapper=mount(UiDatePicker,{attachTo:document.body,props:{appendToBody:false}})
    expect(wrapper.vm.focus()).toBe(true)
    await wrapper.vm.show();await nextTick()
    expect(wrapper.vm.setViewDate('2027-01-01')).toBe('2027-01-01')
    await wrapper.vm.select('2027-01-12');await nextTick()
    expect(wrapper.vm.getState()).toMatchObject({value:'2027-01-12',viewDate:'2027-01-01',valid:true})
    expect(wrapper.vm.blur()).toBe(true)
    wrapper.unmount()
  })

  it('provides production customization slots',async()=>{
    const wrapper=mount(UiDatePicker,{props:{defaultOpen:true,presets:[{label:'Release',value:'2026-08-24'}],appendToBody:false},slots:{prefix:()=>h('b',{class:'custom-prefix'},'P'),suffix:()=>h('i',{class:'custom-suffix'},'S'),preset:({preset})=>h('span',{class:'custom-preset'},preset.label),cell:({date})=>h('span',{class:'custom-cell'},date.slice(-2)),footer:({close})=>h('button',{class:'custom-footer',onClick:close},'Done')}})
    await nextTick()
    for(const selector of ['.custom-prefix','.custom-suffix','.custom-preset','.custom-cell','.custom-footer'])expect(wrapper.find(selector).exists()).toBe(true)
  })

  it('keeps native time and datetime adapters backward compatible without popup ARIA',async()=>{
    const time=mount(UiDatePicker,{props:{mode:'time',modelValue:'09:30',appendToBody:false}})
    const datetime=mount(UiDatePicker,{props:{mode:'datetime',modelValue:'2026-08-24T09:30',appendToBody:false}})
    await nextTick()
    expect(time.get('input').attributes('type')).toBe('time')
    expect(datetime.get('input').attributes('type')).toBe('datetime-local')
    expect(time.get('input').attributes('aria-haspopup')).toBeUndefined()
    expect(time.get('input').attributes('aria-expanded')).toBeUndefined()
    expect(datetime.get('input').attributes('aria-haspopup')).toBeUndefined()
    expect(datetime.get('input').attributes('aria-expanded')).toBeUndefined()
    expect(time.get('.calendar-action').attributes('aria-haspopup')).toBeUndefined()
  })

  it('renders deterministic closed and default-open panel semantics during SSR',async()=>{
    const app=createSSRApp({render:()=>h('div',[h(UiDatePicker,{modelValue:'2026-08-24','aria-label':'Release date'}),h(UiDatePicker,{defaultValue:'2026-08-25',defaultOpen:true,defaultViewDate:'2026-08-01',appendToBody:false,presets:[{label:'Today',value:'2026-08-24'}]})])})
    const html=await renderToString(app)
    expect(html).toContain('data-state="closed"')
    expect(html).toContain('data-state="open"')
    expect(html).toContain('ui-date-picker-panel-content')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).not.toContain('[object Object]')
  })
})

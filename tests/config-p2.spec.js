// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDateRangePicker from '../src/components/UiDateRangePicker.vue'
import UiEmpty from '../src/components/UiEmpty.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiPagination from '../src/components/UiPagination.vue'
import UiPopover from '../src/components/UiPopover.vue'
import UiSelect from '../src/components/UiSelect.vue'
import UiTable from '../src/components/UiTable.vue'
import { createLanUi, enUS } from '../src/index.js'

describe('application configuration',()=>{
  it('applies locale, component size, density and theme tokens to descendants',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US',size:'lg',density:'compact',theme:{'brand-600':'#7c3aed'}},slots:{default:()=>h('div',[h(UiButton,null,()=> 'Action'),h(UiSelect,{options:[]}),h(UiEmpty),h(UiPagination,{page:1,total:0}),h(UiTable,{columns:[{key:'name',label:'Name'}],rows:[]})])}})
    expect(wrapper.attributes('data-ui-locale')).toBe('en-US')
    expect(wrapper.attributes('data-ui-density')).toBe('compact')
    expect(wrapper.attributes('style')).toContain('--brand-600: #7c3aed')
    expect(wrapper.get('.btn').classes()).toContain('btn-lg')
    expect(wrapper.get('.ui-select-value').text()).toBe('Select an option')
    expect(wrapper.get('.ui-empty strong').text()).toBe('No data')
    expect(wrapper.get('.ui-pagination').attributes('aria-label')).toBe('Pagination')
    expect(wrapper.get('.ui-table-wrap').classes()).toContain('density-compact')
  })

  it('installs all components and updates a reactive application locale',async()=>{
    const plugin=createLanUi({locale:enUS})
    const wrapper=mount(UiEmpty,{global:{plugins:[plugin]}})
    expect(wrapper.get('strong').text()).toBe('No data')
    expect(wrapper.vm.$root.$lanUi.locale.name).toBe('en-US')
    expect(wrapper.vm.$.appContext.components.UiDateRangePicker).toBeTruthy()
    plugin.setLocale('zh-CN');await nextTick()
    expect(wrapper.get('strong').text()).toBe('暂无数据')
  })

  it('applies the configured overlay base to floating components',async()=>{
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{zIndex:1000},slots:{default:()=>h(UiPopover,{modelValue:true},{trigger:()=>h('button','Open'),default:()=> 'Content'})}})
    await nextTick();await nextTick()
    expect(document.body.querySelector('.ui-popover-panel')?.style.zIndex).toBe('1060')
    wrapper.unmount();document.body.innerHTML=''
  })

  it('merges custom message overrides without losing locale defaults',()=>{
    const locale={name:'en-US',messages:{'empty.title':'Nothing here'}}
    const wrapper=mount(UiConfigProvider,{props:{locale},slots:{default:()=>h(UiEmpty)}})
    expect(wrapper.get('.ui-empty strong').text()).toBe('Nothing here')
    expect(wrapper.get('.ui-empty p').text()).toContain('current criteria')
  })
})

describe('date range input',()=>{
  it('uses a single labelled group inside a composite form item',()=>{
    const wrapper=mount(UiFormItem,{props:{label:'Delivery window',composite:true},slots:{default:()=>h(UiDateRangePicker,{modelValue:[]})}})
    const groups=wrapper.findAll('[role="group"]')
    expect(groups).toHaveLength(1)
    expect(groups[0].attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
  })

  it('exposes two labelled native inputs and range constraints',()=>{
    const wrapper=mount(UiDateRangePicker,{props:{modelValue:['2026-08-01','2026-08-11'],min:'2026-01-01',max:'2026-12-31'}})
    const inputs=wrapper.findAll('input')
    expect(inputs).toHaveLength(2)
    expect(inputs[0].attributes('aria-label')).toBe('开始日期')
    expect(inputs[0].attributes('max')).toBe('2026-08-11')
    expect(inputs[1].attributes('min')).toBe('2026-08-01')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('reports invalid ordering and clears both values',async()=>{
    const wrapper=mount(UiDateRangePicker,{props:{modelValue:['2026-08-20','2026-08-11'],constrain:false}})
    expect(wrapper.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toContain('结束时间')
    await wrapper.get('.ui-date-action').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('localizes labels through ConfigProvider',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiDateRangePicker,{modelValue:[]})}})
    const inputs=wrapper.findAll('input')
    expect(inputs[0].attributes('aria-label')).toBe('Start date')
    expect(inputs[1].attributes('aria-label')).toBe('End date')
    expect(wrapper.get('.ui-date-range-picker').attributes('aria-label')).toBe('Date range')
  })

  it('supports time and datetime native input modes',()=>{
    const time=mount(UiDateRangePicker,{props:{mode:'time',modelValue:['09:00','18:00']}})
    const datetime=mount(UiDateRangePicker,{props:{mode:'datetime',modelValue:[]}})
    expect(time.findAll('input').every(input=>input.attributes('type')==='time')).toBe(true)
    expect(datetime.findAll('input').every(input=>input.attributes('type')==='datetime-local')).toBe(true)
  })
})

// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiCascader from '../src/components/UiCascader.vue'

const options=[
  {name:'Zhejiang',id:'zj',detail:'East region',terms:['hangzhou'],items:[{name:'Hangzhou',id:'hz',leaf:true},{name:'Ningbo',id:'nb',leaf:true}]},
  {name:'Jiangsu',id:'js',items:[{name:'Nanjing',id:'nj',leaf:true},{name:'Suzhou',id:'sz',locked:true,leaf:true}]},
]
const fields={label:'name',value:'id',children:'items',disabled:'locked',isLeaf:'leaf',description:'detail',keywords:'terms'}

describe('UiCascader production contract P75',()=>{
  it('supports controlled value, open and active path without mutating the rendered state',async()=>{
    const wrapper=mount(UiCascader,{props:{modelValue:['zj','hz'],open:false,activePath:['zj'],options,fieldNames:fields,appendToBody:false}})
    expect(wrapper.get('.ui-cascader-value').text()).toContain('Zhejiang / Hangzhou')
    await wrapper.get('[role="combobox"]').trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('.ui-cascader-menu').exists()).toBe(false)
    await wrapper.setProps({open:true});await nextTick()
    expect(wrapper.findAll('.ui-cascader-column')).toHaveLength(2)
    await wrapper.findAll('.ui-cascader-column')[1].findAll('[role="option"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['zj','nb']])
    expect(wrapper.get('.ui-cascader-value').text()).toContain('Hangzhou')
  })

  it('maps fields, searches paths and supports scalar emitPath=false',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,searchable:true,emitPath:false,appendToBody:false}})
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.get('input[type="search"]').setValue('nanjing')
    expect(wrapper.findAll('.ui-cascader-results [role="option"]')).toHaveLength(1)
    await wrapper.get('.ui-cascader-results [role="option"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['nj'])
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('')
  })

  it('selects descendant leaves, renders collapsed tags and enforces maxCount',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,multiple:true,maxCount:1,maxTagCount:1,clearable:true,appendToBody:false}})
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.get('.ui-cascader-check').trigger('click')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0].reason).toBe('max-count')
    await wrapper.findAll('.ui-cascader-column [role="option"]')[0].trigger('click')
    await wrapper.findAll('.ui-cascader-column')[1].findAll('[role="option"]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[['zj','hz']]])
    expect(wrapper.findAll('.ui-cascader-tag')).toHaveLength(1)
    await wrapper.get('.ui-cascader-clear').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('supports checkStrictly branch values and changeOnSelect',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,multiple:true,checkStrictly:true,changeOnSelect:true,appendToBody:false}})
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.find('.ui-cascader-column [role="option"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[['zj']]])
    expect(wrapper.emitted('active-path-change')?.at(-1)?.[0]).toEqual(['zj'])
  })

  it('toggles a multiple branch with Space and exposes its checked state to assistive tech',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,multiple:true,appendToBody:false}})
    const trigger=wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    await trigger.trigger('keydown',{key:' '})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[['zj','hz'],['zj','nb']]])
    expect(wrapper.get('.ui-cascader-column [role="option"]').attributes('aria-selected')).toBe('true')
  })

  it('loads lazily with AbortSignal race protection and retry state',async()=>{
    const requests=[]
    const loadData=vi.fn((node,{signal})=>new Promise((resolve,reject)=>{requests.push({node,signal,resolve,reject})}))
    const wrapper=mount(UiCascader,{props:{options:[{label:'Remote',value:'remote',isLeaf:false}],loadData,appendToBody:false}})
    const first=wrapper.vm.loadNode(['remote']);const second=wrapper.vm.loadNode(['remote'])
    expect(requests[0].signal.aborted).toBe(true)
    requests[1].resolve([{label:'Tokyo',value:'tokyo',isLeaf:true}]);await second;await flushPromises()
    expect(wrapper.emitted('load')?.at(-1)?.[0].children).toHaveLength(1)
    await wrapper.get('[role="combobox"]').trigger('click');const third=wrapper.vm.loadNode(['remote'])
    requests[2].reject(new Error('offline'));await third;await flushPromises()
    expect(wrapper.emitted('load-error')?.at(-1)?.[0].error.message).toBe('offline')
    expect(wrapper.find('.ui-cascader-retry').exists()).toBe(true)
    requests[0].resolve([]);await first
  })

  it('bridges required native forms and restores defaultValue on reset',async()=>{
    const host=document.createElement('form');document.body.append(host)
    const wrapper=mount(UiCascader,{attachTo:host,props:{defaultValue:['zj','hz'],options,fieldNames:fields,name:'office',required:true,clearable:true,appendToBody:false}})
    const native=wrapper.get('select[name="office"]')
    expect(native.attributes('required')).toBeDefined()
    expect(native.element.value).toBe('zj / hz')
    await wrapper.vm.setValue(['js','nj']);expect(wrapper.vm.value).toEqual(['js','nj'])
    host.reset();await nextTick();expect(wrapper.vm.value).toEqual(['zj','hz'])
    wrapper.unmount();host.remove()
  })

  it('exposes focus, popup, selection and active-path methods',async()=>{
    const wrapper=mount(UiCascader,{attachTo:document.body,props:{options,fieldNames:fields,appendToBody:false}})
    expect(wrapper.vm.focus()).toBe(true);expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element)
    expect(wrapper.vm.show()).toBeTruthy();await nextTick();expect(wrapper.vm.open).toBe(true)
    expect(wrapper.vm.setActivePath(['js'])).toBeTruthy();expect(wrapper.vm.activePath).toEqual(['js'])
    expect(wrapper.vm.select(['js','nj'])).toBeTruthy();expect(wrapper.vm.value).toEqual(['js','nj']);expect(wrapper.vm.open).toBe(false)
    expect(wrapper.vm.show()).toBeTruthy();expect(wrapper.vm.hide()).toBeTruthy();expect(wrapper.vm.open).toBe(false)
  })

  it('renders all customization slots and readonly invalid diagnostics',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,defaultValue:['zj','hz'],clearable:true,appendToBody:false},slots:{prefix:'P',suffix:'S',arrow:'A','clear-icon':'C',value:'V','option-icon':'I',option:'O',footer:'F'}})
    expect(wrapper.get('.ui-cascader-trigger').text()).toContain('PVSA')
    await wrapper.get('[role="combobox"]').trigger('click')
    expect(wrapper.get('.ui-cascader-menu').text()).toContain('IOF')
    wrapper.vm.hide();await wrapper.setProps({readonly:true});await wrapper.get('[role="combobox"]').trigger('click')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0].reason).toBe('readonly')
  })

  it('expands on hover and keeps directional keyboard navigation compatible',async()=>{
    const wrapper=mount(UiCascader,{props:{options,fieldNames:fields,expandTrigger:'hover',appendToBody:false}})
    const trigger=wrapper.get('[role="combobox"]');await trigger.trigger('keydown',{key:'ArrowDown'})
    await wrapper.get('.ui-cascader-column [role="option"]').trigger('mouseenter');await nextTick()
    expect(wrapper.findAll('.ui-cascader-column')).toHaveLength(2)
    await trigger.trigger('keydown',{key:'End'});expect(trigger.attributes('aria-activedescendant')).toContain('-1-1')
  })
})

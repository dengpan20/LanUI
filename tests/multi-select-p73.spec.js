// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import UiMultiSelect from '../src/components/UiMultiSelect.vue'

const options=[
  {label:'East region',value:'east',description:'Primary cluster',keywords:['hangzhou']},
  {label:'West disabled',value:'west',disabled:true},
  {label:'North region',value:'north'},
  {label:'South region',value:'south'},
]

afterEach(()=>{document.body.innerHTML='';vi.useRealTimers()})

describe('UiMultiSelect production contract P73',()=>{
  it('supports uncontrolled values, structured events, tag removal, clearing and native form values',async()=>{
    const wrapper=mount(UiMultiSelect,{attachTo:document.body,props:{defaultValue:['east'],options,clearable:true,name:'regions',required:true,appendToBody:false}})
    expect(wrapper.get('.ui-multi-tag').text()).toContain('East region')
    expect([...wrapper.get('select.ui-multi-select-native').element.selectedOptions].map(item=>item.value)).toEqual(['east'])
    expect(wrapper.get('[role="combobox"]').attributes()).toMatchObject({'aria-required':'true','aria-expanded':'false'})

    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.findAll('[role="option"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['east','north']])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'pointer',previous:['east'],next:['east','north'],index:2})
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({label:'North region',value:'north'})
    expect(wrapper.vm.value).toEqual(['east','north'])
    expect([...wrapper.get('select.ui-multi-select-native').element.selectedOptions].map(item=>item.value)).toEqual(['east','north'])

    await wrapper.findAll('.ui-multi-tag button')[0].trigger('click')
    expect(wrapper.emitted('remove')?.at(-1)?.[0]).toMatchObject({value:'east'})
    expect(wrapper.vm.value).toEqual(['north'])
    await wrapper.get('.ui-multi-select-clear').trigger('click')
    expect(wrapper.emitted('clear')?.at(-1)?.[0]).toEqual([])
    expect(wrapper.vm.value).toEqual([])
  })

  it('keeps controlled value and open state consumer-owned while emitting updates',async()=>{
    const wrapper=mount(UiMultiSelect,{props:{modelValue:['east'],open:false,options,appendToBody:false}})
    expect(wrapper.vm.show('api')).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    await wrapper.setProps({open:true})
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    wrapper.vm.select('north','api')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['east','north']])
    expect(wrapper.vm.value).toEqual(['east'])
    await wrapper.setProps({modelValue:['north'],open:false})
    expect(wrapper.get('.ui-multi-tag').text()).toContain('North region')
  })

  it('supports disabled-skipping keyboard navigation, toggle, typeahead and Backspace removal',async()=>{
    const wrapper=mount(UiMultiSelect,{props:{defaultValue:['east'],options,appendToBody:false}})
    const trigger=wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    expect(wrapper.get('[role="option"].active').text()).toContain('East region')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    expect(wrapper.get('[role="option"].active').text()).toContain('North region')
    await trigger.trigger('keydown',{key:'End'})
    expect(wrapper.get('[role="option"].active').text()).toContain('South region')
    await trigger.trigger('keydown',{key:'Enter'})
    expect(wrapper.vm.value).toEqual(['east','south'])
    await trigger.trigger('keydown',{key:'n'})
    expect(wrapper.get('[role="option"].active').text()).toContain('North region')
    await trigger.trigger('keydown',{key:'Backspace'})
    expect(wrapper.vm.value).toEqual(['east'])
    expect(wrapper.emitted('remove')?.at(-1)?.[0]).toMatchObject({value:'south'})
  })

  it('filters mapped label, description and keywords with IME-safe search',async()=>{
    const custom=[
      {text:'Hangzhou office',id:'hz',note:'East delivery',terms:['zhejiang']},
      {text:'Shenzhen office',id:'sz',note:'South delivery',terms:['guangdong']},
    ]
    const wrapper=mount(UiMultiSelect,{props:{options:custom,fieldNames:{label:'text',value:'id',description:'note',keywords:'terms'},searchable:true,defaultOpen:true,appendToBody:false}})
    const input=wrapper.get('.ui-multi-search input')
    await input.setValue('zhejiang')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.get('[role="option"]').text()).toContain('Hangzhou office')
    await input.trigger('compositionstart')
    input.element.value='guangdong'
    await input.trigger('input',{isComposing:true})
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    await input.trigger('compositionend')
    expect(wrapper.get('[role="option"]').text()).toContain('Shenzhen office')
  })

  it('handles remote races, cache reuse, retryable errors and loading state',async()=>{
    const pending=new Map()
    const remoteMethod=vi.fn(query=>new Promise((resolve,reject)=>pending.set(query,{resolve,reject})))
    const wrapper=mount(UiMultiSelect,{props:{searchable:true,defaultOpen:true,remoteMethod,remoteDebounce:0,appendToBody:false}})
    await nextTick()
    pending.get('').resolve([])
    await flushPromises()
    const input=wrapper.get('.ui-multi-search input')
    await input.setValue('e')
    await input.setValue('ea')
    expect(wrapper.attributes('data-state')).toBe('loading')
    pending.get('e').resolve([{label:'Stale',value:'stale'}])
    pending.get('ea').resolve([{label:'East remote',value:'east'}])
    await flushPromises()
    expect(wrapper.get('[role="option"]').text()).toContain('East remote')
    const calls=remoteMethod.mock.calls.length
    await wrapper.vm.reload('ea',{source:'cache',useCache:true})
    expect(remoteMethod).toHaveBeenCalledTimes(calls)
    const failed=wrapper.vm.reload('fail')
    pending.get('fail').reject(new Error('network'))
    await failed
    await flushPromises()
    expect(wrapper.get('.ui-multi-error').attributes('role')).toBe('alert')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toMatchObject({query:'fail'})
  })

  it('enforces maximum and minimum counts and selects all visible enabled options',async()=>{
    const wrapper=mount(UiMultiSelect,{props:{defaultValue:['east'],options,maxCount:2,minCount:1,showSelectAll:true,defaultOpen:true,appendToBody:false}})
    await wrapper.get('.ui-multi-select-all').trigger('click')
    expect(wrapper.vm.value).toEqual(['east','north'])
    expect(wrapper.emitted('select-all')?.at(-1)?.slice(0,2)).toEqual([true,['east','north']])
    await wrapper.findAll('[role="option"]')[3].trigger('click')
    expect(wrapper.emitted('max')?.at(-1)?.[0]).toMatchObject({maxCount:2})
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'max-count'})
    wrapper.vm.remove('north','api')
    expect(wrapper.vm.value).toEqual(['east'])
    expect(wrapper.vm.clear('api')).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'min-count'})
  })

  it('blocks activation and mutations for disabled, readonly and loading states',()=>{
    for(const state of ['disabled','readonly','loading']){
      const wrapper=mount(UiMultiSelect,{props:{modelValue:['east'],options,clearable:true,[state]:true,appendToBody:false}})
      if(state!=='loading')expect(wrapper.vm.show('api')).toBe(false)
      expect(wrapper.vm.setValue(['north'],'api')).toBe(false)
      expect(wrapper.vm.clear('api')).toBe(false)
      expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:state})
    }
  })

  it('restores uncontrolled defaults on form reset and exposes public operations',async()=>{
    const Host={components:{UiMultiSelect},template:'<form><UiMultiSelect ref="select" :default-value="[\'east\']" name="regions" :options="options" :append-to-body="false"/></form>',data:()=>({options})}
    const host=mount(Host,{attachTo:document.body})
    const select=host.getComponent(UiMultiSelect)
    expect(select.vm.focus()).toBe(true)
    expect(select.vm.show('api')).toBe(true)
    await nextTick()
    expect(select.vm.scrollToActive()).toBe(true)
    select.vm.select('north','api')
    expect(select.vm.value).toEqual(['east','north'])
    host.get('form').element.reset()
    await nextTick()
    expect(select.vm.value).toEqual(['east'])
    expect(select.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'reset',previous:['east','north'],next:['east']})
  })

  it('renders tag, affix, action, option, select-all and footer slots with scopes',()=>{
    const wrapper=mount(UiMultiSelect,{props:{modelValue:['east','north'],options,clearable:true,showSelectAll:true,defaultOpen:true,appendToBody:false},slots:{
      prefix:'PRE',tag:scope=>`TAG:${scope.option.label}`,'overflow-tag':scope=>`MORE:${scope.count}`,suffix:'POST',arrow:'ARROW','clear-icon':'CLEAR',
      'select-all':scope=>`ALL:${scope.selected}`,option:scope=>`OPTION:${scope.option.label}:${scope.selected}`,footer:scope=>`FOOTER:${scope.options.length}`,
    }})
    expect(wrapper.get('.ui-multi-select-trigger').text()).toContain('PRETAG:East regionTAG:North regionPOSTARROW')
    expect(wrapper.get('.ui-multi-select-clear').text()).toBe('CLEAR')
    expect(wrapper.get('.ui-multi-select-all').text()).toBe('ALL:false')
    expect(wrapper.get('[role="option"]').text()).toContain('OPTION:East region:true')
    expect(wrapper.get('.ui-select-footer').text()).toBe('FOOTER:4')
  })

  it('renders deterministic SSR markup with multiple native and combobox semantics',async()=>{
    const html=await renderToString(h(UiMultiSelect,{modelValue:['east'],options,name:'regions',required:true,ariaLabel:'Regions'}))
    expect(html).toContain('data-ui-multi-select')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-required="true"')
    expect(html).toContain('class="ui-multi-select-native"')
    expect(html).toContain('multiple')
    expect(html).toContain('name="regions"')
  })
})

// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import UiSelect from '../src/components/UiSelect.vue'

const options=[
  {label:'East region',value:'east',description:'Primary cluster',keywords:['hangzhou']},
  {label:'West disabled',value:'west',disabled:true},
  {label:'North region',value:'north'},
]

afterEach(()=>{document.body.innerHTML='';vi.useRealTimers()})

describe('UiSelect production contract P72',()=>{
  it('supports uncontrolled value, structured selection events, clear and native form submission',async()=>{
    const wrapper=mount(UiSelect,{attachTo:document.body,props:{defaultValue:'east',options,clearable:true,name:'region',required:true,appendToBody:false}})
    expect(wrapper.get('.ui-select-value').text()).toBe('East region')
    expect(wrapper.get('select.ui-select-native').element.value).toBe('east')
    expect(wrapper.get('[role="combobox"]').attributes()).toMatchObject({'aria-required':'true','aria-expanded':'false'})

    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.findAll('[role="option"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['north'])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'pointer',previous:'east',next:'north',index:2})
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({label:'North region',value:'north'})
    expect(wrapper.vm.value).toBe('north')
    await nextTick()
    expect(wrapper.get('select.ui-select-native').element.value).toBe('north')

    await wrapper.get('.ui-select-clear').trigger('click')
    expect(wrapper.emitted('clear')?.at(-1)?.[0]).toBe('')
    expect(wrapper.emitted('clear')?.at(-1)?.[1]).toMatchObject({source:'clear',previous:'north',next:''})
    expect(wrapper.vm.value).toBe('')
  })

  it('keeps controlled value and open state consumer-owned while emitting update contracts',async()=>{
    const wrapper=mount(UiSelect,{props:{modelValue:'east',open:false,options,appendToBody:false}})
    expect(wrapper.vm.show('api')).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    await wrapper.setProps({open:true})
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    wrapper.vm.select('north','api')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['north'])
    expect(wrapper.vm.value).toBe('east')
    await wrapper.setProps({modelValue:'north',open:false})
    expect(wrapper.get('.ui-select-value').text()).toBe('North region')
  })

  it('skips disabled options with arrows and supports Home, End, typeahead and Enter',async()=>{
    const wrapper=mount(UiSelect,{props:{options,appendToBody:false}})
    const trigger=wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    expect(wrapper.get('[role="option"].active').text()).toContain('East region')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    expect(wrapper.get('[role="option"].active').text()).toContain('North region')
    await trigger.trigger('keydown',{key:'Home'})
    expect(wrapper.get('[role="option"].active').text()).toContain('East region')
    await trigger.trigger('keydown',{key:'End'})
    expect(wrapper.get('[role="option"].active').text()).toContain('North region')
    await trigger.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['north'])
    await trigger.trigger('keydown',{key:'e'})
    expect(wrapper.get('[role="option"].active').text()).toContain('East region')
  })

  it('filters label, description and keywords with IME-safe search and custom field mapping',async()=>{
    const custom=[
      {text:'Hangzhou office',id:'hz',note:'East delivery',terms:['zhejiang']},
      {text:'Shenzhen office',id:'sz',note:'South delivery',terms:['guangdong']},
    ]
    const wrapper=mount(UiSelect,{props:{options:custom,fieldNames:{label:'text',value:'id',description:'note',keywords:'terms'},searchable:true,defaultOpen:true,appendToBody:false}})
    const input=wrapper.get('.ui-select-search input')
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

  it('handles remote search races, cache reuse, retryable errors and loading state',async()=>{
    const pending=new Map()
    const remoteMethod=vi.fn(query=>new Promise((resolve,reject)=>pending.set(query,{resolve,reject})))
    const wrapper=mount(UiSelect,{props:{searchable:true,defaultOpen:true,remoteMethod,remoteDebounce:0,appendToBody:false}})
    await nextTick()
    expect(remoteMethod).toHaveBeenCalledWith('',expect.objectContaining({signal:expect.anything()}))
    pending.get('').resolve([])
    await flushPromises()

    const input=wrapper.get('.ui-select-search input')
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
    expect(wrapper.get('.ui-select-error').attributes('role')).toBe('alert')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toMatchObject({query:'fail'})
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'remote-error'})
  })

  it('blocks activation and mutations in disabled, readonly and loading states',async()=>{
    for(const state of ['disabled','readonly','loading']){
      const wrapper=mount(UiSelect,{props:{modelValue:'east',options,clearable:true,[state]:true,appendToBody:false}})
      if(state==='disabled')expect(wrapper.vm.show('api')).toBe(false)
      else if(state==='readonly')expect(wrapper.vm.show('api')).toBe(false)
      expect(wrapper.vm.setValue('north','api')).toBe(false)
      expect(wrapper.vm.clear('api')).toBe(false)
      expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:state})
    }
  })

  it('restores an uncontrolled default value on native form reset',async()=>{
    const Host={components:{UiSelect},template:'<form><UiSelect ref="select" default-value="east" name="region" :options="options" :append-to-body="false"/></form>',data:()=>({options})}
    const host=mount(Host,{attachTo:document.body})
    const select=host.getComponent(UiSelect)
    select.vm.setValue('north','api')
    expect(select.vm.value).toBe('north')
    host.get('form').element.reset()
    await nextTick()
    expect(select.vm.value).toBe('east')
    expect(select.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'reset',previous:'north',next:'east'})
  })

  it('exposes focus, blur, open, selection, clear and scrolling operations',async()=>{
    const wrapper=mount(UiSelect,{attachTo:document.body,props:{options,appendToBody:false}})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element)
    expect(wrapper.vm.show('api')).toBe(true)
    expect(wrapper.vm.open).toBe(true)
    await nextTick()
    expect(wrapper.vm.scrollToActive()).toBe(true)
    expect(wrapper.vm.select('north','api')).toMatchObject({source:'api',next:'north'})
    expect(wrapper.vm.value).toBe('north')
    expect(wrapper.vm.clear('api')).toMatchObject({source:'api',next:''})
    expect(wrapper.vm.blur()).toBe(true)
  })

  it('renders value, affix, option, action, state and footer slots with typed scopes',async()=>{
    const wrapper=mount(UiSelect,{props:{modelValue:'east',options,clearable:true,defaultOpen:true,appendToBody:false},slots:{
      prefix:'PRE',value:scope=>`VALUE:${scope.label}`,suffix:'POST',arrow:'ARROW','clear-icon':'CLEAR',
      option:scope=>`OPTION:${scope.option.label}:${scope.selected}`,footer:scope=>`FOOTER:${scope.options.length}`,
    }})
    expect(wrapper.get('.ui-select-trigger').text()).toContain('PREVALUE:East regionPOSTARROW')
    expect(wrapper.get('.ui-select-clear').text()).toBe('CLEAR')
    expect(wrapper.get('[role="option"]').text()).toContain('OPTION:East region:true')
    expect(wrapper.get('.ui-select-footer').text()).toBe('FOOTER:3')
  })

  it('renders deterministic SSR markup with native and combobox semantics',async()=>{
    const html=await renderToString(h(UiSelect,{modelValue:'east',options,name:'region',required:true,ariaLabel:'Region'}))
    expect(html).toContain('data-ui-select')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-required="true"')
    expect(html).toContain('class="ui-select-native"')
    expect(html).toContain('name="region"')
  })
})

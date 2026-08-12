// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiAutoComplete from '../src/components/UiAutoComplete.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'

afterEach(()=>{document.body.innerHTML='';vi.useRealTimers()})

describe('maturity P18 autocomplete',()=>{
  it('inherits FormItem names, descriptions, invalid state and localized copy',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Office',help:'Choose a supported office',error:'Selection required'}, {default:()=>h(UiAutoComplete,{modelValue:'',options:['London'],appendToBody:false})})}})
    const input=wrapper.get('[role="combobox"]')
    expect(input.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    expect(input.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('placeholder')).toBe('Type to search')
    await input.trigger('focus')
    expect(wrapper.get('[role="listbox"]').attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
  })

  it('filters local options, highlights matches and selects with the keyboard',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,options:[
      {label:'Beijing',value:'pek',description:'Capital'},
      {label:'Berlin',value:'ber',keywords:['Germany']},
      {label:'Boston',value:'bos',disabled:true},
    ],'aria-label':'City'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('bei')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.get('[role="option"] mark').text()).toBe('Bei')
    expect(input.attributes('aria-activedescendant')).toContain('ui-autocomplete-option-')
    await input.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('pek')
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({label:'Beijing',value:'pek',description:'Capital'})
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'option',index:0})
    expect(input.element.value).toBe('Beijing')
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('supports Arrow navigation while skipping disabled suggestions',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,highlightFirst:false,options:[{label:'One',value:1,disabled:true},{label:'Two',value:2},{label:'Three',value:3}],'aria-label':'Number'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    await input.trigger('keydown',{key:'ArrowDown'})
    expect(input.attributes('aria-activedescendant')).toContain('-1')
    await input.trigger('keydown',{key:'ArrowDown'})
    expect(input.attributes('aria-activedescendant')).toContain('-2')
    await input.trigger('keydown',{key:'ArrowUp'})
    await input.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(2)
  })

  it('commits custom text once and exposes a clear action',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'Old',appendToBody:false,options:['Old','Other'],'aria-label':'Custom'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('New value')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('New value')
    await input.trigger('keydown',{key:'Enter'})
    await input.trigger('blur')
    expect(wrapper.emitted('change')).toEqual([['New value',{source:'enter'}]])
    await wrapper.get('.ui-autocomplete-clear').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['',{source:'clear'}])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('keeps select-only models unchanged until an option is chosen',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:1,allowCustom:false,appendToBody:false,options:[{label:'One',value:1},{label:'Two',value:2}],'aria-label':'Strict'}})
    const input=wrapper.get('input')
    expect(input.element.value).toBe('One')
    await input.trigger('focus')
    await input.setValue('Unknown')
    expect(wrapper.emitted('input')?.at(-1)?.[0]).toBe('Unknown')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.trigger('blur')
    expect(input.element.value).toBe('One')
    await input.trigger('focus')
    await input.setValue('Two')
    await wrapper.get('[role="option"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(2)
  })

  it('waits for IME composition before searching or updating the model',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,options:['北京','上海'],'aria-label':'城市'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    const searchesBeforeComposition=wrapper.emitted('search')?.length||0
    await input.trigger('compositionstart')
    input.element.value='北'
    await input.trigger('input',{isComposing:true})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('search')?.length||0).toBe(searchesBeforeComposition)
    await input.trigger('compositionend')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('北')
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('北')
  })

  it('debounces async suggestions, aborts stale requests and reuses cached results',async()=>{
    vi.useFakeTimers()
    const requests=[]
    const fetchSuggestions=vi.fn((query,{signal})=>new Promise(resolve=>requests.push({query,signal,resolve})))
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,fetchSuggestions,debounce:20,minChars:1,'aria-label':'Remote'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('a')
    await vi.advanceTimersByTimeAsync(20)
    expect(requests[0].query).toBe('a')
    expect(input.attributes('aria-busy')).toBe('true')
    await input.setValue('ab')
    await vi.advanceTimersByTimeAsync(20)
    expect(requests[0].signal.aborted).toBe(true)
    requests[1].resolve([{label:'Abacus',value:'abacus'}])
    await Promise.resolve();await nextTick()
    expect(wrapper.get('[role="option"]').text()).toContain('Abacus')
    requests[0].resolve([{label:'Stale',value:'stale'}])
    await Promise.resolve();await nextTick()
    expect(wrapper.text()).not.toContain('Stale')
    await input.setValue('a')
    await vi.advanceTimersByTimeAsync(20)
    requests[2].resolve([{label:'Alpha',value:'alpha'}])
    await Promise.resolve();await nextTick()
    await input.setValue('ab')
    await vi.advanceTimersByTimeAsync(20)
    expect(fetchSuggestions).toHaveBeenCalledTimes(3)
    expect(wrapper.get('[role="option"]').text()).toContain('Abacus')
  })

  it('contains async failures and emits a typed load-error payload',async()=>{
    const failure=new Error('service unavailable')
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,debounce:0,fetchSuggestions:async()=>{throw failure},'aria-label':'Remote'}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('lan')
    await Promise.resolve();await nextTick()
    expect(wrapper.get('.ui-autocomplete-status.error').attributes('role')).toBe('alert')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toEqual({error:failure,query:'lan'})
  })

  it('teleports and positions the suggestion panel without changing ownership semantics',async()=>{
    const wrapper=mount(UiAutoComplete,{attachTo:document.body,props:{modelValue:'',options:['Alpha'],'aria-label':'Teleported'}})
    wrapper.element.getBoundingClientRect=()=>({left:100,right:340,top:100,bottom:134,width:240,height:34,x:100,y:100,toJSON(){}})
    await wrapper.get('input').trigger('focus')
    await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-autocomplete-menu.ui-floating-panel')
    expect(panel).not.toBeNull()
    expect(panel.style.width).toBe('240px')
    expect(panel.style.minWidth).toBe('240px')
    expect(wrapper.get('input').attributes('aria-controls')).toBe(panel.id)
    wrapper.unmount()
  })

  it('supports custom option and empty content while retaining listbox ownership',async()=>{
    const wrapper=mount(UiAutoComplete,{props:{modelValue:'',appendToBody:false,options:[{label:'Alpha',value:'alpha'}],'aria-label':'Custom results'},slots:{option:({option})=>h('strong',{class:'custom-option'},option.label),empty:()=>h('span',{class:'custom-empty'},'Nothing here')}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    expect(wrapper.get('[role="option"] .custom-option').text()).toBe('Alpha')
    await input.setValue('zzz')
    expect(wrapper.get('[role="listbox"] .custom-empty').text()).toBe('Nothing here')
  })

  it('keeps disabled and readonly controls immutable',async()=>{
    const disabled=mount(UiAutoComplete,{props:{modelValue:'A',disabled:true,appendToBody:false,options:['A']}})
    expect(disabled.get('input').attributes('disabled')).toBeDefined()
    await disabled.get('input').trigger('keydown',{key:'ArrowDown'})
    expect(disabled.find('[role="listbox"]').exists()).toBe(false)
    const readonly=mount(UiAutoComplete,{props:{modelValue:'A',readonly:true,appendToBody:false,options:['A']}})
    expect(readonly.get('input').attributes('readonly')).toBeDefined()
    expect(readonly.find('.ui-autocomplete-clear').exists()).toBe(false)
  })
})

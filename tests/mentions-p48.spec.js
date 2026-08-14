// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiMentions from '../src/components/UiMentions.vue'

afterEach(()=>{document.body.innerHTML='';vi.useRealTimers();vi.unstubAllGlobals()})

async function placeCaret(wrapper,value){
  const textarea=wrapper.get('textarea')
  await textarea.setValue(value)
  textarea.element.setSelectionRange(value.length,value.length)
  await textarea.trigger('keyup',{key:value.at(-1)||'a'})
  await nextTick()
  return textarea
}

describe('maturity P48 mentions',()=>{
  it('inherits FormItem semantics and localized copy',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Reviewers',help:'Mention an owner',error:'Owner required'}, {default:()=>h(UiMentions,{modelValue:'',options:['Ada'],appendToBody:false})})}})
    const textarea=wrapper.get('textarea')
    expect(textarea.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    expect(textarea.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
    expect(textarea.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(textarea.attributes('placeholder')).toBe('Type @ to mention someone')
    await placeCaret(wrapper,'@')
    expect(wrapper.get('[role="listbox"]').attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
  })

  it('filters local suggestions and inserts a mention with the keyboard',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'Hello ',appendToBody:false,options:[{label:'Alice Chen',value:'alice',description:'Design'},{label:'Alan Turing',value:'alan'},{label:'Bob',value:'bob'}],'aria-label':'Comment'}})
    const textarea=await placeCaret(wrapper,'Hello @al')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(textarea.attributes('aria-activedescendant')).toContain('ui-mentions-option-')
    await textarea.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('Hello @alice ')
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({label:'Alice Chen',value:'alice'})
    expect(wrapper.emitted('select')?.at(-1)?.[1]).toMatchObject({trigger:'@',query:'al',source:'enter'})
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'mention',trigger:'@'})
    await textarea.trigger('blur')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('supports multiple triggers and trigger-scoped options',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,triggers:['@','#'],options:[{label:'Alice',value:'alice',trigger:'@'},{label:'Release',value:'release',trigger:'#'},{label:'Research',value:'research',trigger:'#'}],'aria-label':'Post'}})
    await placeCaret(wrapper,'Ship #re')
    const options=wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options.every(option=>option.text().includes('#'))).toBe(true)
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('Ship #research ')
  })

  it('requires a token boundary and optionally accepts spaces in a query',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,options:['example','Design Team'],'aria-label':'Message'}})
    await placeCaret(wrapper,'mail@example')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    await wrapper.setProps({allowSpaces:true})
    await placeCaret(wrapper,'Ask @Design T')
    expect(wrapper.get('[role="option"]').text()).toContain('Design Team')
  })

  it('skips disabled options and supports Ctrl+Home/Ctrl+End navigation',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,highlightFirst:false,options:[{label:'Disabled',value:'disabled',disabled:true},{label:'Ada',value:'ada'},{label:'Grace',value:'grace'}],'aria-label':'Team'}})
    const textarea=await placeCaret(wrapper,'@')
    expect(textarea.attributes('aria-activedescendant')).toBeUndefined()
    await textarea.trigger('keydown',{key:'ArrowDown'})
    expect(textarea.attributes('aria-activedescendant')).toContain('-1')
    await textarea.trigger('keydown',{key:'End',ctrlKey:true})
    expect(textarea.attributes('aria-activedescendant')).toContain('-2')
    await textarea.trigger('keydown',{key:'Home',ctrlKey:true})
    await textarea.trigger('keydown',{key:'Tab'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('@ada ')
  })

  it('waits for IME composition before searching or updating the model',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,options:['张三'],'aria-label':'成员'}})
    const textarea=wrapper.get('textarea')
    await textarea.trigger('focus')
    await textarea.trigger('compositionstart')
    textarea.element.value='@张'
    await textarea.trigger('input',{isComposing:true})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('search')).toBeUndefined()
    textarea.element.setSelectionRange(2,2)
    await textarea.trigger('compositionend')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('@张')
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('张')
  })

  it('debounces async suggestions, aborts stale requests and reuses cache',async()=>{
    vi.useFakeTimers()
    const requests=[]
    const fetchSuggestions=vi.fn((query,{trigger,signal})=>new Promise(resolve=>requests.push({query,trigger,signal,resolve})))
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,fetchSuggestions,debounce:20,'aria-label':'Async mentions'}})
    await placeCaret(wrapper,'@a');await vi.advanceTimersByTimeAsync(20)
    expect(requests[0]).toMatchObject({query:'a',trigger:'@'})
    expect(wrapper.get('textarea').attributes('aria-busy')).toBe('true')
    await placeCaret(wrapper,'@ab');await vi.advanceTimersByTimeAsync(20)
    expect(requests[0].signal.aborted).toBe(true)
    requests[1].resolve([{label:'Abby',value:'abby'}]);await Promise.resolve();await nextTick()
    expect(wrapper.get('[role="option"]').text()).toContain('Abby')
    await placeCaret(wrapper,'@a');await vi.advanceTimersByTimeAsync(20)
    requests[2].resolve([{label:'Ada',value:'ada'}]);await Promise.resolve();await nextTick()
    await placeCaret(wrapper,'@ab');await vi.advanceTimersByTimeAsync(20)
    expect(fetchSuggestions).toHaveBeenCalledTimes(3)
    expect(wrapper.get('[role="option"]').text()).toContain('Abby')
  })

  it('invalidates a closing async request instead of caching its late result',async()=>{
    vi.useFakeTimers()
    const requests=[]
    const fetchSuggestions=vi.fn((query,{signal})=>new Promise(resolve=>requests.push({query,signal,resolve})))
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,fetchSuggestions,debounce:10,'aria-label':'Closing request'}})
    await placeCaret(wrapper,'@a');await vi.advanceTimersByTimeAsync(10)
    expect(fetchSuggestions).toHaveBeenCalledTimes(1)
    wrapper.vm.close()
    expect(requests[0].signal.aborted).toBe(true)
    requests[0].resolve([{label:'Late Ada',value:'ada'}]);await Promise.resolve();await nextTick()
    await placeCaret(wrapper,'@a');await vi.advanceTimersByTimeAsync(10)
    expect(fetchSuggestions).toHaveBeenCalledTimes(2)
  })

  it('contains async failures and emits trigger-aware load errors',async()=>{
    const failure=new Error('service unavailable')
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,debounce:0,fetchSuggestions:async()=>{throw failure},'aria-label':'Remote'}})
    await placeCaret(wrapper,'@lan');await Promise.resolve();await nextTick()
    expect(wrapper.get('.ui-mentions-status.error').attributes('role')).toBe('alert')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toEqual({error:failure,query:'lan',trigger:'@'})
  })

  it('supports custom formatting, public insertion and auto sizing',async()=>{
    const wrapper=mount(UiMentions,{props:{modelValue:'',appendToBody:false,autoSize:{minRows:2,maxRows:4},formatMention:(option,meta)=>`[${meta.trigger}${option.value}]`,'aria-label':'Custom'}})
    await placeCaret(wrapper,'Owner @a')
    expect(wrapper.vm.insert({label:'Ada',value:'ada'})).toBe(true)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('Owner [@ada]')
    expect(wrapper.get('textarea').element.style.height).not.toBe('')
    expect(typeof wrapper.vm.focus).toBe('function')
    expect(typeof wrapper.vm.close).toBe('function')
  })

  it('teleports its listbox while retaining combobox ownership',async()=>{
    const observed=[]
    vi.stubGlobal('ResizeObserver',class { observe(node){if(!(node instanceof Element))throw new TypeError('Expected Element');observed.push(node)} disconnect(){} })
    const wrapper=mount(UiMentions,{attachTo:document.body,props:{modelValue:'',options:['Ada'],'aria-label':'Teleported'}})
    await placeCaret(wrapper,'@')
    await nextTick()
    const panel=document.body.querySelector('.ui-mentions-menu.ui-floating-panel')
    expect(panel).not.toBeNull()
    expect(wrapper.get('textarea').attributes('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('role')).toBe('listbox')
    expect(observed).toEqual([panel])
    wrapper.unmount()
  })

  it('keeps disabled and readonly controls immutable',async()=>{
    const disabled=mount(UiMentions,{props:{modelValue:'@a',disabled:true,appendToBody:false,options:['Ada']}})
    expect(disabled.get('textarea').attributes('disabled')).toBeDefined()
    await disabled.get('textarea').trigger('keydown',{key:'ArrowDown'})
    expect(disabled.find('[role="listbox"]').exists()).toBe(false)
    const readonly=mount(UiMentions,{props:{modelValue:'@a',readonly:true,appendToBody:false,options:['Ada']}})
    expect(readonly.get('textarea').attributes('readonly')).toBeDefined()
    await readonly.get('textarea').trigger('focus')
    expect(readonly.find('[role="listbox"]').exists()).toBe(false)
    expect(readonly.emitted('search')).toBeUndefined()
  })
})

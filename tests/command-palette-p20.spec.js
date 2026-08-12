// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import UiCommandPalette from '../src/components/UiCommandPalette.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

const commands=[
  {key:'dashboard',label:'Open dashboard',description:'View business metrics',group:'Navigation',icon:'home',keywords:['home'],shortcut:['G','D']},
  {key:'settings',label:'Project settings',description:'Configure workspace',group:'Navigation',icon:'settings'},
  {key:'invite',label:'Invite member',description:'Add a teammate',group:'Actions',icon:'users'},
  {key:'delete',label:'Delete project',group:'Actions',disabled:true},
]
const wrappers=[]
const render=(props={},slots={})=>{const wrapper=mount(UiCommandPalette,{attachTo:document.body,props:{commands,...props},slots});wrappers.push(wrapper);return wrapper}
afterEach(()=>{for(const wrapper of wrappers.splice(0))wrapper.unmount();document.body.innerHTML='';vi.useRealTimers()})

describe('UiCommandPalette P20',()=>{
  it('renders an accessible grouped dialog and restores focus',async()=>{
    const origin=document.createElement('button');document.body.append(origin);origin.focus()
    const wrapper=render({defaultOpen:true,title:'Workspace commands','aria-label':'Global commands'})
    await nextTick()
    const dialog=document.body.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-label')).toBe('Global commands')
    expect(dialog?.getAttribute('dir')).toBe('ltr')
    expect(document.activeElement?.getAttribute('role')).toBe('combobox')
    expect(document.body.querySelectorAll('[role="group"]')).toHaveLength(2)
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(4)
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({modelValue:false})
    await nextTick();await new Promise(resolve=>setTimeout(resolve,25))
    expect(document.activeElement).toBe(origin)
  })

  it('opens and closes from configurable global shortcuts',async()=>{
    const wrapper=render({clearOnClose:false})
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('supports controlled open and query models',async()=>{
    const wrapper=render({modelValue:false,query:'dash'})
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true,bubbles:true,cancelable:true}))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    await wrapper.setProps({modelValue:true})
    await nextTick()
    const input=document.body.querySelector('[role="combobox"]')
    expect(input.value).toBe('dash')
    input.value='settings';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    expect(wrapper.emitted('update:query')?.at(-1)).toEqual(['settings'])
    await wrapper.setProps({query:'settings'})
    expect(input.value).toBe('settings')
  })

  it('ranks exact, prefix, keyword, description and fuzzy matches',async()=>{
    const wrapper=render({defaultOpen:true,defaultQuery:'home'})
    await nextTick()
    expect(document.body.querySelector('[role="option"]')?.textContent).toContain('Open dashboard')
    const input=document.body.querySelector('input')
    input.value='workspace';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    expect(document.body.querySelector('[role="option"]')?.textContent).toContain('Project settings')
    input.value='ivtm';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    expect(document.body.querySelector('[role="option"]')?.textContent).toContain('Invite member')
  })

  it('navigates enabled commands and selects with the keyboard',async()=>{
    const wrapper=render({defaultOpen:true,clearOnClose:false})
    await nextTick()
    const input=document.body.querySelector('input')
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'End',ctrlKey:true,bubbles:true,cancelable:true}))
    await nextTick()
    expect(input.getAttribute('aria-activedescendant')).toMatch(/option-.*-2$/)
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))
    await nextTick()
    expect(wrapper.emitted('select')?.at(-1)?.[0].key).toBe('invite')
    expect(wrapper.emitted('select')?.at(-1)?.[1]).toEqual({source:'keyboard',query:''})
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('supports pointer selection without closing when configured',async()=>{
    const wrapper=render({defaultOpen:true,closeOnSelect:false})
    await nextTick()
    document.body.querySelectorAll('[role="option"]')[1].click();await nextTick()
    expect(wrapper.emitted('select')?.at(-1)?.[0].key).toBe('settings')
    expect(wrapper.emitted('select')?.at(-1)?.[1].source).toBe('pointer')
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('loads async commands, aborts stale work and caches query results',async()=>{
    vi.useFakeTimers()
    const resolvers=[]
    const fetchCommands=vi.fn((query,{signal})=>new Promise(resolve=>resolvers.push({query,signal,resolve})))
    const wrapper=render({defaultOpen:true,commands:[],fetchCommands,debounce:0,clearOnClose:false})
    await nextTick();expect(fetchCommands).toHaveBeenCalledWith('',expect.objectContaining({signal:expect.any(AbortSignal)}))
    const input=document.body.querySelector('input')
    input.value='a';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    expect(resolvers[0].signal.aborted).toBe(true)
    input.value='ab';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    resolvers[1].resolve([{key:'stale',label:'A stale'}]);resolvers[2].resolve([{key:'fresh',label:'AB fresh result'}])
    await flushPromises()
    expect(document.body.textContent).toContain('AB fresh result')
    expect(document.body.textContent).not.toContain('Stale')
    input.value='a';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick()
    input.value='ab';input.dispatchEvent(new Event('input',{bubbles:true}));await nextTick();await flushPromises()
    expect(fetchCommands.mock.calls.filter(([query])=>query==='ab')).toHaveLength(1)
    wrapper.unmount()
  })

  it('contains async errors and retries on demand',async()=>{
    let fail=true
    const fetchCommands=vi.fn(async()=>{if(fail)throw new Error('offline');return [{key:'retry',label:'Recovered'}]})
    const wrapper=render({defaultOpen:true,commands:[],fetchCommands,debounce:0})
    await flushPromises()
    expect(document.body.querySelector('[role="alert"]')?.textContent).toContain('命令加载失败')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0].error.message).toBe('offline')
    fail=false;document.body.querySelector('[role="alert"] button').click();await flushPromises()
    expect(document.body.textContent).toContain('Recovered')
    expect(fetchCommands).toHaveBeenCalledTimes(2)
  })

  it('honors minimum query length and maximum result count',async()=>{
    const fetchCommands=vi.fn(async()=>[])
    render({defaultOpen:true,fetchCommands,minChars:2,maxResults:2,debounce:0})
    await nextTick();expect(fetchCommands).not.toHaveBeenCalled()
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(2)
    const input=document.body.querySelector('input');input.value='op';input.dispatchEvent(new Event('input',{bubbles:true}));await flushPromises()
    expect(fetchCommands).toHaveBeenCalledTimes(1)
  })

  it('emits deterministic duplicate and missing key diagnostics',async()=>{
    const wrapper=render({commands:[{label:'Missing'},{key:'same',label:'One'},{key:'same',label:'Two'}]})
    await nextTick()
    expect(wrapper.emitted('data-error')?.at(-1)?.[0].errors.map(error=>error.code)).toEqual(['missing-key','duplicate-key'])
  })

  it('supports every content slot contract',async()=>{
    render({defaultOpen:true},{
      trigger:({toggle})=>h('button',{class:'custom-trigger',onClick:toggle},'Toggle'),
      header:()=>h('strong',{class:'custom-header'},'Header'),
      group:({group})=>h('span',{class:'custom-group'},group),
      command:({command})=>h('span',{class:'custom-command'},command.label),
      footer:()=>h('span',{class:'custom-footer'},'Footer'),
    })
    await nextTick()
    expect(document.querySelectorAll('.custom-group')).toHaveLength(2)
    expect(document.querySelectorAll('.custom-command')).toHaveLength(4)
    expect(document.querySelector('.custom-header')?.textContent).toBe('Header')
    expect(document.querySelector('.custom-footer')?.textContent).toBe('Footer')
  })

  it('inherits locale direction and copy',async()=>{
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{locale:'en-US',direction:'rtl'},slots:{default:()=>h(UiCommandPalette,{defaultOpen:true,commands:[]})}});wrappers.push(wrapper)
    await nextTick()
    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('dir')).toBe('rtl')
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('Quick commands')
    expect(document.body.querySelector('input')?.placeholder).toBe('Search commands')
  })

  it('traps tab focus and closes only the top overlay with Escape',async()=>{
    const wrapper=render({defaultOpen:true,clearOnClose:false})
    await nextTick()
    const close=document.body.querySelector('.ui-command-close');close.focus()
    close.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));await nextTick()
    expect(document.activeElement?.getAttribute('role')).toBe('option')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await nextTick()
    expect(wrapper.emitted('close')?.at(-1)).toEqual([{source:'escape'}])
  })
})

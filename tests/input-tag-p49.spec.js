// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiInputTag from '../src/components/UiInputTag.vue'
import UiSchemaForm from '../src/components/UiSchemaForm.vue'

const wrappers=[]
function render(props={}){
  let wrapper
  wrapper=mount(UiInputTag,{attachTo:document.body,props:{...props,'onUpdate:modelValue':value=>wrapper.setProps({modelValue:value})}})
  wrappers.push(wrapper)
  return wrapper
}
async function flush(){await Promise.resolve();await Promise.resolve();await nextTick()}
afterEach(()=>{while(wrappers.length)wrappers.pop()?.unmount();document.body.innerHTML='';vi.restoreAllMocks()})

describe('P49 UiInputTag',()=>{
  it('inherits FormItem labelling, validation and localized placeholder text',()=>{
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Topics',help:'Add searchable topics',error:'At least one topic is required'},{default:()=>h(UiInputTag,{modelValue:[]})})}})
    wrappers.push(wrapper)
    const input=wrapper.get('.ui-input-tag-native')
    const label=wrapper.get('label')
    expect(input.attributes('id')).toBe(label.attributes('for'))
    expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('placeholder')).toBe('Type a tag and press Enter')
  })

  it('is available as a managed schema-form field',async()=>{
    const model={topics:[]}
    const wrapper=mount(UiSchemaForm,{attachTo:document.body,props:{model,schema:[{name:'topics',type:'input-tag',label:'Topics',props:{maxTags:3}}]}})
    wrappers.push(wrapper)
    const input=wrapper.get('.ui-input-tag-native')
    await input.setValue('design');await input.trigger('keydown',{key:'Enter'});await flush()
    expect(model.topics).toEqual(['design'])
    expect(wrapper.emitted('field-change')?.at(-1)?.[0]).toMatchObject({name:'topics',value:['design']})
  })

  it('adds normalized tags with Enter and typed separators',async()=>{
    const wrapper=render({modelValue:[]})
    const input=wrapper.get('.ui-input-tag-native')
    await input.setValue('  Vue  ');await input.trigger('keydown',{key:'Enter'});await flush()
    expect(wrapper.props('modelValue')).toEqual(['Vue'])
    await input.setValue('Design，System；');await flush()
    expect(wrapper.props('modelValue')).toEqual(['Vue','Design','System'])
    expect(wrapper.emitted('add')?.map(event=>event[0])).toEqual(['Vue','Design','System'])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'separator',added:['Design','System']})
  })

  it('tokenizes multiline clipboard input and rejects case-insensitive duplicates',async()=>{
    const wrapper=render({modelValue:['Vue']})
    const input=wrapper.get('.ui-input-tag-native')
    await input.trigger('paste',{clipboardData:{getData:()=> 'React, vue\nTypeScript;  CSS  '}});await flush()
    expect(wrapper.props('modelValue')).toEqual(['Vue','React','TypeScript','CSS'])
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({value:'vue',reason:'duplicate',source:'paste'})
  })

  it('defers separator processing while an IME composition is active',async()=>{
    const wrapper=render({modelValue:[]})
    const input=wrapper.get('.ui-input-tag-native')
    await input.trigger('compositionstart')
    input.element.value='设计，'
    await input.trigger('input',{isComposing:true})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.trigger('compositionend');await flush()
    expect(wrapper.props('modelValue')).toEqual(['设计'])
  })

  it('arms then removes the last tag with Backspace and respects RTL arrows',async()=>{
    const wrapper=render({modelValue:['one','two','three']})
    const input=wrapper.get('.ui-input-tag-native')
    input.element.focus();input.element.setSelectionRange(0,0)
    await input.trigger('keydown',{key:'Backspace'})
    expect(wrapper.findAll('.ui-input-tag-chip')[2].classes()).toContain('active')
    await input.trigger('keydown',{key:'Backspace'});await flush()
    expect(wrapper.props('modelValue')).toEqual(['one','two'])
    wrapper.unmount();wrappers.pop()
    const rtl=mount(UiConfigProvider,{attachTo:document.body,props:{direction:'rtl'},slots:{default:()=>h(UiInputTag,{modelValue:['يمين','يسار'],'onUpdate:modelValue':()=>{}})}})
    wrappers.push(rtl)
    const rtlInput=rtl.get('.ui-input-tag-native');rtlInput.element.focus();rtlInput.element.setSelectionRange(0,0)
    await rtlInput.trigger('keydown',{key:'ArrowRight'})
    expect(rtl.findAll('.ui-input-tag-chip')[1].classes()).toContain('active')
    await rtlInput.trigger('keydown',{key:'ArrowLeft'})
    expect(rtl.findAll('.ui-input-tag-chip').some(chip=>chip.classes().includes('active'))).toBe(false)
  })

  it('reports maximum, length and validation failures without mutating values',async()=>{
    const validate=vi.fn(value=>value.startsWith('ok')||'Tags must start with ok')
    const wrapper=render({modelValue:['ok-one'],maxTags:2,maxLength:8,validate})
    const input=wrapper.get('.ui-input-tag-native')
    await input.setValue('too-long-tag');await input.trigger('keydown',{key:'Enter'});await flush()
    await input.setValue('bad');await input.trigger('keydown',{key:'Enter'});await flush()
    await input.setValue('ok-two');await input.trigger('keydown',{key:'Enter'});await flush()
    await input.setValue('ok-three');await input.trigger('keydown',{key:'Enter'});await flush()
    expect(wrapper.props('modelValue')).toEqual(['ok-one','ok-two'])
    expect(wrapper.emitted('invalid')?.map(event=>event[0].reason)).toEqual(['tooLong','validationFailed','maxReached'])
    expect(wrapper.emitted('invalid')?.[1]?.[0].message).toBe('Tags must start with ok')
  })

  it('serializes asynchronous beforeAdd checks and exposes busy semantics',async()=>{
    let release
    const first=new Promise(resolve=>{release=resolve})
    const beforeAdd=vi.fn(value=>value==='alpha'?first:true)
    const wrapper=render({modelValue:[],beforeAdd})
    const input=wrapper.get('.ui-input-tag-native')
    await input.setValue('alpha');await input.trigger('keydown',{key:'Enter'})
    await input.setValue('beta');await input.trigger('keydown',{key:'Enter'})
    expect(input.attributes('aria-busy')).toBe('true')
    expect(beforeAdd).toHaveBeenCalledTimes(1)
    release(true);await flush();await flush();await new Promise(resolve=>setTimeout(resolve,0));await nextTick()
    expect(beforeAdd).toHaveBeenCalledTimes(2)
    expect(wrapper.props('modelValue')).toEqual(['alpha','beta'])
    expect(input.attributes('aria-busy')).toBeUndefined()
  })

  it('supports editable tags, removal and clear metadata',async()=>{
    const wrapper=render({modelValue:['Vue','React'],editable:true,clearable:true})
    await wrapper.findAll('.ui-input-tag-chip')[0].trigger('dblclick');await nextTick()
    const edit=wrapper.get('.ui-input-tag-edit')
    await edit.setValue('Vue 4');await edit.trigger('keydown',{key:'Enter'});await flush()
    expect(wrapper.props('modelValue')).toEqual(['Vue 4','React'])
    expect(wrapper.emitted('edit')?.at(-1)?.[1]).toMatchObject({index:0,previous:'Vue',source:'edit-enter'})
    await wrapper.findAll('.ui-input-tag-remove')[1].trigger('click');await flush()
    expect(wrapper.props('modelValue')).toEqual(['Vue 4'])
    await wrapper.get('.ui-input-tag-clear').trigger('click');await flush()
    expect(wrapper.props('modelValue')).toEqual([])
    expect(wrapper.emitted('clear')?.at(-1)?.[0]).toMatchObject({source:'button',previous:['Vue 4']})
  })

  it('adds a draft on blur and expands collapsed tags on focus',async()=>{
    const wrapper=render({modelValue:['one','two','three','four'],collapseTags:true,maxVisibleTags:2})
    expect(wrapper.get('.ui-input-tag-collapsed').text()).toBe('+2')
    const input=wrapper.get('.ui-input-tag-native')
    await input.trigger('focus');await nextTick()
    expect(wrapper.find('.ui-input-tag-collapsed').exists()).toBe(false)
    await input.setValue('five');await input.trigger('blur');await flush()
    expect(wrapper.props('modelValue')).toEqual(['one','two','three','four','five'])
  })

  it('submits one hidden field per tag and supports a custom tag slot',()=>{
    const wrapper=mount(UiInputTag,{props:{modelValue:['design','system'],name:'topics'},slots:{tag:({tag})=>h('strong',tag.toUpperCase())}})
    wrappers.push(wrapper)
    expect(wrapper.findAll('input[type="hidden"]')).toHaveLength(2)
    expect(wrapper.findAll('input[type="hidden"]').map(input=>[input.attributes('name'),input.attributes('value')])).toEqual([['topics','design'],['topics','system']])
    expect(wrapper.findAll('strong').map(node=>node.text())).toEqual(['DESIGN','SYSTEM'])
  })

  it('keeps disabled and readonly controls immutable',async()=>{
    const disabled=render({modelValue:['fixed'],disabled:true,clearable:true})
    expect(disabled.get('.ui-input-tag-native').attributes('disabled')).toBeDefined()
    expect(disabled.find('.ui-input-tag-remove').exists()).toBe(false)
    expect(await disabled.vm.add('next')).toEqual([])
    const readonly=render({modelValue:['fixed'],readonly:true,editable:true})
    expect(readonly.get('.ui-input-tag-native').attributes('readonly')).toBeDefined()
    expect(readonly.find('.ui-input-tag-remove').exists()).toBe(false)
    expect(readonly.vm.remove(0)).toBe(false)
  })

  it('exposes imperative methods and renders deterministic SSR markup',async()=>{
    const wrapper=render({modelValue:['alpha'],editable:true})
    expect(wrapper.vm.focus()).toBe(true)
    expect(await wrapper.vm.add(['beta','gamma'])).toEqual(['beta','gamma']);await flush()
    expect(wrapper.props('modelValue')).toEqual(['alpha','beta','gamma'])
    expect(wrapper.vm.edit(1)).toBe(true);await nextTick();expect(wrapper.find('.ui-input-tag-edit').exists()).toBe(true)
    wrapper.vm.cancelEdit();expect(wrapper.vm.remove(2,'api')).toBe(true);await flush()
    const html=await renderToString(createSSRApp({render:()=>h(UiInputTag,{modelValue:['ssr','stable'],name:'tags',ariaLabel:'Build tags'})}))
    expect(html).toContain('class="ui-input-tag')
    expect(html).toContain('aria-label="Build tags"')
    expect(html.match(/type="hidden"/g)).toHaveLength(2)
    expect(html).toContain('value="stable"')
  })
})

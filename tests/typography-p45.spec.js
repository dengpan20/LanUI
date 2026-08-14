// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiTypography from '../src/components/UiTypography.vue'

const wrappers=[]
const clipboardDescriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard')

afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  if(clipboardDescriptor)Object.defineProperty(navigator,'clipboard',clipboardDescriptor)
  else delete navigator.clipboard
})

function render(props={},slots={}){
  const wrapper=mount(UiTypography,{props,slots})
  wrappers.push(wrapper)
  return wrapper
}

describe('P45 UiTypography',()=>{
  it('renders semantic headings and the full visual modifier contract',()=>{
    const wrapper=render({content:'Release evidence',variant:'title',level:3,tone:'primary',size:'lg',weight:'bold',align:'center',mark:true,underline:true,italic:true})
    expect(wrapper.element.tagName).toBe('H3')
    expect(wrapper.attributes('data-ui-typography')).toBe('title')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['variant-title','level-3','tone-primary','size-lg','weight-bold','align-center','mark','underline','italic']))
    expect(wrapper.text()).toContain('Release evidence')
  })

  it('copies explicit or slotted text and announces success',async()=>{
    const writeText=vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}})
    const wrapper=render({content:'Visible value',copyable:{text:'Canonical value'},copyDuration:10000})
    await wrapper.find('.ui-typography-action').trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('Canonical value')
    expect(wrapper.emitted('copy')?.[0]?.[0]).toEqual({text:'Canonical value',source:'button'})
    expect(wrapper.find('.ui-typography-action').classes()).toContain('copied')
    expect(wrapper.find('[aria-live="polite"]').text()).not.toBe('')
  })

  it('emits a structured copy error without reporting success',async()=>{
    const error=new Error('denied')
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:vi.fn().mockRejectedValue(error)}})
    const wrapper=render({content:'Protected',copyable:true})
    expect(await wrapper.vm.copy('api')).toBe(false)
    expect(wrapper.emitted('copy')).toBeUndefined()
    expect(wrapper.emitted('copy-error')?.[0]?.[0]).toMatchObject({text:'Protected',source:'api',error})
  })

  it('detects multiline overflow and supports controlled expansion',async()=>{
    const wrapper=render({content:'A long release note that occupies more than two rendered lines.',variant:'paragraph',ellipsis:{rows:2,expandable:true},expanded:false})
    const content=wrapper.find('.ui-typography-content').element
    Object.defineProperties(content,{scrollHeight:{configurable:true,value:90},clientHeight:{configurable:true,value:40}})
    expect(wrapper.vm.measureOverflow()).toBe(true)
    await nextTick()
    const button=wrapper.find('.ui-typography-action.is-expand')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    expect(wrapper.emitted('update:expanded')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('expand')?.[0]?.[0]).toEqual({expanded:true,source:'button',rows:2})
  })

  it('edits text with keyboard commit and structured previous value metadata',async()=>{
    const wrapper=render({content:'Draft title',variant:'title',level:4,editable:true})
    await wrapper.find('.ui-typography-action').trigger('click')
    const input=wrapper.find('.ui-typography-editor-control')
    expect(input.exists()).toBe(true)
    await input.setValue('Approved title')
    await input.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:content')?.[0]?.[0]).toBe('Approved title')
    expect(wrapper.emitted('edit-end')?.[0]?.[0]).toEqual({value:'Approved title',previous:'Draft title',source:'keyboard'})
    expect(wrapper.emitted('update:editing')?.map(entry=>entry[0])).toEqual([true,false])
  })

  it('supports paragraph cancellation, maximum length and text-trigger editing',async()=>{
    const wrapper=render({content:'Original',variant:'paragraph',editable:{trigger:'text',maxLength:8}})
    await wrapper.find('.ui-typography-content').trigger('dblclick')
    const textarea=wrapper.find('textarea')
    expect(textarea.attributes('maxlength')).toBe('8')
    await textarea.setValue('Temporary')
    await textarea.trigger('keydown',{key:'Escape'})
    expect(wrapper.emitted('edit-cancel')?.[0]?.[0]).toEqual({value:'Original',source:'keyboard'})
    expect(wrapper.emitted('update:content')).toBeUndefined()
  })

  it('keeps disabled actions discoverable but immutable',async()=>{
    const wrapper=render({content:'Immutable',copyable:true,editable:true,ellipsis:{rows:1,expandable:true},disabled:true})
    const content=wrapper.find('.ui-typography-content').element
    Object.defineProperties(content,{scrollWidth:{configurable:true,value:200},clientWidth:{configurable:true,value:80}})
    wrapper.vm.measureOverflow();await nextTick()
    expect(wrapper.findAll('button')).toHaveLength(3)
    expect(wrapper.findAll('button').every(button=>button.attributes('disabled')!==undefined)).toBe(true)
    expect(wrapper.vm.startEdit()).toBe(false)
    expect(await wrapper.vm.copy()).toBe(false)
  })

  it('renders deterministic semantic SSR markup and slot content',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiTypography,{variant:'paragraph',tone:'secondary',copyable:true,ariaLabel:'Release summary'},{default:()=>h('strong','Server-rendered summary')})}))
    expect(html).toContain('<p')
    expect(html).toContain('data-ui-typography="paragraph"')
    expect(html).toContain('aria-label="Release summary"')
    expect(html).toContain('Server-rendered summary')
    expect(html).toContain('ui-typography-action')
  })
})

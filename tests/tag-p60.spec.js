// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiTag from '../src/components/UiTag.vue'

describe('P60 UiTag maturity contract',()=>{
  it('keeps legacy color, dot and default slot rendering compatible',()=>{
    const wrapper=mount(UiTag,{props:{color:'green',dot:true},slots:{default:()=> 'Ready'}})
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['tag','ui-tag','tag-green','variant-soft','size-md']))
    expect(wrapper.attributes('data-ui-tag')).toBe('')
    expect(wrapper.get('.status-dot').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toBe('Ready')
  })

  it('supports variants, sizes, rounded presentation and the legacy type alias',()=>{
    const wrapper=mount(UiTag,{props:{type:'purple',color:'blue',variant:'solid',size:'lg',round:true}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['tag-purple','variant-solid','size-lg','round']))
    expect(wrapper.attributes('data-color')).toBe('purple')
    const custom=mount(UiTag,{props:{color:'#0f766e',variant:'outlined'}})
    expect(custom.classes()).toContain('tag-custom')
    expect(custom.attributes('style')).toContain('--ui-tag-color: #0f766e')
  })

  it('preserves passive click listeners for non-interactive tags',async()=>{
    const wrapper=mount(UiTag,{slots:{default:()=> 'Passive'}})
    await wrapper.trigger('click',{detail:1})
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('publishes controlled selection and pointer activation metadata',async()=>{
    const wrapper=mount(UiTag,{props:{checkable:true,checked:false},slots:{default:({checked})=>`Selected ${checked}`}})
    const button=wrapper.get('button.ui-tag-main')
    expect(button.attributes('aria-pressed')).toBe('false')
    await button.trigger('click',{detail:1})
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.[0]?.[1]).toEqual({source:'pointer',checked:true,href:undefined,previous:false})
    expect(wrapper.emitted('activate')?.[0]?.[0].source).toBe('pointer')
  })

  it('uses keyboard source metadata for native keyboard activation',async()=>{
    const wrapper=mount(UiTag,{props:{interactive:true},slots:{default:()=> 'Open'}})
    await wrapper.get('button.ui-tag-main').trigger('click',{detail:0})
    expect(wrapper.emitted('activate')?.[0]?.[0]).toEqual({source:'keyboard',checked:false,href:undefined})
  })

  it('emits localized close metadata without activating the label',async()=>{
    const wrapper=mount(UiTag,{props:{color:'red',closable:true,checked:true},slots:{default:()=> 'Failed'}})
    const close=wrapper.get('button.ui-tag-close')
    expect(close.attributes('aria-label')).toBe('移除标签')
    await close.trigger('click',{detail:1})
    expect(wrapper.emitted('close')?.[0]?.[0]).toEqual({source:'pointer',color:'red',checked:true})
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders secure link tags and removes navigation while disabled',async()=>{
    const active=mount(UiTag,{props:{href:'https://example.com/release',target:'_blank'},slots:{default:()=> 'Release'}})
    const link=active.get('a.ui-tag-main')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    const disabled=mount(UiTag,{props:{href:'#blocked',disabled:true,closable:true},slots:{default:()=> 'Blocked'}})
    expect(disabled.get('a.ui-tag-main').attributes('href')).toBeUndefined()
    expect(disabled.get('a.ui-tag-main').attributes('aria-disabled')).toBe('true')
    expect(disabled.get('button.ui-tag-close').attributes('disabled')).toBe('')
    await disabled.get('a.ui-tag-main').trigger('click')
    expect(disabled.emitted('activate')).toBeUndefined()
  })

  it('exposes label and close focus methods',()=>{
    const wrapper=mount(UiTag,{attachTo:document.body,props:{checkable:true,closable:true},slots:{default:()=> 'Focus'}})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('.ui-tag-main').element)
    expect(wrapper.vm.focusClose()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('.ui-tag-close').element)
    wrapper.unmount()
  })

  it('supports structured scoped slots',()=>{
    const wrapper=mount(UiTag,{props:{checked:true,closable:true},slots:{prefix:({checked})=>h('i',String(checked)),default:({disabled})=>String(disabled),suffix:()=>h('b','suffix'),'close-icon':()=>h('span','remove')}})
    expect(wrapper.text()).toContain('truefalsesuffixremove')
  })

  it('renders selection, close and link contracts during SSR',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiTag,{color:'purple',variant:'solid',checkable:true,checked:true,closable:true},()=> 'SSR tag')}))
    expect(html).toContain('data-ui-tag')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-label="移除标签"')
    expect(html).toContain('SSR tag')
  })
})

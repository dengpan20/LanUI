// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiCard from '../src/components/UiCard.vue'

describe('P59 UiCard maturity contract',()=>{
  it('renders labelled title, subtitle, actions, cover and footer regions',()=>{
    const wrapper=mount(UiCard,{
      props:{title:'Release evidence',subtitle:'Verified moments ago',titleTag:'h2',size:'lg',variant:'outlined',shadow:'none'},
      slots:{
        cover:()=>h('img',{src:'data:image/gif;base64,R0lGODlhAQABAAAAACw=',alt:'Release cover'}),
        action:()=>h('button',{type:'button'},'Refresh'),
        default:()=>h('p','Runtime evidence'),
        footer:()=>h('span','Updated now'),
      },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-ui-card')).toBe('')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ui-card','size-lg','variant-outlined','shadow-none']))
    expect(wrapper.get('h2').text()).toContain('Release evidence')
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
    expect(wrapper.attributes('aria-describedby')).toBe(wrapper.get('.ui-card-subtitle').attributes('id'))
    expect(wrapper.get('.ui-card-actions').text()).toBe('Refresh')
    expect(wrapper.get('.ui-card-cover img').attributes('alt')).toBe('Release cover')
    expect(wrapper.get('.ui-card-footer').text()).toBe('Updated now')
  })

  it('emits compatible click and pointer activation metadata',async()=>{
    const wrapper=mount(UiCard,{props:{title:'Customer',interactive:true,selected:true},slots:{default:()=>h('p',{class:'card-copy'},'Customer details')}})
    expect(wrapper.element.tagName).toBe('DIV')
    await wrapper.get('.card-copy').trigger('click',{detail:1})
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('activate')?.[0]?.[0]).toEqual({source:'pointer',href:undefined,selected:true})
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
  })

  it('supports Enter and Space activation without duplicate click events',async()=>{
    const wrapper=mount(UiCard,{props:{title:'Keyboard card',interactive:true}})
    await wrapper.trigger('keydown',{key:'Enter'})
    await wrapper.trigger('keydown',{key:' '})
    expect(wrapper.emitted('activate')?.map(event=>event[0].source)).toEqual(['keyboard','keyboard'])
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('uses secure link defaults and removes navigation while disabled',async()=>{
    const active=mount(UiCard,{props:{title:'Documentation',href:'https://example.com/docs',target:'_blank'}})
    expect(active.element.tagName).toBe('A')
    expect(active.attributes('href')).toBe('https://example.com/docs')
    expect(active.attributes('rel')).toBe('noopener noreferrer')
    const disabled=mount(UiCard,{props:{title:'Unavailable',href:'#blocked',disabled:true}})
    expect(disabled.attributes('href')).toBeUndefined()
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.attributes('tabindex')).toBe('-1')
    await disabled.trigger('click')
    expect(disabled.emitted('activate')).toBeUndefined()
  })

  it('does not activate the card when a nested control is used',async()=>{
    const wrapper=mount(UiCard,{
      props:{title:'Actions',interactive:true},
      slots:{default:()=>h('button',{type:'button',class:'nested-action'},'Edit')},
    })
    await wrapper.get('.nested-action').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('exposes localized loading state without stale body or footer content',()=>{
    const wrapper=mount(UiCard,{props:{title:'Loading card',loading:true,loadingRows:4},slots:{default:()=>h('p','Stale body'),footer:()=>h('span','Stale footer')}})
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('.ui-card-skeleton')).toHaveLength(4)
    expect(wrapper.text()).toContain('加载中')
    expect(wrapper.text()).not.toContain('Stale body')
    expect(wrapper.text()).not.toContain('Stale footer')
  })

  it('supports custom loading and scoped composition slots',()=>{
    const wrapper=mount(UiCard,{
      props:{title:'Custom loading',loading:true,loadingRows:2},
      slots:{loading:({rows})=>h('div',{class:'custom-loading'},`Rows ${rows}`)},
    })
    expect(wrapper.get('.custom-loading').text()).toBe('Rows 2')
  })

  it('exposes focus, blur and reduced-motion-aware scrolling methods',async()=>{
    const wrapper=mount(UiCard,{attachTo:document.body,props:{title:'Focusable',interactive:true}})
    const scrollIntoView=vi.fn()
    wrapper.element.scrollIntoView=scrollIntoView
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.element)
    expect(wrapper.vm.scrollIntoView()).toBe(true)
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({block:'nearest'}))
    expect(wrapper.vm.blur()).toBe(true)
    wrapper.unmount()
  })

  it('keeps custom heading slots dependent on an explicit accessible label',()=>{
    const wrapper=mount(UiCard,{props:{ariaLabel:'Release status'},slots:{header:()=>h('strong','Custom heading'),default:()=>h('span','Body')}})
    expect(wrapper.attributes('aria-label')).toBe('Release status')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
  })

  it('renders the interactive contract during SSR',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiCard,{title:'SSR card',subtitle:'Server rendered',interactive:true,selected:true,variant:'elevated'},()=>h('p','Hydration ready'))}))
    expect(html).toContain('data-ui-card')
    expect(html).toContain('role="button"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('Hydration ready')
  })
})

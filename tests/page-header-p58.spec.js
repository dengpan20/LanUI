// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import UiButton from '../src/components/UiButton.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiPageHeader from '../src/components/UiPageHeader.vue'

const wrappers=[]
afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  vi.restoreAllMocks()
})
function render(props={},slots={},options={}){
  const wrapper=mount(UiPageHeader,{props,slots,...options})
  wrappers.push(wrapper)
  return wrapper
}

const breadcrumbs=[{label:'Workspace',href:'#/workbench'},{label:'Release details'}]

describe('P58 UiPageHeader',()=>{
  it('renders semantic title, description, breadcrumb and action regions',()=>{
    const wrapper=render(
      {title:'Release details',description:'Review the current deployment.',breadcrumbs,bordered:true,size:'lg'},
      {actions:()=>h(UiButton,'Publish'),meta:()=>h('span',{class:'release-meta'},'Updated now'),footer:()=>h('nav',{class:'release-tabs'},'Overview')},
    )
    const title=wrapper.get('h1')
    expect(wrapper.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['size-lg','bordered']))
    expect(wrapper.get('.ui-page-header-description').text()).toBe('Review the current deployment.')
    expect(wrapper.findAll('.ui-breadcrumb li')).toHaveLength(2)
    expect(wrapper.get('.ui-breadcrumb').attributes('aria-label')).toBe('Release details: 面包屑导航')
    expect(wrapper.get('.ui-page-header-actions').text()).toContain('Publish')
    expect(wrapper.get('.release-meta').text()).toBe('Updated now')
    expect(wrapper.get('.release-tabs').text()).toBe('Overview')
  })

  it('emits pointer and keyboard back metadata and exposes focus control',async()=>{
    const wrapper=render({title:'Editor',showBack:true,backLabel:'Return to list'}, {}, {attachTo:document.body})
    const back=wrapper.get('.ui-page-header-back')
    expect(back.attributes('aria-label')).toBe('Return to list')
    await back.trigger('click',{detail:1})
    await back.trigger('click',{detail:0})
    expect(wrapper.emitted('back')?.map(event=>event[0])).toEqual([{source:'pointer',href:undefined},{source:'keyboard',href:undefined}])
    expect(wrapper.vm.focusBack()).toBe(true)
    expect(document.activeElement).toBe(back.element)
  })

  it('supports link back behavior and keeps disabled navigation inert',async()=>{
    const wrapper=render({title:'Order',backHref:'#/orders'})
    const link=wrapper.get('a.ui-page-header-back')
    expect(link.attributes('href')).toBe('#/orders')
    await link.trigger('click',{detail:1})
    expect(wrapper.emitted('back')?.[0]?.[0]).toEqual({source:'pointer',href:'#/orders'})
    await wrapper.setProps({backDisabled:true})
    expect(link.attributes('aria-disabled')).toBe('true')
    expect(link.attributes('href')).toBeUndefined()
    expect(wrapper.vm.focusBack()).toBe(false)
  })

  it('forwards breadcrumb navigation with a stable item index',async()=>{
    const wrapper=render({title:'Release details',breadcrumbs})
    await wrapper.get('.ui-breadcrumb a').trigger('click')
    expect(wrapper.emitted('breadcrumb-navigate')?.[0]?.[0]).toEqual({item:breadcrumbs[0],index:0})
  })

  it('applies sticky offset and passthrough root attributes',()=>{
    const wrapper=render({title:'Sticky configuration',sticky:true,stickyOffset:48,ariaLabel:'Configuration heading'}, {}, {attrs:{id:'release-heading','data-tenant':'north'}})
    expect(wrapper.classes()).toContain('sticky')
    expect(wrapper.attributes('id')).toBe('release-heading')
    expect(wrapper.attributes('data-tenant')).toBe('north')
    expect(wrapper.attributes('aria-label')).toBe('Configuration heading')
    expect(wrapper.element.style.getPropertyValue('--ui-page-header-sticky-offset')).toBe('48px')
  })

  it('renders a localized busy state without stale labelled-by references',()=>{
    const wrapper=mount({render:()=>h(UiConfigProvider,{locale:'en-US'},()=>h(UiPageHeader,{title:'Loading release',loading:true}))})
    wrappers.push(wrapper)
    const header=wrapper.get('.ui-page-header')
    expect(header.attributes('aria-busy')).toBe('true')
    expect(header.attributes('aria-labelledby')).toBeUndefined()
    expect(header.text()).toContain('Loading')
    expect(header.findAll('.ui-page-header-skeleton')).toHaveLength(3)
  })

  it('supports custom breadcrumb, title, description, back icon and loading slots',async()=>{
    const wrapper=render(
      {title:'Canonical title',description:'Canonical description',breadcrumbs,showBack:true},
      {
        breadcrumb:({items})=>h('div',{class:'custom-breadcrumb'},`${items.length} levels`),
        'back-icon':()=>h('span',{class:'custom-back'},'←'),
        title:({title})=>h('span',{class:'custom-title'},title.toUpperCase()),
        description:({description})=>h('strong',{class:'custom-description'},description),
      },
    )
    expect(wrapper.get('.custom-breadcrumb').text()).toBe('2 levels')
    expect(wrapper.get('.custom-title').text()).toBe('CANONICAL TITLE')
    expect(wrapper.get('.custom-description').text()).toBe('Canonical description')
    expect(wrapper.get('.custom-back').text()).toBe('←')
    await wrapper.setProps({loading:true})
    expect(wrapper.find('.custom-title').exists()).toBe(false)
  })

  it('exposes deterministic scrolling and refuses unavailable focus',()=>{
    const wrapper=render({title:'Audit'})
    wrapper.element.scrollIntoView=vi.fn()
    expect(wrapper.vm.scrollIntoView({block:'center',behavior:'auto'})).toBe(true)
    expect(wrapper.element.scrollIntoView).toHaveBeenCalledWith({block:'center',behavior:'auto'})
    expect(wrapper.vm.focusBack()).toBe(false)
  })

  it('provides an accessible fallback when no title is supplied',()=>{
    const wrapper=render({description:'Context without a visible title'})
    expect(wrapper.attributes('aria-label')).toBe('页面标题')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
  })

  it('renders SSR-safe heading, breadcrumb and back-link markup',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiPageHeader,{title:'Server release',description:'SSR contract',breadcrumbs,backHref:'#/releases',bordered:true})}))
    expect(html).toContain('data-ui-page-header')
    expect(html).toContain('class="ui-page-header')
    expect(html).toContain('<h1')
    expect(html).toContain('Server release')
    expect(html).toContain('href="#/releases"')
    expect(html).toContain('aria-current="page"')
  })
})

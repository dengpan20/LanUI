// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiBreadcrumb from '../src/components/UiBreadcrumb.vue'

const items=[
  {key:'home',label:'Home',href:'#home',icon:'home'},
  {key:'workspace',label:'Workspace',href:'#workspace'},
  {key:'project',label:'Project',href:'#project'},
  {key:'components',label:'Components',href:'#components'},
  {key:'breadcrumb',label:'Breadcrumb'},
]

describe('P63 UiBreadcrumb maturity contract',()=>{
  it('keeps legacy semantic navigation and current-page behavior',()=>{
    const wrapper=mount(UiBreadcrumb,{props:{items:items.slice(0,3)}})
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('data-ui-breadcrumb')).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('面包屑导航')
    expect(wrapper.findAll('ol > li')).toHaveLength(3)
    expect(wrapper.findAll('.ui-breadcrumb-separator')).toHaveLength(2)
    expect(wrapper.findAll('a.ui-breadcrumb-item')).toHaveLength(2)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('Project')
  })

  it('adapts domain records and resolves explicit current keys',()=>{
    const records=[{id:7,name:'Overview',url:'#overview',glyph:'home'},{id:8,name:'Audit',url:'#audit'}]
    const wrapper=mount(UiBreadcrumb,{props:{items:records,itemKey:'id',labelField:'name',hrefField:item=>item.url,iconField:'glyph',currentKey:7}})
    expect(wrapper.get('[data-key="7"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[data-key="7"] svg[data-ui-icon="home"]').exists()).toBe(true)
    expect(wrapper.get('[data-key="8"]').attributes('href')).toBe('#audit')
  })

  it('collapses long paths and expands with pointer metadata',async()=>{
    const wrapper=mount(UiBreadcrumb,{props:{items,maxItems:4,itemsBeforeCollapse:1,itemsAfterCollapse:2}})
    expect(wrapper.classes()).toContain('is-collapsed')
    expect(wrapper.findAll('.ui-breadcrumb-node')).toHaveLength(4)
    expect(wrapper.get('.ui-breadcrumb-overflow').attributes('aria-label')).toBe('展开中间 2 级路径')
    await wrapper.get('.ui-breadcrumb-overflow').trigger('click',{detail:1})
    expect(wrapper.classes()).not.toContain('is-collapsed')
    expect(wrapper.findAll('.ui-breadcrumb-node')).toHaveLength(5)
    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([true])
    expect(wrapper.emitted('expand-change')?.[0]?.slice(0,2)).toEqual([true,expect.objectContaining({expanded:true,previous:false,source:'pointer',hiddenCount:2})])
  })

  it('supports controlled expansion without mutating local state',async()=>{
    const wrapper=mount(UiBreadcrumb,{props:{items,maxItems:3,expanded:false}})
    await wrapper.get('.ui-breadcrumb-overflow').trigger('click')
    expect(wrapper.classes()).toContain('is-collapsed')
    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([true])
    await wrapper.setProps({expanded:true})
    expect(wrapper.classes()).not.toContain('is-collapsed')
  })

  it('emits stable navigation metadata, invokes callbacks and secures blank links',async()=>{
    const onClick=vi.fn()
    const linked=[{key:'docs',label:'Docs',href:'https://example.com',target:'_blank'},{key:'action',label:'Action',onClick},{key:'blocked',label:'Blocked',href:'#blocked',disabled:true},{key:'current',label:'Current'}]
    const wrapper=mount(UiBreadcrumb,{props:{items:linked}})
    expect(wrapper.get('a').attributes('rel')).toBe('noopener noreferrer')
    await wrapper.get('a').trigger('click',{detail:1})
    await wrapper.get('button[data-key="action"]').trigger('click',{detail:0})
    expect(onClick).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({key:'action',source:'keyboard'}))
    expect(wrapper.emitted('navigate')?.[1]?.slice(0,2)).toEqual([linked[1],expect.objectContaining({index:1,key:'action',source:'keyboard'})])
    expect(wrapper.find('[data-key="blocked"]').attributes('href')).toBeUndefined()
    expect(wrapper.find('[data-key="blocked"]').attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('[data-key="current"]').attributes('aria-current')).toBe('page')
  })

  it('supports sizes, nowrap, truncation and text separators',()=>{
    const wrapper=mount(UiBreadcrumb,{props:{items:items.slice(0,2),size:'lg',wrap:false,truncate:true,maxItemWidth:120,separator:'/',separatorMode:'text'}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['size-lg','is-nowrap','is-truncated']))
    expect(wrapper.attributes('style')).toContain('--ui-breadcrumb-max-item-width: 120px')
    expect(wrapper.get('.ui-breadcrumb-separator').text()).toBe('/')
    expect(wrapper.get('.ui-breadcrumb-label').text()).toBe('Home')
    expect(wrapper.get('[data-key="home"]').attributes('title')).toBe('Home')
  })

  it('renders localized loading and empty states',()=>{
    const loading=mount(UiBreadcrumb,{props:{loading:true,loadingCount:2}})
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.findAll('.ui-breadcrumb-skeleton')).toHaveLength(2)
    expect(loading.text()).toContain('正在加载导航路径')
    const empty=mount(UiBreadcrumb)
    expect(empty.get('.ui-breadcrumb-empty').text()).toBe('暂无导航路径')
  })

  it('supports structured item, icon, separator, overflow, loading and empty slots',()=>{
    const wrapper=mount(UiBreadcrumb,{props:{items:items.slice(0,2)},slots:{item:({label,current})=>h('b',`${label}:${current}`),icon:({key})=>h('i',key),separator:({index})=>h('span',`S${index}`)}})
    expect(wrapper.findAll('b').map(node=>node.text())).toEqual(['Home:false','Workspace:true'])
    expect(wrapper.findAll('i').map(node=>node.text())).toEqual(['home','workspace'])
    expect(wrapper.get('.ui-breadcrumb-separator').text()).toBe('S0')
    const collapsed=mount(UiBreadcrumb,{props:{items,maxItems:3},slots:{overflow:({count})=>h('strong',`+${count}`)}})
    expect(collapsed.get('.ui-breadcrumb-overflow').text()).toBe('+3')
    const loading=mount(UiBreadcrumb,{props:{loading:true},slots:{loading:({count})=>h('li',{class:'custom-loading'},`Loading ${count}`)}})
    expect(loading.get('.custom-loading').text()).toBe('Loading 3')
    const empty=mount(UiBreadcrumb,{slots:{empty:()=>h('em','Custom empty')}})
    expect(empty.get('.ui-breadcrumb-empty').text()).toBe('Custom empty')
  })

  it('exposes focus, navigation and expansion methods',async()=>{
    const wrapper=mount(UiBreadcrumb,{attachTo:document.body,props:{items,maxItems:3}})
    expect(wrapper.vm.focusFirst()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('[data-key="home"]').element)
    expect(wrapper.vm.focusItem('workspace')).toBe(false)
    expect(wrapper.vm.expand('api')).toEqual(expect.objectContaining({expanded:true,source:'api',hiddenCount:3}))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.focusItem('workspace')).toBe(true)
    expect(wrapper.vm.navigate('workspace','api')).toEqual(expect.objectContaining({key:'workspace',source:'api'}))
    expect(wrapper.vm.focusLast()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('[data-key="components"]').element)
    expect(wrapper.vm.collapse('api')).toEqual(expect.objectContaining({expanded:false}))
    wrapper.unmount()
  })

  it('renders deterministic SSR semantics for collapsed and linked paths',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiBreadcrumb,{items,maxItems:3,size:'lg',truncate:true,ariaLabel:'Release location'})}))
    expect(html).toContain('data-ui-breadcrumb')
    expect(html).toContain('aria-label="Release location"')
    expect(html).toContain('size-lg')
    expect(html).toContain('is-collapsed')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-current="page"')
  })
})

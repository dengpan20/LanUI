// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import UiSkeleton from '../src/components/UiSkeleton.vue'

describe('UiSkeleton P84 loading/content contract',()=>{
  it('preserves defaults and normalizes rows and lengths safely',()=>{
    const wrapper=mount(UiSkeleton)
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('.ui-skeleton-line')).toHaveLength(3)
    expect(wrapper.findAll('.ui-skeleton-line')[0].attributes('style')).toContain('width: 100%')
    expect(wrapper.findAll('.ui-skeleton-line')[2].attributes('style')).toContain('width: 72%')
    const normalized=mount(UiSkeleton,{props:{rows:2.9,width:0,rowWidths:[0,'calc(100% - 2px)','url(javascript:x)'],title:true,titleWidth:'clamp(10px,50%,100px)',avatar:true,avatarSize:0}})
    expect(normalized.findAll('.ui-skeleton-line')).toHaveLength(2)
    expect(normalized.findAll('.ui-skeleton-line')[0].attributes('style')).toContain('width: 0px')
    expect(normalized.findAll('.ui-skeleton-line')[1].attributes('style')).toContain('calc(100% - 2px)')
    expect(normalized.vm.getState().titleWidth).toBe('clamp(10px,50%,100px)')
    expect(normalized.find('.ui-skeleton-avatar').attributes('style')).toContain('width: 0px')
    expect(mount(UiSkeleton,{props:{rows:Infinity}}).findAll('.ui-skeleton-line')).toHaveLength(3)
    expect(mount(UiSkeleton,{props:{rows:-4}}).findAll('.ui-skeleton-line')).toHaveLength(0)
    expect(mount(UiSkeleton,{props:{rows:1000}}).findAll('.ui-skeleton-line')).toHaveLength(100)
  })
  it('switches to real content without placeholder or status semantics',async()=>{
    const wrapper=mount(UiSkeleton,{props:{loading:false},slots:{default:()=>h('article',{class:'loaded'},'Loaded content')}})
    expect(wrapper.find('.loaded').exists()).toBe(true)
    expect(wrapper.find('.ui-skeleton-placeholder').exists()).toBe(false)
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBe('false')
    await wrapper.setProps({loading:true});await nextTick()
    expect(wrapper.find('.loaded').exists()).toBe(false);expect(wrapper.get('[role="status"]').attributes('aria-label')).toMatch(/Loading content|正在加载内容/)
  })
  it('passes the complete camelCase immutable state to template',()=>{
    const wrapper=mount(UiSkeleton,{props:{rows:1,title:true,avatar:true,avatarShape:'square',round:true,ariaLabel:'Loading report'},slots:{template:scope=>h('pre',{class:'custom-template'},JSON.stringify(scope))}})
    const scope=JSON.parse(wrapper.get('.custom-template').text())
    expect(scope).toMatchObject({loading:true,rows:1,avatar:true,animated:true,title:true,width:'100%',titleWidth:'38%',rowWidths:[],avatarSize:'38px',avatarShape:'square',round:true})
    expect(wrapper.get('[role="status"]').attributes('aria-label')).toBe('Loading report')
    const state=wrapper.vm.getState();expect(state.rows).toBe(1);expect(Object.isFrozen(state)).toBe(true);expect(Object.isFrozen(state.rowWidths)).toBe(true);expect(wrapper.vm.getElement()).toBe(wrapper.element);expect(wrapper.vm.root).toBeUndefined()
  })
  it('executes avatar, title, and row scoped slots when template is absent',()=>{
    const wrapper=mount(UiSkeleton,{props:{rows:2,title:true,avatar:true,avatarShape:'square'},slots:{avatar:scope=>h('i',{class:'avatar-scope'},`${scope.shape}:${scope.size}:${scope.loading}`),title:scope=>h('i',{class:'title-scope'},`${scope.width}:${scope.loading}`),row:scope=>h('i',{class:'row-scope'},`${scope.index}:${scope.width}:${scope.size}:${scope.shape}:${scope.loading}`)}})
    expect(wrapper.get('.avatar-scope').text()).toBe('square:38px:true')
    expect(wrapper.get('.title-scope').text()).toBe('38%:true')
    expect(wrapper.findAll('.row-scope')).toHaveLength(2)
    expect(wrapper.findAll('.row-scope')[0].text()).toBe('0:100%:10:line:true')
    expect(wrapper.findAll('.row-scope')[1].text()).toBe('1:72%:10:line:true')
  })
  it('renders stable SSR output for both loading states',async()=>{
    const loading=await renderToString(h(UiSkeleton,{loading:true,rows:2}));const loaded=await renderToString(h(UiSkeleton,{loading:false},()=>h('p','ready')))
    expect(loading).toContain('role="status"');expect(loading).toContain('aria-busy="true"');expect(loaded).toContain('ready');expect(loaded).not.toContain('role="status"')
  })
})

// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiTimeline from '../src/components/UiTimeline.vue'

const items=[
  {key:'audit',title:'Audit complete',description:'Tokens verified',time:'09:30',datetime:'2026-08-20T09:30:00+08:00',status:'success'},
  {key:'review',title:'Review',description:'Awaiting approval',time:'11:20',status:'warning'},
  {key:'release',title:'Release',time:'14:00',status:'info'},
]

describe('P61 UiTimeline maturity contract',()=>{
  it('keeps the legacy items presentation and semantic ordered list',()=>{
    const wrapper=mount(UiTimeline,{props:{items}})
    expect(wrapper.element.tagName).toBe('OL')
    expect(wrapper.attributes('data-ui-timeline')).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('事件时间轴')
    expect(wrapper.findAll('.ui-timeline-item')).toHaveLength(3)
    expect(wrapper.get('.status-success strong').text()).toBe('Audit complete')
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-08-20T09:30:00+08:00')
    expect(wrapper.text()).toContain('Tokens verified')
  })

  it('supports orientation, placement, size, line, reverse and solid dots',()=>{
    const wrapper=mount(UiTimeline,{props:{items,orientation:'horizontal',placement:'alternate',size:'lg',line:'dashed',dotVariant:'solid',reverse:true}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['direction-horizontal','placement-alternate','size-lg','line-dashed','dot-solid']))
    expect(wrapper.findAll('.ui-timeline-item')[0].attributes('data-key')).toBe('release')
  })

  it('adapts domain records with field resolvers and custom colors',()=>{
    const records=[{id:7,label:'Deployed',copy:'East cluster',at:'15:00',tone:'#7c3aed'}]
    const wrapper=mount(UiTimeline,{props:{items:records,itemKey:'id',titleField:'label',descriptionField:'copy',timeField:'at',colorField:item=>item.tone}})
    const item=wrapper.get('.ui-timeline-item')
    expect(item.attributes('data-key')).toBe('7')
    expect(item.attributes('style')).toContain('--ui-timeline-color: #7c3aed')
    expect(item.text()).toContain('Deployed15:00East cluster')
  })

  it('publishes controlled selection and pointer activation metadata',async()=>{
    const wrapper=mount(UiTimeline,{props:{items,selectable:true,modelValue:'audit'}})
    const buttons=wrapper.findAll('button.ui-timeline-content')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    await buttons[1].trigger('click',{detail:1})
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['review'])
    expect(wrapper.emitted('change')?.[0]?.[1]).toEqual(expect.objectContaining({key:'review',sourceIndex:1,status:'warning',selected:true,source:'pointer',previous:'audit'}))
    expect(wrapper.emitted('item-click')?.[0]?.slice(0,2)).toEqual([items[1],1])
    expect(wrapper.emitted('activate')?.[0]?.[0]).toEqual(expect.objectContaining({key:'review',source:'pointer'}))
  })

  it('supports uncontrolled deselection through defaultValue',async()=>{
    const wrapper=mount(UiTimeline,{props:{items,selectable:true,defaultValue:'audit'}})
    await wrapper.findAll('button.ui-timeline-content')[0].trigger('click',{detail:1})
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([undefined])
    expect(wrapper.findAll('button.ui-timeline-content')[0].attributes('aria-pressed')).toBe('false')
  })

  it('uses roving focus and skips disabled records with vertical keys',async()=>{
    const wrapper=mount(UiTimeline,{attachTo:document.body,props:{items,interactive:true,disabledKeys:['review'],loop:true}})
    const actions=wrapper.findAll('button.ui-timeline-content')
    expect(actions.map(action=>action.attributes('tabindex'))).toEqual(['0',undefined,'-1'])
    await actions[0].trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(actions[2].element)
    await actions[2].trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(actions[0].element)
    await actions[0].trigger('keydown',{key:'End'})
    expect(document.activeElement).toBe(actions[2].element)
    wrapper.unmount()
  })

  it('renders secure links and suppresses disabled navigation',async()=>{
    const linked=[{key:'docs',title:'Docs',href:'https://example.com/docs',target:'_blank'},{key:'blocked',title:'Blocked',href:'#blocked',disabled:true}]
    const wrapper=mount(UiTimeline,{props:{items:linked}})
    const links=wrapper.findAll('a.ui-timeline-content')
    expect(links[0].attributes('rel')).toBe('noopener noreferrer')
    expect(links[1].attributes('href')).toBeUndefined()
    expect(links[1].attributes('aria-disabled')).toBe('true')
    await links[1].trigger('click')
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('renders localized loading, empty and pending states',async()=>{
    const loading=mount(UiTimeline,{props:{loading:true,loadingCount:2}})
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.findAll('.ui-timeline-skeleton')).toHaveLength(2)
    expect(loading.text()).toContain('正在加载时间轴')
    const empty=mount(UiTimeline)
    expect(empty.get('.ui-timeline-empty').text()).toBe('暂无时间轴事件')
    const pending=mount(UiTimeline,{props:{items,pending:'Publishing'}})
    expect(pending.get('.pending').text()).toContain('Publishing')
  })

  it('supports item, dot, time, opposite and state slots',()=>{
    const wrapper=mount(UiTimeline,{props:{items:[items[0]],timePosition:'opposite',pending:true},slots:{dot:({status})=>h('i',status),opposite:({time})=>h('small',`At ${time}`),item:({title,selected})=>h('b',`${title}:${selected}`),pending:()=>h('em','Queued')}})
    expect(wrapper.get('.ui-timeline-dot').text()).toBe('success')
    expect(wrapper.get('.ui-timeline-opposite').text()).toBe('At 09:30')
    expect(wrapper.get('.ui-timeline-content').text()).toBe('Audit complete:false')
    expect(wrapper.get('.pending').text()).toContain('Queued')
  })

  it('exposes focus and programmatic selection methods',()=>{
    const wrapper=mount(UiTimeline,{attachTo:document.body,props:{items,selectable:true}})
    expect(wrapper.vm.focusItem('review')).toBe(true)
    expect(document.activeElement).toBe(wrapper.findAll('button.ui-timeline-content')[1].element)
    expect(wrapper.vm.focusFirst()).toBe(true)
    expect(wrapper.vm.focusLast()).toBe(true)
    expect(wrapper.vm.select('release','api')).toEqual(expect.objectContaining({key:'release',source:'api',selected:true}))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['release'])
    wrapper.unmount()
  })

  it('renders deterministic SSR semantics',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiTimeline,{items,selectable:true,modelValue:'review',timePosition:'opposite',pending:true,ariaLabel:'Release history'})}))
    expect(html).toContain('data-ui-timeline')
    expect(html).toContain('aria-label="Release history"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('datetime="2026-08-20T09:30:00+08:00"')
    expect(html).toContain('处理中')
  })
})

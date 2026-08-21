// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiSteps from '../src/components/UiSteps.vue'

const items=[
  {key:'foundation',title:'Foundation',description:'Tokens approved'},
  {key:'components',title:'Components',subtitle:'8/12',description:'Contracts in review'},
  {key:'release',title:'Release',description:'Publish package'},
]

describe('P62 UiSteps maturity contract',()=>{
  it('keeps the legacy current presentation with visible connectors',()=>{
    const wrapper=mount(UiSteps,{props:{items,current:2}})
    expect(wrapper.element.tagName).toBe('OL')
    expect(wrapper.attributes('data-ui-steps')).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('步骤进度')
    expect(wrapper.findAll('.ui-step')).toHaveLength(3)
    expect(wrapper.findAll('.ui-step-connector')).toHaveLength(2)
    expect(wrapper.findAll('.ui-step').map(item=>item.classes().find(name=>name.startsWith('status-')))).toEqual(['status-finish','status-finish','status-process'])
    expect(wrapper.findAll('.ui-step-main')[2].attributes('aria-current')).toBe('step')
  })

  it('supports direction, label placement, navigation, inline and sizes',async()=>{
    const wrapper=mount(UiSteps,{props:{items,direction:'vertical',labelPlacement:'vertical',type:'navigation',size:'lg'}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['direction-vertical','label-vertical','type-navigation','size-lg','is-responsive','is-interactive']))
    expect(wrapper.findAll('button.ui-step-main')).toHaveLength(3)
    await wrapper.setProps({type:'inline',responsive:false,size:'sm'})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['type-inline','size-sm']))
    expect(wrapper.classes()).not.toContain('is-responsive')
  })

  it('adapts domain records with string and function fields',()=>{
    const records=[{id:'audit',label:'Audit',copy:'Evidence ready',phase:'finish',glyph:'check'}]
    const wrapper=mount(UiSteps,{props:{items:records,itemKey:'id',titleField:'label',descriptionField:'copy',statusField:'phase',iconField:item=>item.glyph}})
    const step=wrapper.get('.ui-step')
    expect(step.attributes('data-key')).toBe('audit')
    expect(step.classes()).toContain('status-finish')
    expect(step.text()).toContain('AuditEvidence ready')
    expect(step.find('svg.icon[data-ui-icon="check"]').exists()).toBe(true)
  })

  it('publishes controlled navigation and pointer metadata',async()=>{
    const wrapper=mount(UiSteps,{props:{items,interactive:true,modelValue:0}})
    const actions=wrapper.findAll('button.ui-step-main')
    await actions[1].trigger('click',{detail:1})
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1])
    expect(wrapper.emitted('change')?.[0]?.slice(0,2)).toEqual([1,expect.objectContaining({index:1,previous:0,key:'components',source:'pointer'})])
    expect(wrapper.emitted('item-click')?.[0]?.slice(0,2)).toEqual([items[1],1])
  })

  it('supports uncontrolled progress from defaultCurrent',async()=>{
    const wrapper=mount(UiSteps,{props:{items,interactive:true,defaultCurrent:1}})
    await wrapper.findAll('button.ui-step-main')[2].trigger('click',{detail:1})
    expect(wrapper.findAll('.ui-step')[2].classes()).toContain('active')
    expect(wrapper.findAll('.ui-step')[1].classes()).toContain('done')
    expect(wrapper.emitted('change')?.[0]?.[1]).toEqual(expect.objectContaining({previous:1,index:2}))
  })

  it('enforces linear navigation and disabled indexes',async()=>{
    const wrapper=mount(UiSteps,{props:{items,interactive:true,linear:true,current:0,disabledIndexes:[1]}})
    const actions=wrapper.findAll('button.ui-step-main')
    expect(actions[0].attributes('disabled')).toBeUndefined()
    expect(actions[1].attributes('disabled')).toBeDefined()
    expect(actions[2].attributes('disabled')).toBeDefined()
    await actions[2].trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('uses roving keyboard focus, skips disabled items and loops',async()=>{
    const wrapper=mount(UiSteps,{attachTo:document.body,props:{items,interactive:true,disabledIndexes:[1],loop:true}})
    const actions=wrapper.findAll('button.ui-step-main')
    expect(actions.map(action=>action.attributes('tabindex'))).toEqual(['0',undefined,'-1'])
    await actions[0].trigger('keydown',{key:'ArrowRight'})
    expect(document.activeElement).toBe(actions[2].element)
    await actions[2].trigger('keydown',{key:'ArrowRight'})
    expect(document.activeElement).toBe(actions[0].element)
    await actions[0].trigger('keydown',{key:'End'})
    expect(document.activeElement).toBe(actions[2].element)
    expect(wrapper.emitted('item-focus')?.at(-1)?.[0]).toEqual(expect.objectContaining({index:2,source:'focus'}))
    wrapper.unmount()
  })

  it('renders localized loading and empty states',()=>{
    const loading=mount(UiSteps,{props:{loading:true,loadingCount:2}})
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.findAll('.ui-step-skeleton')).toHaveLength(2)
    expect(loading.text()).toContain('正在加载步骤')
    const empty=mount(UiSteps)
    expect(empty.get('.ui-steps-empty').text()).toBe('暂无步骤')
  })

  it('supports item, icon, title, description and state slots',()=>{
    const wrapper=mount(UiSteps,{props:{items:[items[0]]},slots:{icon:({status})=>h('i',status),title:({key})=>h('b',`Title ${key}`),description:({description})=>h('em',description),subtitle:()=>h('small','Custom')}})
    expect(wrapper.get('.ui-step-mark').text()).toBe('process')
    expect(wrapper.get('.ui-step-heading').text()).toContain('Title foundationCustom')
    expect(wrapper.get('.ui-step-copy').text()).toContain('Tokens approved')
    const custom=mount(UiSteps,{props:{items:[items[0]],interactive:true},slots:{item:({activate})=>h('span',{class:'custom-step',onClick:()=>activate('slot')},'Custom item')}})
    expect(custom.get('.custom-step').text()).toBe('Custom item')
  })

  it('exposes focus and imperative navigation methods',()=>{
    const wrapper=mount(UiSteps,{attachTo:document.body,props:{items,interactive:true}})
    expect(wrapper.vm.focusItem('components')).toBe(true)
    expect(document.activeElement).toBe(wrapper.findAll('button.ui-step-main')[1].element)
    expect(wrapper.vm.focusCurrent()).toBe(true)
    expect(wrapper.vm.focusFirst()).toBe(true)
    expect(wrapper.vm.focusLast()).toBe(true)
    expect(wrapper.vm.goTo('components','api')).toEqual(expect.objectContaining({index:1,source:'api'}))
    expect(wrapper.vm.next('api')).toEqual(expect.objectContaining({index:2}))
    expect(wrapper.vm.previous('api')).toEqual(expect.objectContaining({index:1}))
    wrapper.unmount()
  })

  it('renders deterministic SSR semantics',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiSteps,{items,modelValue:1,type:'navigation',size:'lg',ariaLabel:'Release workflow'})}))
    expect(html).toContain('data-ui-steps')
    expect(html).toContain('aria-label="Release workflow"')
    expect(html).toContain('type-navigation')
    expect(html).toContain('aria-current="step"')
    expect(html).toContain('ui-step-connector')
  })
})

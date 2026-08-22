// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import UiCollapse from '../src/components/UiCollapse.vue'

const items=[
  {key:'overview',label:'Overview',content:'Release overview',extra:'Required'},
  {key:'locked',label:'Locked',content:'Restricted content',disabled:true},
  {key:'evidence',label:'Evidence',content:'Verification evidence'},
]

describe('UiCollapse mature disclosure contract',()=>{
  it('supports uncontrolled defaults and emits structured multiple changes',async()=>{
    const wrapper=mount(UiCollapse,{props:{items,defaultValue:['overview'],animated:false}})
    expect(wrapper.find('[data-key="overview"]').classes()).toContain('open')
    await wrapper.find('[data-key="evidence"] button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['overview','evidence']])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({key:'evidence',open:true,source:'keyboard',previous:['overview'],value:['overview','evidence']})
    expect(wrapper.find('[data-key="evidence"] [role="region"]').text()).toBe('Verification evidence')
  })

  it('keeps controlled state stable until the owner updates modelValue',async()=>{
    const wrapper=mount(UiCollapse,{props:{items,modelValue:[],animated:false}})
    const trigger=wrapper.find('[data-key="overview"] button')
    await trigger.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['overview']])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({modelValue:['overview']})
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('enforces non-collapsible accordion behavior and scalar values',async()=>{
    const wrapper=mount(UiCollapse,{props:{items,accordion:true,collapsible:false,defaultValue:'overview',animated:false}})
    await wrapper.find('[data-key="overview"] button').trigger('click')
    expect(wrapper.emitted('toggle-blocked')?.at(-1)?.[0]).toMatchObject({key:'overview',open:false})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.find('[data-key="evidence"] button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['evidence'])
    expect(wrapper.find('[data-key="overview"] button').attributes('aria-expanded')).toBe('false')
    const defaultOpen=mount(UiCollapse,{props:{items,accordion:true,collapsible:false,animated:false}})
    expect(defaultOpen.find('[data-key="overview"] button').attributes('aria-expanded')).toBe('true')
    expect(defaultOpen.vm.closeAll('test')).toBe('overview')
  })

  it('moves header focus with Arrow, Home and End while skipping disabled panels',async()=>{
    const wrapper=mount(UiCollapse,{attachTo:document.body,props:{items,loop:true,animated:false}})
    const triggers=wrapper.findAll('.ui-collapse-trigger')
    triggers[0].element.focus()
    await triggers[0].trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(triggers[2].element)
    expect(wrapper.emitted('item-focus')?.at(-1)?.[0]).toMatchObject({key:'evidence',source:'keyboard'})
    await triggers[2].trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(triggers[0].element)
    await triggers[0].trigger('keydown',{key:'End'})
    expect(document.activeElement).toBe(triggers[2].element)
    await triggers[2].trigger('keydown',{key:'Home'})
    expect(document.activeElement).toBe(triggers[0].element)
    wrapper.unmount()
  })

  it('lazy mounts once and optionally destroys hidden content',async()=>{
    const keep=mount(UiCollapse,{props:{items:[items[0]],lazy:true,animated:false}})
    expect(keep.find('[role="region"]').exists()).toBe(false)
    await keep.get('button').trigger('click')
    expect(keep.find('[role="region"]').exists()).toBe(true)
    await keep.get('button').trigger('click')
    expect(keep.find('[role="region"]').exists()).toBe(true)
    expect(keep.get('[role="region"]').attributes('style')).toContain('display: none')
    const destroy=mount(UiCollapse,{props:{items:[items[0]],lazy:true,destroyOnHide:true,animated:false}})
    await destroy.get('button').trigger('click')
    expect(destroy.find('[role="region"]').exists()).toBe(true)
    await destroy.get('button').trigger('click')
    expect(destroy.find('[role="region"]').exists()).toBe(false)
  })

  it('exposes pending state while an asynchronous toggle guard resolves',async()=>{
    let resolve
    const beforeToggle=vi.fn(()=>new Promise(done=>{resolve=done}))
    const wrapper=mount(UiCollapse,{props:{items:[items[0]],beforeToggle,animated:false}})
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.ui-collapse-pending').exists()).toBe(true)
    resolve(true);await nextTick();await nextTick()
    expect(wrapper.emitted('before-change')?.at(-1)?.[0]).toMatchObject({key:'overview',open:true})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['overview']])
  })

  it('reports guard rejections and failures without changing value',async()=>{
    const rejected=mount(UiCollapse,{props:{items:[items[0]],beforeToggle:()=>false,animated:false}})
    await rejected.get('button').trigger('click');await nextTick()
    expect(rejected.emitted('toggle-blocked')?.at(-1)?.[0]).toMatchObject({reason:'guard'})
    expect(rejected.emitted('update:modelValue')).toBeUndefined()
    const error=new Error('policy unavailable')
    const failed=mount(UiCollapse,{props:{items:[items[0]],beforeToggle:()=>{throw error},animated:false}})
    await failed.get('button').trigger('click');await nextTick()
    expect(failed.emitted('toggle-error')?.at(-1)?.[0]).toBe(error)
    expect(failed.emitted('update:modelValue')).toBeUndefined()
  })

  it('supports field adapters and generic header, content, extra and icon slots',()=>{
    const wrapper=mount(UiCollapse,{props:{items:[{id:'audit',title:'Audit',body:'Evidence',meta:'Stable'}],itemKey:'id',labelField:'title',contentField:'body',extraField:'meta',defaultValue:['audit'],animated:false},slots:{header:scope=>`Header ${scope.label}`,content:scope=>`Body ${scope.content}`,extra:scope=>`Extra ${scope.extra}`,'expand-icon':scope=>scope.open?'−':'+'}})
    expect(wrapper.get('.ui-collapse-label').text()).toBe('Header Audit')
    expect(wrapper.get('.ui-collapse-panel').text()).toBe('Body Evidence')
    expect(wrapper.get('.ui-collapse-extra').text()).toBe('Extra Stable')
    expect(wrapper.get('.ui-collapse-expand-icon').text()).toBe('−')
  })

  it('renders loading and empty states with semantic status content',()=>{
    const loading=mount(UiCollapse,{props:{loading:true,loadingCount:2,ariaLabel:'Release sections'}})
    expect(loading.attributes('role')).toBe('group')
    expect(loading.attributes('aria-label')).toBe('Release sections')
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.findAll('.ui-collapse-skeleton')).toHaveLength(2)
    const empty=mount(UiCollapse,{props:{emptyText:'No release sections'}})
    expect(empty.get('[role="status"]').text()).toBe('No release sections')
  })

  it('provides imperative open, close, openAll, closeAll and focus controls',async()=>{
    const wrapper=mount(UiCollapse,{attachTo:document.body,props:{items,animated:false}})
    await wrapper.vm.open('overview','test')
    expect(wrapper.vm.isOpen('overview')).toBe(true)
    expect(wrapper.vm.openAll('test')).toEqual(['overview','evidence'])
    expect(wrapper.vm.focusLast()).toBe(true)
    expect(document.activeElement?.textContent).toContain('Evidence')
    await wrapper.vm.close('evidence','test')
    expect(wrapper.vm.isOpen('evidence')).toBe(false)
    expect(wrapper.vm.closeAll('test')).toEqual([])
    wrapper.unmount()
  })

  it('renders linked headings and regions during SSR',async()=>{
    const app=createSSRApp({render:()=>h(UiCollapse,{items:[items[0]],defaultValue:['overview'],headingLevel:2,ariaLabel:'SSR sections'})})
    const html=await renderToString(app)
    expect(html).toContain('data-ui-collapse')
    expect(html).toContain('role="group"')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('<h2')
  })
})

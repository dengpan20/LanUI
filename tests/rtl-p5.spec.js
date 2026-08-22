// @vitest-environment happy-dom
import fs from 'node:fs'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiCascader from '../src/components/UiCascader.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDrawer from '../src/components/UiDrawer.vue'
import UiMenu from '../src/components/UiMenu.vue'
import UiSegmented from '../src/components/UiSegmented.vue'
import UiTable from '../src/components/UiTable.vue'
import UiTabs from '../src/components/UiTabs.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import UiTreeSelect from '../src/components/UiTreeSelect.vue'

const withDirection=(direction,component,props={},slots={})=>mount(UiConfigProvider,{
  attachTo:document.body,
  props:{direction},
  slots:{default:()=>h(component,props,slots)},
})

afterEach(()=>{document.body.innerHTML=''})

describe('logical direction configuration',()=>{
  it('publishes an inherited direction on the provider boundary',()=>{
    const wrapper=withDirection('rtl','div',{class:'sample'})
    expect(wrapper.attributes('dir')).toBe('rtl')
    expect(wrapper.attributes('data-ui-direction')).toBe('rtl')
  })

  it('reverses horizontal tab and segmented arrow navigation in RTL',async()=>{
    const items=[{label:'Alpha',value:'a'},{label:'Beta',value:'b'},{label:'Gamma',value:'c'}]
    const tabs=withDirection('rtl',UiTabs,{modelValue:'a',items,panels:false})
    await tabs.findAll('[role="tab"]')[0].trigger('keydown',{key:'ArrowLeft'})
    expect(tabs.findComponent(UiTabs).emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    await tabs.findAll('[role="tab"]')[0].trigger('keydown',{key:'ArrowRight'})
    expect(tabs.findComponent(UiTabs).emitted('update:modelValue')?.at(-1)).toEqual(['c'])

    const segmented=withDirection('rtl',UiSegmented,{modelValue:'b',options:items})
    await segmented.get('[role="radiogroup"]').trigger('keydown',{key:'ArrowLeft'})
    expect(segmented.findComponent(UiSegmented).emitted('update:modelValue')?.at(-1)).toEqual(['c'])
  })

  it('uses logical expand and collapse keys for tree, cascader and menu',async()=>{
    const tree=[{label:'Parent',value:'parent',children:[{label:'Child',value:'child'}]}]
    const treeSelect=withDirection('rtl',UiTreeSelect,{options:tree,appendToBody:false})
    const treeTrigger=treeSelect.get('[role="combobox"]')
    await treeTrigger.trigger('keydown',{key:'ArrowDown'})
    await treeTrigger.trigger('keydown',{key:'ArrowLeft'})
    await nextTick()
    expect(treeSelect.get('[role="treeitem"]').attributes('aria-expanded')).toBe('true')
    await treeTrigger.trigger('keydown',{key:'ArrowLeft'})
    await treeTrigger.trigger('keydown',{key:'Enter'})
    expect(treeSelect.findComponent(UiTreeSelect).emitted('update:modelValue')?.at(-1)).toEqual(['child'])

    const cascader=withDirection('rtl',UiCascader,{options:tree,modelValue:[]})
    const cascaderTrigger=cascader.get('[role="combobox"]')
    await cascaderTrigger.trigger('keydown',{key:'ArrowDown'})
    await cascaderTrigger.trigger('keydown',{key:'ArrowLeft'})
    await nextTick()
    expect(cascaderTrigger.attributes('aria-activedescendant')).toContain('-1-0')

    const menu=withDirection('rtl',UiMenu,{items:[{key:'parent',label:'Parent',children:[{key:'child',label:'Child'}]}]})
    const menuParent=menu.get('[data-key="parent"]')
    menuParent.element.focus()
    await menu.get('[role="menu"]').trigger('keydown',{key:'ArrowLeft'})
    expect(menuParent.attributes('aria-expanded')).toBe('true')
  })

  it('resolves logical drawer placement and forwards direction to teleports',async()=>{
    const drawer=withDirection('rtl',UiDrawer,{modelValue:true,placement:'start',title:'Details'})
    await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-drawer')
    expect(panel?.classList.contains('placement-right')).toBe(true)
    expect(panel?.getAttribute('data-logical-placement')).toBe('start')
    expect(panel?.getAttribute('dir')).toBe('rtl')
    drawer.unmount()

    const toast=withDirection('rtl',UiToastHost,{items:[{id:'one',type:'success',message:'Saved',placement:'top-end'}]})
    await nextTick()
    expect(document.body.querySelector('.toasts-top-end')?.getAttribute('dir')).toBe('rtl')
    expect(document.body.querySelector('.toast')?.getAttribute('role')).toBe('status')
    toast.unmount()
  })

  it('supports logical fixed table columns and logical CSS properties',()=>{
    const wrapper=withDirection('rtl',UiTable,{
      columns:[{key:'name',label:'Name',fixed:'start',start:0},{key:'status',label:'Status',fixed:'end'}],
      rows:[{id:1,name:'Lan',status:'Ready'}],
    })
    expect(wrapper.findAll('.fixed-start')).toHaveLength(2)
    expect(wrapper.findAll('.fixed-end')).toHaveLength(2)
    expect(wrapper.get('th.fixed-start').attributes('style')).toContain('inset-inline-start: 0')
    const styles=fs.readFileSync('styles.css','utf8')
    expect(styles).toContain('.ui-table .fixed-start { inset-inline-start: 0;')
    expect(styles).toContain('[dir="rtl"] .ui-switch.on .ui-switch-handle { transform: translateX(-14px);')
    expect(styles).toContain('.toasts-top-end { top: 18px; inset-inline-end: 18px;')
  })
})

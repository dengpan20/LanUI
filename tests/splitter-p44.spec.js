// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiSplitter from '../src/components/UiSplitter.vue'

const wrappers=[]
const panels=[
  {key:'navigation',label:'Navigation',defaultSize:'25%',min:'15%',max:'40%',collapsible:true},
  {key:'workspace',label:'Workspace',defaultSize:'50%',min:'30%'},
  {key:'inspector',label:'Inspector',defaultSize:'25%',min:'15%',max:'40%',collapsible:true},
]

afterEach(()=>{while(wrappers.length)wrappers.pop()?.unmount();document.body.innerHTML=''})

async function measured(props={}){
  const wrapper=mount(UiSplitter,{attachTo:document.body,props:{panels,...props},slots:{panel:({panel})=>h('div',panel.label)}})
  wrappers.push(wrapper)
  wrapper.element.getBoundingClientRect=()=>({left:0,right:800,top:0,bottom:300,width:800,height:300,x:0,y:0,toJSON(){}})
  await nextTick();await nextTick()
  wrapper.vm.reset()
  await nextTick()
  return wrapper
}

describe('P44 UiSplitter',()=>{
  it('renders accessible multi-panel structure with normalized responsive sizes',async()=>{
    const wrapper=await measured({modelValue:[25,50,25],ariaLabel:'Workspace layout'})
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Workspace layout')
    expect(wrapper.findAll('.ui-splitter-panel')).toHaveLength(3)
    const bars=wrapper.findAll('[role="separator"]')
    expect(bars).toHaveLength(2)
    expect(bars[0].attributes('aria-orientation')).toBe('vertical')
    expect(bars[0].attributes('aria-controls')).toContain('panel-0')
    expect(bars[0].attributes('aria-controls')).toContain('panel-1')
    expect(Number(bars[0].attributes('aria-valuenow'))).toBeCloseTo(25,3)
    expect(wrapper.vm.sizes.reduce((total,value)=>total+value,0)).toBeCloseTo(100,5)
  })

  it('resizes adjacent panels by keyboard and clamps Home/End to constraints',async()=>{
    const wrapper=await measured({modelValue:[25,50,25],keyboardStep:20})
    const bar=wrapper.findAll('[role="separator"]')[0]
    await bar.trigger('keydown',{key:'ArrowRight'})
    const moved=wrapper.emitted('update:modelValue')?.at(-1)?.[0]
    expect(moved[0]).toBeGreaterThan(25)
    expect(moved[1]).toBeLessThan(50)
    expect(moved[2]).toBeCloseTo(25,3)
    expect(wrapper.emitted('resize-start')?.at(-1)?.[0]).toMatchObject({index:0,source:'keyboard',direction:'horizontal'})
    expect(wrapper.emitted('resize-end')?.at(-1)?.[0].sizes).toEqual(moved)
    await bar.trigger('keydown',{key:'Home'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0][0]).toBeCloseTo(15,2)
    await bar.trigger('keydown',{key:'End'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0][0]).toBeCloseTo(40,2)
  })

  it('mirrors horizontal keyboard movement in RTL and exposes horizontal separators for vertical layouts',async()=>{
    const rtl=mount(UiConfigProvider,{props:{direction:'rtl'},slots:{default:()=>h(UiSplitter,{panels,modelValue:[25,50,25]})}})
    wrappers.push(rtl)
    const splitter=rtl.findComponent(UiSplitter)
    splitter.element.getBoundingClientRect=()=>({left:0,right:800,top:0,bottom:300,width:800,height:300,x:0,y:0,toJSON(){}})
    await nextTick();splitter.vm.reset();await nextTick()
    await splitter.find('[role="separator"]').trigger('keydown',{key:'ArrowRight'})
    expect(splitter.emitted('update:modelValue')?.at(-1)?.[0][0]).toBeLessThan(25)
    const vertical=await measured({direction:'vertical',modelValue:[25,50,25]})
    expect(vertical.find('[role="separator"]').attributes('aria-orientation')).toBe('horizontal')
    await vertical.find('[role="separator"]').trigger('keydown',{key:'ArrowDown'})
    expect(vertical.emitted('update:modelValue')?.at(-1)?.[0][0]).toBeGreaterThan(25)
  })

  it('defers model commits during lazy pointer resizing and emits the full lifecycle',async()=>{
    const wrapper=await measured({modelValue:[25,50,25],lazy:true})
    const bar=wrapper.find('[role="separator"]')
    await bar.trigger('pointerdown',{button:0,clientX:200,clientY:100})
    document.dispatchEvent(new PointerEvent('pointermove',{clientX:260,clientY:100,bubbles:true}))
    await nextTick()
    expect(wrapper.emitted('resize-start')?.at(-1)?.[0].source).toBe('pointer')
    expect(wrapper.emitted('resize')?.at(-1)?.[0].sizes[0]).toBeGreaterThan(25)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.ui-splitter-ghost').exists()).toBe(true)
    document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0][0]).toBeGreaterThan(25)
    expect(wrapper.emitted('resize-end')?.at(-1)?.[0].source).toBe('pointer')
    expect(wrapper.find('.ui-splitter-ghost').exists()).toBe(false)
  })

  it('collapses and restores panels by API, Enter and double click',async()=>{
    const wrapper=await measured({modelValue:[25,50,25]})
    wrapper.vm.collapse(2)
    await nextTick()
    expect(wrapper.findAll('.ui-splitter-panel')[2].classes()).toContain('collapsed')
    expect(wrapper.emitted('collapse')?.at(-1)?.[0]).toMatchObject({index:2,collapsed:true,source:'api'})
    await wrapper.findAll('[role="separator"]')[1].trigger('keydown',{key:'Enter'})
    expect(wrapper.findAll('.ui-splitter-panel')[2].classes()).not.toContain('collapsed')
    await wrapper.findAll('[role="separator"]')[1].trigger('dblclick')
    expect(wrapper.emitted('collapse')?.at(-1)?.[0]).toMatchObject({index:2,collapsed:true,source:'pointer'})
  })

  it('rejects invalid programmatic sizes and disables immutable separators',async()=>{
    const wrapper=await measured({panels:[panels[0],{...panels[1],resizable:false},panels[2]]})
    expect(wrapper.findAll('[role="separator"]').every(bar=>bar.attributes('aria-disabled')==='true')).toBe(true)
    wrapper.vm.setSizes([50,-10,60])
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual({reason:'size',value:[50,-10,60]})
    await wrapper.find('[role="separator"]').trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.emitted('resize')).toBeUndefined()
  })

  it('reports impossible aggregate panel constraints once per measured geometry',async()=>{
    const constrained=[
      {key:'a',min:'60%'},
      {key:'b',min:'60%'},
    ]
    const wrapper=await measured({panels:constrained})
    const issue=wrapper.emitted('invalid')?.find(entry=>entry[0].reason==='constraints')?.[0]
    expect(issue).toMatchObject({reason:'constraints',value:{minimum:expect.any(Number),available:expect.any(Number)}})
    expect(issue.value.minimum).toBeGreaterThan(issue.value.available)
  })

  it('renders deterministic SSR markup without browser geometry',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiSplitter,{panels,modelValue:[25,50,25],ariaLabel:'SSR split layout'},{panel:({panel})=>h('article',panel.label)})}))
    expect(html).toContain('data-ui-splitter="horizontal"')
    expect(html).toContain('aria-label="SSR split layout"')
    expect(html.match(/role="separator"/g)).toHaveLength(2)
    expect(html).toContain('aria-valuenow="25"')
    expect(html).toContain('Navigation')
    expect(html).toContain('Inspector')
  })
})

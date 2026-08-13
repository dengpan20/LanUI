// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiAnchor from '../src/components/UiAnchor.vue'
import { lanUiConfigKey } from '../src/config.js'
import { lanUiMotionKey } from '../src/motion.js'

const wrappers=[]
afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML=''
})

function rect(top){return {top,bottom:top+40,left:0,right:300,width:300,height:40,x:0,y:top,toJSON(){}}}
function fixture(){
  const scroller=document.createElement('div')
  scroller.id='anchor-scroller'
  scroller.scrollTop=20
  scroller.getBoundingClientRect=()=>rect(100)
  scroller.scrollTo=vi.fn()
  const mountPoint=document.createElement('div')
  const overview=document.createElement('section')
  const api=document.createElement('section')
  overview.id='anchor-overview';api.id='anchor-api'
  overview.getBoundingClientRect=()=>rect(120)
  api.getBoundingClientRect=()=>rect(260)
  scroller.append(mountPoint,overview,api)
  document.body.append(scroller)
  return {scroller,mountPoint,overview,api}
}

const items=[
  {key:'overview',href:'#anchor-overview',title:'Overview'},
  {key:'disabled',href:'#anchor-disabled',title:'Disabled',disabled:true},
  {key:'api',href:'#anchor-api',title:'API',children:[{key:'events',href:'#anchor-events',title:'Events'}]},
]

describe('P38 UiAnchor',()=>{
  it('renders a labelled nested anchor list with active and disabled semantics',()=>{
    const wrapper=mount(UiAnchor,{props:{items,modelValue:'api',ariaLabel:'On this page'}})
    wrappers.push(wrapper)
    expect(wrapper.attributes('aria-label')).toBe('On this page')
    expect(wrapper.findAll('.ui-anchor-link')).toHaveLength(4)
    expect(wrapper.get('[href="#anchor-api"]').attributes('aria-current')).toBe('location')
    expect(wrapper.get('[href="#anchor-disabled"]').attributes('aria-disabled')).toBe('true')
    expect(wrapper.get('[href="#anchor-events"]').element.parentElement.style.getPropertyValue('--ui-anchor-level')).toBe('1')
  })

  it('scrolls an element container with offset and emits a complete pointer lifecycle',async()=>{
    vi.useFakeTimers()
    const {scroller,mountPoint}=fixture()
    const wrapper=mount(UiAnchor,{attachTo:mountPoint,props:{items,container:()=>scroller,offsetTop:24,smooth:true}})
    wrappers.push(wrapper)
    await nextTick()
    await wrapper.get('[href="#anchor-api"]').trigger('click')
    expect(scroller.scrollTo).toHaveBeenCalledWith({top:156,behavior:'smooth'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['api'])
    expect(wrapper.emitted('change')?.at(-1)?.[2]).toEqual({source:'pointer'})
    expect(wrapper.emitted('scroll-start')).toHaveLength(1)
    vi.advanceTimersByTime(181)
    expect(wrapper.emitted('scroll-end')).toHaveLength(1)
  })

  it('updates the controlled value from scroll position without emitting duplicates',async()=>{
    const {scroller,mountPoint,overview,api}=fixture()
    let overviewTop=120
    let apiTop=260
    overview.getBoundingClientRect=()=>rect(overviewTop)
    api.getBoundingClientRect=()=>rect(apiTop)
    const wrapper=mount(UiAnchor,{attachTo:mountPoint,props:{items:[items[0],items[2]],container:scroller,modelValue:'overview',offsetTop:12,bounds:8}})
    wrappers.push(wrapper)
    await nextTick()
    overviewTop=40;apiTop=112
    scroller.dispatchEvent(new Event('scroll'))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['api'])
    expect(wrapper.emitted('change')?.at(-1)?.[2]).toEqual({source:'scroll'})
    await wrapper.setProps({modelValue:'api'})
    scroller.dispatchEvent(new Event('scroll'))
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('roves focus horizontally, skips disabled links and mirrors arrows in RTL',async()=>{
    const wrapper=mount(UiAnchor,{attachTo:document.body,global:{provide:{[lanUiConfigKey]:{direction:'rtl'}}},props:{items,direction:'horizontal'}})
    wrappers.push(wrapper)
    expect(wrapper.classes()).toContain('direction-horizontal')
    expect(wrapper.classes()).not.toContain('direction-rtl')
    const links=wrapper.findAll('.ui-anchor-link')
    links[0].element.focus()
    await links[0].trigger('keydown',{key:'ArrowLeft'})
    expect(document.activeElement).toBe(links[2].element)
    await links[2].trigger('keydown',{key:'Home'})
    expect(document.activeElement).toBe(links[0].element)
    expect(links[1].attributes('tabindex')).toBe('-1')
  })

  it('honors scoped reduced motion and exposes deterministic SSR markup',async()=>{
    const {scroller,mountPoint}=fixture()
    const wrapper=mount(UiAnchor,{attachTo:mountPoint,global:{provide:{[lanUiMotionKey]:{resolvedPreference:'reduced'}}},props:{items:[items[0],items[2]],container:scroller}})
    wrappers.push(wrapper)
    await wrapper.get('[href="#anchor-api"]').trigger('click')
    expect(scroller.scrollTo).toHaveBeenCalledWith(expect.objectContaining({behavior:'auto'}))
    const html=await renderToString(createSSRApp({render:()=>h(UiAnchor,{items:[items[0]],ariaLabel:'SSR outline'})}))
    expect(html).toContain('aria-label="SSR outline"')
    expect(html).toContain('aria-current="location"')
    expect(html).toContain('href="#anchor-overview"')
  })
})

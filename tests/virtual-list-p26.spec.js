// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiVirtualList from '../src/components/UiVirtualList.vue'

const wrappers=[]
const items=Array.from({length:100},(_,index)=>({id:`item-${index}`,label:`Item ${index}`}))
const render=(props={},slots={})=>{const wrapper=mount(UiVirtualList,{attachTo:document.body,props:{items,...props},slots});wrappers.push(wrapper);return wrapper}

class MockResizeObserver{
  static instances=[]
  constructor(callback){this.callback=callback;this.elements=new Set();MockResizeObserver.instances.push(this)}
  observe(element){this.elements.add(element)}
  unobserve(element){this.elements.delete(element)}
  disconnect(){this.elements.clear()}
  trigger(element,height){this.callback([{target:element,contentRect:{height},borderBoxSize:[{blockSize:height}]}])}
}

beforeEach(()=>{MockResizeObserver.instances=[];vi.stubGlobal('ResizeObserver',MockResizeObserver)})
afterEach(()=>{for(const wrapper of wrappers.splice(0))wrapper.unmount();document.body.innerHTML='';vi.unstubAllGlobals()})

describe('maturity P26 virtual list',()=>{
  it('renders only the visible range with overscan and a full-size spacer',()=>{
    const wrapper=render({height:120,itemSize:30,overscan:1,bordered:true})
    expect(wrapper.get('.ui-virtual-list').classes()).toContain('is-bordered')
    expect(wrapper.get('.ui-virtual-list-content').attributes('style')).toContain('height: 3000px')
    expect(wrapper.findAll('.ui-virtual-list-item')).toHaveLength(5)
    expect(wrapper.get('.ui-virtual-list-item').attributes('aria-posinset')).toBe('1')
  })

  it('updates its window after scrolling and emits the exact range',async()=>{
    const wrapper=render({height:120,itemSize:30,overscan:1})
    const root=wrapper.get('.ui-virtual-list')
    root.element.scrollTop=300
    await root.trigger('scroll');await nextTick()
    expect(wrapper.get('.ui-virtual-list-item').attributes('aria-posinset')).toBe('10')
    expect(wrapper.emitted('scroll')?.at(-1)?.[0]).toMatchObject({scrollTop:300,viewportHeight:120})
    expect(wrapper.emitted('range-change')?.at(-1)?.[0]).toMatchObject({start:9,end:15,visibleStart:10,visibleEnd:14,total:100})
  })

  it('exposes aligned index/key scrolling and the visible range',async()=>{
    const wrapper=render({height:100,itemSize:25,overscan:0})
    expect(wrapper.vm.scrollToIndex(20,{align:'center'})).toBe(462.5)
    await nextTick()
    expect(wrapper.vm.getVisibleRange()).toMatchObject({visibleStart:18,visibleEnd:23,total:100})
    expect(wrapper.vm.scrollToKey('item-80',{align:'start'})).toBe(2000)
    expect(wrapper.vm.scrollToKey('missing')).toBe(-1)
  })

  it('measures variable rows and rebuilds later offsets',async()=>{
    const wrapper=render({items:items.slice(0,4),height:120,itemSize:40,estimatedItemSize:40,overscan:0,measure:true})
    await nextTick()
    const row=wrapper.get('.ui-virtual-list-item').element
    const observer=MockResizeObserver.instances.find(instance=>instance.elements.has(row))
    expect(observer).toBeTruthy()
    observer.trigger(row,76);await nextTick()
    expect(wrapper.get('.ui-virtual-list-content').attributes('style')).toContain('height: 196px')
    expect(wrapper.findAll('.ui-virtual-list-item')[1].attributes('style')).toContain('translateY(76px)')
    wrapper.vm.resetAfterIndex(0);await nextTick()
    expect(wrapper.get('.ui-virtual-list-content').attributes('style')).toContain('height: 160px')
  })

  it('supports pointer-driven single selection and deselection',async()=>{
    const wrapper=render({items:items.slice(0,5),selectionMode:'single',modelValue:'item-0',deselectable:true})
    const options=wrapper.findAll('[role="option"]')
    await options[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['item-2'])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({key:'item-2',index:2,selected:true,source:'pointer'})
    await options[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    expect(wrapper.emitted('item-click')).toHaveLength(2)
  })

  it('navigates enabled options and selects from the keyboard',async()=>{
    const wrapper=render({items:items.slice(0,6),selectionMode:'single',disabledKeys:['item-1'],defaultActiveIndex:0})
    const root=wrapper.get('[role="listbox"]')
    await root.trigger('keydown',{key:'ArrowDown'});await nextTick()
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([2])
    expect(root.attributes('aria-activedescendant')).toContain('-2')
    await root.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['item-2'])
    await root.trigger('keydown',{key:'End'});expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([5])
    await root.trigger('keydown',{key:'Home'});expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])
  })

  it('selects all enabled options and toggles multiple values',async()=>{
    const wrapper=render({items:items.slice(0,4),selectionMode:'multiple',modelValue:['item-0'],disabledKeys:['item-2']})
    const root=wrapper.get('[role="listbox"]')
    expect(root.attributes('aria-multiselectable')).toBe('true')
    await root.trigger('keydown',{key:'a',ctrlKey:true})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['item-0','item-1','item-3'])
    await root.trigger('keydown',{key:' '})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })

  it('provides typeahead and page navigation for long collections',async()=>{
    const wrapper=render({items:[{id:'a',label:'Alpha'},{id:'b',label:'Beta'},{id:'g',label:'Gamma'},...items],height:88,itemSize:44,selectionMode:'single'})
    const root=wrapper.get('[role="listbox"]')
    await root.trigger('keydown',{key:'g'});expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([2])
    await root.trigger('keydown',{key:'PageDown'});expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([4])
    await root.trigger('keydown',{key:'PageUp'});expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([2])
  })

  it('honors controlled active indexes without mutating internal focus',async()=>{
    const wrapper=render({items:items.slice(0,8),selectionMode:'single',activeIndex:3})
    const root=wrapper.get('[role="listbox"]')
    expect(root.attributes('aria-activedescendant')).toContain('-3')
    await root.trigger('keydown',{key:'ArrowDown'})
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([4])
    expect(root.attributes('aria-activedescendant')).toContain('-3')
  })

  it('renders localized loading, error and empty states with retry',async()=>{
    const loading=render({items:[],loading:true})
    expect(loading.get('[role="status"]').text()).toContain('正在加载列表')
    const failed=render({items:[],error:'Network unavailable'})
    expect(failed.get('[role="alert"]').text()).toContain('Network unavailable')
    await failed.get('button').trigger('click');expect(failed.emitted('retry')).toHaveLength(1)
    const empty=render({items:[],emptyText:'Nothing queued'})
    expect(empty.text()).toContain('Nothing queued')
  })

  it('passes rich state into the item slot and supports functional keys/text',()=>{
    const data=[{code:'x',name:'Extended row'},{code:'y',name:'Second row'}]
    const wrapper=render({items:data,itemKey:item=>item.code,textField:item=>item.name,selectionMode:'single',modelValue:'x'},{item:({item,index,itemKey,selected})=>`${index}:${itemKey}:${item.name}:${selected}`})
    expect(wrapper.get('.ui-virtual-list-item').text()).toBe('0:x:Extended row:true')
  })

  it('announces range boundaries once per crossing',async()=>{
    const wrapper=render({items:items.slice(0,10),height:100,itemSize:25,overscan:0})
    const root=wrapper.get('.ui-virtual-list')
    root.element.scrollTop=0;await root.trigger('scroll')
    expect(wrapper.emitted('reach-start')).toHaveLength(1)
    root.element.scrollTop=150;await root.trigger('scroll')
    expect(wrapper.emitted('reach-end')).toHaveLength(1)
    await root.trigger('scroll');expect(wrapper.emitted('reach-end')).toHaveLength(1)
  })
})

// @vitest-environment happy-dom
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UiCollapse from '../src/components/UiCollapse.vue'
import UiDescriptions from '../src/components/UiDescriptions.vue'
import UiMenu from '../src/components/UiMenu.vue'
import UiPopover from '../src/components/UiPopover.vue'
import UiResult from '../src/components/UiResult.vue'
import UiSegmented from '../src/components/UiSegmented.vue'
import UiSpin from '../src/components/UiSpin.vue'
import UiTooltip from '../src/components/UiTooltip.vue'
import { notification, notificationState, toast, toastState } from '../src/feedback.js'

describe('viewport-aware floating layers',()=>{
  beforeEach(()=>{
    Object.defineProperty(document.documentElement,'clientWidth',{configurable:true,value:800})
    Object.defineProperty(document.documentElement,'clientHeight',{configurable:true,value:600})
    vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){
      if(this.classList.contains('ui-popover-trigger'))return {left:700,right:780,top:550,bottom:582,width:80,height:32,x:700,y:550,toJSON(){}}
      if(this.classList.contains('ui-tooltip'))return {left:760,right:792,top:550,bottom:582,width:32,height:32,x:760,y:550,toJSON(){}}
      if(this.classList.contains('ui-popover-panel'))return {left:0,right:240,top:0,bottom:160,width:240,height:160,x:0,y:0,toJSON(){}}
      if(this.classList.contains('ui-tooltip-content'))return {left:0,right:150,top:0,bottom:40,width:150,height:40,x:0,y:0,toJSON(){}}
      return {left:0,right:0,top:0,bottom:0,width:0,height:0,x:0,y:0,toJSON(){}}
    })
  })
  afterEach(()=>{vi.restoreAllMocks();document.body.innerHTML=''})
  it('flips a bottom popover and keeps it inside the viewport',async()=>{
    const wrapper=mount(UiPopover,{attachTo:document.body,props:{modelValue:true,placement:'bottom'},slots:{default:'内容',trigger:'打开'}})
    await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-popover-panel')
    expect(panel.dataset.placement).toBe('top')
    expect(parseInt(panel.style.left)).toBeLessThanOrEqual(552)
    expect(parseInt(panel.style.top)).toBeGreaterThanOrEqual(8)
    wrapper.unmount()
  })
  it('shifts a tooltip away from the right edge',async()=>{
    const wrapper=mount(UiTooltip,{attachTo:document.body,props:{content:'完整提示信息'},slots:{default:'触发'}})
    await wrapper.trigger('mouseenter');await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-tooltip-content')
    expect(parseInt(panel.style.left)).toBeLessThanOrEqual(642)
    expect(panel.style.visibility).toBe('visible')
    wrapper.unmount()
  })
})

describe('new primitive interactions',()=>{
  it('moves menu focus with arrow keys and emits selection',async()=>{
    const wrapper=mount(UiMenu,{attachTo:document.body,props:{items:[{key:'a',label:'A'},{key:'group',label:'Group',children:[{key:'b',label:'B'}]}],defaultOpenKeys:['group']}})
    const buttons=wrapper.findAll('[role="menuitem"]');buttons[0].element.focus()
    await wrapper.trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(buttons[1].element)
    await buttons[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    wrapper.unmount()
  })
  it('connects collapse triggers and regions',async()=>{
    const wrapper=mount(UiCollapse,{props:{items:[{key:'rules',label:'规则',content:'内容'}],modelValue:[]}})
    const trigger=wrapper.get('button');await trigger.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['rules']])
    expect(trigger.attributes('aria-controls')).toBe(wrapper.get('[role="region"]').attributes('id'))
  })
  it('supports segmented arrow selection and disabled options',async()=>{
    const wrapper=mount(UiSegmented,{props:{modelValue:'day',options:[{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month',disabled:true}]}})
    await wrapper.trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['week'])
    expect(wrapper.findAll('[role="radio"]')[2].attributes('disabled')).toBeDefined()
  })
  it('renders semantic descriptions, results and loading state',()=>{
    const descriptions=mount(UiDescriptions,{props:{items:[{label:'名称',value:'Button'}],bordered:true}})
    const result=mount(UiResult,{props:{status:'error',title:'提交失败'}})
    const spin=mount(UiSpin,{props:{spinning:true,text:'读取中'},slots:{default:'数据'}})
    expect(descriptions.get('dt').text()).toBe('名称')
    expect(result.attributes('role')).toBe('alert')
    expect(spin.attributes('aria-busy')).toBe('true')
    expect(spin.get('[role="status"]').text()).toBe('读取中')
  })
})

describe('feedback services',()=>{
  beforeEach(()=>{vi.useFakeTimers();toast.clear();notificationState.current=null})
  afterEach(()=>{toast.clear();vi.useRealTimers()})
  it('opens, pauses, resumes and closes toast messages',()=>{
    const id=toast.success('保存成功',{duration:1000})
    expect(toastState.items[0]).toMatchObject({id,type:'success',message:'保存成功'})
    toast.pause(id);toast.resume(id);toast.close(id);vi.advanceTimersByTime(200)
    expect(toastState.items).toHaveLength(0)
  })
  it('runs notification actions and clears the current notice',()=>{
    const action=vi.fn();notification.error({title:'失败',message:'请重试',actionText:'重试',onAction:action})
    expect(notificationState.current.type).toBe('error')
    notification.action();expect(action).toHaveBeenCalledOnce();expect(notificationState.current).toBeNull()
  })
})

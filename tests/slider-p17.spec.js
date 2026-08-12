// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiSlider from '../src/components/UiSlider.vue'

describe('maturity P17 slider',()=>{
  it('links a localized slider to FormItem and exposes its value contract',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Completion',help:'Choose a percentage'}, {default:()=>h(UiSlider,{modelValue:40,min:0,max:100,step:5})})}})
    const slider=wrapper.get('[role="slider"]')
    expect(slider.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    expect(slider.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
    expect(slider.attributes('aria-describedby')).toBe(wrapper.get('.field-help').attributes('id'))
    expect(slider.attributes('aria-valuemin')).toBe('0')
    expect(slider.attributes('aria-valuemax')).toBe('100')
    expect(slider.attributes('aria-valuenow')).toBe('40')
  })

  it('steps decimal values with Arrow, Page, Home and End keys',async()=>{
    const wrapper=mount(UiSlider,{props:{modelValue:0.2,min:0,max:1,step:0.2,ariaLabel:'Volume'}})
    const slider=wrapper.get('[role="slider"]')
    await slider.trigger('keydown',{key:'ArrowRight'})
    await slider.trigger('keydown',{key:'PageUp'})
    await slider.trigger('keydown',{key:'Home'})
    await slider.trigger('keydown',{key:'End'})
    expect(wrapper.emitted('update:modelValue')?.map(event=>event[0])).toEqual([0.4,1,0,1])
    expect(wrapper.emitted('change')?.map(event=>event[1])).toEqual([
      {source:'keyboard',thumb:0},{source:'keyboard',thumb:0},{source:'keyboard',thumb:0},{source:'keyboard',thumb:0},
    ])
    expect(slider.attributes('aria-valuenow')).toBe('1')
  })

  it('maintains ordered range thumbs and the configured minimum distance',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiSlider,{modelValue:[20,80],range:true,min:0,max:100,step:5,minDistance:12,ariaLabel:'Price'})}})
    const [start,end]=wrapper.findAll('[role="slider"]')
    expect(start.attributes('aria-label')).toBe('Price Range start')
    expect(end.attributes('aria-label')).toBe('Price Range end')
    for(let index=0;index<20;index+=1)await start.trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.findComponent(UiSlider).emitted('update:modelValue')?.at(-1)?.[0]).toEqual([65,80])
    for(let index=0;index<20;index+=1)await end.trigger('keydown',{key:'ArrowLeft'})
    expect(wrapper.findComponent(UiSlider).emitted('update:modelValue')?.at(-1)?.[0]).toEqual([65,80])
  })

  it('maps directional keys in RTL, reverse and vertical modes',async()=>{
    const rtl=mount(UiConfigProvider,{props:{locale:'en-US',direction:'rtl'},slots:{default:()=>h(UiSlider,{modelValue:50,step:10,ariaLabel:'RTL'})}})
    await rtl.get('[role="slider"]').trigger('keydown',{key:'ArrowRight'})
    expect(rtl.findComponent(UiSlider).emitted('update:modelValue')?.at(-1)?.[0]).toBe(40)
    const reverse=mount(UiSlider,{props:{modelValue:50,step:10,reverse:true,ariaLabel:'Reverse'}})
    await reverse.get('[role="slider"]').trigger('keydown',{key:'ArrowRight'})
    expect(reverse.emitted('update:modelValue')?.at(-1)?.[0]).toBe(40)
    const vertical=mount(UiSlider,{props:{modelValue:50,step:10,vertical:true,ariaLabel:'Vertical'}})
    await vertical.get('[role="slider"]').trigger('keydown',{key:'ArrowUp'})
    expect(vertical.emitted('update:modelValue')?.at(-1)?.[0]).toBe(60)
    expect(vertical.get('[role="slider"]').attributes('aria-orientation')).toBe('vertical')
  })

  it('supports clickable marks, formatter output and contained formatter failures',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiSlider,{modelValue:20,marks:[0,{value:50,label:'Half'},100],tooltip:'always',formatter:value=>`${value}%`,ariaLabel:'Progress'})}})
    expect(wrapper.findAll('.ui-slider-mark-label')).toHaveLength(3)
    await wrapper.findAll('.ui-slider-mark-label')[1].trigger('click')
    expect(wrapper.findComponent(UiSlider).emitted('update:modelValue')?.at(-1)?.[0]).toBe(50)
    expect(wrapper.get('[role="tooltip"]').text()).toBe('50%')
    const contained=mount(UiSlider,{props:{modelValue:25,tooltip:'always',formatter:()=>{throw new Error('consumer')}}})
    expect(contained.get('[role="tooltip"]').text()).toBe('25')
  })

  it('moves by pointer and commits only once when the gesture ends',async()=>{
    const wrapper=mount(UiSlider,{attachTo:document.body,props:{modelValue:0,min:0,max:100,step:5,ariaLabel:'Pointer'}})
    wrapper.element.getBoundingClientRect=()=>({left:0,right:200,top:0,bottom:32,width:200,height:32,x:0,y:0,toJSON(){}})
    await wrapper.trigger('pointerdown',{button:0,clientX:150,clientY:16})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(75)
    document.dispatchEvent(new Event('pointerup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([75,{source:'pointer',thumb:0}])
    wrapper.unmount()
  })

  it('keeps disabled and readonly sliders immutable while preserving readonly focus',async()=>{
    const disabled=mount(UiSlider,{props:{modelValue:30,disabled:true,marks:[50]}})
    expect(disabled.get('[role="slider"]').attributes('tabindex')).toBe('-1')
    await disabled.get('[role="slider"]').trigger('keydown',{key:'ArrowRight'})
    expect(disabled.emitted('update:modelValue')).toBeUndefined()
    const readonly=mount(UiSlider,{props:{modelValue:30,readonly:true,marks:[50]}})
    expect(readonly.get('[role="slider"]').attributes('tabindex')).toBe('0')
    expect(readonly.get('[role="slider"]').attributes('aria-readonly')).toBe('true')
    expect(readonly.get('.ui-slider-mark-label').attributes('disabled')).toBeDefined()
  })
})

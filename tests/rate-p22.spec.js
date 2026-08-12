// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiRate from '../src/components/UiRate.vue'

describe('maturity P22 rate',()=>{
  it('links localized slider semantics to FormItem help and label',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Service rating',help:'Choose a score'}, {default:()=>h(UiRate,{modelValue:3,max:5})})}})
    const rate=wrapper.get('[role="slider"]')
    expect(rate.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    expect(rate.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
    expect(rate.attributes('aria-describedby')).toBe(wrapper.get('.field-help').attributes('id'))
    expect(rate.attributes('aria-valuemin')).toBe('0')
    expect(rate.attributes('aria-valuemax')).toBe('5')
    expect(rate.attributes('aria-valuenow')).toBe('3')
    expect(rate.attributes('aria-valuetext')).toBe('3 of 5')
  })

  it('supports fractional Arrow, Page, Home, End and Delete keyboard contracts',async()=>{
    const wrapper=mount(UiRate,{props:{modelValue:1.5,step:.5,ariaLabel:'Quality'}})
    const rate=wrapper.get('[role="slider"]')
    await rate.trigger('keydown',{key:'ArrowRight'})
    await rate.trigger('keydown',{key:'PageUp'})
    await rate.trigger('keydown',{key:'Home'})
    await rate.trigger('keydown',{key:'End'})
    await rate.trigger('keydown',{key:'Delete'})
    expect(wrapper.emitted('update:modelValue')?.map(event=>event[0])).toEqual([2,4.5,0,5,0])
    expect(wrapper.emitted('change')?.every(event=>event[1].source==='keyboard')).toBe(true)
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(rate.attributes('aria-valuenow')).toBe('0')
  })

  it('mirrors horizontal Arrow keys in RTL while vertical keys remain logical',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{direction:'rtl'},slots:{default:()=>h(UiRate,{modelValue:3,ariaLabel:'评分'})}})
    const rate=wrapper.get('[role="slider"]')
    await rate.trigger('keydown',{key:'ArrowRight'})
    await rate.trigger('keydown',{key:'ArrowUp'})
    expect(wrapper.findComponent(UiRate).emitted('update:modelValue')?.map(event=>event[0])).toEqual([2,3])
    expect(wrapper.get('.ui-rate').attributes('data-direction')).toBe('rtl')
  })

  it('previews and selects fractional values from pointer position',async()=>{
    const wrapper=mount(UiRate,{props:{modelValue:1,step:.25,ariaLabel:'Pointer rating'}})
    const item=wrapper.findAll('.ui-rate-item')[2]
    item.element.getBoundingClientRect=()=>({left:100,right:140,top:0,bottom:40,width:40,height:40})
    await item.trigger('pointermove',{clientX:111})
    expect(wrapper.emitted('hover-change')?.at(-1)).toEqual([2.5])
    expect(wrapper.findAll('.ui-rate-fill')[2].attributes('style')).toContain('50%')
    await item.trigger('pointerdown',{button:0,clientX:111})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2.5])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2.5,{source:'pointer',previous:1}])
  })

  it('clears the selected pointer value and emits complete metadata',async()=>{
    const wrapper=mount(UiRate,{props:{modelValue:3,allowClear:true,ariaLabel:'Clearable rating'}})
    const item=wrapper.findAll('.ui-rate-item')[2]
    item.element.getBoundingClientRect=()=>({left:0,right:40,top:0,bottom:40,width:40,height:40})
    await item.trigger('pointerdown',{button:0,clientX:40})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([0,{source:'pointer',previous:3}])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('formats text, uses configured descriptions and contains consumer errors',()=>{
    const configured=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiRate,{modelValue:4,showText:true,texts:['Poor','Fair','Good','Great','Excellent']})}})
    expect(configured.get('.ui-rate-text').text()).toBe('Great')
    expect(configured.get('[role="slider"]').attributes('aria-valuetext')).toBe('Great')
    const formatted=mount(UiRate,{props:{modelValue:2,showText:true,formatter:(value,max)=>`${value}/${max} custom`}})
    expect(formatted.get('.ui-rate-text').text()).toBe('2/5 custom')
    const contained=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiRate,{modelValue:2,showText:true,formatter:()=>{throw new Error('consumer')}})}})
    expect(contained.get('.ui-rate-text').text()).toBe('2 of 5')
  })

  it('keeps disabled and readonly values immutable with correct focusability',async()=>{
    const disabled=mount(UiRate,{props:{modelValue:2,disabled:true}})
    expect(disabled.get('[role="slider"]').attributes('tabindex')).toBe('-1')
    await disabled.get('[role="slider"]').trigger('keydown',{key:'End'})
    expect(disabled.emitted('update:modelValue')).toBeUndefined()
    const readonly=mount(UiRate,{props:{modelValue:2,readonly:true}})
    expect(readonly.get('[role="slider"]').attributes('tabindex')).toBe('0')
    expect(readonly.get('[role="slider"]').attributes('aria-readonly')).toBe('true')
    await readonly.get('[role="slider"]').trigger('keydown',{key:'End'})
    expect(readonly.emitted('update:modelValue')).toBeUndefined()
  })

  it('supports public item and text slots without losing slider semantics',()=>{
    const wrapper=mount(UiRate,{props:{modelValue:2,showText:true,ariaLabel:'Custom'},slots:{item:scope=>h('b',{class:'custom-item'},`${scope.index}:${scope.fill}`),text:scope=>h('em',scope.text)}})
    expect(wrapper.findAll('.custom-item')).toHaveLength(5)
    expect(wrapper.get('.custom-item').text()).toBe('0:100')
    expect(wrapper.get('.ui-rate-text em').text()).toContain('2')
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('2')
  })
})

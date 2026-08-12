// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiNumberInput from '../src/components/UiNumberInput.vue'

describe('maturity P16 number input',()=>{
  it('exposes a labelled spinbutton and localized controls inside a form item',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Quantity'}, {default:()=>h(UiNumberInput,{modelValue:2,min:0,max:5})})}})
    const input=wrapper.get('[role="spinbutton"]')
    const label=wrapper.get('label')
    expect(input.attributes('id')).toBe(label.attributes('for'))
    expect(input.attributes('aria-valuemin')).toBe('0')
    expect(input.attributes('aria-valuemax')).toBe('5')
    expect(input.attributes('aria-valuenow')).toBe('2')
    expect(wrapper.get('[aria-label="Decrease value"]').exists()).toBe(true)
    expect(wrapper.get('[aria-label="Increase value"]').exists()).toBe(true)
  })

  it('steps decimal values without floating-point drift and disables at bounds',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:0.1,min:0,max:0.5,step:0.2}})
    const increase=wrapper.get('.is-increase')
    await increase.trigger('click')
    await increase.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.map(event=>event[0])).toEqual([0.3,0.5])
    expect(wrapper.emitted('step')?.at(-1)).toEqual([0.5,{direction:1,step:0.2,source:'control'}])
    expect(increase.attributes('disabled')).toBeDefined()
  })

  it('keeps an editable draft then rounds and clamps on commit',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:5,min:0,max:10,precision:1}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('12.88')
    expect(wrapper.emitted('input')?.at(-1)?.[0]).toBe(12.88)
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(10)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([10,{source:'blur',previous:5}])
    expect(input.element.value).toBe('10.0')
  })

  it('restores the model and reports invalid free-form input',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:4}})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('not-a-number')
    await input.trigger('blur')
    expect(wrapper.emitted('invalid')?.[0]?.[0]).toEqual({reason:'parse',input:'not-a-number'})
    expect(input.element.value).toBe('4')
  })

  it('supports Arrow, Page, Home and End keyboard contracts',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:5,min:0,max:20,step:2}})
    const input=wrapper.get('input')
    await input.trigger('keydown',{key:'ArrowUp'})
    await input.trigger('keydown',{key:'PageDown'})
    await input.trigger('keydown',{key:'End'})
    await input.trigger('keydown',{key:'Home'})
    expect(wrapper.emitted('update:modelValue')?.map(event=>event[0])).toEqual([7,0,20,0])
    expect(wrapper.emitted('step')?.map(event=>event[1].source)).toEqual(['keyboard','keyboard'])
  })

  it('supports custom formatting, parsing, affixes and compact right controls',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:12.5,precision:2,controlsPosition:'right',formatter:value=>`$${value.toFixed(2)}`,parser:text=>text.replace('$','')},slots:{prefix:()=>h('span','USD'),suffix:()=>h('span','net')}})
    const input=wrapper.get('input')
    expect(input.element.value).toBe('$12.50')
    expect(wrapper.text()).toContain('USD')
    expect(wrapper.text()).toContain('net')
    expect(wrapper.findAll('.ui-number-input-controls button')).toHaveLength(2)
    await input.trigger('focus')
    await input.setValue('$18.75')
    await input.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(18.75)
  })

  it('creates an isolated control id and contains consumer hook failures',async()=>{
    const wrapper=mount(UiNumberInput,{props:{modelValue:8,formatter:()=>{throw new Error('formatter')},parser:()=>{throw new Error('parser')}}})
    const input=wrapper.get('input')
    expect(input.attributes('id')).toMatch(/^ui-number-input-/)
    expect(input.element.value).toBe('8')
    expect(wrapper.get('.is-decrease').attributes('aria-controls')).toBe(input.attributes('id'))
    await input.setValue('broken')
    await input.trigger('blur')
    expect(wrapper.emitted('invalid')?.[0]?.[0]).toEqual({reason:'parse',input:'broken'})
    expect(input.element.value).toBe('8')
  })
})

// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiColorPicker from '../src/components/UiColorPicker.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import { formatColor, getContrastRatio, getReadableTextColor, hslToRgb, hsvToRgb, isValidColor, parseColor, rgbToHsl, rgbToHsv } from '../src/color.js'

afterEach(()=>{document.body.innerHTML=''})

describe('maturity P21 color utilities',()=>{
  it('parses short, alpha, functional, percentage and named colors',()=>{
    expect(parseColor('#0af')).toEqual({r:0,g:170,b:255,a:1})
    expect(parseColor('#0af8')).toEqual({r:0,g:170,b:255,a:0.5333})
    expect(parseColor('rgb(100% 0% 50% / 25%)')).toEqual({r:255,g:0,b:128,a:0.25})
    expect(parseColor('hsl(120deg, 100%, 25%)')).toEqual({r:0,g:128,b:0,a:1})
    expect(parseColor('transparent')).toEqual({r:0,g:0,b:0,a:0})
  })

  it('round-trips HSV and HSL color spaces without material drift',()=>{
    const source={r:22,g:119,b:255,a:0.6}
    expect(hsvToRgb(rgbToHsv(source))).toEqual(source)
    expect(hslToRgb(rgbToHsl(source))).toEqual(source)
  })

  it('formats HEX, RGB and HSL values with explicit alpha contracts',()=>{
    expect(formatColor('rgba(22,119,255,.5)','hex',true)).toBe('#1677FF80')
    expect(formatColor('#1677FF','rgb',false)).toBe('rgb(22, 119, 255)')
    expect(formatColor('#FF000080','hsl',true)).toBe('hsla(0, 100%, 50%, .5)')
    expect(formatColor('bad')).toBe('')
  })

  it('calculates WCAG contrast and selects the more readable text color',()=>{
    expect(getContrastRatio('#000','#fff')).toBe(21)
    expect(getContrastRatio('rgba(0,0,0,.5)','#fff')).toBe(3.95)
    expect(getReadableTextColor('#1677FF')).toBe('#111827')
    expect(isValidColor('hsl(.5turn 50% 50%)')).toBe(true)
    expect(isValidColor('rgb(nope)')).toBe(false)
  })
})

describe('maturity P21 color picker',()=>{
  it('links to a form label and exposes localized dialog semantics',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Brand color'}, {default:()=>h(UiColorPicker,{modelValue:'#1677FF',appendToBody:false})})}})
    const trigger=wrapper.get('.ui-color-trigger')
    expect(trigger.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    await trigger.trigger('click')
    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('Color picker')
    expect(wrapper.get('.ui-color-plane').attributes('aria-valuetext')).toContain('Saturation')
  })

  it('supports controlled open state and preserves the requested placement',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#1677FF',open:false,appendToBody:false,placement:'top-end'}})
    await wrapper.get('.ui-color-trigger').trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.find('.ui-color-panel').exists()).toBe(false)
    await wrapper.setProps({open:true})
    expect(wrapper.get('.ui-color-panel').attributes('data-placement')).toBe('top-end')
  })

  it('updates saturation and brightness through complete keyboard contracts',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#808080',defaultOpen:true,appendToBody:false}})
    const plane=wrapper.get('.ui-color-plane')
    await plane.trigger('keydown',{key:'End'})
    await plane.trigger('keydown',{key:'ArrowUp',shiftKey:true})
    await plane.trigger('keydown',{key:'PageDown'})
    expect(wrapper.emitted('change')).toHaveLength(3)
    expect(wrapper.emitted('change')?.every(event=>event[1].source==='keyboard')).toBe(true)
    expect(Number(plane.attributes('aria-valuenow'))).toBe(100)
  })

  it('maps pointer coordinates into the two-dimensional color plane',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#FF0000',defaultOpen:true,appendToBody:false}})
    const plane=wrapper.get('.ui-color-plane')
    plane.element.getBoundingClientRect=()=>({left:10,right:210,top:20,bottom:120,width:200,height:100})
    await plane.trigger('pointerdown',{clientX:110,clientY:70,pointerId:1})
    await plane.trigger('pointerup',{clientX:110,clientY:70,pointerId:1})
    const value=wrapper.emitted('update:modelValue')?.at(-1)?.[0]
    expect(parseColor(value)).toEqual({r:128,g:64,b:64,a:1})
    expect(wrapper.emitted('change')?.at(-1)?.[1].source).toBe('plane')
  })

  it('mirrors pointer saturation in RTL direction',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{direction:'rtl'},slots:{default:()=>h(UiColorPicker,{modelValue:'#FF0000',defaultOpen:true,appendToBody:false})}})
    const plane=wrapper.get('.ui-color-plane')
    plane.element.getBoundingClientRect=()=>({left:10,right:210,top:20,bottom:120,width:200,height:100})
    await plane.trigger('pointerdown',{clientX:60,clientY:20,pointerId:1})
    const color=parseColor(wrapper.findComponent(UiColorPicker).emitted('update:modelValue')?.at(-1)?.[0])
    expect(color).toEqual({r:255,g:64,b:64,a:1})
  })

  it('supports hue and alpha sliders with input and committed change events',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#FF000080',alpha:true,defaultOpen:true,appendToBody:false}})
    const [hue,opacity]=wrapper.findAll('input[type="range"]')
    await hue.setValue('120');await hue.trigger('change')
    await opacity.setValue('25');await opacity.trigger('change')
    expect(wrapper.emitted('input')?.some(event=>event[1].source==='hue')).toBe(true)
    expect(wrapper.emitted('change')?.at(-1)?.[1].source).toBe('alpha')
    expect(parseColor(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).a).toBe(0.251)
  })

  it('normalizes text input and restores the last value after invalid input',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#1677FF',format:'rgb',defaultOpen:true,appendToBody:false}})
    const input=wrapper.get('.ui-color-text-input')
    await input.setValue('hsl(0 100% 50%)');await input.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('rgb(255, 0, 0)')
    await input.setValue('not-a-color');await input.trigger('blur')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual({reason:'parse',input:'not-a-color'})
    expect(input.element.value).toBe('rgb(255, 0, 0)')
  })

  it('selects presets, ignores invalid entries and optionally closes',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#000000',presets:['bad',{label:'Brand',value:'#1677FF'}, {value:'#FF0000',disabled:true}],closeOnSelect:true,defaultOpen:true,appendToBody:false}})
    expect(wrapper.findAll('.ui-color-preset')).toHaveLength(2)
    await wrapper.findAll('.ui-color-preset')[0].trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['#1677FF',{source:'preset',previous:'#000000'}])
    expect(wrapper.emitted('open-change')?.at(-1)).toEqual([false])
  })

  it('reports contrast and clears the model with complete metadata',async()=>{
    const wrapper=mount(UiColorPicker,{props:{modelValue:'#000000',showContrast:true,defaultOpen:true,appendToBody:false}})
    expect(wrapper.get('.ui-color-contrast').text()).toContain('21.00:1')
    await wrapper.get('.ui-color-clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['',{source:'clear',previous:'#000000'}])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('restores trigger focus on Escape and closes on outside interaction',async()=>{
    const wrapper=mount(UiColorPicker,{attachTo:document.body,props:{modelValue:'#1677FF',appendToBody:true}})
    const trigger=wrapper.get('.ui-color-trigger')
    await trigger.trigger('click');await nextTick()
    expect(document.querySelector('.ui-color-panel')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await nextTick()
    expect(document.activeElement).toBe(trigger.element)
    await trigger.trigger('click');document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await nextTick()
    expect(wrapper.emitted('open-change')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('prevents interaction while disabled or readonly',async()=>{
    const disabled=mount(UiColorPicker,{props:{modelValue:'#1677FF',disabled:true,appendToBody:false}})
    await disabled.get('.ui-color-trigger').trigger('click')
    expect(disabled.emitted('open-change')).toBeUndefined()
    const readonly=mount(UiColorPicker,{props:{modelValue:'#1677FF',readonly:true,defaultOpen:true,appendToBody:false}})
    expect(readonly.find('.ui-color-panel').exists()).toBe(true)
    await readonly.get('.ui-color-plane').trigger('keydown',{key:'End'})
    expect(readonly.emitted('update:modelValue')).toBeUndefined()
  })
})

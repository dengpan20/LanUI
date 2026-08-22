// @vitest-environment happy-dom
import fs from 'node:fs'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiCheckbox from '../src/components/UiCheckbox.vue'
import UiCheckboxGroup from '../src/components/UiCheckboxGroup.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiRadio from '../src/components/UiRadio.vue'
import UiRadioGroup from '../src/components/UiRadioGroup.vue'
import UiSwitch from '../src/components/UiSwitch.vue'

const settle=async()=>{await nextTick();await Promise.resolve();await nextTick()}

describe('selection controls P71',()=>{
  it('supports scalar values, custom true/false values and native checkbox form fields',async()=>{
    const wrapper=mount(UiCheckbox,{props:{modelValue:'enabled',trueValue:'enabled',falseValue:'paused',name:'alerts',form:'settings',label:'Alerts',description:'Critical notices',required:true}})
    const input=wrapper.get('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
    expect(input.attributes()).toMatchObject({name:'alerts',form:'settings',required:'',checked:'', 'aria-checked':'true'})
    expect(input.attributes('aria-describedby')).toContain('-description')
    await input.setValue(false)
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('paused')
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({checked:false,value:true,source:'pointer',group:false})
  })

  it('preserves array identity semantics and exposes indeterminate, read-only and imperative states',async()=>{
    const value=Number.NaN
    const wrapper=mount(UiCheckbox,{attachTo:document.body,props:{modelValue:[value,'other'],value,indeterminate:true,ariaLabel:'Mixed selection'}})
    expect(wrapper.get('input').element.indeterminate).toBe(true)
    expect(wrapper.get('input').attributes('aria-checked')).toBe('mixed')
    await wrapper.get('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['other'])
    await wrapper.setProps({modelValue:[value],readonly:true})
    expect(wrapper.vm.toggle('api')).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'readonly',source:'api'})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })

  it('runs controlled and uncontrolled checkbox groups with min/max limits and option slots',async()=>{
    const options=[{label:'Email',value:'email',description:'Release results'},{label:'SMS',value:'sms'},{label:'Inbox',value:'inbox'},{label:'Locked',value:'locked',disabled:true},{label:'Policy',value:'policy',readonly:true}]
    const controlled=mount(UiCheckboxGroup,{props:{modelValue:['email'],options,min:1,max:2,name:'channels',label:'Channels'}})
    const inputs=controlled.findAll('input[type="checkbox"]')
    expect(inputs).toHaveLength(5)
    expect(inputs.every(input=>input.attributes('name')==='channels')).toBe(true)
    await inputs[1].setValue(true)
    expect(controlled.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['email','sms'])
    await controlled.setProps({modelValue:['email','sms']})
    await inputs[2].setValue(true)
    expect(controlled.emitted('limit')?.at(-1)?.[0]).toMatchObject({reason:'max',value:'inbox',min:1,max:2})
    await inputs[0].setValue(false)
    await controlled.setProps({modelValue:['sms']})
    await inputs[1].setValue(false)
    expect(controlled.emitted('limit')?.at(-1)?.[0]).toMatchObject({reason:'min',value:'sms'})
    const uncontrolled=mount(UiCheckboxGroup,{props:{defaultValue:['email'],options,max:3}})
    expect(uncontrolled.vm.selectAll('api').next).toEqual(['email','sms','inbox'])
    expect(uncontrolled.vm.value).toEqual(['email','sms','inbox'])
    expect(uncontrolled.vm.clear('api').next).toEqual([])
  })

  it('links checkbox groups to FormItem without making every checkbox natively required',()=>{
    const Host=defineComponent({render:()=>h(UiFormItem,{label:'Channels',group:true,required:true,error:'Choose a channel'},()=>h(UiCheckboxGroup,{options:['email','sms']}))})
    const wrapper=mount(Host)
    const group=wrapper.get('[data-ui-checkbox-group]')
    expect(group.attributes('aria-labelledby')).toMatch(/^ui-form-label-/)
    expect(group.attributes('aria-describedby')).toMatch(/^ui-form-error-/)
    expect(group.attributes()).toMatchObject({'aria-invalid':'true','data-required':'true'})
    expect(group.attributes('aria-required')).toBeUndefined()
    expect(wrapper.findAll('input[type="checkbox"]').every(input=>input.attributes('required')===undefined)).toBe(true)
  })

  it('supports standalone radios and native named radio groups with focus methods',async()=>{
    const standalone=mount(UiRadio,{props:{modelValue:'starter',value:'team',name:'plan',size:'lg',label:'Team',description:'Shared workspace'}})
    await standalone.get('input').setValue(true)
    expect(standalone.emitted('update:modelValue')?.[0]?.[0]).toBe('team')
    expect(standalone.emitted('change')?.[0]?.[1]).toMatchObject({value:'team',checked:true,group:false})
    const group=mount(UiRadioGroup,{props:{defaultValue:'team',options:[{label:'Starter',value:'starter'},{label:'Team',value:'team'},{label:'Review',value:'review',readonly:true},{label:'Locked',value:'locked',disabled:true}],required:true,label:'Plan'}})
    const inputs=group.findAll('input[type="radio"]')
    expect(new Set(inputs.map(input=>input.attributes('name'))).size).toBe(1)
    expect(inputs[1].element.checked).toBe(true)
    await inputs[0].setValue(true)
    expect(group.vm.value).toBe('starter')
    expect(group.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'pointer',previous:'team',next:'starter'})
    expect(group.vm.focus()).toBe(true)
    await inputs[0].trigger('keydown',{key:'ArrowRight'});await settle()
    expect(group.vm.value).toBe('team')
    expect(group.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'keyboard',previous:'starter',next:'team'})
    await inputs[1].trigger('keydown',{key:'ArrowRight'});await settle()
    expect(group.vm.value).toBe('starter')
  })

  it('prevents read-only radio changes while preserving focusability',async()=>{
    const wrapper=mount(UiRadio,{props:{modelValue:'a',value:'b',readonly:true,label:'Read only'}})
    const input=wrapper.get('input')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(input.attributes('aria-disabled')).toBe('true')
    await input.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'readonly'})
  })

  it('supports switch value mapping, form submission, visible labels and complete states',async()=>{
    const wrapper=mount(UiSwitch,{props:{modelValue:'enabled',activeValue:'enabled',inactiveValue:'paused',name:'policy',form:'settings',checkedText:'Automatic',uncheckedText:'Paused',required:true}})
    const button=wrapper.get('[role="switch"]')
    expect(button.attributes()).toMatchObject({'aria-checked':'true','aria-required':'true'})
    expect(wrapper.get('input[type="hidden"]').attributes()).toMatchObject({name:'policy',form:'settings',value:'enabled'})
    expect(wrapper.get('.ui-switch-text').text()).toBe('Automatic')
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('paused')
    expect(wrapper.emitted('before-change')?.[0]?.[1]).toMatchObject({checked:false,previous:'enabled',next:'paused'})
    await wrapper.setProps({modelValue:'paused',readonly:true})
    expect(button.attributes('aria-readonly')).toBe('true')
    await button.trigger('click')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'readonly'})
  })

  it('handles asynchronous switch guards, duplicate locking, rejection and thrown errors',async()=>{
    let resolveGuard
    const guard=vi.fn(()=>new Promise(resolve=>{resolveGuard=resolve}))
    const wrapper=mount(UiSwitch,{props:{modelValue:false,beforeChange:guard,ariaLabel:'Policy'}})
    await wrapper.get('button').trigger('click')
    expect(wrapper.vm.pending).toBe(true)
    expect(wrapper.get('button').attributes()).toMatchObject({disabled:'','aria-busy':'true'})
    await wrapper.get('button').trigger('click')
    expect(guard).toHaveBeenCalledTimes(1)
    resolveGuard(true);await settle()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(true)
    const rejected=mount(UiSwitch,{props:{modelValue:false,beforeChange:()=>false,ariaLabel:'Rejected'}})
    await rejected.get('button').trigger('click')
    expect(rejected.emitted('update:modelValue')).toBeUndefined()
    expect(rejected.emitted('invalid')?.[0]?.[0]).toMatchObject({reason:'guard'})
    const broken=mount(UiSwitch,{props:{modelValue:false,beforeChange:()=>{throw new Error('policy failed')},ariaLabel:'Broken'}})
    await broken.get('button').trigger('click')
    expect(broken.emitted('invalid')?.[0]?.[0]).toMatchObject({reason:'guard-error',error:expect.any(Error)})
  })

  it('keeps slots, public CSS, RTL and SSR contracts synchronized',async()=>{
    const checkbox=mount(UiCheckbox,{props:{modelValue:true,description:'Fallback'},slots:{default:'Custom label',indicator:'CUSTOM',description:'Custom description'}})
    expect(checkbox.get('.ui-checkbox-indicator').text()).toBe('CUSTOM')
    expect(checkbox.get('.ui-selection-copy').text()).toContain('Custom label')
    expect(checkbox.get('.ui-selection-description').text()).toBe('Custom description')
    const radio=mount(UiRadio,{props:{modelValue:'a',value:'a'},slots:{default:'Radio label',indicator:'DOT'}})
    expect(radio.get('.ui-radio-indicator').text()).toBe('DOT')
    const toggle=mount(UiSwitch,{props:{modelValue:true},slots:{'checked-icon':'ON','checked-text':'Enabled'}})
    expect(toggle.get('.ui-switch-handle').text()).toBe('ON')
    expect(toggle.get('.ui-switch-text').text()).toBe('Enabled')
    const html=await renderToString(createSSRApp({render:()=>h('main',[h(UiCheckboxGroup,{defaultValue:['email'],options:['email','sms'],ariaLabel:'SSR channels'}),h(UiRadioGroup,{defaultValue:'team',options:['starter','team'],ariaLabel:'SSR plan'}),h(UiSwitch,{modelValue:'enabled',activeValue:'enabled',inactiveValue:'paused',checkedText:'Automatic'})])}))
    expect(html).toContain('data-ui-checkbox-group')
    expect(html).toContain('data-ui-radio-group')
    expect(html).toContain('data-ui-switch')
    const styles=fs.readFileSync('styles.css','utf8')
    expect(styles).toContain('[dir="rtl"] .ui-switch.size-lg.on .ui-switch-handle { transform: translateX(-18px); }')
    expect(styles).toContain('@media (forced-colors:active){.ui-checkbox-indicator')
  })
})

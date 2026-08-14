// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiOtpInput from '../src/components/UiOtpInput.vue'

const wrappers=[]
function render(props={}){
  const wrapper=mount(UiOtpInput,{attachTo:document.body,props})
  wrappers.push(wrapper)
  return wrapper
}
afterEach(()=>{while(wrappers.length)wrappers.pop()?.unmount();document.body.innerHTML=''})

describe('P47 UiOtpInput',()=>{
  it('renders a labelled one-time-code group with deterministic cells',()=>{
    const wrapper=render({modelValue:'1204',length:4,name:'verification-code',separator:'–',separatorEvery:2})
    const inputs=wrapper.findAll('.ui-otp-input-cell')
    expect(inputs).toHaveLength(4)
    expect(inputs.map(input=>input.element.value)).toEqual(['1','2','0','4'])
    expect(inputs[0].attributes('autocomplete')).toBe('one-time-code')
    expect(inputs[0].attributes('inputmode')).toBe('numeric')
    expect(wrapper.get('[type="hidden"]').attributes('name')).toBe('verification-code')
    expect(wrapper.get('.ui-otp-input-separator').text()).toBe('–')
    expect(wrapper.get('[role="group"]').classes()).toContain('complete')
  })

  it('accepts sequential input, advances focus and emits completion metadata',async()=>{
    const wrapper=render({length:4})
    const inputs=wrapper.findAll('.ui-otp-input-cell')
    await inputs[0].setValue('1');await nextTick()
    expect(document.activeElement).toBe(inputs[1].element)
    await inputs[1].setValue('2');await inputs[2].setValue('3');await inputs[3].setValue('4')
    expect(wrapper.emitted('update:modelValue')?.map(event=>event[0])).toEqual(['1','12','123','1234'])
    expect(wrapper.emitted('complete')?.at(-1)).toEqual(['1234',{source:'input',index:3,value:'1234',complete:true}])
  })

  it('normalizes full-width digits and distributes clipboard input',async()=>{
    const wrapper=render({length:6})
    const first=wrapper.findAll('.ui-otp-input-cell')[0]
    await first.trigger('paste',{clipboardData:{getData:()=> '１２ ３-４５６'}})
    expect(wrapper.findAll('.ui-otp-input-cell').map(input=>input.element.value)).toEqual(['1','2','3','4','5','6'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('123456')
    expect(wrapper.emitted('complete')?.at(-1)?.[1].source).toBe('paste')
  })

  it('suppresses duplicate native input events after completion',async()=>{
    const wrapper=render({modelValue:'123',length:4})
    const last=wrapper.findAll('.ui-otp-input-cell')[3]
    await last.setValue('4')
    await last.trigger('input')
    expect(wrapper.emitted('input')).toHaveLength(1)
    expect(wrapper.emitted('complete')).toHaveLength(1)
    expect(wrapper.emitted('complete')?.[0]?.[0]).toBe('1234')
  })

  it('supports backspace, delete and directional keyboard navigation',async()=>{
    const wrapper=render({modelValue:'1234',length:4})
    const inputs=wrapper.findAll('.ui-otp-input-cell')
    inputs[2].element.focus()
    await inputs[2].trigger('keydown',{key:'Backspace'});await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('124')
    expect(document.activeElement).toBe(inputs[2].element)
    await inputs[2].trigger('keydown',{key:'ArrowLeft'});expect(document.activeElement).toBe(inputs[1].element)
    await inputs[1].trigger('keydown',{key:'End'});expect(document.activeElement).toBe(inputs[3].element)
    await inputs[3].trigger('keydown',{key:'Home'});expect(document.activeElement).toBe(inputs[0].element)
    await inputs[0].trigger('keydown',{key:'Delete'})
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({source:'delete',index:0,previous:'124'})
  })

  it('supports alphanumeric transforms, masking and rejected-input feedback',async()=>{
    const wrapper=render({length:4,mode:'alphanumeric',uppercase:true,mask:true})
    const first=wrapper.findAll('.ui-otp-input-cell')[0]
    expect(first.attributes('type')).toBe('password')
    await first.trigger('paste',{clipboardData:{getData:()=> 'a-b９'}})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('AB9')
    await wrapper.findAll('.ui-otp-input-cell')[3].setValue('!')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual({source:'input',index:3,input:'!',mode:'alphanumeric'})
  })

  it('integrates form labelling and disabled, readonly and invalid states',()=>{
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Security code',error:'Expired code'}, {default:()=>h(UiOtpInput,{modelValue:'12',length:4,readonly:true})})}})
    wrappers.push(wrapper)
    const label=wrapper.get('label')
    const first=wrapper.findAll('.ui-otp-input-cell')[0]
    expect(first.attributes('id')).toBe(label.attributes('for'))
    expect(wrapper.get('[role="group"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="group"]').attributes('aria-describedby')).toBeTruthy()
    expect(first.attributes('aria-label')).toBe('Digit 1 of 4')
    expect(first.attributes('readonly')).toBeDefined()
  })

  it('synchronizes controlled values and length changes without emitting',async()=>{
    const wrapper=render({modelValue:'123456',length:6})
    await wrapper.setProps({modelValue:'98',length:4});await nextTick()
    expect(wrapper.findAll('.ui-otp-input-cell')).toHaveLength(4)
    expect(wrapper.findAll('.ui-otp-input-cell').map(input=>input.element.value)).toEqual(['9','8','',''])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('exposes focus, clear and setValue instance controls',async()=>{
    const wrapper=render({modelValue:'12',length:4})
    expect(wrapper.vm.focus(1)).toBe(true);expect(document.activeElement).toBe(wrapper.findAll('.ui-otp-input-cell')[1].element)
    expect(wrapper.vm.setValue('5678')).toBe(true)
    expect(wrapper.emitted('complete')?.at(-1)?.[0]).toBe('5678')
    expect(wrapper.vm.clear()).toBe(true);await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('')
    expect(document.activeElement).toBe(wrapper.findAll('.ui-otp-input-cell')[0].element)
  })

  it('renders deterministic SSR markup without browser globals',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiOtpInput,{modelValue:'2048',length:4,ariaLabel:'Deployment code',separator:'-',separatorEvery:2})}))
    expect(html).toContain('class="ui-otp-input')
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Deployment code"')
    expect(html.match(/ui-otp-input-cell/g)).toHaveLength(4)
    expect(html).toContain('ui-otp-input-separator')
  })
})

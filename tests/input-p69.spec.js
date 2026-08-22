// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiInput from '../src/components/UiInput.vue'

const mounted=[]
afterEach(()=>{while(mounted.length)mounted.pop().unmount()})
function create(props={},options={}){
  let wrapper
  wrapper=mount(UiInput,{attachTo:document.body,props:{...props,'onUpdate:modelValue':value=>wrapper.setProps({modelValue:value})},...options})
  mounted.push(wrapper)
  return wrapper
}

describe('P69 UiInput',()=>{
  it('forwards typed native form attributes and exposes stable state markers',()=>{
    const wrapper=create({modelValue:'18',type:'number',name:'age',form:'profile',autocomplete:'off',inputMode:'numeric',pattern:'[0-9]+',min:1,max:99,step:1,minlength:1,maxlength:2,required:true,ariaLabel:'Age'},{attrs:{class:'contract-input','data-contract':'native'}})
    const input=wrapper.get('input')
    expect(wrapper.classes()).toContain('contract-input')
    expect(wrapper.attributes('data-ui-input')).toBe('')
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(input.attributes()).toMatchObject({type:'number',name:'age',form:'profile',autocomplete:'off',inputmode:'numeric',pattern:'[0-9]+',min:'1',max:'99',step:'1',minlength:'1',maxlength:'2',required:'','aria-label':'Age','aria-required':'true','data-contract':'native'})
  })

  it('emits typed values and source metadata for native input and change',async()=>{
    const wrapper=create({modelValue:'old'})
    await wrapper.get('input').setValue('next')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['next'])
    expect(wrapper.emitted('input')[0]).toEqual(['next',expect.objectContaining({source:'input',previous:'old',value:'next',composing:false})])
    expect(wrapper.emitted('change')[0]).toEqual(['next',expect.objectContaining({source:'change',value:'next'})])
  })

  it('suppresses intermediate IME input and commits composition exactly once',async()=>{
    const wrapper=create({modelValue:''})
    const input=wrapper.get('input')
    await input.trigger('compositionstart')
    input.element.value='拼'
    await input.trigger('input')
    expect(wrapper.emitted('input')).toBeUndefined()
    await input.trigger('compositionend')
    await input.trigger('input')
    expect(wrapper.emitted('composition-start')).toHaveLength(1)
    expect(wrapper.emitted('composition-end')[0][0]).toBe('拼')
    expect(wrapper.emitted('input')).toHaveLength(1)
    expect(wrapper.emitted('input')[0][1].source).toBe('composition')
    input.element.value='拼音'
    await input.trigger('input')
    expect(wrapper.emitted('input')).toHaveLength(2)
    expect(wrapper.emitted('input')[1]).toEqual(['拼音',expect.objectContaining({source:'input'})])
  })

  it('supports lazy, trim and number v-model modifiers',async()=>{
    const wrapper=create({modelValue:0,modelModifiers:{lazy:true,trim:true,number:true}})
    const input=wrapper.get('input')
    input.element.value=' 42 '
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('input')[0][0]).toBe(42)
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([42])
    expect(wrapper.emitted('change')[0][0]).toBe(42)
  })

  it('formats at rest and parses an editable draft on blur',async()=>{
    const wrapper=create({modelValue:1200,formatter:value=>`¥${value}`,parser:value=>Number(String(value).replace(/[^0-9]/g,''))})
    const input=wrapper.get('input')
    expect(input.element.value).toBe('¥1200')
    await input.trigger('focus')
    expect(input.element.value).toBe('1200')
    input.element.value='¥2500'
    await input.trigger('input')
    await input.trigger('blur')
    await nextTick()
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(2500)
    expect(input.element.value).toBe('¥2500')
  })

  it('reports parser failures without replacing the controlled value',async()=>{
    const wrapper=create({modelValue:'stable',parser:()=>{throw new Error('bad')}})
    const input=wrapper.get('input')
    input.element.value='broken'
    await input.trigger('input')
    expect(wrapper.emitted('invalid')[0][0]).toMatchObject({reason:'parse',source:'input',input:'broken'})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clears with metadata, restores focus and dispatches a native form change',async()=>{
    let nativeChanges=0
    document.addEventListener('change',()=>{nativeChanges+=1},{once:true})
    const wrapper=create({modelValue:'query',clearable:true})
    await wrapper.get('.clear-action').trigger('click')
    await nextTick()
    expect(wrapper.emitted('clear')[0]).toEqual(['',expect.objectContaining({source:'clear',previous:'query'})])
    expect(wrapper.emitted('change')[0][1].source).toBe('clear')
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(nativeChanges).toBe(1)
  })

  it('supports Escape clearing and a custom clear value',async()=>{
    const wrapper=create({modelValue:'draft',clearable:true,clearOnEscape:true,clearValue:'reset'})
    const input=wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('keydown',{key:'Escape'})
    await nextTick()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['reset'])
    expect(wrapper.emitted('clear')[0][1].source).toBe('escape')
  })

  it('supports controlled and uncontrolled password visibility',async()=>{
    const uncontrolled=create({modelValue:'secret',type:'password',passwordToggle:true,defaultPasswordVisible:true})
    expect(uncontrolled.get('input').attributes('type')).toBe('text')
    await uncontrolled.get('.ui-input-action').trigger('click')
    expect(uncontrolled.get('input').attributes('type')).toBe('password')
    expect(uncontrolled.emitted('password-visibility-change')[0]).toEqual([false,{source:'control',previous:true}])
    const controlled=create({modelValue:'secret',type:'password',passwordToggle:true,passwordVisible:true})
    await controlled.get('.ui-input-action').trigger('click')
    expect(controlled.emitted('update:passwordVisible')[0]).toEqual([false])
    expect(controlled.get('input').attributes('type')).toBe('text')
  })

  it('renders addons, affixes and action slots without losing the native control',()=>{
    const wrapper=create({modelValue:'value',clearable:true},{slots:{prepend:'https://',prefix:'P',suffix:'.com',append:'Lookup','clear-icon':'C'}})
    expect(wrapper.get('.ui-input-addon.is-prepend').text()).toBe('https://')
    expect(wrapper.get('.ui-input-prefix').text()).toBe('P')
    expect(wrapper.get('.ui-input-suffix').text()).toBe('.com')
    expect(wrapper.get('.ui-input-addon.is-append').text()).toBe('Lookup')
    expect(wrapper.get('.clear-action').text()).toBe('C')
    expect(wrapper.get('input').element.value).toBe('value')
  })

  it('links the count and FormItem help to the native input',()=>{
    const wrapper=mount(UiFormItem,{attachTo:document.body,props:{label:'Project code',help:'Use the release identifier',required:true},slots:{default:()=>h(UiInput,{modelValue:'release',showCount:true,maxlength:12})}})
    mounted.push(wrapper)
    const input=wrapper.get('input')
    const ids=input.attributes('aria-describedby').split(' ')
    expect(input.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(input.attributes('aria-required')).toBe('true')
    expect(ids).toContain(wrapper.get('.field-help').attributes('id'))
    expect(ids).toContain(wrapper.get('.ui-input-count').attributes('id'))
    expect(wrapper.get('.ui-input-count').text()).toBe('7/12')
  })

  it('prioritizes loading and suppresses mutating actions for locked states',()=>{
    const loading=create({modelValue:'busy',clearable:true,loading:true})
    expect(loading.attributes('data-state')).toBe('loading')
    expect(loading.get('input').attributes('aria-busy')).toBe('true')
    expect(loading.find('.clear-action').exists()).toBe(false)
    expect(loading.get('[role="status"]').attributes('aria-label')).toBeTruthy()
    const disabled=create({modelValue:'locked',clearable:true,disabled:true})
    expect(disabled.attributes('data-state')).toBe('disabled')
    expect(disabled.find('.clear-action').exists()).toBe(false)
  })

  it('emits Enter and keydown contracts without intercepting form submission',async()=>{
    const wrapper=create({modelValue:'release'})
    const event={key:'Enter'}
    await wrapper.get('input').trigger('keydown',event)
    expect(wrapper.emitted('keydown')).toHaveLength(1)
    expect(wrapper.emitted('enter')[0][0]).toBe('release')
    expect(wrapper.emitted('enter')[0][2]).toMatchObject({source:'enter',value:'release'})
  })

  it('exposes focus, blur, select, setValue, clear and password controls',async()=>{
    const wrapper=create({modelValue:'abc',clearable:true,type:'password',passwordToggle:true})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(wrapper.vm.select()).toBe(true)
    expect(wrapper.vm.setValue('next')).toBe(true)
    expect(wrapper.vm.togglePassword('api')).toBe(true)
    expect(wrapper.vm.clear('api')).toBe(true)
    expect(wrapper.vm.blur()).toBe(true)
    await nextTick()
    expect(wrapper.emitted('change').map(event=>event[1].source)).toEqual(['api','api'])
  })

  it('renders deterministic SSR markup with slots and accessibility state',async()=>{
    const html=await renderToString(h(UiInput,{modelValue:'server',invalid:true,showCount:true,maxlength:10,ariaLabel:'Server field'},{prepend:()=>'/api',suffix:()=>'.json'}))
    expect(html).toContain('data-ui-input')
    expect(html).toContain('data-state="invalid"')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-label="Server field"')
    expect(html).toContain('6/10')
    expect(html).toContain('/api')
    expect(html).toContain('.json')
  })
})

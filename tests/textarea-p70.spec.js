// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiTextarea from '../src/components/UiTextarea.vue'

const mounted=[]
afterEach(()=>{while(mounted.length)mounted.pop().unmount()})
function create(props={},options={}){
  let wrapper
  wrapper=mount(UiTextarea,{attachTo:document.body,props:{...props,'onUpdate:modelValue':value=>wrapper.setProps({modelValue:value})},...options})
  mounted.push(wrapper)
  return wrapper
}

describe('P70 UiTextarea',()=>{
  it('forwards multiline form attributes and exposes stable state markers',()=>{
    const wrapper=create({modelValue:'Release note',name:'note',form:'release',autocomplete:'off',inputMode:'text',wrap:'hard',rows:4,minlength:3,maxlength:120,required:true,spellcheck:false,ariaLabel:'Release note'},{attrs:{class:'contract-textarea','data-contract':'native'}})
    const textarea=wrapper.get('textarea')
    expect(wrapper.classes()).toContain('contract-textarea')
    expect(wrapper.attributes('data-ui-textarea')).toBe('')
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(textarea.attributes()).toMatchObject({name:'note',form:'release',autocomplete:'off',inputmode:'text',wrap:'hard',rows:'4',minlength:'3',maxlength:'120',required:'',spellcheck:'false','aria-label':'Release note','aria-required':'true','data-contract':'native'})
  })

  it('emits string values and source metadata for native input and change',async()=>{
    const wrapper=create({modelValue:'old'})
    await wrapper.get('textarea').setValue('next')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['next'])
    expect(wrapper.emitted('input')[0]).toEqual(['next',expect.objectContaining({source:'input',previous:'old',value:'next',composing:false})])
    expect(wrapper.emitted('change')[0]).toEqual(['next',expect.objectContaining({source:'change',value:'next'})])
  })

  it('suppresses intermediate IME input and only deduplicates the committed value',async()=>{
    const wrapper=create({modelValue:''})
    const textarea=wrapper.get('textarea')
    await textarea.trigger('compositionstart')
    textarea.element.value='中文'
    await textarea.trigger('input')
    expect(wrapper.emitted('input')).toBeUndefined()
    await textarea.trigger('compositionend')
    await textarea.trigger('input')
    expect(wrapper.emitted('composition-start')).toHaveLength(1)
    expect(wrapper.emitted('composition-end')[0][0]).toBe('中文')
    expect(wrapper.emitted('input')).toHaveLength(1)
    expect(wrapper.emitted('input')[0][1].source).toBe('composition')
    textarea.element.value='中文说明'
    await textarea.trigger('input')
    expect(wrapper.emitted('input')).toHaveLength(2)
    expect(wrapper.emitted('input')[1]).toEqual(['中文说明',expect.objectContaining({source:'input'})])
  })

  it('supports lazy and trim model modifiers',async()=>{
    const wrapper=create({modelValue:'',modelModifiers:{lazy:true,trim:true}})
    const textarea=wrapper.get('textarea')
    textarea.element.value='  documented  '
    await textarea.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('input')[0][0]).toBe('documented')
    await textarea.trigger('change')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['documented'])
  })

  it('formats at rest and parses an editable draft on blur',async()=>{
    const wrapper=create({modelValue:'release',formatter:value=>`[${value}]`,parser:value=>value.replace(/[\[\]]/g,'')})
    const textarea=wrapper.get('textarea')
    expect(textarea.element.value).toBe('[release]')
    await textarea.trigger('focus')
    expect(textarea.element.value).toBe('release')
    textarea.element.value='[stable]'
    await textarea.trigger('input')
    await textarea.trigger('blur')
    await nextTick()
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe('stable')
    expect(textarea.element.value).toBe('[stable]')
  })

  it('reports parser failures without replacing the controlled value',async()=>{
    const wrapper=create({modelValue:'stable',parser:()=>{throw new Error('bad')}})
    const textarea=wrapper.get('textarea')
    textarea.element.value='broken'
    await textarea.trigger('input')
    expect(wrapper.emitted('invalid')[0][0]).toMatchObject({reason:'parse',source:'input',input:'broken'})
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clears with metadata, restores focus and dispatches a native form change',async()=>{
    let nativeChanges=0
    document.addEventListener('change',()=>{nativeChanges+=1},{once:true})
    const wrapper=create({modelValue:'draft',clearable:true,clearValue:'template'})
    await wrapper.get('.ui-textarea-action').trigger('click')
    await nextTick()
    expect(wrapper.emitted('clear')[0]).toEqual(['template',expect.objectContaining({source:'clear',previous:'draft'})])
    expect(wrapper.emitted('change')[0][1].source).toBe('clear')
    expect(document.activeElement).toBe(wrapper.get('textarea').element)
    expect(nativeChanges).toBe(1)
  })

  it('supports Escape clearing without affecting locked fields',async()=>{
    const wrapper=create({modelValue:'draft',clearable:true,clearOnEscape:true})
    await wrapper.get('textarea').trigger('keydown',{key:'Escape'})
    expect(wrapper.emitted('clear')[0][1].source).toBe('escape')
    const readonly=create({modelValue:'locked',clearable:true,clearOnEscape:true,readonly:true})
    await readonly.get('textarea').trigger('keydown',{key:'Escape'})
    expect(readonly.emitted('clear')).toBeUndefined()
  })

  it('emits configurable keyboard submit while preserving ordinary newlines',async()=>{
    const wrapper=create({modelValue:'publish',submitOnEnter:'ctrl-or-meta'})
    const textarea=wrapper.get('textarea')
    await textarea.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('submit')).toBeUndefined()
    await textarea.trigger('keydown',{key:'Enter',ctrlKey:true})
    expect(wrapper.emitted('keydown')).toHaveLength(2)
    expect(wrapper.emitted('submit')[0][0]).toBe('publish')
    expect(wrapper.emitted('submit')[0][2]).toMatchObject({source:'submit',value:'publish'})
    const both=create({modelValue:'publish',submitOnEnter:'both'})
    await both.get('textarea').trigger('keydown',{key:'Enter',ctrlKey:true})
    expect(both.emitted('submit')).toBeUndefined()
    await both.get('textarea').trigger('keydown',{key:'Enter',ctrlKey:true,metaKey:true})
    expect(both.emitted('submit')).toHaveLength(1)
  })

  it('renders affixes, actions and scoped footer/count slots',()=>{
    const wrapper=create({modelValue:'value',clearable:true,showCount:true,maxlength:12},{slots:{prefix:'P',suffix:'S','clear-icon':'C',footer:({count})=>`Draft ${count}`,count:({count, maxlength})=>`${count} of ${maxlength}`}})
    expect(wrapper.get('.ui-textarea-prefix').text()).toBe('P')
    expect(wrapper.get('.ui-textarea-suffix').text()).toBe('S')
    expect(wrapper.get('.ui-textarea-action').text()).toBe('C')
    expect(wrapper.get('.ui-textarea-footer-content').text()).toBe('Draft 5')
    expect(wrapper.get('.ui-textarea-count').text()).toBe('5 of 12')
  })

  it('links the count and FormItem help to the native textarea',()=>{
    const wrapper=mount(UiFormItem,{attachTo:document.body,props:{label:'Release description',help:'Summarize the change',required:true},slots:{default:()=>h(UiTextarea,{modelValue:'stable',showCount:true,maxlength:20})}})
    mounted.push(wrapper)
    const textarea=wrapper.get('textarea')
    const ids=textarea.attributes('aria-describedby').split(' ')
    expect(textarea.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(textarea.attributes('aria-required')).toBe('true')
    expect(ids).toContain(wrapper.get('.field-help').attributes('id'))
    expect(ids).toContain(wrapper.get('.ui-textarea-count').attributes('id'))
    expect(wrapper.get('.ui-textarea-count').text()).toBe('6/20')
  })

  it('autosizes within row constraints and restores manual resize mode',async()=>{
    const wrapper=create({modelValue:'line',rows:2,autoSize:{minRows:2,maxRows:4}})
    const textarea=wrapper.get('textarea').element
    Object.defineProperty(textarea,'scrollHeight',{configurable:true,get:()=>200})
    expect(wrapper.vm.resize('test')).toBe(true)
    expect(textarea.style.height).toBe('96px')
    expect(textarea.style.overflowY).toBe('auto')
    expect(wrapper.emitted('resize').at(-1)[0]).toMatchObject({source:'test',height:96,minRows:2,maxRows:4,overflow:'auto'})
    await wrapper.setProps({autoSize:false,resize:'horizontal'})
    await nextTick()
    expect(textarea.style.height).toBe('')
    expect(textarea.style.resize).toBe('horizontal')
  })

  it('prioritizes loading and exposes disabled, readonly and invalid states',()=>{
    const loading=create({modelValue:'busy',clearable:true,loading:true})
    expect(loading.attributes('data-state')).toBe('loading')
    expect(loading.get('textarea').attributes('aria-busy')).toBe('true')
    expect(loading.find('.ui-textarea-action').exists()).toBe(false)
    expect(loading.get('[role="status"]').attributes('aria-label')).toBeTruthy()
    expect(create({modelValue:'x',disabled:true}).attributes('data-state')).toBe('disabled')
    expect(create({modelValue:'x',readonly:true}).attributes('data-state')).toBe('readonly')
    expect(create({modelValue:'x',invalid:true}).get('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('exposes focus, blur, select, setValue, clear and resize controls',async()=>{
    const wrapper=create({modelValue:'abc',clearable:true,autoSize:true})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('textarea').element)
    expect(wrapper.vm.select()).toBe(true)
    expect(wrapper.vm.setValue('next')).toBe(true)
    expect(wrapper.vm.resize('api')).toBe(true)
    expect(wrapper.vm.clear('api')).toBe(true)
    expect(wrapper.vm.blur()).toBe(true)
    await nextTick()
    expect(wrapper.emitted('change').map(event=>event[1].source)).toEqual(['api','api'])
  })

  it('renders deterministic SSR markup with slots and accessibility state',async()=>{
    const html=await renderToString(h(UiTextarea,{modelValue:'server',invalid:true,showCount:true,maxlength:10,ariaLabel:'Server note',autoSize:true},{prefix:()=> 'P',suffix:()=> 'S',footer:()=> 'Autosize'}))
    expect(html).toContain('data-ui-textarea')
    expect(html).toContain('data-state="invalid"')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-label="Server note"')
    expect(html).toContain('6/10')
    expect(html).toContain('Autosize')
  })
})

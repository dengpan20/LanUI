// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiKeyValueEditor from '../src/components/UiKeyValueEditor.vue'

const entries=()=>[
  {id:'accept',key:'Accept',value:'application/json',enabled:true},
  {id:'trace',key:'X-Trace-Id',value:'release-42',enabled:false},
]

describe('P57 UiKeyValueEditor',()=>{
  it('renders controlled rows, column labels and serializable field names',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries(),name:'headers',ariaLabel:'Request headers'}})
    expect(wrapper.attributes('data-valid')).toBe('true')
    expect(wrapper.findAll('.ui-key-value-row')).toHaveLength(2)
    expect(wrapper.get('.ui-key-value-key').attributes('name')).toBe('headers[0][key]')
    expect(wrapper.get('.ui-key-value-value').attributes('name')).toBe('headers[0][value]')
    expect(wrapper.find('input[type="hidden"]').attributes()).toMatchObject({name:'headers[0][enabled]',value:'true'})
    expect(wrapper.attributes('aria-label')).toBe('Request headers')
  })

  it('detects empty and case-insensitive duplicate keys per row',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:[{key:'Token',value:'a'},{key:'token',value:'b'},{key:'',value:'c'}]}})
    expect(wrapper.attributes('data-valid')).toBe('false')
    expect(wrapper.vm.validate().errors.map(error=>error.code)).toEqual(['empty-key','duplicate-key','duplicate-key'])
    expect(wrapper.findAll('.ui-key-value-row.invalid')).toHaveLength(3)
    expect(wrapper.text()).toContain('键名不能为空')
  })

  it('supports case-sensitive keys, custom patterns and required values',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:[{key:'Token',value:''},{key:'token',value:'ok'}],caseSensitive:true,keyPattern:'^[A-Za-z]+$',requireValue:true}})
    expect(wrapper.vm.validate().errors).toEqual([expect.objectContaining({code:'empty-value',row:0,field:'value'})])
    expect(wrapper.get('.ui-key-value-value').attributes('aria-invalid')).toBe('true')
    expect(wrapper.vm.validate([{key:'bad-key',value:'ok'}])).toMatchObject({valid:false,errors:[{code:'invalid-key',row:0,field:'key',key:'bad-key'}]})
  })

  it('updates a row and emits complete previous/current validation metadata',async()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries()}})
    await wrapper.findAll('.ui-key-value-value')[0].setValue('text/plain')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]?.[0]).toMatchObject({key:'Accept',value:'text/plain'})
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({type:'update',source:'value-input',index:0,field:'value',previous:entries(),validation:{valid:true}})
  })

  it('adds, removes and preserves stable row identities',async()=>{
    const wrapper=mount(UiKeyValueEditor,{attachTo:document.body,props:{modelValue:entries(),maxRows:4}})
    const firstKeys=wrapper.findAll('.ui-key-value-row').map(row=>row.attributes('data-row-index'))
    const added=wrapper.vm.add({id:'region',key:'X-Region',value:'apac'},1,'test')
    expect(added).toMatchObject({type:'add',index:1,item:{key:'X-Region'}})
    await nextTick()
    expect(wrapper.findAll('.ui-key-value-row')).toHaveLength(3)
    expect(document.activeElement).toBe(wrapper.findAll('.ui-key-value-key')[1].element)
    const removed=wrapper.vm.remove(1,'test')
    expect(removed).toMatchObject({type:'remove',index:1,item:{key:'X-Region'}})
    await nextTick()
    expect(wrapper.findAll('.ui-key-value-row')).toHaveLength(2)
    expect(firstKeys).toEqual(['0','1'])
    wrapper.unmount()
  })

  it('moves rows through buttons and instance API',async()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries()}})
    await wrapper.findAll('.ui-key-value-actions button')[1].trigger('click')
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({from:0,to:1,source:'button'})
    expect(wrapper.vm.getValue().map(item=>item.id)).toEqual(['trace','accept'])
    expect(wrapper.vm.move(1,0,'api')).toMatchObject({from:1,to:0})
  })

  it('toggles row participation and emits the enabled state',async()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries()}})
    await wrapper.findAll('.ui-key-value-toggle input')[0].setValue(false)
    expect(wrapper.emitted('toggle')?.[0]?.[0]).toMatchObject({type:'toggle',index:0,enabled:false,source:'toggle'})
    expect(wrapper.vm.getValue()[0].enabled).toBe(false)
  })

  it('enforces minimum and maximum row limits',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries(),minRows:2,maxRows:2}})
    expect(wrapper.vm.add()).toBe(false)
    expect(wrapper.vm.remove(0)).toBe(false)
    expect(wrapper.emitted('limit')?.map(event=>event[0].action)).toEqual(['add','remove'])
    expect(wrapper.get('.ui-key-value-add').attributes()).toHaveProperty('disabled')
  })

  it('imports dotenv text in replace and append modes',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries(),maxRows:6}})
    expect(wrapper.vm.importText('# release\nREGION=apac\nTIMEOUT=30')).toMatchObject({type:'import',mode:'replace',count:2})
    expect(wrapper.vm.getValue()).toMatchObject([{key:'REGION',value:'apac',enabled:true},{key:'TIMEOUT',value:'30',enabled:true}])
    expect(wrapper.vm.importText('TRACE=on',{mode:'append'})).toMatchObject({mode:'append',count:1})
    expect(wrapper.vm.getValue()).toHaveLength(3)
    expect(wrapper.emitted('import')).toHaveLength(2)
  })

  it('reports invalid imported lines without mutating values',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries()}})
    expect(wrapper.vm.importText('VALID=yes\nmissing-separator')).toBe(false)
    expect(wrapper.vm.getValue()).toEqual(entries())
    expect(wrapper.emitted('invalid')?.[0]?.[0]).toMatchObject({valid:false,errors:[{code:'invalid-import',line:2}]})
  })

  it('supports custom field names and replacement',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:[{name:'region',content:'apac',active:true}],keyField:'name',valueField:'content',enabledField:'active'}})
    expect(wrapper.vm.getValue()[0]).toMatchObject({name:'region',content:'apac',active:true})
    expect(wrapper.vm.replace([{name:'timeout',content:'30',active:false}])).toMatchObject({type:'replace'})
    expect(wrapper.vm.getValue()[0]).toMatchObject({name:'timeout',content:'30',active:false})
  })

  it('integrates form labels, help and error descriptions',()=>{
    const wrapper=mount(UiFormItem,{props:{label:'请求头',help:'配置转发字段',error:'请求头配置错误'},slots:{default:()=>h(UiKeyValueEditor,{modelValue:[{key:'',value:'x'}],name:'headers'})}})
    const editor=wrapper.get('.ui-key-value-editor')
    expect(editor.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(editor.attributes('aria-describedby')).toContain(wrapper.get('.field-error').attributes('id'))
    expect(editor.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.ui-key-value-key').attributes('id')).toBe(wrapper.get('.field-label').attributes('for'))
  })

  it('honors read-only and disabled contracts',async()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries(),readonly:true}})
    expect(wrapper.get('.ui-key-value-key').attributes()).toHaveProperty('readonly')
    expect(wrapper.vm.add()).toBe(false)
    expect(wrapper.vm.toggle(0)).toBe(false)
    await wrapper.setProps({readonly:false,disabled:true})
    expect(wrapper.vm.focus()).toBe(false)
    expect(wrapper.get('.ui-key-value-key').attributes()).toHaveProperty('disabled')
  })

  it('uses provider locale copy',()=>{
    const wrapper=mount({render:()=>h(UiConfigProvider,{locale:'en-US'},()=>h(UiKeyValueEditor,{modelValue:[{key:'',value:''}]}))})
    expect(wrapper.text()).toContain('Key-value configuration')
    expect(wrapper.text()).toContain('The key is required')
  })

  it('supports all documented slots',()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:entries()},slots:{header:({values})=>h('b',{class:'custom-header'},`${values.length} headers`),row:({item})=>h('div',{class:'custom-row'},item.key),actions:()=>h('button',{class:'custom-action'},'Import')}})
    expect(wrapper.get('.custom-header').text()).toBe('2 headers')
    expect(wrapper.findAll('.custom-row')).toHaveLength(2)
    expect(wrapper.get('.custom-action').text()).toBe('Import')
  })

  it('renders the empty slot and adds from the exposed action',async()=>{
    const wrapper=mount(UiKeyValueEditor,{props:{modelValue:[]},slots:{empty:({add})=>h('button',{class:'empty-add',onClick:()=>add({key:'REGION',value:'apac'})},'Create')}})
    await wrapper.get('.empty-add').trigger('click')
    expect(wrapper.vm.getValue()).toMatchObject([{key:'REGION',value:'apac'}])
  })

  it('renders SSR-safe deterministic form controls',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiKeyValueEditor,{modelValue:entries(),name:'headers'})}))
    expect(html).toContain('class="ui-key-value-editor')
    expect(html).toContain('name="headers[0][key]"')
    expect(html).toContain('data-valid="true"')
  })
})

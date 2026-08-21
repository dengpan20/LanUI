// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiQueryBuilder from '../src/components/UiQueryBuilder.vue'
import UiSchemaForm from '../src/components/UiSchemaForm.vue'

const fields=[
  {key:'name',label:'Name',type:'text',defaultOperator:'contains'},
  {key:'age',label:'Age',type:'number',min:0,max:120},
  {key:'status',label:'Status',type:'select',options:[{label:'Active',value:'active'},{label:'Paused',value:'paused'}]},
  {key:'joinedAt',label:'Joined',type:'date'},
  {key:'verified',label:'Verified',type:'boolean'},
]
const wrappers=[]
function controlled(modelValue={combinator:'and',rules:[]},extra={}){
  let wrapper
  wrapper=mount(UiQueryBuilder,{attachTo:document.body,props:{modelValue,fields,...extra,'onUpdate:modelValue':value=>wrapper.setProps({modelValue:value})}})
  wrappers.push(wrapper);return wrapper
}
async function flush(){await Promise.resolve();await nextTick();await Promise.resolve();await nextTick()}
afterEach(()=>{while(wrappers.length)wrappers.pop()?.unmount();document.body.innerHTML='';vi.restoreAllMocks()})

describe('P50 UiQueryBuilder',()=>{
  it('adds a typed rule with stable identifiers and change metadata',async()=>{
    const wrapper=controlled()
    expect(wrapper.get('.ui-query-builder-empty').text()).toContain('暂无筛选条件')
    const result=wrapper.vm.addRule();await flush()
    expect(result.source).toBe('add-rule')
    expect(wrapper.props('modelValue').rules).toHaveLength(1)
    expect(wrapper.props('modelValue').rules[0]).toMatchObject({field:'name',operator:'contains',value:''})
    expect(wrapper.props('modelValue').rules[0].id).toContain('rule')
    expect(wrapper.emitted('add')?.at(-1)?.[0]).toMatchObject({type:'add',kind:'rule',index:0})
  })

  it('resets operator and value when the selected field changes',async()=>{
    const wrapper=controlled({combinator:'and',rules:[{field:'name',operator:'contains',value:'Ada'}]})
    const fieldSelect=wrapper.get('.is-field [role="combobox"]')
    await fieldSelect.trigger('click');await flush()
    const listbox=document.getElementById(fieldSelect.attributes('aria-controls'))
    const age=[...listbox.querySelectorAll('[role="option"]')].find(option=>option.textContent==='Age')
    age.click();await flush()
    expect(wrapper.props('modelValue').rules[0]).toMatchObject({field:'age',operator:'equals',value:null})
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toMatchObject({source:'field',field:'age'})
  })

  it('renders range, select, boolean and multi-value editors from field metadata',async()=>{
    const wrapper=controlled({combinator:'and',rules:[
      {field:'age',operator:'between',value:18,value2:65},
      {field:'status',operator:'equals',value:'active'},
      {field:'verified',operator:'equals',value:true},
      {field:'name',operator:'in',value:['Ada','Grace']},
    ]})
    expect(wrapper.findAll('.ui-number-input')).toHaveLength(2)
    expect(wrapper.findAll('.ui-query-builder-values.is-range')).toHaveLength(1)
    expect(wrapper.findAll('.is-value .ui-select')).toHaveLength(1)
    expect(wrapper.findAll('.is-value .ui-switch')).toHaveLength(1)
    expect(wrapper.findAll('.is-value .ui-input-tag')).toHaveLength(1)
  })

  it('adds, duplicates, moves and removes recursive groups immutably',async()=>{
    const original={combinator:'and',rules:[{field:'name',operator:'contains',value:'design'}]}
    const wrapper=controlled(original,{showNot:true,maxDepth:2})
    wrapper.vm.addGroup();await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(2)
    expect(wrapper.findAll('.ui-query-builder')).toHaveLength(2)
    wrapper.vm.duplicate(1);await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(3)
    wrapper.vm.move(2,-1);await flush()
    expect(wrapper.emitted('move')?.at(-1)?.[0]).toMatchObject({type:'move',from:2,to:1,kind:'group'})
    wrapper.vm.remove(1);await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(2)
    expect(original).toEqual({combinator:'and',rules:[{field:'name',operator:'contains',value:'design'}]})
  })

  it('supports keyboard duplicate, move, append and remove shortcuts',async()=>{
    const wrapper=controlled({combinator:'and',rules:[{field:'name',operator:'contains',value:'a'},{field:'name',operator:'contains',value:'b'}]})
    const first=wrapper.findAll('.ui-query-builder-rule')[0]
    await first.trigger('keydown',{key:'d',ctrlKey:true});await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(3)
    await wrapper.findAll('.ui-query-builder-rule')[1].trigger('keydown',{key:'ArrowDown',altKey:true});await flush()
    expect(wrapper.emitted('move')?.at(-1)?.[0]).toMatchObject({from:1,to:2})
    await wrapper.findAll('.ui-query-builder-rule')[2].trigger('keydown',{key:'Enter',ctrlKey:true});await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(4)
    await wrapper.findAll('.ui-query-builder-rule')[3].trigger('keydown',{key:'Backspace',altKey:true});await flush()
    expect(wrapper.props('modelValue').rules).toHaveLength(3)
  })

  it('validates missing fields, values, ordered ranges and custom rules',async()=>{
    const ruleValidator=vi.fn(value=>value==='blocked'?'Blocked values are reserved':true)
    const wrapper=controlled({combinator:'and',rules:[
      {field:'',operator:'',value:''},
      {field:'age',operator:'between',value:80,value2:20},
      {field:'name',operator:'equals',value:'blocked'},
    ]},{ruleValidator})
    const result=wrapper.vm.validate();await flush()
    expect(result.valid).toBe(false)
    expect(result.errors.map(error=>error.code)).toEqual(expect.arrayContaining(['field','order','custom']))
    expect(wrapper.findAll('.ui-query-builder-error')).toHaveLength(3)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0].source).toBe('validate')
  })

  it('evaluates nested AND, OR and NOT queries against records',()=>{
    const query={combinator:'and',rules:[
      {field:'age',operator:'between',value:18,value2:65},
      {combinator:'or',rules:[{field:'status',operator:'equals',value:'active'},{field:'name',operator:'startsWith',value:'Ada'}]},
      {combinator:'and',not:true,rules:[{field:'verified',operator:'equals',value:false}]},
    ]}
    const wrapper=controlled(query,{showNot:true})
    expect(wrapper.vm.matches({name:'Grace',age:37,status:'active',verified:true})).toBe(true)
    expect(wrapper.vm.matches({name:'Ada Lovelace',age:36,status:'paused',verified:true})).toBe(true)
    expect(wrapper.vm.matches({name:'Ada',age:17,status:'active',verified:true})).toBe(false)
    expect(wrapper.vm.matches({name:'Grace',age:37,status:'active',verified:false})).toBe(false)
  })

  it('uses custom field accessors and operator predicates',()=>{
    const customFields=[{key:'score',label:'Score',type:'number',getValue:record=>record.metrics.score,operators:['divisible']}]
    const customOperators=[{key:'divisible',label:'is divisible by',arity:1,types:['number'],test:(actual,expected)=>actual%expected===0}]
    const wrapper=controlled({combinator:'and',rules:[{field:'score',operator:'divisible',value:5}]},{fields:customFields,operators:customOperators})
    expect(wrapper.vm.matches({metrics:{score:25}})).toBe(true)
    expect(wrapper.vm.matches({metrics:{score:23}})).toBe(false)
  })

  it('serializes a hidden form value and optionally strips internal ids',async()=>{
    const wrapper=controlled({combinator:'or',rules:[{field:'status',operator:'in',value:['active','paused']}]},{name:'filters',emitIds:false})
    const hidden=wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('filters')
    expect(JSON.parse(hidden.attributes('value'))).toEqual({combinator:'or',rules:[{field:'status',operator:'in',value:['active','paused']}]})
    wrapper.vm.addRule();await flush()
    expect(wrapper.vm.getValue({includeIds:false}).rules.every(rule=>!Object.hasOwn(rule,'id'))).toBe(true)
  })

  it('enforces depth, count, readonly and disabled mutation boundaries',async()=>{
    const limited=controlled({combinator:'and',rules:[{field:'name',operator:'equals',value:'a'}]},{maxRules:1,maxDepth:0})
    expect(limited.vm.addRule()).toBe(false)
    expect(limited.vm.addGroup()).toBe(false)
    const readonly=controlled({combinator:'and',rules:[{field:'name',operator:'equals',value:'fixed'}]},{readonly:true})
    expect(readonly.attributes('aria-readonly')).toBe('true')
    expect(readonly.vm.remove(0)).toBe(false)
    expect(readonly.find('.ui-query-builder-node-actions').exists()).toBe(false)
    const disabled=controlled({combinator:'and',rules:[]},{disabled:true})
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.vm.clear()).toBe(false)
  })

  it('renders custom editor slots and works as a managed schema field',async()=>{
    const slotWrapper=mount(UiQueryBuilder,{props:{modelValue:{combinator:'and',rules:[{field:'name',operator:'equals',value:'Ada'}]},fields},slots:{value:({value})=>h('output',{class:'custom-query-value'},String(value).toUpperCase())}})
    wrappers.push(slotWrapper)
    expect(slotWrapper.get('.custom-query-value').text()).toBe('ADA')
    const model={filters:{combinator:'and',rules:[]}}
    const schema=mount(UiSchemaForm,{attachTo:document.body,props:{model,schema:[{name:'filters',type:'query-builder',label:'Filters',fullWidth:true,props:{fields}}]}})
    wrappers.push(schema)
    await schema.get('[data-query-add-rule]').trigger('click');await flush()
    expect(model.filters.rules).toHaveLength(1)
    expect(schema.emitted('field-change')?.at(-1)?.[0]).toMatchObject({name:'filters'})
  })

  it('provides localized accessible markup and deterministic SSR output',async()=>{
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{locale:'en-US'},slots:{default:()=>h(UiQueryBuilder,{modelValue:{combinator:'and',rules:[{field:'name',operator:'contains',value:'design'}]},fields,ariaLabel:'Release filters'})}})
    wrappers.push(wrapper)
    expect(wrapper.get('.ui-query-builder').attributes('aria-label')).toBe('Release filters')
    expect(wrapper.get('.ui-query-builder-rule').attributes('aria-label')).toBe('Condition 1')
    expect(wrapper.text()).toContain('of the following')
    const html=await renderToString(createSSRApp({render:()=>h(UiQueryBuilder,{modelValue:{combinator:'and',rules:[{field:'name',operator:'equals',value:'SSR'}]},fields,name:'query',ariaLabel:'SSR filters'})}))
    expect(html).toContain('class="ui-query-builder')
    expect(html).toContain('aria-label="SSR filters"')
    expect(html).toContain('type="hidden"')
    expect(html).toContain('&quot;field&quot;:&quot;name&quot;')
  })
})

// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiTree from '../src/components/UiTree.vue'

afterEach(()=>{document.body.innerHTML='';vi.restoreAllMocks()})

const data=[
  {label:'Workspace',value:'workspace',children:[
    {label:'Overview',value:'overview'},
    {label:'Settings',value:'settings',children:[{label:'Security',value:'security'},{label:'Audit',value:'audit'}]},
  ]},
  {label:'Reports',value:'reports'},
]
const row=(wrapper,label)=>wrapper.findAll('[role="treeitem"]').find(item=>item.text().includes(label))

describe('maturity P19 tree',()=>{
  it('inherits FormItem naming, descriptions and invalid state with stable tree semantics',async()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiFormItem,{label:'Resource tree',help:'Choose a resource',error:'Selection required',group:true},{default:()=>h(UiTree,{data,bordered:true})})}})
    const tree=wrapper.get('[role="tree"]')
    expect(tree.attributes('id')).toMatch(/^ui-form-control-/)
    expect(tree.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(tree.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
    expect(tree.attributes('aria-invalid')).toBe('true')
    expect(tree.attributes('tabindex')).toBe('0')
    expect(wrapper.get('[role="treeitem"]').attributes('aria-level')).toBe('1')
    expect(wrapper.get('[role="treeitem"]').attributes('aria-posinset')).toBe('1')
  })

  it('expands, collapses and navigates visible nodes with the keyboard in LTR and RTL',async()=>{
    const wrapper=mount(UiTree,{props:{data,'aria-label':'Resources'}})
    const tree=wrapper.get('[role="tree"]')
    await tree.trigger('focus')
    expect(tree.attributes('aria-activedescendant')).toContain('ui-tree-node-')
    await tree.trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4)
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual(['workspace'])
    await tree.trigger('keydown',{key:'ArrowRight'})
    expect(tree.attributes('aria-activedescendant')).toBe(row(wrapper,'Overview').attributes('id'))
    await tree.trigger('keydown',{key:'ArrowDown'})
    expect(tree.attributes('aria-activedescendant')).toBe(row(wrapper,'Settings').attributes('id'))
    await tree.trigger('keydown',{key:'ArrowLeft'})
    expect(tree.attributes('aria-activedescendant')).toBe(row(wrapper,'Workspace').attributes('id'))

    const rtl=mount(UiConfigProvider,{props:{direction:'rtl'},slots:{default:()=>h(UiTree,{data,'aria-label':'RTL resources'})}})
    const rtlTree=rtl.get('[role="tree"]')
    await rtlTree.trigger('focus');await rtlTree.trigger('keydown',{key:'ArrowLeft'})
    expect(rtl.findAll('[role="treeitem"]')).toHaveLength(4)
  })

  it('supports controlled single selection and ordered multiple range selection',async()=>{
    const single=mount(UiTree,{props:{data,defaultExpandedKeys:['workspace']}})
    await row(single,'Overview').trigger('click')
    expect(single.emitted('update:modelValue')?.at(-1)?.[0]).toBe('overview')
    expect(single.emitted('select-change')?.at(-1)?.[2]).toMatchObject({selected:true,source:'pointer'})
    const multiple=mount(UiTree,{props:{data,defaultExpandedKeys:['workspace','settings'],multiple:true}})
    await row(multiple,'Overview').trigger('click')
    await row(multiple,'Audit').trigger('click',{shiftKey:true})
    expect(multiple.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['overview','settings','security','audit'])
    await row(multiple,'Reports').trigger('click',{ctrlKey:true})
    expect(multiple.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['overview','settings','security','audit','reports'])
  })

  it('cascades checks down and derives mixed parents upward',async()=>{
    const wrapper=mount(UiTree,{props:{data,checkable:true,defaultExpandedKeys:['workspace','settings']}})
    const overview=row(wrapper,'Overview')
    await overview.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:checkedKeys')?.at(-1)?.[0]).toEqual(['overview'])
    expect(row(wrapper,'Workspace').get('[role="checkbox"]').attributes('aria-checked')).toBe('mixed')
    expect(wrapper.emitted('check-change')?.at(-1)?.[1].halfCheckedKeys).toEqual(['workspace'])
    await row(wrapper,'Settings').get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:checkedKeys')?.at(-1)?.[0]).toEqual(['workspace','overview','settings','security','audit'])
    expect(row(wrapper,'Workspace').get('[role="checkbox"]').attributes('aria-checked')).toBe('true')
  })

  it('supports strict checks and honors disabled selection and checkbox states',async()=>{
    const strict=mount(UiTree,{props:{data,checkable:true,checkStrictly:true,defaultExpandedKeys:['workspace']}})
    await row(strict,'Workspace').get('[role="checkbox"]').trigger('click')
    expect(strict.emitted('update:checkedKeys')?.at(-1)?.[0]).toEqual(['workspace'])
    expect(row(strict,'Overview').get('[role="checkbox"]').attributes('aria-checked')).toBe('false')
    const constrained=mount(UiTree,{props:{data:[{label:'Locked',value:'locked',disabled:true},{label:'Visible but fixed',value:'fixed',disableCheckbox:true}],checkable:true}})
    await row(constrained,'Locked').trigger('click')
    expect(constrained.emitted('update:modelValue')).toBeUndefined()
    expect(row(constrained,'Locked').attributes('aria-disabled')).toBe('true')
    expect(row(constrained,'Visible but fixed').get('[role="checkbox"]').attributes('disabled')).toBeDefined()
  })

  it('filters matches with their ancestor path and keeps hierarchy metadata',async()=>{
    const wrapper=mount(UiTree,{props:{data,filter:'audit'}})
    expect(wrapper.findAll('[role="treeitem"]').map(item=>item.text())).toEqual(['Workspace','Settings','Audit'])
    expect(row(wrapper,'Audit').attributes('aria-level')).toBe('3')
    await wrapper.setProps({filter:'SEC'})
    expect(wrapper.findAll('[role="treeitem"]').map(item=>item.text())).toEqual(['Workspace','Settings','Security'])
    await wrapper.setProps({filter:'missing'})
    expect(wrapper.get('.ui-tree-empty').text()).toContain('暂无树节点')
  })

  it('loads lazy children once, inherits checked parents and exposes busy state',async()=>{
    let resolveLoad
    const loadData=vi.fn((_node,{signal})=>new Promise((resolve,reject)=>{resolveLoad=resolve;signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true})}))
    const wrapper=mount(UiTree,{props:{data:[{label:'Remote',value:'remote',isLeaf:false}],checkable:true,loadData}})
    await row(wrapper,'Remote').get('[role="checkbox"]').trigger('click')
    await row(wrapper,'Remote').get('.ui-tree-toggle').trigger('click')
    expect(wrapper.get('[role="tree"]').attributes('aria-busy')).toBe('true')
    resolveLoad([{label:'Child',value:'child',isLeaf:true}])
    await Promise.resolve();await nextTick();await nextTick()
    expect(loadData).toHaveBeenCalledTimes(1)
    expect(row(wrapper,'Child')).toBeTruthy()
    expect(wrapper.emitted('load')?.at(-1)?.[0]).toMatchObject({node:{value:'remote'},children:[{value:'child'}]})
    expect(wrapper.emitted('update:checkedKeys')?.at(-1)?.[0]).toEqual(['remote','child'])
    await row(wrapper,'Remote').get('.ui-tree-toggle').trigger('click')
    await row(wrapper,'Remote').get('.ui-tree-toggle').trigger('click')
    expect(loadData).toHaveBeenCalledTimes(1)
  })

  it('contains lazy-load failures, emits details and supports retry',async()=>{
    const failure=new Error('network unavailable')
    const loadData=vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce([{label:'Recovered',value:'recovered',isLeaf:true}])
    const wrapper=mount(UiTree,{props:{data:[{label:'Remote',value:'remote',isLeaf:false}],loadData}})
    await row(wrapper,'Remote').get('.ui-tree-toggle').trigger('click')
    await Promise.resolve();await nextTick();await nextTick()
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toEqual({error:failure,node:expect.objectContaining({value:'remote'})})
    const retry=wrapper.get('.ui-tree-retry')
    expect(retry.text()).toContain('重试')
    await retry.trigger('click');await Promise.resolve();await nextTick();await nextTick()
    expect(loadData).toHaveBeenCalledTimes(2)
    expect(row(wrapper,'Recovered')).toBeTruthy()
  })

  it('loads only explicit empty lazy branches and never refetches existing children',async()=>{
    const loadData=vi.fn().mockResolvedValue([])
    const wrapper=mount(UiTree,{props:{data:[{label:'Local branch',value:'local',children:[{label:'Local leaf',value:'leaf'}]},{label:'Plain leaf',value:'plain'},{label:'Lazy',value:'lazy',isLeaf:false}],loadData}})
    expect(row(wrapper,'Plain leaf').find('.ui-tree-toggle').exists()).toBe(false)
    await row(wrapper,'Local branch').get('.ui-tree-toggle').trigger('click')
    expect(loadData).not.toHaveBeenCalled()
    await row(wrapper,'Lazy').get('.ui-tree-toggle').trigger('click')
    await Promise.resolve();await nextTick()
    expect(loadData).toHaveBeenCalledTimes(1)
    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({value:'lazy'}),expect.objectContaining({signal:expect.anything()}))
  })

  it('reports duplicate and missing keys without rendering ambiguous nodes',async()=>{
    const wrapper=mount(UiTree,{props:{data:[{label:'One',value:'same'},{label:'Duplicate',value:'same'},{label:'Missing'}]}})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1)
    expect(wrapper.get('[role="treeitem"]').attributes('aria-posinset')).toBe('1')
    expect(wrapper.get('[role="treeitem"]').attributes('aria-setsize')).toBe('1')
    expect(wrapper.emitted('data-error')?.[0]?.[0].errors.map(error=>error.code)).toEqual(['duplicate-key','missing-key'])
  })

  it('keeps controlled selection, expansion and checks authoritative until the parent updates',async()=>{
    const wrapper=mount(UiTree,{props:{data,modelValue:'overview',expandedKeys:['workspace'],checkedKeys:['overview'],checkable:true}})
    expect(row(wrapper,'Overview').classes()).toContain('selected')
    expect(row(wrapper,'Workspace').get('[role="checkbox"]').attributes('aria-checked')).toBe('mixed')
    await row(wrapper,'Workspace').get('.ui-tree-toggle').trigger('click')
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual([])
    expect(row(wrapper,'Overview')).toBeTruthy()
    await wrapper.setProps({expandedKeys:[]})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
  })

  it('virtualizes large root lists while preserving active descendant navigation',async()=>{
    const records=Array.from({length:100},(_,index)=>({label:`Node ${index}`,value:index}))
    const wrapper=mount(UiTree,{attachTo:document.body,props:{data:records,virtual:true,height:90,itemHeight:30,overscan:0,'aria-label':'Virtual resources'}})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
    const tree=wrapper.get('[role="tree"]')
    tree.element.scrollTop=1500;await tree.trigger('scroll');await nextTick()
    expect(wrapper.findAll('[role="treeitem"]')[0].text()).toContain('Node 50')
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('supports custom data keys, slots, defaults and empty content',async()=>{
    const wrapper=mount(UiTree,{props:{data:[{id:'root',title:'Custom root',nodes:[{id:'leaf',title:'Custom leaf'}]}],nodeKey:'id',labelKey:'title',childrenKey:'nodes',defaultExpandAll:true,defaultCheckedKeys:['leaf'],checkable:true},slots:{node:({node})=>h('strong',{class:'custom-node'},node.title),suffix:({node})=>h('small',node.id)}})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
    expect(wrapper.findAll('.custom-node').map(node=>node.text())).toEqual(['Custom root','Custom leaf'])
    expect(row(wrapper,'Custom root').get('[role="checkbox"]').attributes('aria-checked')).toBe('true')
    const empty=mount(UiTree,{props:{data:[]},slots:{empty:()=>h('span',{class:'custom-empty'},'No resources')}})
    expect(empty.get('.custom-empty').text()).toBe('No resources')
  })

  it('initializes defaults after delayed data and supports WAI sibling expansion and typeahead',async()=>{
    const delayed=mount(UiTree,{props:{data:[],defaultExpandAll:true,defaultCheckedKeys:['leaf'],checkable:true,'aria-label':'Delayed'}})
    await delayed.setProps({data:[{label:'Root',value:'root',children:[{label:'Leaf',value:'leaf'}]}]})
    expect(delayed.findAll('[role="treeitem"]')).toHaveLength(2)
    expect(row(delayed,'Root').get('[role="checkbox"]').attributes('aria-checked')).toBe('true')

    const branches=mount(UiTree,{props:{data:[{label:'Alpha',value:'a',children:[{label:'A child',value:'ac'}]},{label:'Beta',value:'b',children:[{label:'B child',value:'bc'}]},{label:'Reports',value:'r'}],'aria-label':'Branches'}})
    const tree=branches.get('[role="tree"]')
    await tree.trigger('focus');await tree.trigger('keydown',{key:'*'})
    expect(branches.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual(['a','b'])
    expect(branches.findAll('[role="treeitem"]')).toHaveLength(5)
    await tree.trigger('keydown',{key:'r'})
    expect(tree.attributes('aria-activedescendant')).toBe(row(branches,'Reports').attributes('id'))
  })

  it('aborts pending lazy requests on unmount',async()=>{
    let observedSignal
    const wrapper=mount(UiTree,{props:{data:[{label:'Remote',value:'remote',isLeaf:false}],loadData:(_node,{signal})=>{observedSignal=signal;return new Promise(()=>{})}}})
    await row(wrapper,'Remote').get('.ui-tree-toggle').trigger('click')
    expect(observedSignal?.aborted).toBe(false)
    wrapper.unmount()
    expect(observedSignal?.aborted).toBe(true)
  })
})

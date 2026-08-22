// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiTreeSelect from '../src/components/UiTreeSelect.vue'
import { lanUiConfigKey } from '../src/config-runtime.js'

const baseOptions=[
  {label:'Engineering',value:'engineering',description:'Product engineering',children:[
    {label:'Frontend',value:'frontend',keywords:['web']},
    {label:'Backend',value:'backend'},
  ]},
  {label:'Operations',value:'operations',disabled:true},
]

const mounted=[]
function create(props={},options={}){
  const wrapper=mount(UiTreeSelect,{attachTo:document.body,props:{options:baseOptions,appendToBody:false,...props},...options})
  mounted.push(wrapper)
  return wrapper
}
afterEach(()=>{while(mounted.length)mounted.pop().unmount();document.body.innerHTML=''})

describe('UiTreeSelect P74 production contract',()=>{
  it('preserves scalar selection while adding controlled open and expansion state',async()=>{
    const wrapper=create({modelValue:'frontend',open:true,expandedKeys:['engineering']})
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4)
    await wrapper.findAll('.ui-tree-select-expand')[0].trigger('click')
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual([])
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4)
    await wrapper.setProps({expandedKeys:[]})
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
    await wrapper.setProps({expandedKeys:['engineering']})
    await wrapper.findAll('.ui-tree-select-node-label')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('backend')
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({action:'select',source:'pointer'})
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false)
  })

  it('maps enterprise fields and filters with IME-safe search while retaining ancestors',async()=>{
    const options=[{name:'平台',id:'platform',items:[{name:'发布工程',id:'release',detail:'持续交付',terms:['CI']}]}]
    const wrapper=create({
      options,fieldNames:{label:'name',value:'id',children:'items',description:'detail',keywords:'terms'},
      defaultOpen:true,defaultExpandAll:true,searchable:true,showPath:true,
    })
    const input=wrapper.get('input[type="search"]')
    await input.trigger('compositionstart')
    await input.setValue('CI')
    expect(wrapper.emitted('search')).toBeUndefined()
    await input.trigger('compositionend')
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('CI')
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
    await wrapper.findAll('.ui-tree-select-node-label')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('release')
    expect(wrapper.text()).toContain('发布工程')
  })

  it('supports multiple selection, checkbox cascade, limits, tags and public methods',async()=>{
    const cascade=create({multiple:true,checkable:true,defaultExpandAll:true,defaultOpen:true})
    await cascade.findAll('.ui-tree-select-node-label')[0].trigger('click')
    expect(cascade.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['engineering','frontend','backend'])
    expect(cascade.findAll('.ui-tree-select-tag')).toHaveLength(3)
    expect(cascade.get('[role="treeitem"]').attributes('aria-checked')).toBe('true')
    await cascade.findAll('.ui-tree-select-tag button')[1].trigger('click')
    expect(cascade.emitted('deselect')?.at(-1)?.[0]).toEqual(['backend'])

    const limited=create({multiple:true,defaultExpandAll:true,maxCount:2,minCount:1})
    expect(limited.vm.select('frontend')).toMatchObject({action:'select'})
    expect(limited.vm.select('backend')).toMatchObject({action:'select'})
    expect(limited.vm.select('engineering')).toBe(false)
    expect(limited.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'max-count',maxCount:2})
    expect(limited.vm.remove('frontend')).toMatchObject({action:'deselect'})
    expect(limited.vm.remove('backend')).toBe(false)
    expect(limited.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'min-count',minCount:1})
  })

  it('loads children with retry, aborts superseded requests and ignores stale results',async()=>{
    const loader=vi.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([{label:'Recovered child',value:'recovered',isLeaf:true}])
    const wrapper=create({options:[{label:'Remote',value:'remote',isLeaf:false}],loadData:loader,defaultOpen:true})
    await wrapper.vm.expand('remote','api')
    expect(wrapper.emitted('load-error')?.at(-1)?.[0]).toMatchObject({source:'api'})
    expect(wrapper.find('.ui-tree-select-retry').exists()).toBe(true)
    await wrapper.get('.ui-tree-select-retry').trigger('click')
    await vi.waitFor(()=>expect(wrapper.text()).toContain('Recovered child'))
    expect(wrapper.emitted('load')?.at(-1)?.[0].children[0].value).toBe('recovered')

    const requests=[]
    const racing=create({options:[{label:'Async',value:'async',isLeaf:false}],loadData:(node,{signal})=>new Promise(resolve=>requests.push({signal,resolve}))})
    const first=racing.vm.loadNode('async','first')
    const second=racing.vm.loadNode('async','second')
    expect(requests[0].signal.aborted).toBe(true)
    requests[1].resolve([{label:'Current',value:'current',isLeaf:true}])
    await second
    requests[0].resolve([{label:'Stale',value:'stale',isLeaf:true}])
    await first
    await racing.vm.show()
    await racing.vm.expand('async')
    expect(racing.text()).toContain('Current')
    expect(racing.text()).not.toContain('Stale')
  })

  it('submits native values, validates required state and restores defaults on form reset',async()=>{
    const Host={
      components:{UiTreeSelect},
      data:()=>({items:baseOptions}),
      template:'<form><UiTreeSelect ref="tree" :options="items" default-value="frontend" default-expand-all name="team" required :append-to-body="false"/></form>',
    }
    const host=mount(Host,{attachTo:document.body})
    mounted.push(host)
    const tree=host.getComponent(UiTreeSelect)
    const form=host.get('form').element
    expect(new FormData(form).get('team')).toBe('frontend')
    tree.vm.select('backend')
    await nextTick()
    expect(new FormData(form).get('team')).toBe('backend')
    form.reset()
    await nextTick()
    expect(tree.emitted('update:modelValue')?.at(-1)?.[0]).toBe('frontend')

    const required=create({name:'requiredTree',required:true})
    const native=required.get('select')
    expect(native.element.checkValidity()).toBe(false)
    await native.trigger('invalid')
    expect(required.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'required',source:'native'})
  })

  it('implements tree keyboard navigation, RTL expansion, focus metadata and imperative focus',async()=>{
    const wrapper=create({defaultExpandedKeys:['engineering']})
    const trigger=wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown',{key:'ArrowDown'})
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown',{key:'ArrowRight'})
    await trigger.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('frontend')
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(trigger.element)

    const rtl=create({defaultOpen:true,ariaLabel:'RTL tree'},{global:{provide:{[lanUiConfigKey]:{direction:'rtl'}}}})
    const rtlTrigger=rtl.get('[role="combobox"]')
    await rtlTrigger.trigger('keydown',{key:'ArrowLeft'})
    expect(rtl.get('[role="treeitem"]').attributes('aria-expanded')).toBe('true')
    await rtl.vm.toggleExpand('engineering',false)
    expect(rtl.get('[role="treeitem"]').attributes('aria-expanded')).toBe('false')
    await rtlTrigger.trigger('keydown',{key:'Escape'})
    expect(rtlTrigger.attributes('aria-expanded')).toBe('false')
  })

  it('renders all public slots and remains SSR safe',async()=>{
    const wrapper=create({defaultOpen:true,defaultValue:'frontend',defaultExpandAll:true,clearable:true,searchable:true},{slots:{
      prefix:'prefix',suffix:'suffix',arrow:'arrow','clear-icon':'clear',tag:'tag',placeholder:'placeholder',value:'value',
      'search-prefix':'search',node:'node',icon:'icon',loading:'loading',error:'error',empty:'empty',footer:'footer',
    }})
    expect(wrapper.text()).toContain('prefix')
    expect(wrapper.text()).toContain('value')
    expect(wrapper.text()).toContain('search')
    expect(wrapper.text()).toContain('node')
    expect(wrapper.text()).toContain('footer')
    const html=await renderToString(h(UiTreeSelect,{options:baseOptions,modelValue:'frontend',appendToBody:true}))
    expect(html).toContain('data-ui-tree-select')
    expect(html).toContain('role="combobox"')
  })
})

// @vitest-environment happy-dom
import fs from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h, nextTick } from 'vue'
import UiTransfer from '../src/components/UiTransfer.vue'

const options=[
  {label:'前端平台',value:'frontend',description:'Web 与组件库',keywords:['browser']},
  {label:'后端服务',value:'backend',description:'API 与数据',keywords:['server']},
  {label:'产品设计',value:'design',description:'体验规范'},
  {label:'冻结团队',value:'frozen',disabled:true},
]

afterEach(()=>document.body.replaceChildren())

describe('UiTransfer P76 production contract',()=>{
  it('moves uncontrolled default selections and publishes structured metadata',async()=>{
    const wrapper=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['frontend']}})
    const buttons=wrapper.findAll('.ui-transfer-actions button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    await buttons[0].trigger('click')
    expect(wrapper.findAll('[data-direction="right"] .ui-transfer-option-copy>span').map(node=>node.text())).toEqual(['产品设计','前端平台'])
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual(['design','frontend'])
    expect(wrapper.emitted('change').at(-1)[1]).toMatchObject({source:'button',direction:'right',movedKeys:['frontend'],previous:['design'],next:['design','frontend']})
    expect(wrapper.emitted('move').at(-1)[0]).toMatchObject({direction:'right',movedKeys:['frontend']})
    expect(wrapper.emitted('update:selectedKeys').at(-1)[0]).toEqual([])
  })

  it('keeps controlled value and selected state immutable until the parent updates',async()=>{
    const wrapper=mount(UiTransfer,{props:{options,modelValue:['design'],selectedKeys:['frontend']}})
    await wrapper.find('.ui-transfer-actions button').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['design','frontend'])
    expect(wrapper.findAll('[data-direction="right"] .ui-transfer-option-copy>span').map(node=>node.text())).toEqual(['产品设计'])
    expect(wrapper.find('[data-direction="left"] .ui-virtual-list-item.is-selected').exists()).toBe(true)
  })

  it('keeps described virtual rows separated and paints selected checks with defined theme tokens',()=>{
    const wrapper=mount(UiTransfer,{props:{options,defaultSelectedKeys:['frontend'],itemHeight:32}})
    const rows=wrapper.findAll('[data-direction="left"] .ui-virtual-list-item')
    expect(rows.slice(0,3).map(row=>row.attributes('style'))).toEqual([
      expect.stringContaining('height: 44px'),
      expect.stringMatching(/translateY\(44px\).*height: 44px/),
      expect.stringMatching(/translateY\(88px\).*height: 44px/),
    ])
    expect(rows[0].classes()).toContain('is-selected')
    expect(rows[0].find('.ui-transfer-check [data-ui-icon]').exists()).toBe(true)
    const styles=fs.readFileSync('styles.css','utf8')
    expect(styles).toContain('.ui-transfer-list .is-selected .ui-transfer-check{border-color:var(--brand-600);background:var(--brand-600)}')
    expect(styles).not.toMatch(/ui-transfer[^\n]*var\(--brand-(?:primary|soft)\)/)
  })

  it('uses mixed row heights without changing the public itemHeight lower bound',()=>{
    const mixed=[
      {label:'Plain row',value:'plain'},
      {label:'Described row',value:'described',description:'Second line'},
      {label:'Another plain row',value:'plain-2'},
    ]
    const wrapper=mount(UiTransfer,{props:{options:mixed,itemHeight:20}})
    const rows=wrapper.findAll('[data-direction="left"] .ui-virtual-list-item')
    expect(rows.map(row=>row.attributes('style'))).toEqual([
      expect.stringMatching(/translateY\(0px\).*height: 24px/),
      expect.stringMatching(/translateY\(24px\).*height: 44px/),
      expect.stringMatching(/translateY\(68px\).*height: 24px/),
    ])
    expect(wrapper.find('[data-direction="left"] .ui-virtual-list-content').attributes('style')).toContain('height: 92px')
  })

  it('keeps measured mode on the same estimated offsets while allowing ResizeObserver measurement',()=>{
    const wrapper=mount(UiTransfer,{props:{options,itemHeight:28,measure:true}})
    const rows=wrapper.findAll('[data-direction="left"] .ui-virtual-list-item')
    expect(rows[0].attributes('style')).toContain('min-height: 44px')
    expect(rows[0].attributes('style')).not.toMatch(/(?:^|;)\s*height:\s*44px/)
    expect(rows[1].attributes('style')).toContain('translateY(44px)')
    expect(wrapper.find('[data-direction="left"] .ui-virtual-list-content').attributes('style')).toContain('height: 160px')
  })

  it('maps domain fields, filters descriptions and keywords, and defers IME search events',async()=>{
    const mapped=[
      {text:'浏览器交付',code:'web',locked:false,detail:'组件平台',tags:['frontend']},
      {text:'服务交付',code:'api',locked:true,detail:'后端平台',tags:['server']},
    ]
    const filter=vi.fn((query,option,side)=>side==='left'&&[option.label,option.description,...option.keywords].join(' ').includes(query))
    const wrapper=mount(UiTransfer,{props:{options:mapped,fieldNames:{label:'text',value:'code',disabled:'locked',description:'detail',keywords:'tags'},searchable:true,filterOption:filter}})
    const input=wrapper.find('[data-direction="left"] .ui-transfer-search input')
    await input.trigger('compositionstart')
    await input.setValue('front')
    expect(wrapper.emitted('search')).toBeUndefined()
    await input.trigger('compositionend')
    expect(wrapper.emitted('search').at(-1).slice(0,2)).toEqual(['front','left'])
    expect(filter).toHaveBeenCalledWith('front',expect.objectContaining({value:'web',label:'浏览器交付',description:'组件平台'}),'left')
    expect(wrapper.findAll('[data-direction="left"] .ui-virtual-list-item')).toHaveLength(1)
  })

  it('selects all visible enabled options without dropping hidden selections',async()=>{
    const wrapper=mount(UiTransfer,{props:{options,searchable:true,defaultSelectedKeys:['backend']}})
    await wrapper.find('[data-direction="left"] .ui-transfer-search input').setValue('前端')
    const selectAll=wrapper.find('[data-direction="left"] .ui-transfer-select-all')
    await selectAll.trigger('click')
    expect(wrapper.emitted('update:selectedKeys').at(-1)[0]).toEqual(['backend','frontend'])
    expect(wrapper.emitted('select-all').at(-1)[0]).toMatchObject({direction:'left',selected:true,visibleKeys:['frontend']})
    await selectAll.trigger('click')
    expect(wrapper.emitted('update:selectedKeys').at(-1)[0]).toEqual(['backend'])
  })

  it('protects disabled records and enforces target maximum and minimum constraints',async()=>{
    const maximum=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['frontend'],maxCount:1}})
    await maximum.find('.ui-transfer-actions button').trigger('click')
    expect(maximum.emitted('update:modelValue')).toBeUndefined()
    expect(maximum.emitted('limit')[0][0]).toMatchObject({reason:'max',limit:1,attempted:2,movedKeys:['frontend']})
    expect(maximum.emitted('invalid')[0][0]).toMatchObject({reason:'max'})

    const minimum=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['design'],minCount:1}})
    await minimum.findAll('.ui-transfer-actions button')[1].trigger('click')
    expect(minimum.emitted('update:modelValue')).toBeUndefined()
    expect(minimum.emitted('limit')[0][0]).toMatchObject({reason:'min',limit:1,attempted:0})

    const disabled=mount(UiTransfer,{props:{options,defaultSelectedKeys:['frozen']}})
    expect(disabled.find('.ui-transfer-actions button').attributes('disabled')).toBeDefined()
  })

  it('exposes loading, error, retry, empty and readonly states',async()=>{
    const wrapper=mount(UiTransfer,{props:{options:[],loading:{left:true},error:{right:'网络失败'},readonly:true}})
    expect(wrapper.attributes('data-state')).toBe('readonly')
    expect(wrapper.find('[data-direction="left"] .ui-transfer-spinner').exists()).toBe(true)
    expect(wrapper.find('[data-direction="right"] .ui-transfer-state.is-error').text()).toContain('网络失败')
    await wrapper.find('[data-direction="right"] .ui-transfer-state.is-error button').trigger('click')
    expect(wrapper.emitted('retry')[0]).toEqual(['right',{query:''}])
    expect(wrapper.findAll('.ui-transfer-actions button').every(button=>button.attributes('disabled')!==undefined)).toBe(true)
  })

  it('participates in native multiple forms, reports minimum validity, and resets defaults',async()=>{
    const form=document.createElement('form');document.body.append(form)
    const wrapper=mount(UiTransfer,{attachTo:form,props:{options,name:'teams',required:true,minCount:1,defaultValue:['design'],defaultSelectedKeys:['frontend'],defaultSearchValues:['前','']}})
    const native=wrapper.get('select.ui-transfer-native').element
    expect([...native.selectedOptions].map(option=>option.value)).toEqual(['design'])
    expect(native.checkValidity()).toBe(true)
    await wrapper.vm.moveTo('right',['frontend'],'api')
    await nextTick()
    expect([...native.selectedOptions].map(option=>option.value)).toEqual(['design','frontend'])
    await wrapper.vm.clearSearch('left')
    form.reset();await nextTick()
    expect(wrapper.vm.value).toEqual(['design'])
    expect(wrapper.vm.selectedKeys).toEqual(['frontend'])
    expect(wrapper.vm.searchValues).toEqual(['前',''])

    const empty=mount(UiTransfer,{attachTo:form,props:{options,name:'requiredTeams',required:true,minCount:1}})
    const invalid=empty.get('select').element
    expect(invalid.checkValidity()).toBe(false)
    invalid.dispatchEvent(new Event('invalid'))
    await nextTick()
    expect(empty.emitted('invalid').at(-1)[0]).toMatchObject({reason:'min',source:'native'})
  })

  it('moves selected records with Enter and exposes focus, selection and scrolling APIs',async()=>{
    const many=Array.from({length:250},(_,index)=>({label:`资源 ${index}`,value:index}))
    const wrapper=mount(UiTransfer,{attachTo:document.body,props:{options:many,defaultSelectedKeys:[0],listHeight:96,itemHeight:32,overscan:1}})
    const list=wrapper.find('[data-direction="left"] .ui-transfer-list')
    expect(wrapper.findAll('[data-direction="left"] .ui-virtual-list-item').length).toBeLessThan(20)
    await list.trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('change').at(-1)[1]).toMatchObject({source:'keyboard',direction:'right',movedKeys:[0]})
    expect(wrapper.vm.focus('right')).toBe(true)
    expect(wrapper.vm.getSelectedKeys()).toEqual([])
    expect(wrapper.vm.scrollTo('left',120,{align:'center'})).toBeGreaterThan(0)
    expect(wrapper.vm.blur()).toBe(true)
  })

  it('supports original and unshift ordering plus one-way protection',async()=>{
    const original=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['frontend'],targetOrder:'original'}})
    await original.vm.moveRight()
    expect(original.vm.value).toEqual(['frontend','design'])

    const unshift=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['backend'],targetOrder:'unshift'}})
    await unshift.vm.moveRight()
    expect(unshift.vm.value).toEqual(['backend','design'])

    const oneWay=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['design'],oneWay:true}})
    expect(oneWay.findAll('.ui-transfer-actions button')).toHaveLength(1)
    expect(oneWay.vm.moveLeft()).toBe(false)
    expect(oneWay.emitted('invalid')[0][0]).toMatchObject({reason:'one-way'})
  })

  it('renders all public customization slots with direction-aware scopes',()=>{
    const wrapper=mount(UiTransfer,{props:{options,defaultValue:['design'],defaultSelectedKeys:['frontend']},slots:{
      'left-header':scope=>h('b',{class:'left-header'},`${scope.selectedCount}/${scope.total}`),
      'right-header':scope=>h('b',{class:'right-header'},scope.title),
      'left-option':scope=>h('span',{class:'left-option'},scope.option.label),
      'right-option':scope=>h('span',{class:'right-option'},scope.option.label),
      operation:scope=>h('button',{class:`operation-${scope.direction}`,disabled:scope.disabled,onClick:scope.move},String(scope.count)),
      'left-footer':scope=>h('span',{class:'left-footer'},scope.query||'ready'),
      'right-footer':scope=>h('span',{class:'right-footer'},String(scope.total)),
    }})
    expect(wrapper.get('.left-header').text()).toBe('1/3')
    expect(wrapper.get('.right-header').text()).toContain('已选项')
    expect(wrapper.find('.left-option').exists()).toBe(true)
    expect(wrapper.find('.right-option').exists()).toBe(true)
    expect(wrapper.find('.operation-right').exists()).toBe(true)
    expect(wrapper.get('.left-footer').text()).toBe('ready')
    expect(wrapper.get('.right-footer').text()).toBe('1')
  })

  it('renders deterministic SSR markup without browser globals',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiTransfer,{options,defaultValue:['design'],searchable:true,ariaLabel:'Team assignment'})}))
    expect(html).toContain('data-ui-transfer')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('Team assignment')
    expect(html).toContain('产品设计')
  })
})

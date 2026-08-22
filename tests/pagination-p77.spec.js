// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiPagination from '../src/components/UiPagination.vue'
import { lanUiConfigKey } from '../src/config-runtime.js'

afterEach(()=>{vi.restoreAllMocks();delete global.ResizeObserver})

describe('P77 UiPagination maturity contract',()=>{
  it('preserves legacy page, size and total behavior with semantic page labels',()=>{
    const wrapper=mount(UiPagination,{props:{page:3,pageSize:10,total:86,pageSizeOptions:[10,20]}})
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('data-ui-pagination')).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('列表分页')
    expect(wrapper.get('.ui-pagination-total').text()).toContain('21–30')
    expect(wrapper.get('[data-page="3"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[data-page="3"]').attributes('aria-label')).toContain('当前页')
    expect(wrapper.findAll('.page-item').map(item=>item.text())).toEqual(['1','2','3','4','5','9'])
  })

  it('renders bounded pager windows and interactive ellipsis targets',async()=>{
    const wrapper=mount(UiPagination,{props:{defaultPage:50,total:1000,showSizeChanger:false,pagerCount:7}})
    expect(wrapper.findAll('.page-item').map(item=>item.text())).toEqual(['1','49','50','51','100'])
    const gaps=wrapper.findAll('.page-ellipsis.is-interactive')
    expect(gaps).toHaveLength(2)
    expect(gaps[0].attributes('aria-label')).toContain('向前跳转')
    await gaps[1].trigger('click')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('53')
    expect(wrapper.emitted('page-change')?.at(-1)?.[0]).toEqual(expect.objectContaining({page:53,previousPage:50,source:'jump-forward'}))
  })

  it('supports controlled page aliases and uncontrolled defaults',async()=>{
    const controlled=mount(UiPagination,{props:{modelValue:2,total:40,showSizeChanger:false}})
    await controlled.get('.page-next').trigger('click')
    expect(controlled.emitted('update:modelValue')?.[0]).toEqual([3])
    expect(controlled.emitted('update:page')?.[0]).toEqual([3])
    expect(controlled.get('[aria-current="page"]').text()).toBe('2')
    const uncontrolled=mount(UiPagination,{props:{defaultPage:2,total:40,showSizeChanger:false}})
    await uncontrolled.get('.page-next').trigger('click')
    expect(uncontrolled.get('[aria-current="page"]').text()).toBe('3')
    expect(uncontrolled.emitted('change')?.[0]?.[0]).toEqual(expect.objectContaining({page:3,previousPage:2,pageSize:10}))
  })

  it('normalizes totals and page inputs without rendering impossible states',async()=>{
    const wrapper=mount(UiPagination,{props:{page:99,pageSize:0,total:-12,showSizeChanger:false}})
    expect(wrapper.get('[aria-current="page"]').text()).toBe('1')
    expect(wrapper.get('.ui-pagination-total').text()).toContain('0–0')
    await wrapper.setProps({total:95,pageSize:10,page:99})
    expect(wrapper.get('[aria-current="page"]').text()).toBe('10')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual(expect.objectContaining({reason:'page-clamped',normalized:10}))
  })

  it.each([
    ['reset',1],
    ['preserve-page',4],
    ['preserve-item',2],
  ])('applies %s page-size behavior with one structured change',async(behavior,expectedPage)=>{
    const wrapper=mount(UiPagination,{props:{defaultPage:4,defaultPageSize:10,total:100,pageSizeChangeBehavior:behavior}})
    const result=wrapper.vm.setPageSize(20,'api')
    expect(result).toEqual(expect.objectContaining({page:expectedPage,pageSize:20,previousPage:4,previousPageSize:10}))
    await nextTick()
    expect(wrapper.vm.page).toBe(expectedPage)
    expect(wrapper.vm.pageSize).toBe(20)
    expect(wrapper.emitted('page-size-change')?.[0]?.[0]).toEqual(expect.objectContaining({page:expectedPage,pageSize:20}))
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('supports quick and simple jump input with clamping and Escape restoration',async()=>{
    const quick=mount(UiPagination,{props:{defaultPage:2,total:300,showQuickJumper:true,showSizeChanger:false}})
    const input=quick.get('.ui-pagination-jumper input')
    await input.setValue('99')
    await input.trigger('keydown',{key:'Enter'})
    expect(quick.vm.page).toBe(30)
    expect(quick.emitted('quick-jump')?.[0]?.[0]).toEqual(expect.objectContaining({page:30,source:'quick-jump'}))
    const simple=mount(UiPagination,{props:{defaultPage:3,total:100,simple:true}})
    const simpleInput=simple.get('.ui-pagination-simple input')
    await simpleInput.setValue('7')
    await simpleInput.trigger('keydown',{key:'Enter'})
    expect(simple.vm.page).toBe(7)
    await simpleInput.setValue('9')
    await simpleInput.trigger('keydown',{key:'Escape'})
    expect(simpleInput.element.value).toBe('7')
  })

  it('serializes asynchronous guards and reports rejection or failure',async()=>{
    let resolve
    const guard=vi.fn(()=>new Promise(done=>{resolve=done}))
    const wrapper=mount(UiPagination,{props:{defaultPage:1,total:50,beforeChange:guard,showSizeChanger:false}})
    const promise=wrapper.vm.next('api')
    expect(wrapper.vm.pending).toBe(true)
    await nextTick()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.vm.next('duplicate')).toBe(false)
    resolve(true)
    await promise;await flushPromises()
    expect(wrapper.vm.page).toBe(2)
    expect(wrapper.vm.pending).toBe(false)
    await wrapper.setProps({beforeChange:()=>false})
    expect(wrapper.vm.next('guarded')).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual(expect.objectContaining({reason:'guard-rejected'}))
    const quick=mount(UiPagination,{props:{total:50,showQuickJumper:true,showSizeChanger:false,beforeChange:()=>false}})
    await quick.get('.ui-pagination-jumper input').setValue('3')
    await quick.get('.ui-pagination-jumper input').trigger('keydown',{key:'Enter'})
    expect(quick.emitted('quick-jump')).toBeUndefined()
    await wrapper.setProps({beforeChange:()=>{throw new Error('offline')}})
    expect(wrapper.vm.next('failure')).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toEqual(expect.objectContaining({reason:'guard-error'}))
  })

  it('blocks disabled, readonly and loading mutations while preserving readonly focusability',async()=>{
    const disabled=mount(UiPagination,{props:{defaultPage:2,total:50,disabled:true,showSizeChanger:false}})
    expect(disabled.get('.page-next').attributes('disabled')).toBeDefined()
    expect(disabled.vm.next()).toBe(false)
    const readonly=mount(UiPagination,{props:{defaultPage:2,total:50,readonly:true,showSizeChanger:false}})
    expect(readonly.get('.page-next').attributes('disabled')).toBeUndefined()
    expect(readonly.get('.page-next').attributes('aria-disabled')).toBe('true')
    await readonly.get('.page-next').trigger('click')
    expect(readonly.vm.page).toBe(2)
    const loading=mount(UiPagination,{props:{total:50,loading:true}})
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.get('[role="status"]').text()).toBe('正在切换分页')
  })

  it('supports logical keyboard navigation in LTR and RTL',async()=>{
    const ltr=mount(UiPagination,{props:{defaultPage:2,total:50,showSizeChanger:false}})
    await ltr.get('[data-page="2"]').trigger('keydown',{key:'ArrowRight'})
    expect(ltr.vm.page).toBe(3)
    await ltr.get('[data-page="3"]').trigger('keydown',{key:'End'})
    expect(ltr.vm.page).toBe(5)
    const rtl=mount(UiPagination,{global:{provide:{[lanUiConfigKey]:{direction:'rtl'}}},props:{defaultPage:2,total:50,showSizeChanger:false}})
    await rtl.get('[data-page="2"]').trigger('keydown',{key:'ArrowLeft'})
    expect(rtl.vm.page).toBe(3)
    await rtl.get('[data-page="3"]').trigger('keydown',{key:'ArrowRight'})
    expect(rtl.vm.page).toBe(2)
  })

  it('supports responsive simple mode, hiding and sizes',async()=>{
    let callback
    global.ResizeObserver=class{constructor(value){callback=value}observe(){}disconnect(){}}
    const wrapper=mount(UiPagination,{props:{total:100,size:'lg'}})
    callback([{contentRect:{width:350}}]);await nextTick()
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['size-lg','is-narrow','is-tight','is-simple']))
    expect(wrapper.find('.ui-pagination-simple').exists()).toBe(true)
    await wrapper.setProps({total:3,pageSize:10,hideOnSinglePage:true})
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('supports all structural slots and imperative focus methods',()=>{
    const wrapper=mount(UiPagination,{attachTo:document.body,props:{defaultPage:2,total:100,showFirstLast:true,showQuickJumper:true},slots:{
      total:({total})=>h('strong',{class:'custom-total'},`Rows ${total}`),
      page:({page,go})=>h('button',{class:'custom-page',onClick:()=>go(page,'slot')},`P${page}`),
      previous:()=>h('i',{class:'custom-previous'},'Previous'),next:()=>h('i',{class:'custom-next'},'Next'),
      first:()=>h('i',{class:'custom-first'},'First'),last:()=>h('i',{class:'custom-last'},'Last'),
      ellipsis:({target})=>h('span',{class:'custom-gap'},`Jump ${target}`),
      'size-changer':()=>h('i',{class:'custom-size'},'Size'),
      'quick-jumper':()=>h('i',{class:'custom-jump'},'Jump'),
    }})
    expect(wrapper.get('.custom-total').text()).toBe('Rows 100')
    expect(wrapper.findAll('.custom-page').length).toBeGreaterThan(2)
    expect(wrapper.find('.custom-gap').exists()).toBe(true)
    expect(wrapper.get('.custom-size').text()).toBe('Size')
    expect(wrapper.get('.custom-jump').text()).toBe('Jump')
    expect(wrapper.vm.goTo(3,'api')).toEqual(expect.objectContaining({page:3}))
    expect(wrapper.vm.first()).toEqual(expect.objectContaining({page:1}))
    expect(wrapper.vm.last()).toEqual(expect.objectContaining({page:10}))
    expect(wrapper.vm.previous()).toEqual(expect.objectContaining({page:9}))
    expect(wrapper.vm.focus()).toBe(true)
    expect(wrapper.vm.blur()).toBe(true)
    wrapper.unmount()
  })

  it('renders deterministic localized SSR semantics',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiPagination,{modelValue:3,pageSize:20,total:150,showFirstLast:true,showQuickJumper:true,ariaLabel:'Release pages'})}))
    expect(html).toContain('data-ui-pagination')
    expect(html).toContain('aria-label="Release pages"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('显示 41–60 条，共 150 条记录')
    expect(html).toContain('ui-pagination-jumper')
  })
})

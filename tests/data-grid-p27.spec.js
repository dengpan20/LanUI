// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UiDataGrid from '../src/components/UiDataGrid.vue'
import UiListToolbar from '../src/components/UiListToolbar.vue'

const columns=[
  {key:'name',label:'Name',sortable:true},
  {key:'status',label:'Status',filterable:true,filterOptions:['active','paused']},
  {key:'score',label:'Score',sortable:true,sorter:(left,right)=>left.score-right.score},
]
const rows=Array.from({length:25},(_,index)=>({id:index+1,name:`Record ${String(index+1).padStart(3,'0')}`,status:index%2?'paused':'active',score:(index*7)%19,meta:{code:`C-${index+1}`}}))

afterEach(()=>vi.useRealTimers())

describe('UiDataGrid P27 orchestration',()=>{
  it('combines toolbar, client pagination, table semantics and result announcements',()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,page:2,pageSize:10,selectable:true,ariaLabel:'Records grid'}})
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-label')).toBe('Records grid')
    expect(wrapper.get('[role="toolbar"]').attributes('aria-label')).toBe('列表工具')
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(10)
    expect(wrapper.findAll('tbody .ui-table-row')[0].text()).toContain('Record 011')
    expect(wrapper.get('caption').text()).toBe('数据网格')
    expect(wrapper.text()).toContain('共 25 条匹配数据')
  })

  it('performs client search across configured nested fields and resets the page',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,page:3,pageSize:10,queryFields:['meta.code']}})
    await wrapper.get('input[aria-label="搜索数据"]').setValue('C-17')
    expect(wrapper.emitted('update:query')?.at(-1)).toEqual(['C-17'])
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['C-17'])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'search',mode:'client',state:{query:'C-17',page:1}})
    await wrapper.setProps({query:'C-17',page:1})
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(1)
    expect(wrapper.text()).toContain('Record 017')
  })

  it('contains custom search errors and supports custom search behavior',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,searchMethod:row=>row.score===7,showPagination:false}})
    await wrapper.setProps({query:'score'})
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(2)
    await wrapper.setProps({searchMethod:()=>{throw new Error('consumer')},query:'broken'})
    expect(wrapper.find('.ui-table-state').exists()).toBe(true)
  })

  it('filters locally with exact values, arrays and column filter methods',async()=>{
    const customColumns=[...columns,{key:'group',label:'Group',filterMethod:(value,row,filter)=>row.id%Number(filter)===0}]
    const wrapper=mount(UiDataGrid,{props:{columns:customColumns,rows:rows.map(row=>({...row,group:'all'})),filters:{status:['active']},showPagination:false}})
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(13)
    await wrapper.setProps({filters:{group:5}})
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(5)
  })

  it('sorts client rows stably with default and column comparators',async()=>{
    const sample=[{id:1,name:'Item 10',status:'active',score:7},{id:2,name:'Item 2',status:'active',score:3},{id:3,name:'Item 2',status:'paused',score:3}]
    const wrapper=mount(UiDataGrid,{props:{columns,rows:sample,sortKey:'name',sortOrder:'asc',showPagination:false}})
    expect(wrapper.findAll('tbody .ui-table-row').map(row=>row.text())).toEqual(expect.arrayContaining([expect.stringContaining('Item 2')]))
    expect(wrapper.findAll('tbody .ui-table-row')[0].text()).toContain('Item 2')
    await wrapper.setProps({sortKey:'score',sortOrder:'desc'})
    expect(wrapper.findAll('tbody .ui-table-row')[0].text()).toContain('Item 10')
    expect(wrapper.findAll('tbody .ui-table-row').slice(1).map(row=>row.text()).every(text=>text.includes('Item 2'))).toBe(true)
  })

  it('turns table sort and filter interactions into one coherent grid state',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,page:2}})
    await wrapper.get('button.ui-table-sort').trigger('click')
    expect(wrapper.emitted('update:sortKey')?.at(-1)).toEqual(['name'])
    expect(wrapper.emitted('update:sortOrder')?.at(-1)).toEqual(['asc'])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'sort',state:{sortKey:'name',sortOrder:'asc',page:1}})
    const filter=wrapper.findAll('.ui-table-filter')[0]
    await filter.trigger('click')
    await wrapper.findAll('.ui-table-filter-menu button')[1].trigger('click')
    expect(wrapper.emitted('update:filters')?.at(-1)).toEqual([{status:'active'}])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'filter',state:{filters:{status:'active'},page:1}})
  })

  it('emits a single page or page-size state transition from pagination',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,page:1,pageSize:10}})
    await wrapper.get('button[aria-label="下一页"]').trigger('click')
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'page',state:{page:2,pageSize:10}})
    wrapper.findComponent({name:'UiPagination'}).vm.$emit('change',{page:1,pageSize:20})
    expect(wrapper.emitted('update:pageSize')?.at(-1)).toEqual([20])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'page-size',state:{page:1,pageSize:20}})
  })

  it('keeps server rows untouched and can request its initial state',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows:rows.slice(0,3),mode:'server',total:240,page:4,pageSize:25,query:'remote',filters:{status:'active'},sortKey:'name',sortOrder:'desc',autoRequest:true}})
    await nextTick()
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(3)
    expect(wrapper.text()).toContain('共 240 条匹配数据')
    expect(wrapper.emitted('request')?.[0]?.[0]).toMatchObject({reason:'init',mode:'server',state:{page:4,pageSize:25,query:'remote',filters:{status:'active'},sortKey:'name',sortOrder:'desc'}})
  })

  it('debounces server search requests while publishing controlled updates immediately',async()=>{
    vi.useFakeTimers()
    const wrapper=mount(UiDataGrid,{props:{columns,rows:[],mode:'server',searchDebounce:120}})
    const input=wrapper.get('input[aria-label="搜索数据"]')
    await input.setValue('a');await input.setValue('ab')
    expect(wrapper.emitted('update:query')?.length).toBe(2)
    expect(wrapper.emitted('request')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(119);expect(wrapper.emitted('request')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.emitted('request')).toHaveLength(1)
    expect(wrapper.emitted('request')?.[0]?.[0]).toMatchObject({reason:'search',state:{query:'ab',page:1}})
  })

  it('provides refresh and retry request contracts',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,error:'Network unavailable'}})
    await wrapper.get('button[aria-label="刷新列表"]').trigger('click')
    expect(wrapper.emitted('refresh')?.at(-1)?.[0]).toMatchObject({reason:'refresh'})
    expect(wrapper.emitted('request')?.at(-1)?.[0]).toMatchObject({reason:'refresh'})
    await wrapper.get('.ui-table-state button').trigger('click')
    expect(wrapper.emitted('retry')?.at(-1)?.[0]).toMatchObject({reason:'retry'})
    expect(wrapper.emitted('request')?.at(-1)?.[0]).toMatchObject({reason:'retry'})
  })

  it('owns accessible column visibility settings and restores trigger focus on Escape',async()=>{
    const wrapper=mount(UiDataGrid,{attachTo:document.body,props:{columns,rows:rows.slice(0,2)}})
    const trigger=wrapper.get('button[aria-label="显示列"]')
    await trigger.trigger('click')
    const group=wrapper.get('[role="group"][aria-label="列设置"]')
    expect(trigger.attributes('aria-controls')).toBe(group.attributes('id'))
    await group.findAll('input')[1].setValue(false)
    expect(wrapper.emitted('update:visibleColumns')?.at(-1)).toEqual([['name','score']])
    await wrapper.setProps({visibleColumns:['name','score']})
    await wrapper.get('[role="toolbar"]').trigger('keydown',{key:'Escape'})
    expect(wrapper.find('[aria-label="列设置"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('forwards table models and scoped presentation slots',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows:rows.slice(0,2),selectable:true,expandable:true,showPagination:false},slots:{
      'cell-status':scope=>`State:${scope.value}`,
      expanded:scope=>`Expanded:${scope.row.name}`,
      'toolbar-actions':'<button id="bulk-action">Bulk</button>',
      filters:scope=>`Filters:${Object.keys(scope.filters).length}`,
      footer:scope=>`Visible:${scope.rows.length}`,
    }})
    expect(wrapper.text()).toContain('State:active')
    expect(wrapper.text()).toContain('Filters:0')
    expect(wrapper.text()).toContain('Visible:2')
    expect(wrapper.find('#bulk-action').exists()).toBe(true)
    await wrapper.find('tbody input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1]])
    await wrapper.find('tbody .ui-table-expand').trigger('click')
    expect(wrapper.emitted('update:expandedRows')?.at(-1)).toEqual([[1]])
  })

  it('exposes reset, clearFilters, refresh and current state methods',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,page:2,pageSize:20,query:'record',filters:{status:'active'},sortKey:'name',sortOrder:'desc',visibleColumns:['name','status']}})
    expect(wrapper.vm.getState()).toMatchObject({page:1,pageSize:20,query:'record',filters:{status:'active'},sortKey:'name',sortOrder:'desc',visibleColumns:['name','status']})
    wrapper.vm.clearFilters();expect(wrapper.emitted('update:filters')?.at(-1)).toEqual([{}])
    wrapper.vm.reset()
    expect(wrapper.emitted('update:query')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('update:sortKey')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('reset')?.at(-1)?.[0]).toMatchObject({reason:'reset',state:{page:1,query:'',filters:{},sortKey:'',sortOrder:''}})
  })

  it('clamps an out-of-range controlled page after total changes',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows:rows.slice(0,2),mode:'server',total:100,page:5,pageSize:10}})
    await wrapper.setProps({total:16});await nextTick()
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('state-change')?.at(-1)?.[0]).toMatchObject({reason:'page',state:{page:2}})
  })

  it('lets consumers hide orchestration controls without changing table behavior',()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows:rows.slice(0,2),showToolbar:false,showPagination:false}})
    expect(wrapper.findComponent(UiListToolbar).exists()).toBe(false)
    expect(wrapper.find('.ui-pagination').exists()).toBe(false)
    expect(wrapper.findAll('tbody .ui-table-row')).toHaveLength(2)
  })
})

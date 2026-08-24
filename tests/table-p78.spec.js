// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiDataGrid from '../src/components/UiDataGrid.vue'
import UiTable from '../src/components/UiTable.vue'

const columns=[
  {key:'name',label:'Name',sortable:true,resizable:true},
  {key:'meta.status',dataKey:'meta.status',label:'Status',filterable:true,filterOptions:[{value:'ready',label:'Ready'},{value:'blocked',label:'Blocked',disabled:true}]},
  {key:'score',label:'Score',formatter:value=>`${value}%`},
]
const rows=[
  {id:1,name:'Alpha',meta:{status:'ready'},score:92},
  {id:2,name:'Beta',meta:{status:'blocked'},score:76},
  {id:3,name:'Gamma',meta:{status:'ready'},score:88},
]

afterEach(()=>document.body.innerHTML='')

describe('UiTable P78 production contracts',()=>{
  it('owns default selection while preserving the controlled contract',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows,selectable:true,defaultSelectedRows:[1]}})
    expect(wrapper.findAll('.ui-table-row')[0].classes()).toContain('selected')
    await wrapper.findAll('tbody input[type="checkbox"]')[1].setValue(true)
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1,2]])
    expect(wrapper.emitted('selection-change')?.at(-1)?.[1]).toMatchObject({source:'checkbox',key:2,selected:true,previous:[1],selectedRows:[1,2]})
    expect(wrapper.findAll('.ui-table-row')[1].classes()).toContain('selected')

    const controlled=mount(UiTable,{props:{columns,rows,selectable:true,selectedRows:[1]}})
    await controlled.findAll('tbody input[type="checkbox"]')[1].setValue(true)
    expect(controlled.emitted('update:selectedRows')?.at(-1)).toEqual([[1,2]])
    expect(controlled.findAll('.ui-table-row')[1].classes()).not.toContain('selected')
    await controlled.setProps({selectedRows:[1,2]})
    expect(controlled.findAll('.ui-table-row')[1].classes()).toContain('selected')
  })

  it('supports disabled rows, single selection and page-preserving select all',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows,selectable:true,selectedRows:[99],isRowSelectable:row=>row.id!==2}})
    expect(wrapper.findAll('tbody input[type="checkbox"]')[1].attributes('disabled')).toBeDefined()
    await wrapper.get('thead input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[99,1,3]])
    const single=mount(UiTable,{props:{columns,rows,selectable:true,selectionMode:'single',defaultSelectedRows:[1]}})
    expect(single.find('thead input[type="checkbox"]').exists()).toBe(false)
    await single.findAll('tbody input[type="checkbox"]')[1].setValue(true)
    expect(single.emitted('update:selectedRows')?.at(-1)).toEqual([[2]])
  })

  it('serializes asynchronous selection guards and reports rejection',async()=>{
    let release
    const beforeSelect=vi.fn(()=>new Promise(resolve=>{release=resolve}))
    const wrapper=mount(UiTable,{props:{columns,rows,selectable:true,beforeSelect}})
    await wrapper.find('tbody input[type="checkbox"]').setValue(true)
    expect(wrapper.classes()).toContain('is-loading')
    expect(wrapper.findAll('tbody input[type="checkbox"]')[1].attributes('disabled')).toBeDefined()
    release(false);await flushPromises()
    expect(wrapper.emitted('update:selectedRows')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'guard-rejected',kind:'selection'})
    await wrapper.setProps({beforeSelect:()=>true})
    await wrapper.find('tbody input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1]])
  })

  it('owns expansion, applies row policies and suspends fixed-height virtualization while expanded',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows,expandable:true,virtual:true,defaultExpandedRows:[1],isRowExpandable:row=>row.id!==2},slots:{expanded:scope=>`Details:${scope.row.name}`}})
    expect(wrapper.classes()).not.toContain('is-virtual')
    expect(wrapper.text()).toContain('Details:Alpha')
    expect(wrapper.findAll('.ui-table-expand')[1].attributes('disabled')).toBeDefined()
    await wrapper.findAll('.ui-table-expand')[0].trigger('click')
    expect(wrapper.emitted('update:expandedRows')?.at(-1)).toEqual([[]])
    await nextTick()
    expect(wrapper.classes()).toContain('is-virtual')
  })

  it('cycles uncontrolled sorting and honors an asynchronous sort guard',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows,defaultSortKey:'name',defaultSortOrder:'asc'}})
    const sort=wrapper.get('.ui-table-sort')
    expect(sort.element.closest('th').getAttribute('aria-sort')).toBe('ascending')
    await sort.trigger('click')
    expect(wrapper.emitted('sort-change')?.at(-1)?.[0]).toMatchObject({key:'name',order:'desc',previousKey:'name',previousOrder:'asc'})
    expect(sort.element.closest('th').getAttribute('aria-sort')).toBe('descending')
    await wrapper.setProps({beforeSort:()=>false})
    await sort.trigger('click')
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'guard-rejected',kind:'sort'})
    expect(sort.element.closest('th').getAttribute('aria-sort')).toBe('descending')
  })

  it('owns filter state, exposes menu semantics and restores focus on Escape',async()=>{
    const wrapper=mount(UiTable,{attachTo:document.body,props:{columns,rows,defaultFilters:{'meta.status':'ready'}}})
    const trigger=wrapper.get('.ui-table-filter')
    expect(trigger.classes()).toContain('active')
    await trigger.trigger('click')
    const menu=wrapper.get('[role="menu"]')
    expect(trigger.attributes('aria-controls')).toBe(menu.attributes('id'))
    expect(menu.findAll('[role="menuitemradio"]')[1].attributes('aria-checked')).toBe('true')
    expect(menu.findAll('button')[2].attributes('disabled')).toBeDefined()
    await wrapper.trigger('keydown',{key:'Escape'})
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    await trigger.trigger('click')
    await nextTick()
    const reopened=wrapper.get('[role="menu"]'),items=reopened.findAll('[role="menuitemradio"]')
    expect(document.activeElement).toBe(items[0].element)
    await items[0].trigger('keydown',{key:'End'})
    expect(document.activeElement).toBe(items[1].element)
    await items[1].trigger('keydown',{key:'ArrowDown'})
    expect(document.activeElement).toBe(items[0].element)
    await items[0].trigger('keydown',{key:'ArrowUp'})
    expect(document.activeElement).toBe(items[1].element)
    await items[1].trigger('click',{detail:0})
    await nextTick()
    expect(wrapper.emitted('filter-change')?.at(-1)?.[1]).toMatchObject({source:'keyboard',key:'meta.status',value:'ready'})
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('supports nested values, formatters and dynamic header/cell slots',()=>{
    const wrapper=mount(UiTable,{props:{columns,rows:rows.slice(0,1)},slots:{'header-name':scope=>`Custom ${scope.column.label}`,'cell-meta.status':scope=>`State:${scope.value}`}})
    expect(wrapper.text()).toContain('Custom Name')
    expect(wrapper.text()).toContain('State:ready')
    expect(wrapper.text()).toContain('92%')
  })

  it('publishes deterministic missing and duplicate row-key diagnostics',()=>{
    const wrapper=mount(UiTable,{props:{columns:[columns[0]],rows:[{name:'A'},{id:1,name:'B'},{id:1,name:'C'}]}})
    const reasons=wrapper.emitted('invalid')?.map(args=>args[0].reason)
    expect(reasons).toEqual(['missing-row-key','duplicate-row-key'])
    expect(wrapper.findAll('.ui-table-row')).toHaveLength(3)
  })

  it('provides roving row focus, logical expansion and keyboard selection',async()=>{
    const wrapper=mount(UiTable,{attachTo:document.body,props:{columns,rows,selectable:true,expandable:true,highlightCurrentRow:true}})
    const first=wrapper.findAll('.ui-table-row')[0]
    first.element.focus();expect(document.activeElement).toBe(first.element)
    await first.trigger('keydown',{key:' '})
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1]])
    await first.trigger('keydown',{key:'ArrowDown'})
    await nextTick();expect(document.activeElement).toBe(wrapper.findAll('.ui-table-row')[1].element)
    await wrapper.findAll('.ui-table-row')[1].trigger('keydown',{key:'Enter'})
    expect(wrapper.emitted('update:currentRowKey')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('update:expandedRows')?.at(-1)).toEqual([[2]])
    wrapper.unmount()
  })

  it('emits structured row, cell and current-row events without swallowing native events',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows:rows.slice(0,1),highlightCurrentRow:true}})
    await wrapper.get('tbody td').trigger('click')
    expect(wrapper.emitted('cell-click')?.[0]?.slice(0,2)).toEqual([rows[0],'Alpha'])
    expect(wrapper.emitted('row-click')?.[0]?.[0]).toStrictEqual(rows[0])
    expect(wrapper.emitted('current-change')?.[0]?.slice(0,1)).toEqual([1])
    expect(wrapper.find('.ui-table-row').classes()).toContain('current')
    expect(wrapper.find('.ui-table-row').attributes('aria-current')).toBe('true')
    expect(wrapper.find('.ui-table-row').attributes('aria-selected')).toBeUndefined()
  })

  it('makes column resize separators keyboard operable and resettable',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows:rows.slice(0,1),resizable:true,defaultColumnWidths:{name:120}}})
    const separator=wrapper.findAll('[role="separator"]')[0]
    expect(separator.attributes('aria-valuenow')).toBe('120')
    await separator.trigger('keydown',{key:'ArrowRight'})
    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0]).toMatchObject({name:128})
    expect(wrapper.emitted('column-resize-end')?.at(-1)?.[0]).toMatchObject({key:'name',width:128,source:'keyboard'})
    await separator.trigger('dblclick')
    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0].name).toBeUndefined()
  })

  it('virtualizes fixed-height rows and exposes scroll/focus/state operations',async()=>{
    const many=Array.from({length:100},(_,index)=>({id:index+1,name:`Row ${index+1}`,meta:{status:'ready'},score:index}))
    const wrapper=mount(UiTable,{props:{columns,rows:many,virtual:true,rowHeight:44,viewportHeight:88,overscan:0}})
    expect(wrapper.findAll('.ui-table-row')).toHaveLength(2)
    wrapper.element.scrollTop=440;await wrapper.trigger('scroll');await nextTick()
    expect(wrapper.find('.ui-table-row').attributes('data-row-key')).toBe('11')
    expect(wrapper.vm.getState().virtualRange).toEqual({start:10,end:12})
    expect(wrapper.vm.scrollToRow(20)).toBe(true)
    expect(wrapper.vm.selectRow(20)).toBe(false)
    expect(wrapper.emitted('invalid')?.at(-1)?.[0]).toMatchObject({reason:'row-disabled',kind:'selection'})
  })

  it('supports custom loading, error and empty state slots',async()=>{
    const wrapper=mount(UiTable,{props:{columns,rows:[],loading:true},slots:{loading:'<div id="loading-state">Loading rows</div>',error:'<div id="error-state">Custom error</div>',empty:'<div id="empty-state">Custom empty</div>'}})
    expect(wrapper.find('#loading-state').exists()).toBe(true)
    await wrapper.setProps({loading:false,error:new Error('network')})
    expect(wrapper.find('#error-state').exists()).toBe(true)
    await wrapper.setProps({error:''})
    expect(wrapper.find('#empty-state').exists()).toBe(true)
  })

  it('applies production presentation and blocks readonly instance mutations',()=>{
    const wrapper=mount(UiTable,{props:{columns,rows,striped:true,bordered:true,hover:false,readonly:true,caption:'Orders',ariaLabel:'Order results',rowClass:({row})=>row.id===2?'priority':'',cellClass:({column})=>`cell-${column.key}`}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-striped','is-bordered','is-readonly']))
    expect(wrapper.classes()).not.toContain('has-hover')
    expect(wrapper.get('table').attributes('aria-label')).toBe('Order results')
    expect(wrapper.get('caption').text()).toBe('Orders')
    expect(wrapper.findAll('.ui-table-row')[1].classes()).toContain('priority')
    expect(wrapper.find('tbody td').classes()).toContain('cell-name')
    expect(wrapper.vm.clearSelection()).toBe(false)
    expect(wrapper.vm.clearFilters()).toBe(false)
    expect(wrapper.vm.setColumnWidth('name',180)).toBe(false)
    expect(wrapper.emitted('invalid')?.map(args=>args[0]).slice(-3)).toEqual([
      expect.objectContaining({reason:'blocked',kind:'selection'}),
      expect.objectContaining({reason:'blocked',kind:'filter'}),
      expect.objectContaining({reason:'blocked',kind:'resize'}),
    ])
  })

  it('renders deterministic semantic table markup during SSR',async()=>{
    const render=()=>renderToString(createSSRApp({render:()=>h(UiTable,{columns,rows:rows.slice(0,2),selectable:true,expandable:true,defaultSelectedRows:[1],caption:'SSR table'})}))
    const first=await render(),second=await render()
    expect(first).toBe(second)
    expect(first).toContain('<table')
    expect(first).toContain('<caption class="sr-only">')
    expect(first).toContain('SSR table')
    expect(first).toContain('aria-rowcount="3"')
    expect(first).toContain('aria-selected="true"')
  })

  it('synchronizes mature table controls and structured events through DataGrid',async()=>{
    const wrapper=mount(UiDataGrid,{props:{columns,rows,selectable:true,selectOnRowClick:true,highlightCurrentRow:true,columnWidths:{name:144},showPagination:false}})
    expect(wrapper.get('th').element.nextElementSibling?.style.width||wrapper.findAll('th')[1].attributes('style')).toContain('144px')
    await wrapper.find('.ui-table-row').trigger('click')
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1]])
    expect(wrapper.emitted('update:currentRowKey')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('selection-change')?.at(-1)?.[1]).toMatchObject({source:'row',key:1})
    expect(wrapper.emitted('row-click')?.at(-1)?.[1]).toMatchObject({key:1,rowIndex:0})
  })
})

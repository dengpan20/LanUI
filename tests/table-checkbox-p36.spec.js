// @vitest-environment happy-dom
import fs from 'node:fs'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiCheckbox from '../src/components/UiCheckbox.vue'
import UiTable from '../src/components/UiTable.vue'

describe('compact table checkbox',()=>{
  it('supports explicit component sizes and labels the native control',()=>{
    const wrapper=mount(UiCheckbox,{props:{modelValue:false,size:'sm',label:'Select record',ariaLabel:'Select record'}})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ui-checkbox','size-sm']))
    expect(wrapper.get('input').attributes('aria-label')).toBe('Select record')
    expect(wrapper.get('.ui-selection-label').text()).toBe('Select record')
    expect(wrapper.get('.ui-checkbox-indicator').exists()).toBe(true)
  })

  it('does not render an empty label gap for icon-only table usage',()=>{
    const wrapper=mount(UiCheckbox,{props:{modelValue:false,size:'sm',ariaLabel:'Select row'}})
    expect(wrapper.find('.ui-selection-copy').exists()).toBe(false)
    expect(wrapper.find('.ui-checkbox-indicator').exists()).toBe(true)
    expect(wrapper.get('input').attributes('aria-label')).toBe('Select row')
  })

  it('uses the project checkbox component for select-all and row selection',async()=>{
    const rows=[{id:1,name:'Alpha'},{id:2,name:'Beta'}]
    const wrapper=mount(UiTable,{props:{columns:[{key:'name',label:'Name'}],rows,selectable:true,selectedRows:[1]}})
    await nextTick()
    const checkboxes=wrapper.findAllComponents(UiCheckbox)
    expect(checkboxes).toHaveLength(3)
    expect(checkboxes.every(checkbox=>checkbox.props('size')==='sm')).toBe(true)
    expect(wrapper.get('thead input').element.indeterminate).toBe(true)
    await wrapper.findAll('tbody input')[1].setValue(true)
    expect(wrapper.emitted('update:selectedRows')?.at(-1)).toEqual([[1,2]])
  })

  it('keeps compact header and row hit areas centered around the indicator',()=>{
    const wrapper=mount(UiTable,{props:{columns:[{key:'name',label:'Name'}],rows:[{id:1,name:'Alpha'}],selectable:true,density:'compact'}})
    const headerCell=wrapper.get('thead .ui-table-select-column')
    const rowCell=wrapper.get('tbody .ui-table-select-column')
    for(const cell of [headerCell,rowCell]){
      const checkbox=cell.get('.ui-table-checkbox')
      expect(checkbox.classes()).toContain('size-sm')
      expect(checkbox.get('.ui-checkbox-indicator').exists()).toBe(true)
      expect(checkbox.get('input').attributes('aria-label')).toBeTruthy()
    }
    expect(wrapper.get('.ui-table-wrap').classes()).toContain('density-compact')
  })

  it('keeps the visual size compact and removes the legacy 24px override',()=>{
    const table=fs.readFileSync('src/components/UiTable.vue','utf8')
    const styles=fs.readFileSync('styles.css','utf8')
    expect(table).toContain('<UiCheckbox class="ui-table-checkbox" size="sm"')
    expect(styles).toContain('.ui-checkbox.size-sm .ui-checkbox-indicator, .ui-radio.size-sm .ui-radio-indicator { width: 14px; height: 14px;')
    expect(styles).toContain('.ui-table-select-column .ui-table-checkbox { min-width: 24px; min-height: 28px; align-items: center; justify-content: center; gap: 0; }')
    expect(styles).toContain('.ui-table-select-column .ui-table-checkbox .ui-checkbox-indicator { margin-top: 0; }')
    expect(styles).toContain('.ui-table-select-column > input[type="checkbox"] { width: 14px; min-width: 14px; max-width: 14px; height: 14px; min-height: 14px; max-height: 14px;')
    expect(styles).not.toContain('.ui-table-select-column input { width:24px; height:24px;')
  })

  it('keeps the standalone table example on the same compact checkbox structure',()=>{
    const preview=fs.readFileSync('component-preview.html','utf8')
    expect(preview).toContain('ui-table-control-column ui-table-select-column')
    expect(preview).toContain('checkbox ui-checkbox size-sm ui-table-checkbox')
    expect(preview).not.toContain('<th class="ui-table-control-column"><input id="previewSelectAll"')
    expect(preview).not.toContain('<td class="ui-table-control-column"><input class="preview-row-check"')
  })
})

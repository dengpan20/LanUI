// @vitest-environment happy-dom
import fs from 'node:fs'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiCard from '../src/components/UiCard.vue'
import UiSelect from '../src/components/UiSelect.vue'
import UiTable from '../src/components/UiTable.vue'

afterEach(()=>{document.body.innerHTML=''})

describe('select and mobile table layout regressions',()=>{
  it('teleports and floating-positions a select menu outside an overflow-clipped card',async()=>{
    const wrapper=mount(UiCard,{
      attachTo:document.body,
      props:{title:'Filters'},
      slots:{default:()=>h(UiSelect,{modelValue:'',options:[{label:'North',value:'north'},{label:'South',value:'south'}],'aria-label':'Region'})},
    })
    const select=wrapper.getComponent(UiSelect)
    select.element.getBoundingClientRect=()=>({left:80,right:300,top:100,bottom:134,width:220,height:34,x:80,y:100,toJSON(){}})

    await select.get('[role="combobox"]').trigger('click')
    await nextTick();await nextTick()

    const panel=document.body.querySelector('.ui-select-menu.ui-floating-panel')
    expect(panel).not.toBeNull()
    expect(panel.closest('.ui-card')).toBeNull()
    expect(panel.style.position).toBe('fixed')
    expect(panel.style.width).toBe('220px')
    expect(panel.style.minWidth).toBe('220px')
    expect(select.get('[role="combobox"]').attributes('aria-controls')).toBe(panel.id)

    panel.querySelector('.ui-select-option').dispatchEvent(new Event('pointerdown',{bubbles:true}))
    panel.querySelector('.ui-select-option').click()
    await nextTick()
    expect(select.emitted('update:modelValue')?.at(-1)).toEqual(['north'])
    expect(document.body.querySelector('.ui-select-menu')).toBeNull()
    wrapper.unmount()
  })

  it('keeps an explicit inline select mode for constrained integrations',async()=>{
    const wrapper=mount(UiSelect,{props:{appendToBody:false,options:['One']}})
    await wrapper.get('[role="combobox"]').trigger('click')
    const panel=wrapper.get('.ui-select-menu')
    expect(panel.classes()).not.toContain('ui-floating-panel')
    expect(wrapper.find('.ui-select-menu').exists()).toBe(true)
    expect(document.body.querySelector('.ui-select-menu')).toBeNull()
  })

  it('marks empty and error table states with full-width mobile layout hooks',()=>{
    const columns=[{key:'name',label:'Name'}]
    const empty=mount(UiTable,{props:{columns,rows:[]}})
    const error=mount(UiTable,{props:{columns,rows:[],error:'Request failed'}})

    for(const wrapper of [empty,error]){
      expect(wrapper.get('tbody').classes()).toContain('ui-table-state-body')
      expect(wrapper.get('tbody tr').classes()).toContain('ui-table-state-row')
      expect(wrapper.get('tbody td').classes()).toContain('ui-table-state-cell')
      expect(wrapper.get('.ui-table-state').exists()).toBe(true)
    }
  })

  it('uses class-driven mobile state CSS instead of relational selector support',()=>{
    const styles=fs.readFileSync('styles.css','utf8')
    expect(styles).toContain('.ui-table tbody.ui-table-state-body { width: 100%; padding: 0; display: block; }')
    expect(styles).toContain('.ui-table-state-body .ui-table-state-row, .ui-table-state-body .ui-table-state-cell { width: 100%; min-width: 0; display: block; }')
    expect(styles).not.toContain('.ui-table tbody:has(.ui-table-state)')
  })
})

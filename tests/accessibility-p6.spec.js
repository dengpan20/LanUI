// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import UiCard from '../src/components/UiCard.vue'
import UiDrawer from '../src/components/UiDrawer.vue'
import UiProgress from '../src/components/UiProgress.vue'
import UiSelect from '../src/components/UiSelect.vue'
import UiTabs from '../src/components/UiTabs.vue'

afterEach(()=>{document.body.innerHTML='';document.body.style.overflow=''})

describe('P6 browser-audit semantics',()=>{
  it('exposes the progress value and accessible name on the progressbar itself',()=>{
    const wrapper=mount(UiProgress,{props:{value:42,label:'Upload progress'}})
    const progress=wrapper.get('[role="progressbar"]')
    expect(progress.attributes('aria-label')).toBe('Upload progress')
    expect(progress.attributes('aria-valuenow')).toBe('42')
    expect(progress.attributes('aria-valuetext')).toBe('42%')
    expect(wrapper.findAll('[role="progressbar"]')).toHaveLength(1)
  })

  it('only references tab panels when the component renders panels',()=>{
    const items=[{label:'Overview',value:'overview'}]
    const navigationOnly=mount(UiTabs,{props:{modelValue:'overview',items,panels:false}})
    expect(navigationOnly.get('[role="tab"]').attributes('aria-controls')).toBeUndefined()
    const withPanels=mount(UiTabs,{props:{modelValue:'overview',items}})
    const tab=withPanels.get('[role="tab"]')
    const controlled=tab.attributes('aria-controls')
    expect(controlled).toBe('panel-overview')
    expect(withPanels.get(`#${controlled}`).attributes('role')).toBe('tabpanel')
  })

  it('supports page-appropriate card heading levels',()=>{
    const wrapper=mount(UiCard,{props:{title:'Section title',titleTag:'h2'}})
    expect(wrapper.get('h2').text()).toContain('Section title')
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  it('only references a select popup while that popup exists',async()=>{
    const wrapper=mount(UiSelect,{props:{modelValue:'east',options:[{label:'East',value:'east'}]},attrs:{'aria-label':'Region'}})
    const trigger=wrapper.get('[role="combobox"]')
    expect(trigger.attributes('aria-controls')).toBeUndefined()
    await trigger.trigger('click')
    const controlled=trigger.attributes('aria-controls')
    expect(controlled).toBeTruthy()
    expect(wrapper.get(`#${controlled}`).attributes('role')).toBe('listbox')
  })

  it('uses a dialog-compatible section element for drawers',async()=>{
    const wrapper=mount(UiDrawer,{attachTo:document.body,props:{modelValue:true,title:'Settings'}})
    await nextTick()
    const dialog=document.querySelector('[role="dialog"][aria-modal="true"]')
    expect(dialog?.tagName).toBe('SECTION')
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy()
    wrapper.unmount()
  })
})

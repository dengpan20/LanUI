// @vitest-environment happy-dom
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiDrawer from '../src/components/UiDrawer.vue'
import UiModal from '../src/components/UiModal.vue'
import { overlayCount } from '../src/components/overlayManager.js'

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('client overlay lifecycle', () => {
  it('retains the body lock until the last overlay closes', async () => {
    const modal = mount(UiModal, { attachTo:document.body, props:{ modelValue:true, title:'Modal' } })
    const drawer = mount(UiDrawer, { attachTo:document.body, props:{ modelValue:true, title:'Drawer' } })
    await nextTick(); await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    expect(overlayCount()).toBe(2)
    await drawer.setProps({ modelValue:false }); await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    expect(overlayCount()).toBe(1)
    await modal.setProps({ modelValue:false }); await nextTick()
    expect(document.body.style.overflow).toBe('')
    expect(overlayCount()).toBe(0)
    drawer.unmount(); modal.unmount()
  })

  it('returns focus to the trigger after a modal closes', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open modal'
    document.body.append(trigger)
    trigger.focus()
    const modal = mount(UiModal, { attachTo:document.body, props:{ modelValue:false, title:'Review' } })
    await modal.setProps({ modelValue:true }); await nextTick(); await nextTick()
    expect(document.activeElement?.closest('.ui-modal')).toBeTruthy()
    await modal.setProps({ modelValue:false }); await nextTick()
    expect(document.activeElement).toBe(trigger)
    modal.unmount()
    expect(overlayCount()).toBe(0)
  })
})

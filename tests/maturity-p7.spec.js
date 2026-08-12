// @vitest-environment happy-dom
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiPopconfirm from '../src/components/UiPopconfirm.vue'

afterEach(() => { document.body.innerHTML = '' })

describe('maturity P7 interaction contracts', () => {
  it('can reserve validation message space without changing the compact default', () => {
    const stable = mount(UiFormItem, { props: { label: 'Name', name: 'name', reserveMessageSpace: true }, slots: { default: '<input />' } })
    expect(stable.find('.ui-form-item-message').exists()).toBe(true)
    expect(stable.find('.ui-form-item-message').attributes('aria-hidden')).toBe('true')
    const compact = mount(UiFormItem, { props: { label: 'Name', name: 'name' }, slots: { default: '<input />' } })
    expect(compact.find('.ui-form-item-message').exists()).toBe(false)
  })

  it('focuses the first popconfirm action and restores the trigger after Escape', async () => {
    const wrapper = mount(UiPopconfirm, {
      attachTo: document.body,
      props: { title: 'Delete record?' },
      slots: { default: '<button id="p7-trigger">Delete</button>' },
    })
    const trigger = wrapper.find('#p7-trigger')
    trigger.element.focus()
    await trigger.trigger('click')
    await nextTick(); await nextTick()
    await new Promise(resolve => setTimeout(resolve, 30))
    const firstAction = document.querySelector('.ui-popconfirm-panel button')
    expect(document.activeElement).toBe(firstAction)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })
})

// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UiList from '../src/components/UiList.vue'
import UiPagination from '../src/components/UiPagination.vue'

const wrappers = []
const items = Array.from({ length: 12 }, (_, index) => ({
  id: `item-${index}`,
  title: `Release ${index + 1}`,
  description: `Evidence record ${index + 1}`,
  avatar: `data:image/svg+xml,${index}`,
  disabled: index === 2,
}))

class MockResizeObserver {
  static instances = []
  constructor(callback) { this.callback = callback; this.elements = new Set(); MockResizeObserver.instances.push(this) }
  observe(element) { this.elements.add(element) }
  disconnect() { this.elements.clear() }
  trigger() { this.callback([]) }
}

function render(props = {}, slots = {}) {
  const wrapper = mount(UiList, { attachTo: document.body, props: { items, ...props }, slots })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => { MockResizeObserver.instances = []; vi.stubGlobal('ResizeObserver', MockResizeObserver) })
afterEach(() => { while (wrappers.length) wrappers.pop()?.unmount(); document.body.innerHTML = ''; vi.unstubAllGlobals() })

describe('P46 UiList', () => {
  it('renders semantic rich list items with size and surface modifiers', () => {
    const wrapper = render({ items: items.slice(0, 2), size: 'lg', bordered: true, split: true, hoverable: true })
    expect(wrapper.get('.ui-list').classes()).toEqual(expect.arrayContaining(['size-lg', 'is-bordered', 'is-split', 'is-hoverable']))
    expect(wrapper.get('ul').attributes('role')).toBe('list')
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(2)
    expect(wrapper.findAll('.ui-list-title').map(node => node.text())).toEqual(['Release 1', 'Release 2'])
    expect(wrapper.findAll('.ui-list-description')[0].text()).toBe('Evidence record 1')
    expect(wrapper.findAll('.ui-list-avatar img')[0].attributes('alt')).toBe('')
  })

  it('supports pointer single selection and protects nested actions', async () => {
    const wrapper = render({ items: items.slice(0, 4), selectionMode: 'single', modelValue: 'item-0', deselectable: true }, {
      actions: ({ item }) => h('button', { type: 'button', 'data-id': item.id }, 'Open'),
    })
    const options = wrapper.findAll('[role="option"]')
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['item-1'])
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({ key: 'item-1', index: 1, sourceIndex: 1, selected: true, source: 'pointer' })
    await options[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    const before = wrapper.emitted('update:modelValue')?.length
    await wrapper.find('[data-id="item-1"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(before)
  })

  it('navigates a responsive grid and selects enabled options from the keyboard', async () => {
    const wrapper = render({ items: items.slice(0, 6), selectionMode: 'multiple', grid: { columns: 1, sm: 2, md: 3 }, defaultActiveIndex: 0 })
    const body = wrapper.get('.ui-list-body').element
    Object.defineProperty(body, 'clientWidth', { configurable: true, value: 800 })
    MockResizeObserver.instances[0].trigger(); await nextTick()
    const listbox = wrapper.get('[role="listbox"]')
    await listbox.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([3])
    await listbox.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['item-3']])
    await listbox.trigger('keydown', { key: 'a', ctrlKey: true })
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['item-0', 'item-1', 'item-3', 'item-4', 'item-5'])
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
  })

  it('supports typeahead, controlled active state and exposed selection methods', async () => {
    const wrapper = render({ items: items.slice(0, 5), selectionMode: 'single', activeIndex: 0 })
    const listbox = wrapper.get('[role="listbox"]')
    await listbox.trigger('keydown', { key: 'r' })
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([1])
    expect(listbox.attributes('aria-activedescendant')).toContain('-0')
    expect(wrapper.vm.setActiveIndex(4)).toBe(4)
    expect(wrapper.vm.selectKey('item-4')).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['item-4'])
    expect(wrapper.vm.clearSelection()).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    expect(wrapper.vm.scrollToKey('missing')).toBe(false)
  })

  it('slices client data and synchronizes internal pagination events', async () => {
    const wrapper = render({ pagination: { position: 'center', compact: true }, defaultPageSize: 5, showSizeChanger: false })
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(5)
    expect(wrapper.get('.ui-list-title').text()).toBe('Release 1')
    const pageTwo = wrapper.findAll('.page-number').find(button => button.text() === '2')
    await pageTwo.trigger('click'); await nextTick()
    expect(wrapper.get('.ui-list-title').text()).toBe('Release 6')
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('page-change')?.at(-1)?.[0]).toEqual({ page: 2, pageSize: 5, source: 'pagination' })
    expect(wrapper.get('.ui-list-pagination').classes()).toContain('position-center')
    wrapper.findComponent(UiPagination).vm.$emit('update:pageSize', 20); await nextTick()
    expect(wrapper.emitted('update:pageSize')?.at(-1)).toEqual([20])
    expect(wrapper.emitted('page-size-change')?.at(-1)?.[0]).toEqual({ page: 1, pageSize: 20, source: 'pagination' })
  })

  it('keeps server rows intact and exposes absolute option positions', () => {
    const wrapper = render({ items: items.slice(0, 3), pagination: true, server: true, page: 3, pageSize: 3, total: 30, selectionMode: 'single' })
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(3)
    expect(options[0].attributes('aria-posinset')).toBe('7')
    expect(options[0].attributes('aria-setsize')).toBe('30')
  })

  it('renders localized loading, error and empty states with retry', async () => {
    const loading = render({ items: [], loading: true, loadingCount: 3 })
    expect(loading.get('[role="status"]').text()).toContain('\u6b63\u5728\u52a0\u8f7d\u5217\u8868')
    expect(loading.findAll('.ui-list-skeletons .ui-list-item')).toHaveLength(3)
    const failed = render({ items: [], error: 'Network unavailable' })
    expect(failed.get('[role="alert"]').text()).toContain('Network unavailable')
    await failed.get('button').trigger('click')
    expect(failed.emitted('retry')).toHaveLength(1)
    const empty = render({ items: [], emptyText: 'Nothing queued' })
    expect(empty.text()).toContain('Nothing queued')
  })

  it('provides complete state and control scopes to custom slots', () => {
    const wrapper = render({ items: items.slice(0, 1), selectionMode: 'single', modelValue: 'item-0', pagination: true, pageSize: 1 }, {
      item: scope => `${scope.index}:${scope.itemKey}:${scope.active}:${scope.selected}:${scope.disabled}`,
      header: () => 'Release queue',
      footer: () => 'End of queue',
      pagination: ({ page, total }) => `${page}/${total}`,
    })
    expect(wrapper.get('.ui-list-header').text()).toBe('Release queue')
    expect(wrapper.get('.ui-list-item').text()).toBe('0:item-0:true:true:false')
    expect(wrapper.get('.ui-list-pagination').text()).toBe('1/1')
    expect(wrapper.get('.ui-list-footer').text()).toBe('End of queue')
  })

  it('renders deterministic semantic SSR markup', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(UiList, { items: items.slice(0, 2), selectionMode: 'single', modelValue: 'item-1', ariaLabel: 'Release evidence' }) }))
    expect(html).toContain('class="ui-list')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('aria-label="Release evidence"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('Release 1')
  })
})

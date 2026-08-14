// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import UiCarousel from '../src/components/UiCarousel.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

const items = [
  { key: 'overview', title: 'Overview', content: 'Release overview' },
  { key: 'quality', title: 'Quality', content: 'Quality gates' },
  { key: 'delivery', title: 'Delivery', content: 'Delivery status' },
]

function controlled(extra = {}) {
  let wrapper
  wrapper = mount(UiCarousel, {
    attachTo: document.body,
    props: {
      modelValue: 0,
      items,
      'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
      ...extra,
    },
  })
  return wrapper
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('P51 UiCarousel', () => {
  it('renders named carousel, slide and picker semantics with lazy content', () => {
    const wrapper = mount(UiCarousel, { props: { items, ariaLabel: 'Release highlights' } })
    const root = wrapper.get('.ui-carousel')
    expect(root.attributes('role')).toBe('region')
    expect(root.attributes('aria-roledescription')).toBe('carousel')
    expect(root.attributes('aria-label')).toBe('Release highlights')
    expect(wrapper.findAll('.ui-carousel-slide')).toHaveLength(3)
    expect(wrapper.findAll('.ui-carousel-slide')[0].attributes('aria-label')).toContain('Overview')
    expect(wrapper.findAll('.ui-carousel-slide')[1].attributes('inert')).toBe('')
    expect(wrapper.findAll('.ui-carousel-content')).toHaveLength(1)
    expect(wrapper.findAll('.ui-carousel-indicator')).toHaveLength(3)
    expect(wrapper.get('.ui-carousel-indicator.active').attributes('aria-current')).toBe('true')
  })

  it('navigates with arrows and indicators using structured controlled changes', async () => {
    const change = vi.fn()
    const wrapper = controlled({ onChange: change })
    await wrapper.get('.ui-carousel-arrow.next').trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toBe(1)
    expect(change.mock.calls[0][0]).toMatchObject({ index: 1, previousIndex: 0, source: 'control', direction: 'next' })
    await wrapper.findAll('.ui-carousel-indicator')[2].trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toBe(2)
    await wrapper.get('.ui-carousel-arrow.next').trigger('click'); await nextTick()
    expect(wrapper.props('modelValue')).toBe(0)
    expect(change.mock.calls.at(-1)[0]).toMatchObject({ index: 0, previousIndex: 2, direction: 'next' })
  })

  it('guards finite endpoints and emits reach events', async () => {
    const reachStart = vi.fn(), reachEnd = vi.fn()
    const wrapper = controlled({ loop: false, onReachStart: reachStart, onReachEnd: reachEnd })
    expect(wrapper.get('.ui-carousel-arrow.previous').attributes('disabled')).toBeDefined()
    await wrapper.get('.ui-carousel-arrow.next').trigger('click'); await nextTick()
    await wrapper.get('.ui-carousel-arrow.next').trigger('click'); await nextTick()
    expect(reachEnd).toHaveBeenCalledOnce()
    expect(wrapper.get('.ui-carousel-arrow.next').attributes('disabled')).toBeDefined()
    await wrapper.findAll('.ui-carousel-indicator')[0].trigger('click'); await nextTick()
    expect(reachStart).toHaveBeenCalledOnce()
  })

  it('supports logical horizontal and vertical keyboard navigation', async () => {
    const ltr = controlled()
    await ltr.get('.ui-carousel').trigger('keydown', { key: 'ArrowRight' }); await nextTick()
    expect(ltr.props('modelValue')).toBe(1)
    await ltr.get('.ui-carousel').trigger('keydown', { key: 'End' }); await nextTick()
    expect(ltr.props('modelValue')).toBe(2)
    ltr.unmount()

    let carousel
    const rtl = mount(UiConfigProvider, { props: { direction: 'rtl' }, slots: { default: () => h(UiCarousel, { ref: value => { carousel = value }, modelValue: undefined, items }) } })
    await rtl.get('.ui-carousel').trigger('keydown', { key: 'ArrowLeft' }); await nextTick()
    expect(carousel.activeIndex).toBe(1)
    rtl.unmount()

    const vertical = controlled({ direction: 'vertical' })
    await vertical.get('.ui-carousel').trigger('keydown', { key: 'ArrowDown' }); await nextTick()
    expect(vertical.props('modelValue')).toBe(1)
  })

  it('automatically rotates and pauses for hover, focus and manual controls', async () => {
    vi.useFakeTimers()
    const wrapper = mount(UiCarousel, { attachTo: document.body, props: { items, autoplay: true, interval: 100 } })
    vi.advanceTimersByTime(100); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(1)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(300); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(1)
    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(100); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(2)
    await wrapper.trigger('focusin')
    vi.advanceTimersByTime(300); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(2)
    await wrapper.trigger('focusout'); await nextTick()
    vi.advanceTimersByTime(100); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(0)
    await wrapper.get('.ui-carousel-play').trigger('click')
    vi.advanceTimersByTime(300); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(0)
    expect(wrapper.vm.isPlaying).toBe(false)
  })

  it('stops automatic rotation for reduced motion', async () => {
    vi.useFakeTimers()
    let carousel
    const wrapper = mount(UiConfigProvider, {
      props: { motion: 'reduced' },
      slots: { default: () => h(UiCarousel, { ref: value => { carousel = value }, items, autoplay: true, interval: 100 }) },
    })
    vi.advanceTimersByTime(500); await nextTick()
    expect(carousel.activeIndex).toBe(0)
    expect(carousel.isPlaying).toBe(false)
    expect(wrapper.get('.ui-carousel').classes()).toContain('is-reduced')
  })

  it('pauses while the document is hidden and resumes when visible', async () => {
    vi.useFakeTimers()
    let hidden = false
    const hiddenSpy = vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const wrapper = mount(UiCarousel, { props: { items, autoplay: true, interval: 100 } })
    hidden = true; document.dispatchEvent(new Event('visibilitychange')); await nextTick()
    vi.advanceTimersByTime(300); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(0)
    hidden = false; document.dispatchEvent(new Event('visibilitychange')); await nextTick()
    vi.advanceTimersByTime(100); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(1)
    hiddenSpy.mockRestore()
  })

  it('handles pointer swipe with RTL-aware direction and lifecycle events', async () => {
    const dragStart = vi.fn(), dragEnd = vi.fn()
    const wrapper = mount(UiCarousel, { attachTo: document.body, props: { items, swipeThreshold: 20, onDragStart: dragStart, onDragEnd: dragEnd } })
    const viewport = wrapper.get('.ui-carousel-viewport')
    await viewport.trigger('pointerdown', { button: 0, pointerId: 5, clientX: 100, clientY: 20 })
    await viewport.trigger('pointermove', { pointerId: 5, clientX: 50, clientY: 20 })
    await viewport.trigger('pointerup', { pointerId: 5, clientX: 50, clientY: 20 }); await nextTick()
    expect(wrapper.vm.activeIndex).toBe(1)
    expect(dragStart).toHaveBeenCalledOnce()
    expect(dragEnd.mock.calls[0][0]).toMatchObject({ index: 1, delta: -50, changed: true, canceled: false })
  })

  it('supports fade, vertical, numbered, outside and eager presentation variants', () => {
    const wrapper = mount(UiCarousel, { props: { items, effect: 'fade', direction: 'vertical', indicators: 'numbers', indicatorPosition: 'outside', lazy: false, arrows: 'always' } })
    expect(wrapper.get('.ui-carousel').classes()).toEqual(expect.arrayContaining(['effect-fade', 'direction-vertical', 'indicators-numbers', 'indicator-outside', 'arrows-always']))
    expect(wrapper.findAll('.ui-carousel-content')).toHaveLength(3)
    expect(wrapper.findAll('.ui-carousel-indicator')[1].text()).toBe('2')
  })

  it('renders item, indicator and empty slots', () => {
    const wrapper = mount(UiCarousel, {
      props: { items },
      slots: {
        item: ({ item, active }) => h('output', { class: 'custom-slide', 'data-active': active }, item.title),
        indicator: ({ index }) => h('span', { class: 'custom-indicator' }, index + 1),
      },
    })
    expect(wrapper.get('.custom-slide').text()).toBe('Overview')
    expect(wrapper.findAll('.custom-indicator')).toHaveLength(3)
    const empty = mount(UiCarousel, { slots: { empty: () => h('strong', 'Nothing scheduled') } })
    expect(empty.get('.ui-carousel-empty').text()).toBe('Nothing scheduled')
  })

  it('exposes navigation and playback state without replacing item identity', async () => {
    const wrapper = mount(UiCarousel, { props: { items, defaultIndex: 1, autoplay: false } })
    expect(wrapper.vm.getState()).toMatchObject({ index: 1, count: 3, playing: false })
    const meta = wrapper.vm.next('api'); await nextTick()
    expect(meta).toMatchObject({ index: 2, previousIndex: 1, item: items[2], previousItem: items[1] })
    expect(wrapper.vm.getState().index).toBe(2)
    wrapper.vm.play(); expect(wrapper.vm.getState().requestedPlaying).toBe(true)
    wrapper.vm.pause(); expect(wrapper.vm.getState().requestedPlaying).toBe(false)
  })

  it('renders deterministic SSR structure without browser globals', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(UiCarousel, { items, modelValue: 1, ariaLabel: 'SSR highlights' }) }))
    expect(html).toContain('class="ui-carousel')
    expect(html).toContain('aria-roledescription="carousel"')
    expect(html).toContain('SSR highlights')
    expect(html).toContain('data-active-index="1"')
    expect(html).toContain('ui-carousel-slide-')
  })
})

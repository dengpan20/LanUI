// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiAffix from '../src/components/UiAffix.vue'

const wrappers = []

afterEach(() => {
  while (wrappers.length) wrappers.pop()?.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

function rect({ top = 0, left = 0, width = 240, height = 40 } = {}) {
  return { top, bottom: top + height, left, right: left + width, width, height, x: left, y: top, toJSON() {} }
}

async function settle() {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function mountMeasured(props = {}, rootRect = rect(), contentRect = rootRect) {
  const wrapper = mount(UiAffix, { attachTo: document.body, props, slots: { default: '<button>Save changes</button>' } })
  wrappers.push(wrapper)
  wrapper.element.getBoundingClientRect = () => rootRect
  wrapper.get('.ui-affix-content').element.getBoundingClientRect = () => contentRect
  return wrapper
}

describe('P43 UiAffix', () => {
  it('affixes to the window top while preserving measured layout', async () => {
    const wrapper = mountMeasured({ offset: 16, zIndex: 120 }, rect({ top: -12, left: 44, width: 320, height: 48 }))
    await settle()
    expect(wrapper.attributes('data-affixed')).toBe('true')
    expect(wrapper.attributes('style')).toContain('height: 48px')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toContain('top: 16px')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toContain('left: 44px')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toContain('width: 320px')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.at(-1)?.[1]).toMatchObject({ source: 'root', position: 'top', top: 16 })
  })

  it('supports a bottom position inside an element scroll target', async () => {
    const target = document.createElement('div')
    target.id = 'affix-scroll-target'
    target.scrollTop = 55
    target.getBoundingClientRect = () => rect({ top: 100, height: 400, width: 500 })
    document.body.append(target)
    const wrapper = mountMeasured(
      { target: '#affix-scroll-target', position: 'bottom', offset: 20 },
      rect({ top: 560, left: 80, width: 260, height: 40 }),
    )
    await settle()
    expect(wrapper.attributes('data-ui-affix')).toBe('bottom')
    expect(wrapper.attributes('data-affixed')).toBe('true')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toContain('top: 440px')
    target.dispatchEvent(new Event('scroll'))
    await settle()
    expect(wrapper.emitted('scroll')?.at(-1)?.[0]).toMatchObject({ affixed: true, position: 'bottom', scrollTop: 55, source: 'scroll' })
  })

  it('stops at an explicit boundary and releases after the boundary leaves view', async () => {
    let boundaryTop = 0
    const boundary = document.createElement('section')
    boundary.id = 'affix-boundary'
    boundary.getBoundingClientRect = () => rect({ top: boundaryTop, height: 50, width: 400 })
    document.body.append(boundary)
    const wrapper = mountMeasured(
      { boundary: () => boundary, offset: 20 },
      rect({ top: -10, left: 20, width: 300, height: 40 }),
    )
    await settle()
    expect(wrapper.get('.ui-affix-content').attributes('style')).toContain('top: 10px')
    boundaryTop = -60
    window.dispatchEvent(new Event('scroll'))
    await settle()
    expect(wrapper.attributes('data-affixed')).toBe('false')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toBeUndefined()
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(false)
  })

  it('reports invalid targets, falls back to the window and honors disabled state', async () => {
    const wrapper = mountMeasured({ target: '[invalid', offset: 8 }, rect({ top: -4, width: 260 }))
    await settle()
    expect(wrapper.emitted('error')?.[0]?.[0]).toMatchObject({ kind: 'target', target: '[invalid' })
    expect(wrapper.attributes('data-affixed')).toBe('true')
    await wrapper.setProps({ disabled: true })
    await settle()
    expect(wrapper.attributes('data-affixed')).toBe('false')
    expect(wrapper.get('.ui-affix-content').attributes('style')).toBeUndefined()
  })

  it('observes geometry, exposes manual updates and cleans listeners on unmount', async () => {
    const observed = []
    const disconnect = vi.fn()
    class Observer {
      observe(node) { observed.push(node) }
      disconnect() { disconnect() }
    }
    vi.stubGlobal('ResizeObserver', Observer)
    const remove = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountMeasured({}, rect({ top: 30, width: 280 }))
    await settle()
    expect(observed.length).toBeGreaterThanOrEqual(2)
    expect(wrapper.vm.affixed).toBe(false)
    expect(wrapper.vm.update()).toMatchObject({ affixed: false, position: 'top' })
    expect(wrapper.vm.updateRoot()).toMatchObject({ affixed: false })
    wrapper.unmount()
    wrappers.pop()
    expect(disconnect).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true)
  })

  it('renders deterministic SSR markup without resolving browser targets', async () => {
    const html = await renderToString(createSSRApp({
      render: () => h(UiAffix, { position: 'bottom', offset: 24, 'aria-label': 'Sticky actions' }, {
        default: () => h('button', 'Approve'),
      }),
    }))
    expect(html).toContain('class="ui-affix"')
    expect(html).toContain('data-ui-affix="bottom"')
    expect(html).toContain('data-affixed="false"')
    expect(html).toContain('aria-label="Sticky actions"')
    expect(html).toContain('Approve')
  })
})

// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UiWatermark from '../src/components/UiWatermark.vue'

const waitForMutation = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('maturity P42 watermark', () => {
  let context

  beforeEach(() => {
    context = {
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,bGFuLXVp')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders high-density multi-line text without blocking content interaction', async () => {
    const wrapper = mount(UiWatermark, {
      props: { content: ['Lan UI', 'CONFIDENTIAL'], width: 140, height: 72, gap: [80, 96], rotate: -30 },
      slots: { default: () => h('button', { id: 'watermark-action' }, 'Continue') },
    })
    await nextTick()
    const layer = wrapper.get('[data-ui-watermark-layer]')
    expect(wrapper.get('#watermark-action').text()).toBe('Continue')
    expect(layer.attributes('data-ui-watermark-mode')).toBe('text')
    expect(layer.attributes('aria-hidden')).toBe('true')
    expect(layer.element.style.pointerEvents).toBe('none')
    expect(layer.element.style.backgroundSize).toBe('220px 168px')
    expect(context.scale).toHaveBeenCalled()
    expect(context.rotate).toHaveBeenCalledWith((-30 * Math.PI) / 180)
    expect(context.fillText.mock.calls.map(call => call[0])).toEqual(['Lan UI', 'CONFIDENTIAL'])
    expect(wrapper.emitted('render')?.at(-1)?.[0]).toMatchObject({ mode: 'text', width: 220, height: 168 })
  })

  it('normalizes gap and offset and reacts to configuration updates', async () => {
    const wrapper = mount(UiWatermark, { props: { content: 'Draft', gap: [-10, 40], offset: [-12, 18], zIndex: 12 } })
    await nextTick()
    let layer = wrapper.get('[data-ui-watermark-layer]')
    expect(layer.element.style.backgroundSize).toBe('120px 104px')
    expect(layer.element.style.backgroundPosition).toBe('-12px -2px')
    expect(layer.element.style.zIndex).toBe('12')
    await wrapper.setProps({ gap: [60, 80], offset: undefined, zIndex: 3 })
    await nextTick()
    layer = wrapper.get('[data-ui-watermark-layer]')
    expect(layer.element.style.backgroundSize).toBe('180px 144px')
    expect(layer.element.style.backgroundPosition).toBe('0px 0px')
    expect(layer.element.style.zIndex).toBe('3')
    expect(wrapper.emitted('render')?.length).toBeGreaterThanOrEqual(2)
  })

  it('prioritizes a loaded image and applies cross-origin before the source', async () => {
    const created = []
    class FakeImage {
      constructor() { created.push(this) }
      set src(value) { this._src = value }
      get src() { return this._src }
    }
    vi.stubGlobal('Image', FakeImage)
    const wrapper = mount(UiWatermark, { props: { image: 'https://example.invalid/logo.png', content: 'Fallback', imageCrossOrigin: 'use-credentials' } })
    expect(created).toHaveLength(1)
    expect(created[0].crossOrigin).toBe('use-credentials')
    expect(created[0].src).toBe('https://example.invalid/logo.png')
    created[0].onload({ type: 'load' })
    await nextTick()
    expect(context.drawImage).toHaveBeenCalled()
    expect(wrapper.get('[data-ui-watermark-layer]').attributes('data-ui-watermark-mode')).toBe('image')
    expect(wrapper.emitted('image-load')?.[0]?.[0]).toMatchObject({ src: 'https://example.invalid/logo.png' })
  })

  it('falls back to text and reports the image load stage when an image fails', async () => {
    let created
    class FakeImage {
      constructor() { created = this }
      set src(value) { this._src = value }
    }
    vi.stubGlobal('Image', FakeImage)
    const wrapper = mount(UiWatermark, { props: { image: '/missing.svg', content: 'Protected' } })
    created.onerror({ type: 'error' })
    await nextTick()
    expect(wrapper.get('[data-ui-watermark-layer]').attributes('data-ui-watermark-mode')).toBe('text')
    expect(context.fillText).toHaveBeenCalledWith('Protected', 0, 0, 120)
    expect(wrapper.emitted('image-error')?.[0]?.[0]).toMatchObject({ src: '/missing.svg', stage: 'load' })
  })

  it('repairs a removed layer and emits a diagnostic reason', async () => {
    const wrapper = mount(UiWatermark, { props: { content: 'Protected' } })
    await waitForMutation()
    wrapper.get('[data-ui-watermark-layer]').element.remove()
    await waitForMutation()
    expect(wrapper.emitted('remove')?.[0]?.[0]).toEqual({ reason: 'removed' })
    expect(wrapper.find('[data-ui-watermark-layer]').exists()).toBe(true)
  })

  it('repairs modified presentation while leaving ordinary slot mutations alone', async () => {
    const wrapper = mount(UiWatermark, {
      props: { content: 'Protected' },
      slots: { default: () => h('div', { id: 'watermark-content' }, 'Content') },
    })
    await waitForMutation()
    const layer = wrapper.get('[data-ui-watermark-layer]').element
    wrapper.get('#watermark-content').element.append(document.createElement('span'))
    await waitForMutation()
    expect(wrapper.emitted('remove')).toBeUndefined()
    layer.style.backgroundImage = 'none'
    await waitForMutation()
    expect(wrapper.get('[data-ui-watermark-layer]').element.style.backgroundImage).toContain('data:image/png')
    expect(wrapper.emitted('remove')?.[0]?.[0]).toEqual({ reason: 'modified' })
  })

  it('allows mutation recovery to be disabled and exposes an explicit accessible label', async () => {
    const wrapper = mount(UiWatermark, {
      attrs: { id: 'document-watermark', class: 'consumer-class' },
      props: { content: 'Draft', observe: false, ariaLabel: 'Draft document watermark' },
    })
    await nextTick()
    expect(wrapper.get('#document-watermark').classes()).toContain('consumer-class')
    const layer = wrapper.get('[data-ui-watermark-layer]')
    expect(layer.attributes('role')).toBe('img')
    expect(layer.attributes('aria-label')).toBe('Draft document watermark')
    layer.element.remove()
    await waitForMutation()
    expect(wrapper.find('[data-ui-watermark-layer]').exists()).toBe(false)
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('is SSR-safe and exposes a manual update contract', async () => {
    const html = await renderToString(h(UiWatermark, { content: 'Server' }, () => h('article', 'SSR content')))
    expect(html).toContain('ui-watermark')
    expect(html).toContain('SSR content')
    const wrapper = mount(UiWatermark, { props: { content: 'Manual' } })
    await nextTick()
    const renders = wrapper.emitted('render')?.length || 0
    wrapper.vm.update('api')
    await nextTick()
    expect(wrapper.emitted('render')?.length).toBe(renders + 1)
  })
})

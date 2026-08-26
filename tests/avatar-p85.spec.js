// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import UiAvatar from '../src/components/UiAvatar.vue'

const flush = () => nextTick()

describe('UiAvatar P85 production contract', () => {
  it('keeps legacy defaults and derives grapheme-safe initials', () => {
    const wrapper = mount(UiAvatar, { props: { name: '  👩‍💻 Team  ' } })
    expect(wrapper.classes()).toContain('size-md')
    expect(wrapper.classes()).toContain('color-blue')
    expect(wrapper.get('.ui-avatar-fallback').text()).toBe('👩‍💻T')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('👩‍💻 Team')
    expect(mount(UiAvatar, { props: { name: '   ' } }).get('.ui-avatar-fallback').text()).toBe('?')
    expect(mount(UiAvatar, { props: { initials: '👩‍💻👍🏽👍' } }).get('.ui-avatar-fallback').text()).toBe('👩‍💻👍🏽')
  })
  it('normalizes custom dimensions and colors without unsafe CSS', () => {
    const wrapper = mount(UiAvatar, { props: { size: 0, color: 'var(--brand-500)', shape: 'square' } })
    expect(wrapper.attributes('style')).toContain('--ui-a-s: 0px')
    expect(wrapper.classes()).toContain('square')
    expect(wrapper.classes()).toContain('color-custom')
    const invalid = mount(UiAvatar, { props: { size: 'url(javascript:x)', color: 'url(javascript:x)' } })
    expect(invalid.attributes('style')).not.toMatch(/url|NaN|Infinity/)
    expect(invalid.classes()).toContain('color-blue')
  })
  it('executes fallback and placeholder slots independently with stable scopes', async () => {
    const placeholder = vi.fn(scope => h('i', { class: 'placeholder' }, scope.status))
    const fallback = vi.fn(scope => h('i', { class: 'fallback' }, `${scope.initials}:${scope.status}`))
    const wrapper = mount(UiAvatar, { props: { src: 'data:image/svg+xml,<svg/>', name: 'Ada Lovelace' }, slots: { placeholder, fallback } })
    expect(wrapper.find('.placeholder').exists()).toBe(true)
    expect(placeholder.mock.calls[0][0]).toMatchObject({ initials: 'AL', status: 'loading', usingFallback: false })
    const image = wrapper.get('img').element
    image.dispatchEvent(new Event('load'))
    await flush()
    expect(wrapper.get('img').attributes('alt')).toBe('')
    expect(wrapper.vm.getState().status).toBe('loaded')
    wrapper.vm.getImage().dispatchEvent(new Event('error'))
    await flush()
    expect(wrapper.find('.fallback').exists()).toBe(true)
    expect(fallback.mock.calls.at(-1)[0].retry).toEqual(expect.any(Function))
  })
  it('runs the primary/fallback state machine, emits exact metadata, and ignores stale elements', async () => {
    const wrapper = mount(UiAvatar, { props: { src: 'primary.png', fallbackSrc: 'fallback.png', name: 'Admin User' }, attrs: { 'data-test': 'avatar' } })
    const primary = wrapper.get('img').element
    primary.dispatchEvent(new Event('error'))
    await flush()
    expect(wrapper.get('img').attributes('src')).toBe('fallback.png')
    expect(wrapper.emitted('error')?.[0]?.[1]).toMatchObject({ src: 'primary.png', fallback: false })
    expect(wrapper.emitted('fallback')?.[0]?.[0]).toMatchObject({ failedSrc: 'primary.png', fallbackSrc: 'fallback.png' })
    expect(wrapper.vm.getState()).toMatchObject({ status: 'loading', usingFallback: true, src: 'fallback.png' })
    const fallback = wrapper.get('img').element
    const errors = wrapper.emitted('error')?.length || 0
    const loads = wrapper.emitted('load')?.length || 0
    primary.dispatchEvent(new Event('error'))
    primary.dispatchEvent(new Event('load'))
    await flush()
    expect(wrapper.emitted('error')?.length || 0).toBe(errors)
    expect(wrapper.emitted('load')?.length || 0).toBe(loads)
    expect(wrapper.vm.getState()).toMatchObject({ status: 'loading', usingFallback: true, src: 'fallback.png' })
    fallback.dispatchEvent(new Event('load'))
    await flush()
    expect(wrapper.vm.getState().status).toBe('loaded')
    expect(wrapper.vm.retry()).toBe(true)
    expect(wrapper.vm.getState().src).toBe('primary.png')
    await flush()
    const retryPrimary = wrapper.get('img').element
    const retryLoads = wrapper.emitted('load')?.length || 0
    fallback.dispatchEvent(new Event('error'))
    fallback.dispatchEvent(new Event('load'))
    await flush()
    expect(wrapper.emitted('load')?.length || 0).toBe(retryLoads)
    expect(wrapper.vm.getState()).toMatchObject({ status: 'loading', usingFallback: false, src: 'primary.png' })
    retryPrimary.dispatchEvent(new Event('load'))
    await flush()
    expect(wrapper.vm.getElement()).toBe(wrapper.element)
    expect(wrapper.vm.getImage()).toBe(wrapper.get('img').element)
  })
  it('keeps fallback-only avatars idle and makes retry a no-op', () => {
    const wrapper = mount(UiAvatar, { props: { fallbackSrc: 'fallback.png', name: 'Fallback only' } })
    expect(wrapper.vm.getState()).toMatchObject({ status: 'idle', src: '', usingFallback: false, loading: false })
    expect(wrapper.vm.retry()).toBe(false)
    expect(wrapper.emitted('retry')).toBeUndefined()
    expect(wrapper.get('.ui-avatar-fallback').text()).toBe('FO')
  })
  it('uses one accessible name, decorative hiding, instance state and SSR-safe markup', async () => {
    const decorative = mount(UiAvatar, { props: { name: 'Private', decorative: true } })
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('role')).toBeUndefined()
    expect(decorative.attributes('aria-label')).toBeUndefined()
    const html = await renderToString(h(UiAvatar, { src: 'image.png', alt: 'A photo', loading: 'lazy' }))
    expect(html).toContain('aria-label="A photo"')
    expect(html).toMatch(/alt(?:="")?(?:\s|>)/)
    expect(html).not.toContain('window')
  })
})

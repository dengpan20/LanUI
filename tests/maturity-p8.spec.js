// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { captureFocusOrigin, focusWithRetry, registerFocusOriginTracking } from '../src/components/focusUtils.js'

let stopTracking = () => {}

afterEach(() => {
  stopTracking()
  stopTracking = () => {}
  document.body.innerHTML = ''
})

describe('maturity P8 cross-browser focus contracts', () => {
  it('prefers a fresh pointer opener when WebKit keeps focus on the previous control', () => {
    const previous = document.createElement('button')
    const opener = document.createElement('button')
    document.body.append(previous, opener)
    previous.focus()
    stopTracking = registerFocusOriginTracking()

    opener.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))

    expect(document.activeElement).toBe(previous)
    expect(captureFocusOrigin()).toBe(opener)
  })

  it('retries asynchronous focus transfer until a mounted target is available', async () => {
    let target = null
    expect(focusWithRetry(() => target)).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 5))
    target = document.createElement('button')
    document.body.append(target)
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(document.activeElement).toBe(target)
  })
})

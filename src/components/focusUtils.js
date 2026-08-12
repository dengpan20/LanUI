import { isClient } from '../env.js'

let focusOriginSubscribers = 0
let lastPointerTarget = null
let lastPointerTimestamp = 0

function trackPointerTarget(event) {
  const target = event.composedPath?.()[0] || event.target
  lastPointerTarget = target?.closest?.('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || target
  lastPointerTimestamp = Date.now()
}

export function registerFocusOriginTracking() {
  if (!isClient) return () => {}
  focusOriginSubscribers += 1
  if (focusOriginSubscribers === 1) document.addEventListener('pointerdown', trackPointerTarget, true)
  return () => {
    focusOriginSubscribers = Math.max(0, focusOriginSubscribers - 1)
    if (!focusOriginSubscribers) {
      document.removeEventListener('pointerdown', trackPointerTarget, true)
      lastPointerTarget = null
      lastPointerTimestamp = 0
    }
  }
}

export function captureFocusOrigin() {
  if (!isClient) return null
  const active = document.activeElement
  // Safari/WebKit does not focus buttons on pointer click. Prefer the fresh
  // pointer source so nested overlays restore to the control that opened them.
  if (lastPointerTarget?.isConnected && Date.now() - lastPointerTimestamp < 500) return lastPointerTarget
  if (active && active !== document.body && active !== document.documentElement) return active
  return lastPointerTarget?.isConnected ? lastPointerTarget : active
}

export function focusWithRetry(targetOrGetter, attempt=0) {
  if (!isClient) return false
  const target = typeof targetOrGetter === 'function' ? targetOrGetter() : targetOrGetter
  if (target?.isConnected && !target.disabled) {
    try { target.focus({ preventScroll: true }) } catch { target.focus?.() }
    if (document.activeElement === target) return true
  }
  if (attempt < 8) setTimeout(() => focusWithRetry(targetOrGetter, attempt + 1), 16)
  return false
}

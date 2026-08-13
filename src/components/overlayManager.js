import { readonly, ref } from 'vue'
import { getDocument } from '../env.js'

const stack = []
const topOverlayZIndexState = ref(0)
let previousOverflow = ''
let scrollLocked = false

export const topOverlayZIndex = readonly(topOverlayZIndexState)

function syncScrollLock(target) {
  const shouldLock = stack.some(item => item.lockScroll)
  if (shouldLock && !scrollLocked) {
    previousOverflow = target.body.style.overflow
    scrollLocked = true
  }
  if (shouldLock) target.body.style.overflow = 'hidden'
  else if (scrollLocked) {
    target.body.style.overflow = previousOverflow
    scrollLocked = false
  }
}

export function openOverlay(id, baseZIndex = 300, options = {}) {
  const target = getDocument()
  const normalizedBase = Number.isFinite(Number(baseZIndex)) ? Number(baseZIndex) : 300
  if (!target) return normalizedBase
  const lockScroll = options.lockScroll !== false
  let entry = stack.find(item => item.id === id)
  if (!entry) {
    entry = { id, zIndex: Math.max(normalizedBase, (stack.at(-1)?.zIndex ?? normalizedBase - 20) + 20), lockScroll }
    stack.push(entry)
    topOverlayZIndexState.value = entry.zIndex
  } else entry.lockScroll = lockScroll
  syncScrollLock(target)
  return entry.zIndex
}

export function closeOverlay(id) {
  const target = getDocument()
  if (!target) return
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  topOverlayZIndexState.value = stack.reduce((highest, item) => Math.max(highest, item.zIndex), 0)
  syncScrollLock(target)
}

export function isTopOverlay(id) {
  return stack.at(-1)?.id === id
}

export function overlayCount() {
  return stack.length
}

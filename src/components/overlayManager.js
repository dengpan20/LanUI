import { readonly, ref } from 'vue'
import { getDocument } from '../env.js'

const stack = []
const topOverlayZIndexState = ref(0)
let previousOverflow = ''

export const topOverlayZIndex = readonly(topOverlayZIndexState)

export function openOverlay(id, baseZIndex = 300) {
  const target = getDocument()
  const normalizedBase = Number.isFinite(Number(baseZIndex)) ? Number(baseZIndex) : 300
  if (!target) return normalizedBase
  let entry = stack.find(item => item.id === id)
  if (!entry) {
    if (!stack.length) previousOverflow = target.body.style.overflow
    entry = { id, zIndex: Math.max(normalizedBase, (stack.at(-1)?.zIndex ?? normalizedBase - 20) + 20) }
    stack.push(entry)
    topOverlayZIndexState.value = entry.zIndex
    target.body.style.overflow = 'hidden'
  }
  return entry.zIndex
}

export function closeOverlay(id) {
  const target = getDocument()
  if (!target) return
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  topOverlayZIndexState.value = stack.reduce((highest, item) => Math.max(highest, item.zIndex), 0)
  if (!stack.length) target.body.style.overflow = previousOverflow
}

export function isTopOverlay(id) {
  return stack.at(-1)?.id === id
}

export function overlayCount() {
  return stack.length
}

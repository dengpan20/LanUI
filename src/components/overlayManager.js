import { getDocument } from '../env.js'

const stack = []
let previousOverflow = ''

export function openOverlay(id) {
  const target = getDocument()
  if (!target) return 300
  if (!stack.includes(id)) {
    if (!stack.length) previousOverflow = target.body.style.overflow
    stack.push(id)
    target.body.style.overflow = 'hidden'
  }
  return 300 + stack.indexOf(id) * 20
}

export function closeOverlay(id) {
  const target = getDocument()
  if (!target) return
  const index = stack.indexOf(id)
  if (index >= 0) stack.splice(index, 1)
  if (!stack.length) target.body.style.overflow = previousOverflow
}

export function isTopOverlay(id) {
  return stack.at(-1) === id
}

export function overlayCount() {
  return stack.length
}

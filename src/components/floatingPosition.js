import { nextTick, onBeforeUnmount, ref, unref, watch } from 'vue'

const opposite = { top:'bottom', bottom:'top', left:'right', right:'left' }

function parsePlacement(value = 'bottom') {
  const [side = 'bottom', align = 'center'] = String(value).split('-')
  return { side, align: align === 'left' ? 'start' : align === 'right' ? 'end' : align }
}

function coordinates(trigger, panel, placement, offset) {
  const { side, align } = parsePlacement(placement)
  let left = trigger.left + (trigger.width - panel.width) / 2
  let top = trigger.top + (trigger.height - panel.height) / 2
  if (side === 'top') top = trigger.top - panel.height - offset
  if (side === 'bottom') top = trigger.bottom + offset
  if (side === 'left') left = trigger.left - panel.width - offset
  if (side === 'right') left = trigger.right + offset
  if (side === 'top' || side === 'bottom') {
    if (align === 'start') left = trigger.left
    if (align === 'end') left = trigger.right - panel.width
  } else {
    if (align === 'start') top = trigger.top
    if (align === 'end') top = trigger.bottom - panel.height
  }
  return { left, top }
}

function overflowScore(point, panel, padding) {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  return Math.max(0, padding - point.left) + Math.max(0, padding - point.top) +
    Math.max(0, point.left + panel.width + padding - width) + Math.max(0, point.top + panel.height + padding - height)
}

function mainAxisOverflow(point, panel, placement, padding) {
  const { side } = parsePlacement(placement)
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  if (side === 'top') return Math.max(0, padding - point.top)
  if (side === 'bottom') return Math.max(0, point.top + panel.height + padding - height)
  if (side === 'left') return Math.max(0, padding - point.left)
  return Math.max(0, point.left + panel.width + padding - width)
}

export function useFloatingPosition({ triggerRef, panelRef, open, placement, offset = 8, padding = 8, zIndex = 360 }) {
  const floatingStyle = ref({ position:'fixed', left:'0px', top:'0px', zIndex:unref(zIndex), visibility:'hidden' })
  const resolvedPlacement = ref(unref(placement) || 'bottom')
  let resizeObserver = null

  function update() {
    if (typeof window === 'undefined' || !unref(open)) return
    const triggerElement = unref(triggerRef)
    const panelElement = unref(panelRef)
    if (!triggerElement || !panelElement) return
    const trigger = triggerElement.getBoundingClientRect()
    const panel = panelElement.getBoundingClientRect()
    const preferred = parsePlacement(unref(placement) || 'bottom')
    const candidates = [
      `${preferred.side}${preferred.align === 'center' ? '' : `-${preferred.align}`}`,
      `${opposite[preferred.side]}${preferred.align === 'center' ? '' : `-${preferred.align}`}`,
    ]
    if (preferred.side === 'top' || preferred.side === 'bottom') candidates.push('right', 'left')
    else candidates.push('bottom', 'top')
    let best = candidates[0]
    let bestPoint = coordinates(trigger, panel, best, offset)
    let bestScore = overflowScore(bestPoint, panel, padding)
    let bestMainOverflow = mainAxisOverflow(bestPoint, panel, best, padding)
    for (const candidate of candidates.slice(1)) {
      const point = coordinates(trigger, panel, candidate, offset)
      const score = overflowScore(point, panel, padding)
      const mainOverflow = mainAxisOverflow(point, panel, candidate, padding)
      if (mainOverflow < bestMainOverflow || (mainOverflow === bestMainOverflow && score < bestScore)) {
        best = candidate; bestPoint = point; bestScore = score; bestMainOverflow = mainOverflow
      }
      if (bestMainOverflow === 0 && best === candidate) break
    }
    const maxLeft = Math.max(padding, document.documentElement.clientWidth - panel.width - padding)
    const maxTop = Math.max(padding, document.documentElement.clientHeight - panel.height - padding)
    resolvedPlacement.value = best
    floatingStyle.value = {
      position:'fixed',
      left:`${Math.round(Math.min(maxLeft, Math.max(padding, bestPoint.left)))}px`,
      top:`${Math.round(Math.min(maxTop, Math.max(padding, bestPoint.top)))}px`,
      zIndex:unref(zIndex),
      visibility:'visible',
    }
  }

  function attach() {
    if (typeof window === 'undefined') return
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    if ('ResizeObserver' in window) {
      resizeObserver = new window.ResizeObserver(update)
      const triggerElement=unref(triggerRef)
      const panelElement=unref(panelRef)
      if (typeof Element!=='undefined'&&triggerElement instanceof Element) resizeObserver.observe(triggerElement)
      if (typeof Element!=='undefined'&&panelElement instanceof Element) resizeObserver.observe(panelElement)
    }
  }
  function detach() {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', update)
    window.removeEventListener('scroll', update, true)
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  watch([() => unref(open), () => unref(placement), () => unref(zIndex)], async ([visible]) => {
    detach()
    if (!visible) return
    await nextTick()
    update()
    attach()
  }, { immediate:true })
  onBeforeUnmount(detach)
  return { floatingStyle, resolvedPlacement, update }
}

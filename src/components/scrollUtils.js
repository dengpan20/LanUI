export function scrollElementWithin(element, container) {
  if (!element || !container) return false
  const elementRect = element.getBoundingClientRect?.()
  const containerRect = container.getBoundingClientRect?.()
  if (!elementRect || !containerRect) return false

  if (elementRect.top < containerRect.top) {
    container.scrollTop = Math.max(0, container.scrollTop - (containerRect.top - elementRect.top))
  } else if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop = Math.max(0, container.scrollTop + (elementRect.bottom - containerRect.bottom))
  }
  return true
}

export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export function getDocument() {
  return isClient ? document : null
}

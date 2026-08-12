import { toRaw } from 'vue'

export function toPath(value) {
  if (Array.isArray(value)) return value.map(part => String(part)).filter(Boolean)
  return String(value ?? '')
    .replace(/\[(?:'([^']*)'|"([^"]*)"|([^\]]+))\]/g, (_, single, double, bare) => `.${single ?? double ?? String(bare).trim()}`)
    .split('.')
    .map(part => part.trim())
    .filter(Boolean)
}

export const pathKey = value => toPath(value).join('.')

export function getPath(target, path) {
  return toPath(path).reduce((current, part) => current == null ? undefined : current[part], target)
}

export function hasPath(target, path) {
  const parts = toPath(path)
  if (!parts.length) return false
  let current = target
  for (const part of parts) {
    if (current == null || !Object.prototype.hasOwnProperty.call(current, part)) return false
    current = current[part]
  }
  return true
}

export function setPath(target, path, value) {
  const parts = toPath(path)
  if (!parts.length) return target
  let current = target
  parts.forEach((part, index) => {
    if (index === parts.length - 1) current[part] = value
    else {
      const nextIsIndex = /^\d+$/.test(parts[index + 1])
      if (!current[part] || typeof current[part] !== 'object') current[part] = nextIsIndex ? [] : {}
      current = current[part]
    }
  })
  return target
}

export function deletePath(target, path) {
  const parts = toPath(path)
  if (!parts.length) return false
  const leaf = parts.pop()
  const parent = parts.reduce((current, part) => current == null ? undefined : current[part], target)
  if (parent == null || !Object.prototype.hasOwnProperty.call(parent, leaf)) return false
  if (Array.isArray(parent) && /^\d+$/.test(leaf)) parent.splice(Number(leaf), 1)
  else delete parent[leaf]
  return true
}

export function cloneValue(value) {
  const raw = toRaw(value)
  if (typeof structuredClone === 'function') {
    try { return structuredClone(raw) } catch {}
  }
  if (raw instanceof Date) return new Date(raw.getTime())
  if (Array.isArray(raw)) return raw.map(cloneValue)
  if (raw && typeof raw === 'object') return Object.fromEntries(Object.entries(raw).map(([key, item]) => [key, cloneValue(item)]))
  return raw
}

export function valuesEqual(left, right) {
  if (Object.is(left, right)) return true
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime()
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((item, index) => valuesEqual(item, right[index]))
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    return leftKeys.length === rightKeys.length && leftKeys.every(key => Object.prototype.hasOwnProperty.call(right, key) && valuesEqual(left[key], right[key]))
  }
  return false
}

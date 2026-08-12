<script setup>
import { computed, inject, ref, toRaw, useId, watch } from 'vue'
import { cloneValue, getPath, pathKey, toPath } from './formUtils.js'

const props = defineProps({
  modelValue: { type: Array, default: undefined },
  name: { type: [String, Array], default: '' },
  defaultValue: { default: undefined },
  min: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
  disabled: Boolean,
  validateOnChange: { type: Boolean, default: true },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change', 'add', 'remove', 'move', 'limit'])
const form = inject('uiFormContext', null)
const prefix = useId()
let serial = 0
const entries = ref([])
const normalizedName = computed(() => pathKey(props.name))
const minimum = computed(() => Math.max(0, Math.trunc(Number.isFinite(props.min) ? props.min : 0)))
const maximum = computed(() => Math.max(minimum.value, Number.isFinite(props.max) ? Math.trunc(props.max) : Infinity))
const value = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  const nested = form && normalizedName.value ? getPath(form.model, props.name) : undefined
  return Array.isArray(nested) ? nested : []
})
const nextKey = () => `${prefix}-item-${++serial}`
const identity = item => toRaw(item)

function reconcile(next) {
  const available = entries.value.map(entry => ({ ...entry, used: false }))
  entries.value = next.map(item => {
    const match = available.find(entry => !entry.used && Object.is(toRaw(entry.identity), identity(item)))
    if (match) { match.used = true; return { key: match.key, identity: identity(item) } }
    return { key: nextKey(), identity: identity(item) }
  })
}
watch(() => value.value.slice(), reconcile, { immediate: true, flush: 'sync' })

const fields = computed(() => value.value.map((item, index) => ({
  key: entries.value[index]?.key || `${prefix}-pending-${index}`,
  name: [...toPath(props.name), index],
  index,
  value: item,
})))
const canAdd = computed(() => !props.disabled && value.value.length < maximum.value)
const canRemove = computed(() => !props.disabled && value.value.length > minimum.value)

function emitLimit(action) {
  const payload = { action, min: minimum.value, max: maximum.value, length: value.value.length }
  emit('limit', payload)
  return false
}
function commit(next, type, detail = {}) {
  const committed = next.slice()
  if (form && normalizedName.value) form.setFieldValue?.(props.name, committed)
  emit('update:modelValue', committed)
  const payload = { type, values: cloneValue(committed), ...detail }
  emit('change', payload)
  if (props.validateOnChange && normalizedName.value && form?.getFieldState?.(props.name)) {
    form.validateField?.(props.name, { trigger: 'change', source: 'list', focus: false })
  }
  return payload
}
function resolveDefault(index) {
  const source = typeof props.defaultValue === 'function' ? props.defaultValue({ index, values: getValue() }) : props.defaultValue
  return cloneValue(source)
}
function add(item, index = value.value.length) {
  if (!canAdd.value) return emitLimit('add')
  const target = Math.max(0, Math.min(value.value.length, Math.trunc(Number(index) || 0)))
  const inserted = arguments.length ? cloneValue(item) : resolveDefault(target)
  const next = value.value.slice()
  next.splice(target, 0, inserted)
  entries.value.splice(target, 0, { key: nextKey(), identity: identity(inserted) })
  const payload = commit(next, 'add', { index: target, value: cloneValue(inserted) })
  emit('add', payload)
  return payload
}
function remove(indices) {
  if (props.disabled) return false
  const requested = (Array.isArray(indices) ? indices : [indices])
    .map(Number).filter(Number.isInteger)
  const targets = [...new Set(requested)].filter(index => index >= 0 && index < value.value.length).sort((a, b) => a - b)
  if (!targets.length) return false
  if (value.value.length - targets.length < minimum.value) return emitLimit('remove')
  const removed = targets.map(index => cloneValue(value.value[index]))
  const next = value.value.filter((_, index) => !targets.includes(index))
  entries.value = entries.value.filter((_, index) => !targets.includes(index))
  const payload = commit(next, 'remove', { indices: targets, removed })
  emit('remove', payload)
  return payload
}
function move(from, to) {
  if (props.disabled) return false
  const source = Math.trunc(Number(from)); const target = Math.trunc(Number(to))
  if (!Number.isInteger(source) || !Number.isInteger(target) || source < 0 || target < 0 || source >= value.value.length || target >= value.value.length || source === target) return false
  const next = value.value.slice(); const [item] = next.splice(source, 1); next.splice(target, 0, item)
  const [entry] = entries.value.splice(source, 1); entries.value.splice(target, 0, entry)
  const payload = commit(next, 'move', { from: source, to: target })
  emit('move', payload)
  return payload
}
function replace(items) {
  if (props.disabled || !Array.isArray(items)) return false
  if (items.length < minimum.value || items.length > maximum.value) return emitLimit('replace')
  reconcile(items)
  return commit(items, 'replace')
}
function getValue() { return cloneValue(value.value) }

defineExpose({ add, remove, move, replace, getValue, fields, canAdd, canRemove })
</script>

<template>
  <div class="ui-form-list" :role="ariaLabel?'group':undefined" :aria-label="ariaLabel || undefined" :aria-disabled="disabled || undefined">
    <slot :fields="fields" :add="add" :remove="remove" :move="move" :replace="replace" :can-add="canAdd" :can-remove="canRemove" />
    <slot v-if="!fields.length" name="empty" :add="add" :can-add="canAdd" />
  </div>
</template>

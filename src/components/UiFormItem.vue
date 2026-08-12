<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'
import { cloneValue, getPath, pathKey, valuesEqual } from './formUtils.js'

const props = defineProps({
  label: { type: String, default: '' },
  name: { type: [String, Array], default: '' },
  required: Boolean,
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  forId: { type: String, default: '' },
  group: Boolean,
  composite: Boolean,
  reserveMessageSpace: Boolean,
  rules: { type: [Array, Object, Function], default: () => [] },
  validateStatus: { type: String, default: '' },
  showSuccess: Boolean,
})
const emit = defineEmits(['validate'])
const form = inject('uiFormContext', null)
const { t } = useLocale()
const uid = useId()
const internalError = ref('')
const generatedError = ref(null)
const status = ref('idle')
const touched = ref(false)
const validationRun = ref(0)
let controller = null
let activeValidation = null
const initialValue = ref()
const itemElement = ref(null)
const normalizedName = computed(() => pathKey(props.name))
const controlId = computed(() => props.forId || `ui-form-control-${uid}`)
const labelId = computed(() => props.label ? `ui-form-label-${uid}` : '')
const helpId = `ui-form-help-${uid}`
const errorId = `ui-form-error-${uid}`
const message = computed(() => props.error || (generatedError.value ? t(generatedError.value.key, {...generatedError.value.params,label:props.label||props.name||t('form.field')}) : internalError.value))
const describedby = computed(() => message.value ? errorId : props.help ? helpId : '')
const effectiveStatus = computed(() => props.validateStatus || (message.value ? 'error' : status.value))
const invalid = computed(() => effectiveStatus.value === 'error')
const validating = computed(() => effectiveStatus.value === 'validating')
const dirty = computed(() => !valuesEqual(form ? getPath(form.model, props.name) : undefined, initialValue.value))
const transientReserve = ref(false)
watch(() => form?.actionPointer?.value, value => {
  if (value && message.value) transientReserve.value = true
  else if (!value) transientReserve.value = false
})
const reserveMessage = computed(() => props.reserveMessageSpace || transientReserve.value)
const normalizedRules = computed(() => {
  const ownRules = props.rules?.length || typeof props.rules === 'function' || Object.keys(props.rules || {}).length
  const source = ownRules ? props.rules : getPath(form?.rules, props.name) || form?.rules?.[normalizedName.value] || []
  return Array.isArray(source) ? source : [source]
})

provide('uiFormItemContext', { controlId, labelId, describedby, invalid, validating, required: computed(() => props.required) })

const empty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
function typeValid(value, type) {
  if (!type) return true
  if (type === 'array') return Array.isArray(value)
  if (type === 'date') return value instanceof Date && !Number.isNaN(value.getTime())
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value)
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value)
  if (type === 'object') return !!value && typeof value === 'object' && !Array.isArray(value)
  if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
  if (type === 'url') { try { return Boolean(new URL(String(value))) } catch { return false } }
  return typeof value === type
}
function matchesPattern(pattern, value) { pattern.lastIndex = 0; return pattern.test(String(value)) }
function getState() {
  const errors = message.value ? [message.value] : []
  return { name: normalizedName.value, label: props.label || normalizedName.value, errors, status: effectiveStatus.value, touched: touched.value, dirty: dirty.value, validating: validating.value }
}
function report() { if (normalizedName.value) form?.report?.(normalizedName.value, getState()) }
async function latestResult() {
  const latest = activeValidation
  return latest ? latest : effectiveStatus.value !== 'error'
}
async function runValidation(trigger, run, currentController) {
  const value = form ? getPath(form.model, props.name) : undefined
  status.value = 'validating'
  report()
  for (const rule of normalizedRules.value) {
    if (!rule) continue
    const target = typeof rule === 'function' ? { validator: rule } : rule
    const triggers = target.trigger ? (Array.isArray(target.trigger) ? target.trigger : [target.trigger]) : []
    if (trigger !== 'submit' && triggers.length && !triggers.includes(trigger)) continue
    let error = ''
    let generated = null
    const checked = target.transform ? target.transform(value) : value
    const size = typeof checked === 'number' ? checked : checked?.length
    if ((target.required || props.required) && empty(checked)) target.message ? error=target.message : generated={key:'form.required',params:{}}
    else if (!empty(checked) && target.whitespace && typeof checked === 'string' && !checked.trim()) target.message ? error=target.message : generated={key:'form.whitespace',params:{}}
    else if (!empty(checked) && target.type && !typeValid(checked, target.type)) target.message ? error=target.message : generated={key:'form.type',params:{type:target.type}}
    else if (!empty(checked) && target.len !== undefined && size !== target.len) target.message ? error=target.message : generated={key:'form.len',params:{len:target.len}}
    else if (!empty(checked) && target.min !== undefined && size < target.min) target.message ? error=target.message : generated={key:'form.min',params:{min:target.min}}
    else if (!empty(checked) && target.max !== undefined && size > target.max) target.message ? error=target.message : generated={key:'form.max',params:{max:target.max}}
    else if (!empty(checked) && target.enum && !target.enum.includes(checked)) target.message ? error=target.message : generated={key:'form.enum',params:{}}
    else if (!empty(checked) && target.pattern && !matchesPattern(target.pattern, checked)) target.message ? error=target.message : generated={key:'form.pattern',params:{}}
    else if (target.validator) {
      try {
        const result = await target.validator(checked, form?.model, { signal: currentController?.signal, trigger, name: normalizedName.value })
        if (run !== validationRun.value) return latestResult()
        if (result === false) target.message ? error=target.message : generated={key:'form.invalid',params:{}}
        else if (typeof result === 'string') error = result
        else if (result instanceof Error) error = result.message
      } catch (reason) {
        if (run !== validationRun.value || reason?.name === 'AbortError') return latestResult()
        error = reason?.message || target.message || ''
        if (!error) generated={key:'form.invalid',params:{}}
      }
    }
    if (run !== validationRun.value) return latestResult()
    if (error || generated) {
      internalError.value = error
      generatedError.value = generated
      status.value = 'error'
      const result = { valid: false, ...getState(), trigger }
      report(); emit('validate', result)
      return false
    }
  }
  if (run !== validationRun.value) return latestResult()
  internalError.value = ''
  generatedError.value = null
  status.value = normalizedRules.value.length ? 'success' : 'idle'
  const result = { valid: true, ...getState(), trigger }
  report(); emit('validate', result)
  return true
}
function validate(trigger = 'submit') {
  const run = ++validationRun.value
  controller?.abort()
  const currentController = typeof AbortController === 'function' ? new AbortController() : null
  controller = currentController
  const task = runValidation(trigger, run, currentController)
  activeValidation = task
  const cleanup = () => { if (activeValidation === task) activeValidation = null }
  task.then(cleanup, cleanup)
  return task
}
function clear() {
  validationRun.value++
  controller?.abort(); controller = null; activeValidation = null
  internalError.value = ''; generatedError.value = null; status.value = 'idle'
  report()
}
function setErrors(errors) {
  validationRun.value++
  controller?.abort(); controller = null; activeValidation = null
  const values = (Array.isArray(errors) ? errors : [errors]).filter(Boolean).map(item => item instanceof Error ? item.message : String(item))
  internalError.value = values[0] || ''
  generatedError.value = null
  status.value = values.length ? 'error' : 'idle'
  report()
}
function setMeta(meta = {}) {
  if (meta.touched !== undefined) touched.value = Boolean(meta.touched)
  if (meta.status) status.value = meta.status
  report()
}
function resetState() { touched.value = false; clear() }
function focus() {
  const target = itemElement.value?.querySelector?.('input:not([disabled]),textarea:not([disabled]),select:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])')
  target?.focus?.()
  return Boolean(target)
}
function scrollIntoView(options) { itemElement.value?.scrollIntoView?.(options); return Boolean(itemElement.value) }
function prepareActionPointer() { if (message.value) transientReserve.value = true }
function onFocusout(event) {
  if (form?.actionPointer?.value) return
  const next = event.relatedTarget
  const formElement = event.currentTarget?.closest?.('form')
  if (formElement?.contains(next) && next?.matches?.('button[type="submit"],input[type="submit"]')) return
  touched.value = true
  validate('blur')
}
function onChange() { touched.value = true; validate('change') }
const api = { validate, clear, setErrors, setMeta, resetState, focus, scrollIntoView, getState, prepareActionPointer }
onMounted(() => {
  initialValue.value = cloneValue(form?.getInitialValue?.(props.name) ?? (form ? getPath(form.model, props.name) : undefined))
  form?.register(props.name, api)
  report()
})
onBeforeUnmount(() => { controller?.abort(); form?.unregister(props.name, api) })
watch(normalizedName, (name, previous) => { form?.unregister(previous, api); form?.register(name, api); report() })
watch([message, effectiveStatus, touched, dirty], report)
watch(() => props.error, () => nextTick(report))
defineExpose({ validate, clear, setErrors, focus, scrollIntoView, getState, controlId })
</script>

<template>
  <div ref="itemElement" class="field ui-form-item" :class="{invalid,validating,success:showSuccess&&effectiveStatus==='success',dirty,touched}" :role="group?'group':undefined" :aria-labelledby="group?labelId:undefined" :aria-busy="validating || undefined" @focusout="onFocusout" @change="onChange">
    <label v-if="label && !group && !composite" :id="labelId" class="field-label" :class="{required}" :for="controlId">{{ label }}</label>
    <span v-else-if="label" :id="labelId" class="field-label" :class="{required}">{{ label }}</span>
    <slot :control-id="controlId" :labelledby="labelId || undefined" :describedby="describedby || undefined" :invalid="invalid" :validating="validating" :status="effectiveStatus" :dirty="dirty" :touched="touched" :validate="validate"/>
    <span v-if="message || help || reserveMessage" class="ui-form-item-message" :aria-hidden="!message && !help ? 'true' : undefined">
      <span v-if="message" :id="errorId" class="field-error" role="alert"><AppIcon name="alert" :size="12"/>{{ message }}</span>
      <span v-else-if="help" :id="helpId" class="field-help">{{ help }}</span>
    </span>
  </div>
</template>

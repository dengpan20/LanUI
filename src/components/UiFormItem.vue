<script setup>
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'

const props = defineProps({
  label: { type: String, default: '' },
  name: { type: String, default: '' },
  required: Boolean,
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  forId: { type: String, default: '' },
  group: Boolean,
  composite: Boolean,
  reserveMessageSpace: Boolean,
  rules: { type: [Array, Object, Function], default: () => [] },
})
const form = inject('uiFormContext', null)
const { t } = useLocale()
const uid = useId()
const internalError = ref('')
const generatedError = ref(null)
const controlId = computed(() => props.forId || `ui-form-control-${uid}`)
const labelId = computed(() => props.label ? `ui-form-label-${uid}` : '')
const helpId = `ui-form-help-${uid}`
const errorId = `ui-form-error-${uid}`
const message = computed(() => props.error || (generatedError.value ? t(generatedError.value.key, {...generatedError.value.params,label:props.label||props.name||t('form.field')}) : internalError.value))
const describedby = computed(() => message.value ? errorId : props.help ? helpId : '')
const invalid = computed(() => !!message.value)
const transientReserve = ref(false)
watch(() => form?.submitPointer?.value, value => {
  if (value && message.value) transientReserve.value = true
  else if (!value) transientReserve.value = false
})
const reserveMessage = computed(() => props.reserveMessageSpace || transientReserve.value)
const normalizedRules = computed(() => {
  const ownRules = props.rules?.length || typeof props.rules === 'function' || Object.keys(props.rules || {}).length
  const source = ownRules ? props.rules : form?.rules?.[props.name] || []
  return Array.isArray(source) ? source : [source]
})

provide('uiFormItemContext', { controlId, labelId, describedby, invalid, required: computed(() => props.required) })

const empty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
async function validate(trigger = 'submit') {
  const value = form?.model?.[props.name]
  for (const rule of normalizedRules.value) {
    if (!rule) continue
    const target = typeof rule === 'function' ? { validator: rule } : rule
    const triggers = target.trigger ? (Array.isArray(target.trigger) ? target.trigger : [target.trigger]) : []
    if (trigger !== 'submit' && triggers.length && !triggers.includes(trigger)) continue
    let error = ''
    let generated = null
    if ((target.required || props.required) && empty(value)) target.message ? error=target.message : generated={key:'form.required',params:{}}
    else if (!empty(value) && target.min !== undefined && (typeof value === 'number' ? value : value.length) < target.min) target.message ? error=target.message : generated={key:'form.min',params:{min:target.min}}
    else if (!empty(value) && target.max !== undefined && (typeof value === 'number' ? value : value.length) > target.max) target.message ? error=target.message : generated={key:'form.max',params:{max:target.max}}
    else if (!empty(value) && target.pattern && !target.pattern.test(String(value))) target.message ? error=target.message : generated={key:'form.pattern',params:{}}
    else if (target.validator) {
      try {
        const result = await target.validator(value, form?.model)
        if (result === false) target.message ? error=target.message : generated={key:'form.invalid',params:{}}
        else if (typeof result === 'string') error = result
      } catch (reason) {
        error = reason?.message || target.message || ''
        if (!error) generated={key:'form.invalid',params:{}}
      }
    }
    if (error || generated) { internalError.value = error; generatedError.value=generated; return false }
  }
  internalError.value = ''
  generatedError.value = null
  return true
}
function clear() { internalError.value = ''; generatedError.value = null }
function prepareSubmitPointer() { if (message.value) transientReserve.value = true }
function onFocusout(event) {
  if (form?.submitPointer?.value) return
  const next = event.relatedTarget
  const formElement = event.currentTarget?.closest?.('form')
  if (formElement?.contains(next) && next?.matches?.('button[type="submit"],input[type="submit"]')) return
  validate('blur')
}
onMounted(() => form?.register(props.name, { validate, clear, prepareSubmitPointer }))
onBeforeUnmount(() => form?.unregister(props.name))
defineExpose({ validate, clear, controlId })
</script>

<template>
  <div class="field ui-form-item" :class="{invalid}" :role="group?'group':undefined" :aria-labelledby="group?labelId:undefined" @focusout="onFocusout" @change="validate('change')">
    <label v-if="label && !group && !composite" :id="labelId" class="field-label" :class="{required}" :for="controlId">{{ label }}</label>
    <span v-else-if="label" :id="labelId" class="field-label" :class="{required}">{{ label }}</span>
    <slot :control-id="controlId" :labelledby="labelId || undefined" :describedby="describedby || undefined" :invalid="invalid" :validate="validate"/>
    <span v-if="message || help || reserveMessage" class="ui-form-item-message" :aria-hidden="!message && !help ? 'true' : undefined">
      <span v-if="message" :id="errorId" class="field-error" role="alert"><AppIcon name="alert" :size="12"/>{{ message }}</span>
      <span v-else-if="help" :id="helpId" class="field-help">{{ help }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, provide, reactive, ref, shallowReactive, watch } from 'vue'
import { cloneValue, deletePath, getPath, hasPath, pathKey, setPath } from './formUtils.js'
import { useLocale } from '../config-runtime.js'

const props = defineProps({
  model: { type: Object, required: true },
  rules: { type: Object, default: () => ({}) },
  initialValues: { type: Object, default: undefined },
  validateOnSubmit: { type: Boolean, default: true },
  validateOnRuleChange: Boolean,
  focusOnError: { type: Boolean, default: true },
  scrollToError: Boolean,
  scrollIntoViewOptions: { type: Object, default: () => ({ block: 'center', behavior: 'smooth' }) },
  showErrorSummary: Boolean,
  errorSummaryTitle: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'invalid', 'reset', 'validate'])
const { t } = useLocale()
const formElement = ref(null)
const fields = shallowReactive(new Map())
const fieldStates = reactive(new Map())
const actionPointer = ref(false)
const validating = ref(false)
const submitted = ref(false)
const heldSummaryErrors = ref([])
let actionPointerTimer
const initial = cloneValue(props.initialValues ?? props.model)

const errors = computed(() => [...fieldStates.values()]
  .filter(state => state.errors?.length)
  .map(state => ({ name: state.name, label: state.label, message: state.errors[0], errors: [...state.errors] })))
const dirty = computed(() => [...fieldStates.values()].some(state => state.dirty))
const touched = computed(() => [...fieldStates.values()].some(state => state.touched))
const displayedErrors = computed(() => errors.value.length ? errors.value : actionPointer.value ? heldSummaryErrors.value : [])

function normalizeNames(names) {
  if (names === undefined || names === null) return [...fields.keys()]
  return (Array.isArray(names) ? names : [names]).map(pathKey).filter(Boolean)
}
function register(name, api) {
  const key = pathKey(name)
  if (!key) return
  fields.set(key, api)
  report(key, api.getState?.())
}
function unregister(name, api) {
  const key = pathKey(name)
  if (fields.get(key) !== api) return
  fields.delete(key)
  fieldStates.delete(key)
}
function report(name, state = {}) {
  const key = pathKey(name)
  if (!key) return
  fieldStates.set(key, { name: key, label: state.label || key, errors: [], status: 'idle', touched: false, dirty: false, ...state })
}
function getInitialValue(name) { return cloneValue(getPath(initial, name)) }
function getFieldValue(name) { return getPath(props.model, name) }
function setFieldValue(name, value, options = {}) {
  setPath(props.model, name, value)
  if (options.validate) return validateField(name, { trigger: options.trigger || 'change', focus: false })
  return value
}
function getFieldsValue(names) {
  if (names === undefined) return cloneValue(props.model)
  const result = {}
  normalizeNames(names).forEach(name => setPath(result, name, cloneValue(getPath(props.model, name))))
  return result
}
function getFieldState(name) { return fields.get(pathKey(name))?.getState?.() || null }
function getFieldsState(names) { return normalizeNames(names).map(getFieldState).filter(Boolean) }
function getFieldError(name) { return getFieldState(name)?.errors || [] }
function getFieldsError(names) { return getFieldsState(names).filter(state => state.errors.length) }
function focusField(name) { return fields.get(pathKey(name))?.focus?.() ?? false }
function scrollToField(name, options = props.scrollIntoViewOptions) { return fields.get(pathKey(name))?.scrollIntoView?.(options) ?? false }

async function validate(names, options = {}) {
  const targets = normalizeNames(names)
  validating.value = true
  const trigger = options.trigger || 'submit'
  try {
    const results = await Promise.all(targets.map(name => fields.get(name)?.validate(trigger) ?? true))
    const valid = results.every(Boolean)
    const currentErrors = getFieldsError(targets)
    emit('validate', { valid, errors: currentErrors, source: options.source || trigger })
    if (!valid && options.focus !== false) {
      await nextTick()
      const first = currentErrors[0]?.name
      if (first && (options.scroll ?? props.scrollToError)) scrollToField(first)
      if (first && (options.focus ?? props.focusOnError)) focusField(first)
    }
    return valid
  } finally {
    validating.value = false
  }
}
const validateField = (names, options = {}) => validate(names, { focus: false, ...options })
function clearValidate(names) { normalizeNames(names).forEach(name => fields.get(name)?.clear?.()) }
function setFieldError(name, fieldErrors) { fields.get(pathKey(name))?.setErrors?.(fieldErrors) }
function setFields(states = []) {
  for (const state of states) {
    if (!state?.name) continue
    const field = fields.get(pathKey(state.name))
    if (state.value !== undefined) setPath(props.model, state.name, cloneValue(state.value))
    if (state.errors !== undefined) field?.setErrors?.(state.errors)
    field?.setMeta?.(state)
  }
}
function resetFields(names, event) {
  const targets = normalizeNames(names)
  if (names === undefined) {
    Object.keys(props.model).forEach(key => delete props.model[key])
    Object.assign(props.model, cloneValue(initial))
  } else {
    targets.forEach(name => {
      if (hasPath(initial, name)) setPath(props.model, name, cloneValue(getPath(initial, name)))
      else deletePath(props.model, name)
    })
  }
  targets.forEach(name => fields.get(name)?.resetState?.())
  submitted.value = false
  emit('reset', { names: targets, model: cloneValue(props.model), event })
}
const reset = event => resetFields(undefined, event)
async function submit(event) {
  submitted.value = true
  await nextTick()
  const valid = props.validateOnSubmit ? await validate(undefined, { source: 'submit' }) : true
  if (valid) emit('submit', cloneValue(props.model), event)
  else emit('invalid', cloneValue(props.model), event, getFieldsError())
}
function pointerdown(event) {
  actionPointer.value = !!event.target?.closest?.('button,input[type="button"],input[type="submit"],input[type="reset"]')
  clearTimeout(actionPointerTimer)
  if (actionPointer.value) {
    heldSummaryErrors.value = errors.value.map(item => ({ ...item, errors: [...item.errors] }))
    fields.forEach(field => field.prepareActionPointer?.())
    actionPointerTimer = setTimeout(() => { actionPointer.value = false; heldSummaryErrors.value = [] }, 250)
  } else {
    heldSummaryErrors.value = []
  }
}
watch(() => props.rules, () => { if (props.validateOnRuleChange) validate(undefined, { source: 'rules', focus: false }) }, { deep: true })
onBeforeUnmount(() => clearTimeout(actionPointerTimer))

const context = {
  get model() { return props.model },
  get rules() { return props.rules },
  register,
  unregister,
  report,
  getInitialValue,
  getFieldValue,
  getFieldsValue,
  setFieldValue,
  getFieldState,
  validateField,
  actionPointer,
}
provide('uiFormContext', context)
defineExpose({
  validate, validateField, clearValidate, reset, resetFields, setFields, setFieldError,
  submit,
  getFieldValue, getFieldsValue, setFieldValue, getFieldState, getFieldsState, getFieldError,
  getFieldsError, focusField, scrollToField,
})
</script>

<template>
  <form ref="formElement" class="ui-form" novalidate :aria-busy="validating || undefined" @pointerdown.capture="pointerdown" @reset.prevent="reset" @submit.prevent="submit">
    <div v-if="showErrorSummary && submitted && displayedErrors.length" class="ui-form-error-summary" role="region" :aria-label="errorSummaryTitle || t('form.errorSummary')">
      <strong>{{ errorSummaryTitle || t('form.errorSummary') }}</strong>
      <ul><li v-for="item in displayedErrors" :key="item.name"><button type="button" @click="focusField(item.name)">{{ item.message }}</button></li></ul>
    </div>
    <slot
      :validate="validate"
      :validate-field="validateField"
      :submit="submit"
      :reset="reset"
      :reset-fields="resetFields"
      :errors="errors"
      :validating="validating"
      :dirty="dirty"
      :touched="touched"
    />
  </form>
</template>

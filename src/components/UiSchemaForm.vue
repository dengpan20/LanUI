<script setup>
import { computed, nextTick, ref } from 'vue'
import UiAutoComplete from './UiAutoComplete.vue'
import UiCheckbox from './UiCheckbox.vue'
import UiDatePicker from './UiDatePicker.vue'
import UiDateRangePicker from './UiDateRangePicker.vue'
import UiForm from './UiForm.vue'
import UiFormItem from './UiFormItem.vue'
import UiInput from './UiInput.vue'
import UiNumberInput from './UiNumberInput.vue'
import UiSegmented from './UiSegmented.vue'
import UiSelect from './UiSelect.vue'
import UiSlider from './UiSlider.vue'
import UiSwitch from './UiSwitch.vue'
import UiTextarea from './UiTextarea.vue'
import UiTimePicker from './UiTimePicker.vue'
import { cloneValue, getPath, pathKey, setPath } from './formUtils.js'

const props = defineProps({
  model: { type: Object, required: true },
  schema: { type: Array, default: () => [] },
  rules: { type: Object, default: () => ({}) },
  components: { type: Object, default: () => ({}) },
  columns: { type: Number, default: 2 },
  gap: { type: [String, Number], default: 16 },
  disabled: Boolean,
  readonly: Boolean,
  initialValues: { type: Object, default: undefined },
  validateOnSubmit: { type: Boolean, default: true },
  validateOnRuleChange: Boolean,
  focusOnError: { type: Boolean, default: true },
  scrollToError: Boolean,
  scrollIntoViewOptions: { type: Object, default: () => ({ block: 'center', behavior: 'smooth' }) },
  showErrorSummary: Boolean,
  errorSummaryTitle: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'invalid', 'reset', 'validate', 'field-change', 'schema-error'])
const form = ref(null)
const reportedErrors = new Set()

const builtinComponents = Object.freeze({
  input: UiInput,
  textarea: UiTextarea,
  number: UiNumberInput,
  select: UiSelect,
  autocomplete: UiAutoComplete,
  checkbox: UiCheckbox,
  switch: UiSwitch,
  date: UiDatePicker,
  time: UiTimePicker,
  'date-range': UiDateRangePicker,
  slider: UiSlider,
  segmented: UiSegmented,
})
const nativeReadonlyComponents = new Set([UiInput, UiTextarea, UiNumberInput, UiAutoComplete, UiSlider])
const sectionTitleTags = new Set(['h2', 'h3', 'h4'])

function reportError(kind, definition, error) {
  const name = pathKey(definition?.name) || definition?.key || 'schema'
  const signature = `${kind}:${name}:${error?.message || error}`
  if (reportedErrors.has(signature)) return
  reportedErrors.add(signature)
  nextTick(() => emit('schema-error', { kind, name, error }))
}
function invoke(value, fallback, kind, definition, context) {
  if (typeof value !== 'function') return value === undefined ? fallback : value
  try { return value(props.model, context) }
  catch (error) { reportError(kind, definition, error); return fallback }
}
function fieldContext(field, section) {
  return {
    field,
    section,
    model: props.model,
    getFieldValue: name => getPath(props.model, name),
    getFieldsValue: () => cloneValue(props.model),
  }
}
function isVisible(definition, section) {
  return Boolean(invoke(definition?.visible, true, 'visible', definition, fieldContext(definition, section)))
}
function normalizeSchema(schema) {
  const result = []
  let loose = []
  const flush = () => {
    if (!loose.length) return
    result.push({ key: `schema-fields-${result.length}`, fields: loose })
    loose = []
  }
  schema.forEach((item, index) => {
    const children = item?.fields || item?.children
    if (Array.isArray(children)) {
      flush()
      result.push({ ...item, key: item.key || `schema-section-${index}`, fields: children })
    } else loose.push(item)
  })
  flush()
  return result
}
const sections = computed(() => normalizeSchema(props.schema).filter(section => isVisible(section, section)))
const allFields = computed(() => normalizeSchema(props.schema).flatMap(section => section.fields.filter(field => field?.name)))
const visibleFields = computed(() => sections.value.flatMap(section => section.fields.filter(field => field?.name && isVisible(field, section))))
const resolvedGap = computed(() => typeof props.gap === 'number' ? `${props.gap}px` : props.gap)

function fieldKey(field, index) { return field.key || pathKey(field.name) || `schema-field-${index}` }
function sectionHeadingId(section, index) { return `ui-schema-section-${index}-${String(section.key || 'fields').replace(/[^a-zA-Z0-9_-]+/g, '-')}` }
function sectionTitleTag(section) { return sectionTitleTags.has(section.titleTag) ? section.titleTag : 'h3' }
function sectionStyle(section) {
  const columns = Math.max(1, Math.trunc(Number(section.columns ?? props.columns) || 1))
  return { '--ui-schema-columns': columns, '--ui-schema-gap': resolvedGap.value }
}
function fieldStyle(field, section) {
  const columns = Math.max(1, Math.trunc(Number(section.columns ?? props.columns) || 1))
  const span = field.fullWidth ? columns : Math.max(1, Math.min(columns, Math.trunc(Number(field.span) || 1)))
  return { gridColumn: `span ${span}` }
}
function resolveComponent(field) {
  if (typeof field.component === 'object' || typeof field.component === 'function') return field.component
  const type = field.component || field.type || 'input'
  const resolved = props.components[type] || builtinComponents[type]
  if (!resolved) reportError('component', field, new Error(`Unknown schema component: ${type}`))
  return resolved || UiInput
}
function resolveFieldProps(field, section) {
  const context = fieldContext(field, section)
  const custom = invoke(field.props, {}, 'props', field, context) || {}
  const fieldDisabled = invoke(field.disabled, false, 'disabled', field, context)
  const fieldReadonly = invoke(field.readonly, false, 'readonly', field, context)
  const readonly = Boolean(custom.readonly || props.readonly || fieldReadonly)
  let disabled = Boolean(custom.disabled || props.disabled || fieldDisabled)
  const type = typeof field.component === 'string' ? field.component : field.type || 'input'
  const builtin = builtinComponents[type]
  const usesBuiltin = builtin && !props.components[type] && typeof field.component !== 'object' && typeof field.component !== 'function'
  if (readonly && usesBuiltin && !nativeReadonlyComponents.has(builtin)) disabled = true
  const resolved = { ...custom, disabled, readonly }
  if (field.options !== undefined && resolved.options === undefined) resolved.options = invoke(field.options, [], 'options', field, context)
  if (field.placeholder !== undefined && resolved.placeholder === undefined) resolved.placeholder = invoke(field.placeholder, '', 'placeholder', field, context)
  return resolved
}
function fieldValue(field) { return getPath(props.model, field.name) }
function updateField(field, section, value) {
  const context = fieldContext(field, section)
  let next = value
  if (typeof field.normalize === 'function') {
    try { next = field.normalize(value, props.model, context) }
    catch (error) { reportError('normalize', field, error); return }
  }
  const previous = cloneValue(getPath(props.model, field.name))
  setPath(props.model, field.name, next)
  emit('field-change', { name: pathKey(field.name), value: cloneValue(next), previous, field, model: cloneValue(props.model) })
}
function getFieldDefinition(name) { const key = pathKey(name); return allFields.value.find(field => pathKey(field.name) === key) || null }
function getVisibleFields() { return visibleFields.value.slice() }

const callForm = (method, ...args) => form.value?.[method]?.(...args)
const validate = (...args) => callForm('validate', ...args)
const validateField = (...args) => callForm('validateField', ...args)
const submit = (...args) => callForm('submit', ...args)
const reset = (...args) => callForm('reset', ...args)
const resetFields = (...args) => callForm('resetFields', ...args)
const clearValidate = (...args) => callForm('clearValidate', ...args)
const setFields = (...args) => callForm('setFields', ...args)
const setFieldError = (...args) => callForm('setFieldError', ...args)
const getFieldValue = (...args) => callForm('getFieldValue', ...args)
const getFieldsValue = (...args) => callForm('getFieldsValue', ...args)
const setFieldValue = (...args) => callForm('setFieldValue', ...args)
const getFieldState = (...args) => callForm('getFieldState', ...args)
const getFieldsState = (...args) => callForm('getFieldsState', ...args)
const getFieldError = (...args) => callForm('getFieldError', ...args)
const getFieldsError = (...args) => callForm('getFieldsError', ...args)
const focusField = (...args) => callForm('focusField', ...args)
const scrollToField = (...args) => callForm('scrollToField', ...args)
const onSubmit = (model, event) => emit('submit', model, event)
const onInvalid = (model, event, errors) => emit('invalid', model, event, errors)

defineExpose({
  validate, validateField, submit, reset, resetFields, clearValidate, setFields, setFieldError,
  getFieldValue, getFieldsValue, setFieldValue, getFieldState, getFieldsState, getFieldError,
  getFieldsError, focusField, scrollToField, getFieldDefinition, getVisibleFields,
})
</script>

<template>
  <UiForm
    ref="form"
    class="ui-schema-form"
    :model="model"
    :rules="rules"
    :initial-values="initialValues"
    :validate-on-submit="validateOnSubmit"
    :validate-on-rule-change="validateOnRuleChange"
    :focus-on-error="focusOnError"
    :scroll-to-error="scrollToError"
    :scroll-into-view-options="scrollIntoViewOptions"
    :show-error-summary="showErrorSummary"
    :error-summary-title="errorSummaryTitle"
    @submit="onSubmit"
    @invalid="onInvalid"
    @reset="emit('reset',$event)"
    @validate="emit('validate',$event)"
  >
    <template #default="formState">
      <template v-if="visibleFields.length">
        <section v-for="(section,sectionIndex) in sections" :key="section.key" class="ui-schema-form-section" :class="section.class" :aria-labelledby="(section.title || section.description || $slots[`section-${section.key}-header`])?sectionHeadingId(section,sectionIndex):undefined">
          <header v-if="section.title || section.description || $slots[`section-${section.key}-header`]" :id="sectionHeadingId(section,sectionIndex)" class="ui-schema-form-section-header">
            <slot :name="`section-${section.key}-header`" :section="section" :model="model" :heading-id="sectionHeadingId(section,sectionIndex)"><div><component :is="sectionTitleTag(section)" v-if="section.title">{{ section.title }}</component><p v-if="section.description">{{ section.description }}</p></div></slot>
          </header>
          <div class="ui-schema-form-grid" :style="sectionStyle(section)">
            <template v-for="(field,index) in section.fields" :key="fieldKey(field,index)">
              <UiFormItem
                v-if="field?.name && isVisible(field,section)"
                :name="field.name"
                :label="field.label"
                :help="field.help"
                :required="Boolean(invoke(field.required,false,'required',field,fieldContext(field,section)))"
                :rules="field.rules || []"
                :dependencies="field.dependencies || field.dependsOn || []"
                :validate-on-dependency-change="field.validateOnDependencyChange !== false"
                :reserve-message-space="field.reserveMessageSpace"
                :show-success="field.showSuccess"
                :group="field.group"
                :composite="field.composite"
                class="ui-schema-form-field"
                :class="field.class"
                :style="fieldStyle(field,section)"
              >
                <slot
                  v-if="$slots[`field-${fieldKey(field,index)}`]"
                  :name="`field-${fieldKey(field,index)}`"
                  :field="field"
                  :section="section"
                  :model="model"
                  :value="fieldValue(field)"
                  :update="value=>updateField(field,section,value)"
                />
                <component v-else :is="resolveComponent(field)" v-bind="resolveFieldProps(field,section)" :model-value="fieldValue(field)" @update:model-value="value=>updateField(field,section,value)" />
              </UiFormItem>
            </template>
          </div>
        </section>
      </template>
      <slot v-else name="empty" :model="model" />
      <slot :model="model" :sections="sections" :fields="visibleFields" v-bind="formState" />
      <div v-if="$slots.actions" class="ui-schema-form-actions"><slot name="actions" :model="model" v-bind="formState" /></div>
    </template>
  </UiForm>
</template>

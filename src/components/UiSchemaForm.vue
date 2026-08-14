<script setup>
import { computed, nextTick, ref } from 'vue'
import UiAutoComplete from './UiAutoComplete.vue'
import UiButton from './UiButton.vue'
import UiCheckbox from './UiCheckbox.vue'
import UiDatePicker from './UiDatePicker.vue'
import UiDateRangePicker from './UiDateRangePicker.vue'
import UiForm from './UiForm.vue'
import UiFormItem from './UiFormItem.vue'
import UiFormList from './UiFormList.vue'
import UiInput from './UiInput.vue'
import UiInputTag from './UiInputTag.vue'
import UiNumberInput from './UiNumberInput.vue'
import UiQueryBuilder from './UiQueryBuilder.vue'
import UiSegmented from './UiSegmented.vue'
import UiSelect from './UiSelect.vue'
import UiSlider from './UiSlider.vue'
import UiSwitch from './UiSwitch.vue'
import UiTextarea from './UiTextarea.vue'
import UiTimePicker from './UiTimePicker.vue'
import UiTimeRangePicker from './UiTimeRangePicker.vue'
import { useLocale } from '../config-runtime.js'
import { cloneValue, getPath, pathKey, setPath, toPath } from './formUtils.js'

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
const emit = defineEmits(['submit', 'invalid', 'reset', 'validate', 'field-change', 'list-change', 'list-limit', 'schema-error'])
const form = ref(null)
const listRefs = new Map()
const reportedErrors = new Set()
const { t } = useLocale()

const builtinComponents = Object.freeze({
  input: UiInput,
  'input-tag': UiInputTag,
  'query-builder': UiQueryBuilder,
  textarea: UiTextarea,
  number: UiNumberInput,
  select: UiSelect,
  autocomplete: UiAutoComplete,
  checkbox: UiCheckbox,
  switch: UiSwitch,
  date: UiDatePicker,
  datetime: UiDatePicker,
  time: UiTimePicker,
  'date-range': UiDateRangePicker,
  'datetime-range': UiDateRangePicker,
  'time-range': UiTimeRangePicker,
  slider: UiSlider,
  segmented: UiSegmented,
})
const nativeReadonlyComponents = new Set([UiInput, UiInputTag, UiQueryBuilder, UiTextarea, UiNumberInput, UiAutoComplete, UiSlider])
const builtinDefaultProps = Object.freeze({
  datetime: Object.freeze({ mode: 'datetime' }),
  'datetime-range': Object.freeze({ mode: 'datetime' }),
})
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
function fieldContext(field, section, extras = {}) {
  const itemPath = extras.itemPath || []
  return {
    field,
    section,
    model: props.model,
    list: extras.list,
    item: extras.item,
    index: extras.index,
    relativeName: extras.relativeName,
    getFieldValue: name => getPath(props.model, name),
    getFieldsValue: () => cloneValue(props.model),
    getItemFieldValue: name => itemPath.length ? getPath(props.model, [...itemPath, ...toPath(name)]) : undefined,
  }
}
function isVisible(definition, section, extras) {
  return Boolean(invoke(definition?.visible, true, 'visible', definition, fieldContext(definition, section, extras)))
}
function isListField(field) { return field?.type === 'list' || field?.component === 'form-list' }
function listChildren(field) { return Array.isArray(field?.fields) ? field.fields : Array.isArray(field?.children) ? field.children : [] }
function normalizeSchema(schema) {
  const result = []
  let loose = []
  const flush = () => {
    if (!loose.length) return
    result.push({ key: `schema-fields-${result.length}`, fields: loose })
    loose = []
  }
  schema.forEach((item, index) => {
    const children = !isListField(item) && (item?.fields || item?.children)
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
  const span = field.fullWidth || (isListField(field) && field.span == null) ? columns : Math.max(1, Math.min(columns, Math.trunc(Number(field.span) || 1)))
  return { gridColumn: `span ${span}` }
}
function resolveComponent(field) {
  if (typeof field.component === 'object' || typeof field.component === 'function') return field.component
  const type = field.component || field.type || 'input'
  const resolved = props.components[type] || builtinComponents[type]
  if (!resolved) reportError('component', field, new Error(`Unknown schema component: ${type}`))
  return resolved || UiInput
}
function resolveFieldProps(field, section, extras = {}) {
  const context = fieldContext(field, section, extras)
  const custom = invoke(field.props, {}, 'props', field, context) || {}
  const fieldDisabled = invoke(field.disabled, false, 'disabled', field, context)
  const fieldReadonly = invoke(field.readonly, false, 'readonly', field, context)
  const readonly = Boolean(custom.readonly || props.readonly || extras.readonly || fieldReadonly)
  let disabled = Boolean(custom.disabled || props.disabled || extras.disabled || fieldDisabled)
  const type = typeof field.component === 'string' ? field.component : field.type || 'input'
  const builtin = builtinComponents[type]
  const defaults = builtinDefaultProps[type] || {}
  const usesBuiltin = builtin && !props.components[type] && typeof field.component !== 'object' && typeof field.component !== 'function'
  if (readonly && usesBuiltin && !nativeReadonlyComponents.has(builtin)) disabled = true
  const resolved = { ...defaults, ...custom, disabled, readonly }
  if (field.options !== undefined && resolved.options === undefined) resolved.options = invoke(field.options, [], 'options', field, context)
  if (field.placeholder !== undefined && resolved.placeholder === undefined) resolved.placeholder = invoke(field.placeholder, '', 'placeholder', field, context)
  return resolved
}
function fieldValue(field) { return getPath(props.model, field.name) }
function updateField(field, section, value, extras = {}) {
  const context = fieldContext(field, section, extras)
  let next = value
  if (typeof field.normalize === 'function') {
    try { next = field.normalize(value, props.model, context) }
    catch (error) { reportError('normalize', field, error); return }
  }
  const previous = cloneValue(getPath(props.model, field.name))
  setPath(props.model, field.name, next)
  emit('field-change', { name: pathKey(field.name), value: cloneValue(next), previous, field, model: cloneValue(props.model) })
}

function bindListChild(list, item, child) {
  return { ...child, name: [...item.name, ...toPath(child.name)] }
}
function listChildExtras(list, section, item, child) {
  const state = listState(list, section)
  return { list, item: item.value, index: item.index, relativeName: child.name, itemPath: item.name, disabled: state.disabled, readonly: state.readonly }
}
function listChildVisible(list, section, item, child) {
  return isVisible(bindListChild(list, item, child), section, listChildExtras(list, section, item, child))
}
function listChildRequired(list, section, item, child) {
  const field = bindListChild(list, item, child)
  return Boolean(invoke(child.required, false, 'required', field, fieldContext(field, section, listChildExtras(list, section, item, child))))
}
function listChildProps(list, section, item, child) {
  const field = bindListChild(list, item, child)
  return resolveFieldProps(field, section, listChildExtras(list, section, item, child))
}
function listChildValue(list, item, child) { return fieldValue(bindListChild(list, item, child)) }
function listChildStyle(list, section, child) { return fieldStyle(child, { columns: listNumber(list, section, 'columns', section.columns ?? props.columns) }) }
function updateListChild(list, section, item, child, value) {
  const field = bindListChild(list, item, child)
  updateField(field, section, value, listChildExtras(list, section, item, child))
}
function listChildDependencies(item, child) {
  const dependencies = child.dependencies || child.dependsOn || []
  return dependencies.map(dependency => {
    const parts = toPath(dependency)
    return parts[0] === '$root' ? parts.slice(1) : [...item.name, ...parts]
  })
}
function listChildSlotName(list, child, index) { return `field-${fieldKey(list, 0)}-${fieldKey(child, index)}` }
function listState(field, section) {
  const context = fieldContext(field, section, { list: field })
  const readonly = Boolean(props.readonly || invoke(field.readonly, false, 'readonly', field, context))
  return { readonly, disabled: Boolean(props.disabled || readonly || invoke(field.disabled, false, 'disabled', field, context)) }
}
function listNumber(field, section, property, fallback) {
  const value = invoke(field[property], fallback, property, field, fieldContext(field, section, { list: field }))
  return Number.isFinite(Number(value)) ? Number(value) : fallback
}
function listDefaultValue(field, section) {
  const source = field.defaultValue ?? field.defaultItem ?? {}
  return ({ index, values }) => {
    if (typeof source !== 'function') return source
    try {
      return source({ index, values: cloneValue(values), model: props.model, field, section, getFieldValue: name => getPath(props.model, name), getFieldsValue: () => cloneValue(props.model) })
    } catch (error) { reportError('default-value', field, error); return {} }
  }
}
function listItemContext(field, section, item) {
  return fieldContext(field, section, { list: field, item: item.value, index: item.index, itemPath: item.name })
}
function listText(field, section, property, fallbackKey, item) {
  const fallback = t(fallbackKey, item ? { index: item.index + 1 } : {})
  return String(invoke(field[property], fallback, property, field, item ? listItemContext(field, section, item) : fieldContext(field, section, { list: field })) || fallback)
}
function listItemHeadingId(field, item) {
  return `ui-schema-list-${pathKey(field.name)}-${item.key}`.replace(/[^a-zA-Z0-9_-]+/g, '-')
}
function listItemStyle(field, section) {
  const columns = Math.max(1, Math.trunc(listNumber(field, section, 'columns', section.columns ?? props.columns) || 1))
  const gap = field.gap ?? section.gap ?? props.gap
  return { '--ui-schema-list-columns': columns, '--ui-schema-list-gap': typeof gap === 'number' ? `${gap}px` : gap }
}
function listActionVisible(field, action) { return field[action] !== false }
function listActionAllowed(field, section, action, item) {
  return Boolean(invoke(field[action], true, action, field, item ? listItemContext(field, section, item) : fieldContext(field, section, { list: field })))
}
function onListChange(field, section, change) {
  const payload = { name: pathKey(field.name), field, section, change, model: cloneValue(props.model) }
  emit('field-change', { name: payload.name, value: cloneValue(change.values), previous: cloneValue(change.previous), field, model: payload.model })
  emit('list-change', payload)
}
function onListLimit(field, section, limit) { emit('list-limit', { name: pathKey(field.name), field, section, limit }) }
function setListRef(name, instance) {
  const key = pathKey(name)
  if (!key) return
  if (instance) listRefs.set(key, instance)
  else listRefs.delete(key)
}
function callList(name, method, ...args) { return listRefs.get(pathKey(name))?.[method]?.(...args) ?? false }
const addListItem = (name, ...args) => callList(name, 'add', ...args)
const removeListItem = (name, ...args) => callList(name, 'remove', ...args)
const moveListItem = (name, ...args) => callList(name, 'move', ...args)
const replaceListItems = (name, ...args) => callList(name, 'replace', ...args)
function getListValue(name) { const value = callList(name, 'getValue'); return value === false ? null : value }
function getFieldDefinition(name) {
  const key = pathKey(name)
  const direct = allFields.value.find(field => pathKey(field.name) === key)
  if (direct) return direct
  const target = toPath(name)
  for (const list of allFields.value.filter(isListField)) {
    const base = toPath(list.name)
    if (target.length <= base.length + 1 || !base.every((part, index) => part === target[index]) || !/^\d+$/.test(target[base.length])) continue
    const index = Number(target[base.length]); const relative = target.slice(base.length + 1)
    const child = listChildren(list).find(item => pathKey(item.name) === pathKey(relative))
    if (child) return bindListChild(list, { name: [...base, index], index, value: getPath(props.model, [...base, index]) }, child)
  }
  return null
}
function getVisibleFields() {
  const result = []
  sections.value.forEach(section => section.fields.forEach(field => {
    if (!field?.name || !isVisible(field, section)) return
    result.push(field)
    if (!isListField(field)) return
    const values = getPath(props.model, field.name)
    if (!Array.isArray(values)) return
    values.forEach((value, index) => {
      const item = { name: [...toPath(field.name), index], index, value }
      listChildren(field).forEach(child => { if (child?.name && listChildVisible(field, section, item, child)) result.push(bindListChild(field, item, child)) })
    })
  }))
  return result
}

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
  addListItem, removeListItem, moveListItem, replaceListItems, getListValue,
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
                :group="isListField(field) || field.group"
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
                <UiFormList
                  v-else-if="isListField(field)"
                  :ref="instance=>setListRef(field.name,instance)"
                  :name="field.name"
                  :default-value="listDefaultValue(field,section)"
                  :min="listNumber(field,section,'min',0)"
                  :max="listNumber(field,section,'max',Infinity)"
                  :disabled="listState(field,section).disabled"
                  :validate-on-change="field.validateOnChange !== false"
                  :aria-label="field.ariaLabel || field.label || t('schemaForm.list.group')"
                  @change="change=>onListChange(field,section,change)"
                  @limit="limit=>onListLimit(field,section,limit)"
                >
                  <template #default="{fields,add,remove,move,replace,canAdd,canRemove}">
                    <div v-if="fields.length" class="ui-schema-form-list-items">
                      <article v-for="item in fields" :key="item.key" class="ui-schema-form-list-item" :aria-labelledby="listItemHeadingId(field,item)">
                        <header class="ui-schema-form-list-item-header">
                          <strong :id="listItemHeadingId(field,item)">{{ listText(field,section,'itemLabel','schemaForm.list.item',item) }}</strong>
                          <div class="ui-schema-form-list-item-actions">
                            <UiButton v-if="listActionVisible(field,'reorderable')" type="button" size="sm" variant="text" icon="arrowUp" :disabled="item.index===0 || !listActionAllowed(field,section,'reorderable',item)" @click="move(item.index,item.index-1)">{{ listText(field,section,'moveUpText','schemaForm.list.moveUp',item) }}</UiButton>
                            <UiButton v-if="listActionVisible(field,'reorderable')" type="button" size="sm" variant="text" icon="arrowDown" :disabled="item.index===fields.length-1 || !listActionAllowed(field,section,'reorderable',item)" @click="move(item.index,item.index+1)">{{ listText(field,section,'moveDownText','schemaForm.list.moveDown',item) }}</UiButton>
                            <UiButton v-if="listActionVisible(field,'removable')" type="button" size="sm" variant="text" icon="trash" :disabled="!canRemove || !listActionAllowed(field,section,'removable',item)" @click="remove(item.index)">{{ listText(field,section,'removeText','schemaForm.list.remove',item) }}</UiButton>
                          </div>
                        </header>
                        <slot
                          v-if="$slots[`list-${fieldKey(field,index)}-item`]"
                          :name="`list-${fieldKey(field,index)}-item`"
                          :field="field"
                          :section="section"
                          :model="model"
                          :item="item.value"
                          :item-field="item"
                          :index="item.index"
                          :add="add"
                          :remove="remove"
                          :move="move"
                          :replace="replace"
                        />
                        <div v-else class="ui-schema-form-list-grid" :style="listItemStyle(field,section)">
                          <template v-for="(child,childIndex) in listChildren(field)" :key="`${item.key}-${fieldKey(child,childIndex)}`">
                            <UiFormItem
                              v-if="child?.name && listChildVisible(field,section,item,child)"
                              :name="bindListChild(field,item,child).name"
                              :label="child.label"
                              :help="child.help"
                              :required="listChildRequired(field,section,item,child)"
                              :rules="child.rules || []"
                              :dependencies="listChildDependencies(item,child)"
                              :validate-on-dependency-change="child.validateOnDependencyChange !== false"
                              :reserve-message-space="child.reserveMessageSpace"
                              :show-success="child.showSuccess"
                              :group="child.group"
                              :composite="child.composite"
                              class="ui-schema-form-field ui-schema-form-list-child"
                              :class="child.class"
                              :style="listChildStyle(field,section,child)"
                            >
                              <slot
                                v-if="$slots[listChildSlotName(field,child,childIndex)]"
                                :name="listChildSlotName(field,child,childIndex)"
                                :field="bindListChild(field,item,child)"
                                :relative-field="child"
                                :list="field"
                                :section="section"
                                :model="model"
                                :item="item.value"
                                :index="item.index"
                                :value="listChildValue(field,item,child)"
                                :update="value=>updateListChild(field,section,item,child,value)"
                              />
                              <component v-else :is="resolveComponent(bindListChild(field,item,child))" v-bind="listChildProps(field,section,item,child)" :model-value="listChildValue(field,item,child)" @update:model-value="value=>updateListChild(field,section,item,child,value)" />
                            </UiFormItem>
                          </template>
                        </div>
                      </article>
                      <div v-if="listActionVisible(field,'addable')" class="ui-schema-form-list-footer"><UiButton type="button" size="sm" variant="secondary" icon="plus" :disabled="!canAdd || !listActionAllowed(field,section,'addable')" @click="add()">{{ listText(field,section,'addText','schemaForm.list.add') }}</UiButton></div>
                    </div>
                  </template>
                  <template #empty="{add,canAdd}">
                    <slot v-if="$slots[`list-${fieldKey(field,index)}-empty`]" :name="`list-${fieldKey(field,index)}-empty`" :field="field" :section="section" :model="model" :add="add" :can-add="canAdd" />
                    <div v-else class="ui-schema-form-list-empty">
                      <span>{{ listText(field,section,'emptyText','schemaForm.list.empty') }}</span>
                      <UiButton v-if="listActionVisible(field,'addable')" type="button" size="sm" variant="secondary" icon="plus" :disabled="!canAdd || !listActionAllowed(field,section,'addable')" @click="add()">{{ listText(field,section,'addText','schemaForm.list.add') }}</UiButton>
                    </div>
                  </template>
                </UiFormList>
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

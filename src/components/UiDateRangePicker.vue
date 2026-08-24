<script setup>
import { computed, inject, nextTick, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiCalendar from './UiCalendar.vue'
import UiPopover from './UiPopover.vue'
import { focusWithRetry } from './focusUtils.js'
import { useComponentSize, useLocale } from '../config-runtime.js'
import { compareDateValues, dateValueToDate, fromDateValue, inferDateValueType, toDateValue } from '../date.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: Array, default: undefined }, defaultValue: { type: Array, default: () => [] },
  open: { type: Boolean, default: undefined }, defaultOpen: Boolean,
  viewDate: { type: [String, Date, Number], default: undefined }, defaultViewDate: { type: [String, Date, Number], default: '' },
  mode: { type: String, default: 'date', validator: value => ['date', 'time', 'datetime'].includes(value) },
  valueType: { type: String, default: 'auto', validator: value => ['auto', 'string', 'date', 'timestamp'].includes(value) },
  timeZone: { type: String, default: 'local' }, disambiguation: { type: String, default: 'compatible', validator: value => ['compatible', 'earlier', 'later', 'reject'].includes(value) },
  precision: { type: String, default: 'minute', validator: value => ['minute', 'second', 'millisecond'].includes(value) },
  step: { type: [String, Number], default: undefined }, referenceDate: { type: [String, Date, Number], default: undefined },
  startPlaceholder: { type: String, default: '' }, endPlaceholder: { type: String, default: '' }, separator: { type: String, default: '' },
  min: { type: [String, Date, Number], default: '' }, max: { type: [String, Date, Number], default: '' }, disabledDate: Function,
  presets: { type: Array, default: () => [] }, size: { type: String, default: '' }, clearable: { type: Boolean, default: true },
  constrain: { type: Boolean, default: true }, allowEmpty: { type: Boolean, default: true }, editable: { type: Boolean, default: true },
  readonly: Boolean, disabled: Boolean, loading: Boolean, invalid: Boolean,
  panel: { type: Boolean, default: true }, placement: { type: String, default: 'bottom-start' }, panelWidth: { type: [String, Number], default: 520 },
  appendToBody: { type: Boolean, default: true }, teleportTo: { type: [String, Object], default: 'body' }, closeOnComplete: { type: Boolean, default: true },
  openOnClick: { type: Boolean, default: true }, openOnFocus: Boolean, openOnArrowDown: { type: Boolean, default: true },
  firstDayOfWeek: { type: [String, Number], default: 'auto' }, weekdayFormat: { type: String, default: 'short' }, fixedWeeks: { type: Boolean, default: true },
  showOutsideDays: { type: Boolean, default: true }, showWeekNumbers: Boolean, showToday: { type: Boolean, default: true }, showPanelClear: { type: Boolean, default: true },
  beforeChange: Function, beforeOpenChange: Function, ariaLabel: { type: String, default: '' },
})
const emit = defineEmits([
  'update:modelValue', 'change', 'input', 'clear', 'invalid', 'select',
  'update:open', 'open-change', 'open', 'close', 'update:viewDate', 'view-change', 'panel-change', 'preset-select',
  'focus', 'blur', 'keydown', 'guard-error',
])

const attrs = useAttrs()
const formItem = inject('uiFormItemContext', null)
const { t } = useLocale()
const resolvedSize = useComponentSize(toRef(props, 'size'))
const startInput = ref(null), endInput = ref(null), popover = ref(null), calendar = ref(null)
const focused = ref(false), active = ref(0), internalValue = ref(props.defaultValue), internalOpen = ref(props.defaultOpen), internalView = ref(props.defaultViewDate)
const calendarDraft = ref(null), changePending = ref(false), openPending = ref(false)
const generatedId = `ui-date-range-${useId()}`
const controlledValue = computed(() => props.modelValue !== undefined)
const controlledOpen = computed(() => props.open !== undefined)
const controlledView = computed(() => props.viewDate !== undefined)
const resolvedValue = computed(() => controlledValue.value ? (Array.isArray(props.modelValue) ? props.modelValue : []) : (Array.isArray(internalValue.value) ? internalValue.value : []))
const resolvedOpen = computed(() => supportsPanel.value && (controlledOpen.value ? props.open : internalOpen.value))
const resolvedView = computed(() => controlledView.value ? props.viewDate : internalView.value)
const supportsPanel = computed(() => props.panel && props.mode === 'date')
const blocked = computed(() => props.disabled || props.readonly || props.loading || changePending.value)
const resolvedValueType = computed(() => props.valueType === 'auto' ? inferDateValueType(resolvedValue.value) : props.valueType)
const valueOptions = computed(() => ({ mode: props.mode, valueType: resolvedValueType.value, timeZone: props.timeZone, disambiguation: props.disambiguation, precision: props.precision, step: props.step, referenceDate: props.referenceDate }))
const valueArray = computed(() => {
  const source = calendarDraft.value || resolvedValue.value
  return [source?.[0] ?? (resolvedValueType.value === 'string' ? '' : null), source?.[1] ?? (resolvedValueType.value === 'string' ? '' : null)]
})
const renderValues = computed(() => valueArray.value.map(value => toDateValue(value, valueOptions.value)))
const complete = computed(() => Boolean(renderValues.value[0] && renderValues.value[1] && !orderError.value))
const inputType = computed(() => ({ datetime: 'datetime-local', time: 'time' }[props.mode] || 'date'))
const nativeMin = computed(() => toDateValue(props.min, valueOptions.value) || undefined)
const nativeMax = computed(() => toDateValue(props.max, valueOptions.value) || undefined)
const orderError = computed(() => Boolean(renderValues.value[0] && renderValues.value[1] && compareDateValues(renderValues.value[1], renderValues.value[0], valueOptions.value) < 0))
const resolvedInvalid = computed(() => props.invalid || orderError.value || formItem?.invalid?.value || false)
const controlId = computed(() => attrs.id || formItem?.controlId?.value || `${generatedId}-group`)
const panelId = computed(() => `${controlId.value}-panel`)
const labelledby = computed(() => attrs['aria-labelledby'] || (attrs['aria-label'] || props.ariaLabel ? undefined : formItem?.labelId?.value))
const describedby = computed(() => attrs['aria-describedby'] || formItem?.describedby?.value || undefined)
const startText = computed(() => props.startPlaceholder || t(props.mode === 'time' ? 'date.startTime' : props.mode === 'datetime' ? 'date.startDatetime' : 'date.start'))
const endText = computed(() => props.endPlaceholder || t(props.mode === 'time' ? 'date.endTime' : props.mode === 'datetime' ? 'date.endDatetime' : 'date.end'))
const rangeLabel = computed(() => props.ariaLabel || t(props.mode === 'time' ? 'date.timeRangeLabel' : props.mode === 'datetime' ? 'date.datetimeRangeLabel' : 'date.rangeLabel'))
const normalizedPresets = computed(() => props.presets.map((preset, index) => typeof preset === 'object' && preset !== null ? { ...preset, key: preset.key ?? index } : { label: String(preset), value: preset, key: index }))

function eventSafe(event) { return event && typeof event === 'object' ? event : undefined }
function emptyValue() { return resolvedValueType.value === 'string' ? [] : [null, null] }
function endpointValue(value) { return value === '' || value === null || value === undefined ? (resolvedValueType.value === 'string' ? '' : null) : fromDateValue(value, valueOptions.value) }
function invalid(code, source, details = {}) { const payload = { code, reason: code, source, ...details }; emit('invalid', payload); return false }
function validateRange(value, source, raw = value) {
  const next = Array.isArray(value) ? [value[0] ?? null, value[1] ?? null] : [null, null]
  const rawNext = Array.isArray(raw) ? [raw[0] ?? '', raw[1] ?? ''] : ['', '']
  for (let index = 0; index < 2; index += 1) {
    if (rawNext[index] && !toDateValue(next[index], valueOptions.value)) return invalid('invalid-date-value', source, { value: next, index, raw: rawNext[index], message: t('date.invalidValue') })
    if (!next[index]) continue
    if (nativeMin.value && compareDateValues(next[index], props.min, valueOptions.value) < 0) return invalid('date-before-min', source, { value: next, index, min: props.min })
    if (nativeMax.value && compareDateValues(next[index], props.max, valueOptions.value) > 0) return invalid('date-after-max', source, { value: next, index, max: props.max })
    if (props.mode === 'date' && props.disabledDate) {
      const key = toDateValue(next[index], valueOptions.value)
      const date = dateValueToDate(key, { ...valueOptions.value, valueType: 'date' })
      try { if (props.disabledDate(date, { date: key, index, currentMonth: true })) return invalid('date-disabled', source, { value: next, index, date: key }) } catch (error) { emit('guard-error', error, { kind: 'disabled-date', source, value: next }); return invalid('disabled-date-error', source, { value: next, index, error }) }
    }
  }
  if (!props.allowEmpty && (!next[0] || !next[1])) return invalid('range-incomplete', source, { value: next })
  return true
}
function applyValue(value, meta) {
  const next = Array.isArray(value) ? value.slice(0, 2).map(item => item ?? (resolvedValueType.value === 'string' ? '' : null)) : emptyValue()
  if (!controlledValue.value) internalValue.value = next
  if (meta.complete !== false) calendarDraft.value = null
  emit('update:modelValue', next)
  const payload = { value: next, valid: meta.valid !== false, source: meta.source, previous: meta.previous, raw: meta.raw, complete: meta.complete !== false, ...meta }
  emit('change', payload)
  if (['calendar', 'preset', 'api'].includes(meta.source)) emit('select', next, payload)
  return payload
}
function runGuard(kind, guard, meta, apply) {
  const pending = kind === 'change' ? changePending : openPending
  if (pending.value) return invalid('pending', meta.source, { kind })
  if (!guard) return apply()
  let outcome
  try { outcome = guard(meta) } catch (error) { emit('guard-error', error, { kind, ...meta }); return invalid('guard-error', meta.source, { kind, error }) }
  if (!outcome || typeof outcome.then !== 'function') return outcome === false ? invalid('guard-rejected', meta.source, { kind }) : apply()
  pending.value = true
  return Promise.resolve(outcome).then(allowed => allowed === false ? invalid('guard-rejected', meta.source, { kind }) : apply()).catch(error => { emit('guard-error', error, { kind, ...meta }); return invalid('guard-error', meta.source, { kind, error }) }).finally(() => { pending.value = false })
}
function commit(value, source = 'api', event, details = {}) {
  if (changePending.value) return invalid('pending', source, { kind: 'change' })
  if (props.disabled || props.readonly || props.loading) return invalid('blocked', source, { kind: 'change' })
  const next = Array.isArray(value) ? value.slice(0, 2).map(endpointValue) : emptyValue()
  const raw = details.raw ?? next.map(item => toDateValue(item, valueOptions.value))
  const orderInvalid = Boolean(next[0] && next[1] && compareDateValues(next[1], next[0], valueOptions.value) < 0)
  if (orderInvalid) {
    invalid('range-order', source, { value: next, message: t('date.invalidOrder') })
    if (props.constrain && source !== 'input') return false
  }
  if (!validateRange(next, source, raw)) return false
  const meta = { source, value: next, previous: resolvedValue.value, raw, event: eventSafe(event), complete: Boolean(next[0] && next[1]), valid: !orderInvalid, ...details }
  return runGuard('change', props.beforeChange, meta, () => applyValue(next, meta))
}
function update(index, event) {
  const raw = event.target.value
  const next = [...renderValues.value]
  next[index] = raw
  emit('input', raw, { index, source: 'input', raw, event: eventSafe(event) })
  const result = commit(next, 'input', event, { index, raw: next })
  if (result && typeof result.then === 'function') result.catch(() => {})
}
function clear(source = 'clear', event) {
  if (!props.clearable || blocked.value) return false
  const result = commit(emptyValue(), source, event, { raw: ['', ''], cleared: true, complete: true })
  const announce = meta => { if (meta) emit('clear', meta) }
  if (result && typeof result.then === 'function') return result.then(meta => { announce(meta); return meta })
  announce(result); return result
}
function applyOpen(value, meta) {
  if (!controlledOpen.value) internalOpen.value = value
  emit('update:open', value); emit('open-change', value, meta); emit(value ? 'open' : 'close', meta)
  if (value && meta.source === 'keyboard') focusCalendar()
  return meta
}
function requestOpen(value, source = 'api', event, details = {}) {
  if (!supportsPanel.value) { if (value) return openNative(); return false }
  if (value && (props.disabled || props.loading)) return invalid('blocked', source, { kind: 'open' })
  if (value === resolvedOpen.value) return false
  const meta = { open: value, previous: resolvedOpen.value, source, event: eventSafe(event), ...details }
  return runGuard('open', props.beforeOpenChange, meta, () => applyOpen(value, meta))
}
function onPopoverRequest(value, meta) { return requestOpen(value, meta?.source || 'popover', meta?.event, meta) }
function openNative() { if (props.disabled || props.loading) return false; const input = active.value === 1 ? endInput.value : startInput.value; try { input?.showPicker(); return true } catch { input?.focus(); return false } }
function show(source = 'api', event) { return supportsPanel.value ? requestOpen(true, source, event) : openNative() }
function hide(source = 'api', event) { return requestOpen(false, source, event) }
function toggle(source = 'api', event) { return resolvedOpen.value ? hide(source, event) : show(source, event) }
function onPointerDown(event) { if (supportsPanel.value) { event.preventDefault(); (active.value === 1 ? endInput.value : startInput.value)?.focus({ preventScroll: true }) } }
function onInputClick(index, event) { active.value = index; if (props.openOnClick && supportsPanel.value) show('pointer', event); else if (!supportsPanel.value) openNative() }
function onFocus(index, event) { focused.value = true; active.value = index; emit('focus', { index, event: eventSafe(event), open: resolvedOpen.value }) ; if (props.openOnFocus && supportsPanel.value) show('focus', event) }
function onBlur(index, event) { emit('blur', { index, event: eventSafe(event), open: resolvedOpen.value }) }
function onKeydown(index, event) { emit('keydown', event, { index, open: resolvedOpen.value, value: resolvedValue.value }); if (event.key === 'ArrowDown' && props.openOnArrowDown && supportsPanel.value) { event.preventDefault(); show('keyboard', event) } else if (event.key === 'Escape' && resolvedOpen.value) { event.preventDefault(); hide('escape', event) } }
async function onCalendarChange(value, calendarMeta) {
  const next = Array.isArray(value) ? value : [value]
  const isComplete = Boolean(next[0] && next[1])
  calendarDraft.value = next
  const result = await commit(next, 'calendar', undefined, { calendar: calendarMeta, raw: next, complete: isComplete })
  if (result && isComplete && props.closeOnComplete) await requestOpen(false, 'selection')
  return result
}
function onCalendarView(value) { if (!controlledView.value) internalView.value = value; emit('update:viewDate', value) }
function onCalendarViewChange(meta) { emit('view-change', meta) }
function setViewDate(value, source = 'api', details = {}) { const previous = resolvedView.value; if (!controlledView.value) internalView.value = value; emit('update:viewDate', value); emit('view-change', { value, previous, source, ...details }); return value }
async function choosePreset(preset, event) {
  if (preset.disabled || blocked.value) return invalid(preset.disabled ? 'preset-disabled' : 'blocked', 'preset', { preset })
  const value = typeof preset.value === 'function' ? await preset.value({ value: resolvedValue.value, now: new Date() }) : preset.value
  const result = await commit(value, 'preset', event, { preset, raw: value, complete: Array.isArray(value) && value.length > 1 })
  if (result) { emit('preset-select', preset, result); if (props.closeOnComplete) requestOpen(false, 'selection') }
  return result
}
async function focusCalendar() { await nextTick(); return focusWithRetry(() => { const panel = popover.value?.panel?.value ?? popover.value?.panel; return panel?.querySelector('.ui-calendar-day[tabindex="0"]') || panel?.querySelector('.ui-calendar-day:not([aria-disabled="true"])') }) }
function focus(options) { const target = active.value === 1 ? endInput.value : startInput.value; target?.focus(options); return typeof document !== 'undefined' && document.activeElement === target }
function blur() { startInput.value?.blur(); endInput.value?.blur(); focused.value = false; return true }
function select(value, source = 'api') { return commit(value, source) }
function getState() { return { value: resolvedValue.value, displayValue: valueArray.value, open: resolvedOpen.value, viewDate: resolvedView.value, pending: { change: changePending.value, open: openPending.value }, active: active.value, complete: complete.value, valid: !resolvedInvalid.value } }
watch(() => props.defaultValue, value => { if (!controlledValue.value && !resolvedValue.value.some(Boolean) && value) internalValue.value = value })
watch(() => props.modelValue, value => { if (controlledValue.value && value) calendarDraft.value = null })
watch(() => props.disabled, value => { if (value && resolvedOpen.value) requestOpen(false, 'disabled') })

defineExpose({ startInput, endInput, calendar, popover, value: resolvedValue, open: resolvedOpen, pending: { change: changePending, open: openPending }, getState, focus, blur, show, hide, toggle, clear, select, setViewDate, focusCalendar, openNative })
</script>

<template>
  <span class="ui-date-range-picker" :class="[attrs.class, `size-${resolvedSize}`, { focused, open: resolvedOpen, invalid: resolvedInvalid, disabled, readonly, loading: loading || changePending || openPending, 'has-value': renderValues[0] || renderValues[1], 'has-panel': supportsPanel }]" :style="attrs.style" role="group" :aria-labelledby="labelledby" :aria-label="labelledby ? undefined : rangeLabel" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :data-time-zone="timeZone" :data-value-type="resolvedValueType" :data-state="resolvedOpen ? 'open' : 'closed'">
    <UiPopover ref="popover" :model-value="resolvedOpen" trigger="manual" :disabled="disabled" :loading="loading || changePending || openPending" :placement="placement" :width="panelWidth" :min-width="360" :arrow="false" :append-to-body="appendToBody" :teleport-to="teleportTo" :popover-id="panelId" role="dialog" :aria-label="t('date.calendarPanel')" @open-change="onPopoverRequest">
      <template #trigger>
        <slot name="prefix" :open="resolvedOpen" :value="valueArray"><AppIcon :name="mode === 'time' ? 'clock' : 'calendar'" :size="15" class="ui-date-icon" /></slot>
        <input :id="controlId + '-start'" ref="startInput" class="ui-date-range-native" data-ui-popover-trigger="false" :type="inputType" :value="renderValues[0]" :placeholder="startText" :readonly="readonly || (!editable && supportsPanel)" :disabled="disabled" :min="nativeMin" :max="constrain ? (renderValues[1] || nativeMax) : nativeMax" :step="step" :aria-label="startText" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :aria-busy="loading || changePending || openPending || undefined" @input="update(0, $event)" @pointerdown="onPointerDown" @click="onInputClick(0, $event)" @focus="onFocus(0, $event)" @blur="onBlur(0, $event)" @keydown="onKeydown(0, $event)" />
        <slot name="startInput" :value="valueArray[0]" :index="0" :open="resolvedOpen" />
        <slot name="separator" :value="valueArray"><span class="ui-date-range-separator" aria-hidden="true">{{ props.separator || t('date.separator') }}</span></slot>
        <input :id="controlId + '-end'" ref="endInput" class="ui-date-range-native" data-ui-popover-trigger="false" :type="inputType" :value="renderValues[1]" :placeholder="endText" :readonly="readonly || (!editable && supportsPanel)" :disabled="disabled" :min="constrain ? (renderValues[0] || nativeMin) : nativeMin" :max="nativeMax" :step="step" :aria-label="endText" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :aria-busy="loading || changePending || openPending || undefined" @input="update(1, $event)" @pointerdown="onPointerDown" @click="onInputClick(1, $event)" @focus="onFocus(1, $event)" @blur="onBlur(1, $event)" @keydown="onKeydown(1, $event)" />
        <slot name="endInput" :value="valueArray[1]" :index="1" :open="resolvedOpen" />
        <slot name="suffix" :open="resolvedOpen" :value="valueArray" />
        <slot v-if="clearable && (renderValues[0] || renderValues[1]) && !disabled && !readonly" name="clear" :clear="clear" :pending="changePending"><button type="button" class="ui-date-action" style="inset-inline-end:34px" :aria-label="t('date.clear')" :disabled="loading || changePending" @mousedown.prevent @click.stop="clear('clear', $event)"><AppIcon name="close" :size="12" /></button></slot>
        <slot name="toggle" :open="resolvedOpen" :toggle="toggle" :pending="openPending"><button type="button" class="ui-date-action calendar-action" :data-ui-popover-trigger="supportsPanel ? 'true' : 'false'" :aria-label="t(resolvedOpen ? 'date.close' : 'date.open')" :aria-controls="supportsPanel ? panelId : undefined" :aria-expanded="supportsPanel ? resolvedOpen : undefined" :aria-haspopup="supportsPanel ? 'dialog' : undefined" :disabled="disabled || loading || openPending" @mousedown.prevent @click.stop="toggle('button', $event)"><AppIcon name="chevronDown" :size="12" /></button></slot>
        <span v-if="loading || changePending || openPending" class="ui-date-loading" aria-hidden="true"><AppIcon name="loading" :size="12" /></span>
      </template>
      <div class="ui-date-range-panel-content" :class="{ 'has-presets': normalizedPresets.length }" :data-mode="mode">
        <aside v-if="normalizedPresets.length" class="ui-date-range-presets" :aria-label="t('date.presets')">
          <button v-for="preset in normalizedPresets" :key="preset.key" type="button" :disabled="preset.disabled || blocked" @click="choosePreset(preset, $event)"><slot name="preset" :preset="preset" :select="event => choosePreset(preset, event)">{{ preset.label }}</slot></button>
        </aside>
        <slot name="panel" :value="valueArray" :view-date="resolvedView" :select="select" :close="hide" :set-view-date="setViewDate">
          <slot name="calendar" :value="valueArray" :view-date="resolvedView" :calendar="calendar" :select="select" :close="hide">
          <UiCalendar ref="calendar" :model-value="valueArray" selection-mode="range" :value-type="resolvedValueType" :time-zone="timeZone" :disambiguation="disambiguation" :view-date="resolvedView" :default-view-date="defaultViewDate" :min="min" :max="max" :first-day-of-week="firstDayOfWeek" :weekday-format="weekdayFormat" :fixed-weeks="fixedWeeks" :show-outside-days="showOutsideDays" :show-week-numbers="showWeekNumbers" :disabled-date="disabledDate" :size="resolvedSize" :bordered="false" :readonly="readonly" :disabled="disabled || loading || changePending" :allow-clear="showPanelClear && clearable" :aria-label="t('date.calendarPanel')" @change="onCalendarChange" @update:view-date="onCalendarView" @view-change="onCalendarViewChange" @panel-change="emit('panel-change', $event)" @focus="emit('focus', { source: 'calendar', event: $event })" @blur="emit('blur', { source: 'calendar', event: $event })">
            <template v-if="$slots.header" #header="scope"><slot name="header" v-bind="scope" /></template>
            <template v-if="$slots.cell" #cell="scope"><slot name="cell" v-bind="scope" /></template>
            <template v-if="$slots.year" #year="scope"><slot name="year" v-bind="scope" /></template>
            <template #footer="scope"><slot name="footer" v-bind="scope" :close="hide"><button v-if="showToday" type="button" class="ui-calendar-today" @click="scope.today">{{ t('calendar.today') }}</button><button v-if="showPanelClear && clearable && (renderValues[0] || renderValues[1])" type="button" class="ui-calendar-clear" :disabled="blocked" @click="clear('panel')">{{ t('calendar.clear') }}</button></slot></template>
          </UiCalendar>
          </slot>
        </slot>
      </div>
    </UiPopover>
    <span v-if="orderError" class="sr-only" role="alert">{{ t('date.invalidOrder') }}</span>
  </span>
</template>

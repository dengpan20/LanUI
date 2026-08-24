<script setup>
import { computed, ref } from 'vue'
import UiDateRangePicker from './UiDateRangePicker.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: Array, default: undefined }, defaultValue: { type: Array, default: () => [] },
  open: { type: Boolean, default: undefined }, defaultOpen: Boolean,
  viewDate: { type: [String, Date, Number], default: undefined }, defaultViewDate: { type: [String, Date, Number], default: '' },
  valueType: { type: String, default: 'auto' }, timeZone: { type: String, default: 'local' }, disambiguation: { type: String, default: 'compatible' }, precision: { type: String, default: 'minute' }, step: { type: [String, Number], default: undefined }, referenceDate: { type: [String, Date, Number], default: undefined },
  startPlaceholder: { type: String, default: '' }, endPlaceholder: { type: String, default: '' }, separator: { type: String, default: '' }, min: { type: [String, Date, Number], default: '' }, max: { type: [String, Date, Number], default: '' }, disabledDate: Function,
  presets: { type: Array, default: () => [] }, size: { type: String, default: '' }, clearable: { type: Boolean, default: true }, constrain: { type: Boolean, default: true }, allowEmpty: { type: Boolean, default: true }, editable: { type: Boolean, default: true }, readonly: Boolean, disabled: Boolean, loading: Boolean, invalid: Boolean,
  panel: { type: Boolean, default: true }, placement: { type: String, default: 'bottom-start' }, panelWidth: { type: [String, Number], default: 520 }, appendToBody: { type: Boolean, default: true }, teleportTo: { type: [String, Object], default: 'body' }, closeOnComplete: { type: Boolean, default: true }, openOnClick: { type: Boolean, default: true }, openOnFocus: Boolean, openOnArrowDown: { type: Boolean, default: true }, firstDayOfWeek: { type: [String, Number], default: 'auto' }, weekdayFormat: { type: String, default: 'short' }, fixedWeeks: { type: Boolean, default: true }, showOutsideDays: { type: Boolean, default: true }, showWeekNumbers: Boolean, showToday: { type: Boolean, default: true }, showPanelClear: { type: Boolean, default: true }, beforeChange: Function, beforeOpenChange: Function, ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change', 'input', 'clear', 'invalid', 'select', 'update:open', 'open-change', 'open', 'close', 'update:viewDate', 'view-change', 'panel-change', 'preset-select', 'focus', 'blur', 'keydown', 'guard-error'])
const picker = ref(null)
const forward = name => (...args) => emit(name, ...args)
const onUpdateModelValue = forward('update:modelValue'), onInput = forward('input'), onClear = forward('clear'), onInvalid = forward('invalid'), onSelect = forward('select'), onUpdateOpen = forward('update:open'), onOpenChange = forward('open-change'), onOpen = forward('open'), onClose = forward('close'), onUpdateViewDate = forward('update:viewDate'), onViewChange = forward('view-change'), onPanelChange = forward('panel-change'), onPresetSelect = forward('preset-select'), onFocus = forward('focus'), onBlur = forward('blur'), onKeydown = forward('keydown'), onGuardError = forward('guard-error')
const onChange = payload => emit('change', { value: payload?.value || [], valid: payload?.valid !== false })
const call = name => (...args) => picker.value?.[name]?.(...args)
const value = computed(() => picker.value?.value)
const open = computed(() => picker.value?.open)
const pending = computed(() => picker.value?.pending)
const getState = call('getState'), focus = call('focus'), blur = call('blur'), show = call('show'), hide = call('hide'), toggle = call('toggle'), clear = call('clear'), select = call('select'), setViewDate = call('setViewDate'), focusCalendar = call('focusCalendar'), openNative = call('openNative')
defineExpose({ picker, value, open, pending, getState, focus, blur, show, hide, toggle, clear, select, setViewDate, focusCalendar, openNative })
</script>

<template>
  <UiDateRangePicker ref="picker" v-bind="{ ...$attrs, ...props }" class="ui-time-range-picker" mode="time"
    @update:model-value="onUpdateModelValue" @change="onChange" @input="onInput"
    @clear="onClear" @invalid="onInvalid" @select="onSelect"
    @update:open="onUpdateOpen" @open-change="onOpenChange" @open="onOpen" @close="onClose"
    @update:view-date="onUpdateViewDate" @view-change="onViewChange" @panel-change="onPanelChange" @preset-select="onPresetSelect"
    @focus="onFocus" @blur="onBlur" @keydown="onKeydown" @guard-error="onGuardError">
    <template #prefix="scope"><slot name="prefix" v-bind="scope" /></template>
    <template #startInput="scope"><slot name="startInput" v-bind="scope" /></template>
    <template #separator="scope"><slot name="separator" v-bind="scope" /></template>
    <template #endInput="scope"><slot name="endInput" v-bind="scope" /></template>
    <template #suffix="scope"><slot name="suffix" v-bind="scope" /></template>
    <template #clear="scope"><slot name="clear" v-bind="scope" /></template>
    <template #toggle="scope"><slot name="toggle" v-bind="scope" /></template>
    <template #preset="scope"><slot name="preset" v-bind="scope" /></template>
    <template #panel="scope"><slot name="panel" v-bind="scope" /></template>
    <template #calendar="scope"><slot name="calendar" v-bind="scope" /></template>
    <template #header="scope"><slot name="header" v-bind="scope" /></template>
    <template #cell="scope"><slot name="cell" v-bind="scope" /></template>
    <template #year="scope"><slot name="year" v-bind="scope" /></template>
    <template #footer="scope"><slot name="footer" v-bind="scope" /></template>
  </UiDateRangePicker>
</template>

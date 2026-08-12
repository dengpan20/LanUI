<script setup>
import { computed, inject, ref, toRef, useAttrs } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config.js'
import { fromDateValue, inferDateValueType, toDateValue } from '../date.js'
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Date, Number], default: '' },
  mode: { type: String, default: 'date' },
  valueType: { type: String, default: 'auto' },
  timeZone: { type: String, default: 'local' },
  disambiguation: { type: String, default: 'compatible' },
  precision: { type: String, default: 'minute' },
  step: { type: [String, Number], default: undefined },
  referenceDate: { type: [String, Date, Number], default: undefined },
  icon: { type: String, default: 'calendar' },
  placeholder: { type: String, default: '' },
  min: { type: [String, Date, Number], default: '' },
  max: { type: [String, Date, Number], default: '' },
  size: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
  invalid: Boolean,
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue', 'change', 'clear', 'invalid', 'focus', 'blur'])
const attrs = useAttrs()
const formItem = inject('uiFormItemContext', null)
const inputRef = ref(null)
const focused = ref(false)
const inputType = computed(() => ({ datetime: 'datetime-local', time: 'time' }[props.mode] || 'date'))
const controlId = computed(() => attrs.id || formItem?.controlId?.value)
const labelledby = computed(() => attrs['aria-labelledby'] || (attrs['aria-label'] ? undefined : formItem?.labelId?.value))
const describedby = computed(() => attrs['aria-describedby'] || formItem?.describedby?.value || undefined)
const resolvedInvalid = computed(() => props.invalid || formItem?.invalid?.value || false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t(props.mode==='time'?'date.timePlaceholder':props.mode==='datetime'?'date.datetimePlaceholder':'date.placeholder'))
const inputAttrs=computed(()=>{const {class:className,style,...rest}=attrs;void className;void style;return rest})
const resolvedValueType=computed(()=>props.valueType==='auto'?inferDateValueType(props.modelValue):props.valueType)
const valueOptions=computed(()=>({mode:props.mode,valueType:resolvedValueType.value,timeZone:props.timeZone,disambiguation:props.disambiguation,precision:props.precision,step:props.step,referenceDate:props.referenceDate}))
const nativeValue=computed(()=>toDateValue(props.modelValue,valueOptions.value))
const nativeMin=computed(()=>toDateValue(props.min,valueOptions.value)||undefined)
const nativeMax=computed(()=>toDateValue(props.max,valueOptions.value)||undefined)

function update(event) {
  const raw=event.target.value
  const value=fromDateValue(raw,valueOptions.value)
  if(raw&&value===null){emit('invalid',{code:'invalid-date-value',value:raw});return}
  emit('update:modelValue',value);emit('change',value)
}
function clear() { const value=resolvedValueType.value==='string'?'':null;emit('update:modelValue',value);emit('change',value);emit('clear') }
function openPicker() {
  if (props.disabled) return
  try { inputRef.value?.showPicker() } catch { inputRef.value?.focus() }
}
</script>

<template>
  <span class="ui-date-picker" :class="[attrs.class,`size-${resolvedSize}`,{focused,invalid:resolvedInvalid,disabled,'has-value':nativeValue}]" :style="attrs.style" :data-time-zone="timeZone" :data-value-type="resolvedValueType">
    <AppIcon :name="icon" :size="15" class="ui-date-icon"/>
    <input v-bind="inputAttrs" :id="controlId" ref="inputRef" class="ui-date-native" :type="inputType" :value="nativeValue" :placeholder="resolvedPlaceholder" :min="nativeMin" :max="nativeMax" :step="step" :disabled="disabled" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" @input="update" @focus="focused=true;emit('focus',$event)" @blur="focused=false;emit('blur',$event)"/>
    <button v-if="clearable && nativeValue && !disabled" type="button" class="ui-date-action" :aria-label="t('date.clear')" :aria-controls="controlId" @mousedown.prevent @click="clear"><AppIcon name="close" :size="12"/></button>
    <button v-else type="button" class="ui-date-action calendar-action" :aria-label="t('date.open')" :aria-controls="controlId" :disabled="disabled" @mousedown.prevent @click="openPicker"><AppIcon name="chevronDown" :size="12"/></button>
  </span>
</template>

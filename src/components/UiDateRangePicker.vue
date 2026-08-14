<script setup>
import { computed, inject, ref, toRef, useAttrs, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'
import { compareDateValues, fromDateValue, inferDateValueType, toDateValue } from '../date.js'
defineOptions({inheritAttrs:false})
const props=defineProps({modelValue:{type:Array,default:()=>[]},mode:{type:String,default:'date'},valueType:{type:String,default:'auto'},timeZone:{type:String,default:'local'},disambiguation:{type:String,default:'compatible'},precision:{type:String,default:'minute'},step:{type:[String,Number],default:undefined},referenceDate:{type:[String,Date,Number],default:undefined},startPlaceholder:{type:String,default:''},endPlaceholder:{type:String,default:''},separator:{type:String,default:''},min:{type:[String,Date,Number],default:''},max:{type:[String,Date,Number],default:''},size:{type:String,default:''},clearable:{type:Boolean,default:true},constrain:{type:Boolean,default:true},invalid:Boolean,disabled:Boolean})
const emit=defineEmits(['update:modelValue','change','clear','invalid','focus','blur'])
const attrs=useAttrs();const formItem=inject('uiFormItemContext',null);const uid=useId();const {t}=useLocale();const resolvedSize=useComponentSize(toRef(props,'size'))
const startInput=ref(null);const endInput=ref(null);const focused=ref(false);const active=ref(0)
const resolvedValueType=computed(()=>props.valueType==='auto'?inferDateValueType(props.modelValue):props.valueType)
const valueOptions=computed(()=>({mode:props.mode,valueType:resolvedValueType.value,timeZone:props.timeZone,disambiguation:props.disambiguation,precision:props.precision,step:props.step,referenceDate:props.referenceDate}))
const values=computed(()=>[toDateValue(props.modelValue?.[0],valueOptions.value),toDateValue(props.modelValue?.[1],valueOptions.value)])
const inputType=computed(()=>({datetime:'datetime-local',time:'time'}[props.mode]||'date'))
const nativeMin=computed(()=>toDateValue(props.min,valueOptions.value)||undefined);const nativeMax=computed(()=>toDateValue(props.max,valueOptions.value)||undefined)
const orderError=computed(()=>!!values.value[0]&&!!values.value[1]&&compareDateValues(values.value[1],values.value[0],valueOptions.value)<0)
const resolvedInvalid=computed(()=>props.invalid||orderError.value||formItem?.invalid?.value||false)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-date-range-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const startText=computed(()=>props.startPlaceholder||t(props.mode==='time'?'date.startTime':props.mode==='datetime'?'date.startDatetime':'date.start'))
const endText=computed(()=>props.endPlaceholder||t(props.mode==='time'?'date.endTime':props.mode==='datetime'?'date.endDatetime':'date.end'))
const rangeLabel=computed(()=>t(props.mode==='time'?'date.timeRangeLabel':props.mode==='datetime'?'date.datetimeRangeLabel':'date.rangeLabel'))
function update(index,event){const next=[...values.value];next[index]=event.target.value;const converted=next.map(value=>value?fromDateValue(value,valueOptions.value):resolvedValueType.value==='string'?'':null);if(next[index]&&converted[index]===null){emit('invalid',{code:'invalid-date-value',message:t('date.invalidValue'),value:converted});return}const valid=!(next[0]&&next[1]&&compareDateValues(next[1],next[0],valueOptions.value)<0);emit('update:modelValue',converted);emit('change',{value:converted,valid});if(!valid)emit('invalid',{code:'range-order',message:t('date.invalidOrder'),value:converted})}
function clear(){const empty=resolvedValueType.value==='string'?[]:[null,null];emit('update:modelValue',empty);emit('change',{value:empty,valid:true});emit('clear')}
function openPicker(){if(props.disabled)return;const target=(active.value===1?endInput:startInput).value;try{target?.showPicker()}catch{target?.focus()}}
function onFocus(index,event){focused.value=true;active.value=index;emit('focus',{index,event})}
function onBlur(index,event){const root=event.currentTarget?.parentElement;requestAnimationFrame(()=>{if(!root?.contains(document.activeElement))focused.value=false});emit('blur',{index,event})}
</script>
<template><span class="ui-date-range-picker" :class="[attrs.class,`size-${resolvedSize}`,{focused,invalid:resolvedInvalid,disabled,'has-value':values[0]||values[1]}]" :style="attrs.style" role="group" :aria-labelledby="labelledby" :aria-label="labelledby?undefined:(attrs['aria-label']||rangeLabel)" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :data-time-zone="timeZone" :data-value-type="resolvedValueType">
  <AppIcon :name="mode==='time'?'clock':'calendar'" :size="15" class="ui-date-icon"/>
  <input :id="controlId" ref="startInput" class="ui-date-range-native" :type="inputType" :value="values[0]" :placeholder="startText" :aria-label="startText" :min="nativeMin" :max="constrain?(values[1]||nativeMax):nativeMax" :step="step" :disabled="disabled" @input="update(0,$event)" @focus="onFocus(0,$event)" @blur="onBlur(0,$event)"/>
  <span class="ui-date-range-separator" aria-hidden="true">{{ separator||t('date.separator') }}</span>
  <input ref="endInput" class="ui-date-range-native" :type="inputType" :value="values[1]" :placeholder="endText" :aria-label="endText" :min="constrain?(values[0]||nativeMin):nativeMin" :max="nativeMax" :step="step" :disabled="disabled" @input="update(1,$event)" @focus="onFocus(1,$event)" @blur="onBlur(1,$event)"/>
  <button v-if="clearable&&(values[0]||values[1])&&!disabled" type="button" class="ui-date-action" :aria-label="t('date.clear')" :aria-controls="controlId" @mousedown.prevent @click="clear"><AppIcon name="close" :size="12"/></button>
  <button v-else type="button" class="ui-date-action calendar-action" :aria-label="t('date.open')" :aria-controls="controlId" :disabled="disabled" @mousedown.prevent @click="openPicker"><AppIcon name="chevronDown" :size="12"/></button>
  <span v-if="orderError" class="sr-only" role="alert">{{ t('date.invalidOrder') }}</span>
</span></template>

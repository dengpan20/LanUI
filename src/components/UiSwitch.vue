<script setup>
import { computed, inject, toRef, useAttrs } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config.js'
defineOptions({ inheritAttrs: false })
const props=defineProps({modelValue:Boolean,disabled:Boolean,loading:Boolean,size:{type:String,default:''},checkedText:{type:String,default:''},uncheckedText:{type:String,default:''},ariaLabel:{type:String,default:''}})
const emit=defineEmits(['update:modelValue','change'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const controlId=computed(()=>attrs.id||(!props.ariaLabel&&!attrs['aria-label']?formItem?.controlId?.value:undefined))
const {t}=useLocale();const resolvedSize=useComponentSize(toRef(props,'size'))
const accessibleLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(!formItem?.labelId?.value?(props.modelValue?props.checkedText:props.uncheckedText)||t('switch.label'):undefined))
const labelledby=computed(()=>accessibleLabel.value?undefined:attrs['aria-labelledby']||formItem?.labelId?.value||undefined)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
function toggle(){if(props.disabled||props.loading)return;const next=!props.modelValue;emit('update:modelValue',next);emit('change',next)}
</script>
<template><button v-bind="attrs" :id="controlId" type="button" class="switch ui-switch" :class="[`size-${resolvedSize}`,{on:modelValue,loading}]" role="switch" :aria-label="accessibleLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-checked="modelValue" :aria-busy="loading || undefined" :disabled="disabled||loading" @click="toggle"><span class="ui-switch-handle"><AppIcon v-if="loading" name="refresh" :size="10"/></span><span v-if="checkedText||uncheckedText" class="ui-switch-text">{{ modelValue?checkedText:uncheckedText }}</span></button></template>

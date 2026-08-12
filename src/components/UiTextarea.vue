<script setup>
import { computed, inject, ref, useAttrs } from 'vue'
defineOptions({ inheritAttrs: false })
const props = defineProps({ modelValue: String, placeholder: String, rows: {type:Number,default:3}, maxlength:[String,Number], showCount:Boolean, disabled:Boolean, readonly:Boolean, invalid:Boolean })
const emit=defineEmits(['update:modelValue','input','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const focused=ref(false)
const count=computed(()=>String(props.modelValue||'').length)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
function update(event){emit('update:modelValue',event.target.value);emit('input',event.target.value)}
</script>
<template><span class="ui-textarea" :class="{focused,invalid:resolvedInvalid,disabled,readonly}"><textarea v-bind="attrs" :id="controlId" class="ui-textarea-native" :value="modelValue" :rows="rows" :placeholder="placeholder" :maxlength="maxlength" :disabled="disabled" :readonly="readonly" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" @input="update" @focus="focused=true;emit('focus',$event)" @blur="focused=false;emit('blur',$event)"/><span v-if="showCount && maxlength" class="ui-textarea-count" aria-live="polite">{{ count }}/{{ maxlength }}</span></span></template>

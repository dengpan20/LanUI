<script setup>
import { computed, ref, watchEffect } from 'vue'
const props=defineProps({modelValue:{type:[Boolean,Array],default:false},value:{type:[String,Number,Boolean],default:true},label:{type:String,default:''},disabled:Boolean,indeterminate:Boolean})
const emit=defineEmits(['update:modelValue','change'])
const input=ref(null)
const checked=computed(()=>Array.isArray(props.modelValue)?props.modelValue.includes(props.value):!!props.modelValue)
watchEffect(()=>{if(input.value)input.value.indeterminate=props.indeterminate})
function change(){const next=Array.isArray(props.modelValue)?checked.value?props.modelValue.filter(item=>item!==props.value):[...props.modelValue,props.value]:!checked.value;emit('update:modelValue',next);emit('change',next)}
</script>
<template><label class="checkbox ui-checkbox" :class="{disabled,indeterminate}"><input ref="input" type="checkbox" :checked="checked" :disabled="disabled" @change="change"/><span><slot>{{ label }}</slot></span></label></template>

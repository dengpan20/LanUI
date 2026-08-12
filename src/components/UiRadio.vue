<script setup>
const props=defineProps({modelValue:[String,Number,Boolean],value:[String,Number,Boolean],label:{type:String,default:''},name:{type:String,default:''},disabled:Boolean})
const emit=defineEmits(['update:modelValue','change'])
function change(){emit('update:modelValue',props.value);emit('change',props.value)}
</script>
<template><label class="radio ui-radio" :class="{disabled}"><input type="radio" :name="name||undefined" :value="value" :checked="modelValue===value" :disabled="disabled" @change="change"/><span><slot>{{ label }}</slot></span></label></template>

<script setup>
import { computed, ref, toRef } from 'vue'
import { useComponentSize, useDirection } from '../config.js'
const props=defineProps({modelValue:{type:[String,Number,Boolean],default:''},options:{type:Array,default:()=>[]},size:{type:String,default:''},block:Boolean,disabled:Boolean,name:{type:String,default:''}})
const emit=defineEmits(['update:modelValue','change'])
const root=ref(null)
const resolvedSize=useComponentSize(toRef(props,'size'))
const direction=useDirection()
const normalized=computed(()=>props.options.map(option=>typeof option==='object'?option:{label:String(option),value:option}))
function choose(option){if(props.disabled||option.disabled)return;emit('update:modelValue',option.value);emit('change',option.value)}
function onKeydown(event){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const enabled=normalized.value.filter(option=>!option.disabled);let index=enabled.findIndex(option=>option.value===props.modelValue);if(event.key==='Home')index=0;else if(event.key==='End')index=enabled.length-1;else{const backwards=event.key==='ArrowUp'||(direction.value==='rtl'?event.key==='ArrowRight':event.key==='ArrowLeft');index=(index+(backwards?-1:1)+enabled.length)%enabled.length}const next=enabled[index];if(next){choose(next);requestAnimationFrame(()=>root.value?.querySelector(`[data-segment-index="${normalized.value.indexOf(next)}"]`)?.focus())}}
</script>
<template><div ref="root" class="ui-segmented" :class="[`size-${resolvedSize}`,{block,disabled}]" role="radiogroup" :aria-disabled="disabled" @keydown="onKeydown"><button v-for="(option,index) in normalized" :key="option.value" type="button" role="radio" :data-segment-index="index" :aria-checked="modelValue===option.value" :tabindex="modelValue===option.value?0:-1" :disabled="disabled||option.disabled" :class="{active:modelValue===option.value}" @click="choose(option)"><slot name="option" :option="option"><span v-if="option.icon">{{ option.icon }}</span>{{ option.label }}</slot></button></div></template>

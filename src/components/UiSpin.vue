<script setup>
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue'
import { useComponentSize, useLocale } from '../config.js'
const props=defineProps({spinning:{type:Boolean,default:true},text:{type:String,default:''},fullscreen:Boolean,delay:{type:Number,default:0},size:{type:String,default:''}})
const {t}=useLocale();const resolvedSize=useComponentSize(toRef(props,'size'));const resolvedText=computed(()=>props.text||t('spin.loading'))
const visible=ref(props.spinning&&!props.delay);let timer
watch(()=>props.spinning,value=>{clearTimeout(timer);if(!value)visible.value=false;else if(props.delay)timer=setTimeout(()=>visible.value=true,props.delay);else visible.value=true},{immediate:true})
onBeforeUnmount(()=>clearTimeout(timer))
</script>
<template><div class="ui-spin-container" :class="{fullscreen}" :aria-busy="spinning">
  <slot/><Transition name="fade"><div v-if="visible" class="ui-spin-overlay"><span class="ui-spinner" :class="`size-${resolvedSize}`" aria-hidden="true"/><span role="status">{{ resolvedText }}</span></div></Transition>
</div></template>

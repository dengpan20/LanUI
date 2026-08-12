<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
const props=defineProps({status:{type:String,default:'info'},title:{type:String,default:''},description:{type:String,default:''},icon:{type:String,default:''}})
const iconName=computed(()=>props.icon||({success:'check',error:'alert',warning:'alert',info:'info','404':'file'}[props.status]||'info'))
</script>
<template><section class="ui-result" :class="`status-${status}`" :role="status==='error'?'alert':'status'">
  <div class="ui-result-icon" aria-hidden="true"><slot name="icon"><AppIcon :name="iconName" :size="32"/></slot></div><h3>{{ title }}</h3><p v-if="description">{{ description }}</p><div v-if="$slots.default" class="ui-result-content"><slot/></div><div v-if="$slots.extra" class="ui-result-extra"><slot name="extra"/></div>
</section></template>

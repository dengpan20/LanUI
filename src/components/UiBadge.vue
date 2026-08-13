<script setup>
import { computed } from 'vue'
import { useLocale } from '../config-runtime.js'
const props=defineProps({value:{type:[String,Number],default:''},max:{type:Number,default:99},dot:Boolean,status:{type:String,default:'danger'},show:{type:Boolean,default:true}})
const {t,formatNumber}=useLocale()
const display=computed(()=>typeof props.value==='number'?(props.value>props.max?`${formatNumber(props.max)}+`:formatNumber(props.value)):props.value)
</script>
<template><span class="ui-badge-wrap"><slot/><sup v-if="show&&(dot||value!==''&&value!==null)" class="ui-badge" :class="[`status-${status}`,{dot}]" :aria-label="dot?t('badge.dot'):t('badge.count',{count:display})">{{ dot?'':display }}</sup></span></template>

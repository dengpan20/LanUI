<script setup>
import { computed } from 'vue'
import { useLocale } from '../config-runtime.js'
const props=defineProps({value:{type:Number,default:0},max:{type:Number,default:100},status:{type:String,default:'normal'},showText:{type:Boolean,default:true},size:{type:String,default:'md'},label:{type:String,default:''}})
const {t,formatNumber}=useLocale()
const percent=computed(()=>Math.min(100,Math.max(0,Math.round(props.value/props.max*100))))
const formattedPercent=computed(()=>formatNumber(percent.value/100,{style:'percent',maximumFractionDigits:0}))
const accessibleLabel=computed(()=>props.label||t('progress.label'))
</script>
<template><div class="ui-progress" :class="[`status-${status}`,`size-${size}`]" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent" :aria-valuetext="formattedPercent" :aria-label="accessibleLabel"><div class="ui-progress-track" aria-hidden="true"><span :style="{width:`${percent}%`}"/></div><span v-if="showText" class="ui-progress-text" aria-hidden="true">{{ formattedPercent }}</span></div></template>

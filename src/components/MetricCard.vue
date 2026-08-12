<script setup>
import AppIcon from './AppIcon.vue'
defineProps({ label:String, value:String, unit:String, trend:String, direction:{type:String,default:'up'}, icon:String, color:String, tint:String })
</script>
<template>
  <div class="card metric-card" :style="{'--metric-color':color,'--metric-tint':tint}">
    <div><div class="metric-label">{{ label }}</div><div class="metric-value">{{ value }}<small>{{ unit }}</small></div><div class="metric-trend" :class="direction"><AppIcon :name="direction==='down'?'arrowDown':'arrowUp'" :size="12"/><strong>{{ trend }}</strong><span>较上月</span></div></div>
    <div class="metric-icon"><AppIcon :name="icon" :size="22"/></div>
  </div>
</template>

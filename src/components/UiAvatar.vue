<script setup>
import { computed, ref, watch } from 'vue'
const props=defineProps({src:{type:String,default:''},alt:{type:String,default:''},name:{type:String,default:''},size:{type:[Number,String],default:'md'},color:{type:String,default:'blue'},square:Boolean})
const failed=ref(false);watch(()=>props.src,()=>failed.value=false)
const initials=computed(()=>props.name?props.name.trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase():'?')
const style=computed(()=>typeof props.size==='number'?{width:`${props.size}px`,height:`${props.size}px`,fontSize:`${Math.max(10,props.size*.36)}px`}: {})
</script>
<template><span class="ui-avatar" :class="[`size-${size}`,`color-${color}`,{square}]" :style="style"><img v-if="src&&!failed" :src="src" :alt="alt||name" @error="failed=true"/><span v-else aria-hidden="true"><slot>{{ initials }}</slot></span><span class="sr-only">{{ alt||name }}</span></span></template>

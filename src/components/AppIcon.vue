<script setup>
import { computed, inject } from 'vue'
import { BUILTIN_ICON_BODIES } from '../icon-bodies.js'
import { iconRegistryKey } from '../icon-context.js'

const props=defineProps({name:{type:String,default:'circle'},size:{type:[Number,String],default:18}})
const registry=inject(iconRegistryKey,null)
const body=computed(()=>{
  if(!registry)return BUILTIN_ICON_BODIES[props.name]||BUILTIN_ICON_BODIES.circle
  if(registry.isBuiltin(props.name))return BUILTIN_ICON_BODIES[props.name]
  if(!registry.has(props.name)&&registry.isBuiltin('circle'))return BUILTIN_ICON_BODIES.circle
  return ''
})
const definition=computed(()=>registry?.resolve(props.name,'circle')||null)
const dimension=computed(()=>typeof props.size==='number'?`${props.size}px`:props.size)
</script>

<template>
  <svg v-if="body" class="icon" :style="{width:dimension,height:dimension}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" :data-ui-icon="name" v-html="body"/>
  <svg v-else class="icon" :style="{width:dimension,height:dimension}" :viewBox="definition?.viewBox||'0 0 24 24'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" :data-ui-icon="name">
    <component v-for="(node,index) in definition?.nodes||[]" :is="node.tag" :key="index" v-bind="node.attrs"/>
  </svg>
</template>

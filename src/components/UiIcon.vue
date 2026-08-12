<script setup>
import { computed } from 'vue'
import { useDirection } from '../config.js'
import { useIconRegistry } from '../icons.js'

const props=defineProps({
  name:{type:String,default:'circle'},
  fallback:{type:String,default:'circle'},
  size:{type:[Number,String],default:18},
  strokeWidth:{type:[Number,String],default:1.8},
  color:{type:String,default:''},
  fill:{type:String,default:'none'},
  rotate:{type:Number,default:0},
  flip:{type:String,default:'none'},
  directional:Boolean,
  spin:Boolean,
  ariaLabel:{type:String,default:''},
})
const registry=useIconRegistry()
const direction=useDirection()
const definition=computed(()=>registry.resolve(props.name,props.fallback))
const dimension=computed(()=>typeof props.size==='number'?`${props.size}px`:props.size)
const transform=computed(()=>{
  const horizontal=props.flip==='horizontal'||props.flip==='both'||(props.directional&&direction.value==='rtl')
  const vertical=props.flip==='vertical'||props.flip==='both'
  const values=[]
  if(horizontal||vertical)values.push(`scale(${horizontal?-1:1}, ${vertical?-1:1})`)
  if(props.rotate)values.push(`rotate(${props.rotate}deg)`)
  return values.join(' ')||'none'
})
const iconStyle=computed(()=>({width:dimension.value,height:dimension.value,color:props.color||undefined,'--ui-icon-transform':transform.value}))
</script>

<template>
  <svg class="icon ui-icon" :class="{'is-spinning':spin}" :style="iconStyle" :viewBox="definition?.viewBox||'0 0 24 24'" :fill="fill" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" :role="ariaLabel?'img':undefined" :aria-label="ariaLabel||undefined" :aria-hidden="ariaLabel?undefined:'true'" focusable="false" :data-ui-icon="name" :data-ui-icon-missing="definition?undefined:'true'">
    <component v-for="(node,index) in definition?.nodes||[]" :is="node.tag" :key="index" v-bind="node.attrs"/>
    <slot/>
  </svg>
</template>

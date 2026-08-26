<script setup>
import { computed, ref, useAttrs } from 'vue'
import { cssResponsive, layoutState, safeEnum, safeLength } from '../layout.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({
  tag:{type:String,default:'section'}, direction:{type:[String,Object],default:'vertical'}, gap:{type:[String,Number,Object],default:0}, contained:Boolean,
  align:{type:[String,Object],default:'stretch'}, justify:{type:[String,Object],default:'start'}, wrap:{type:[Boolean,String,Object],default:false},
  maxWidth:{type:[String,Number,Object],default:undefined}, padding:{type:[String,Number,Object],default:0}, minHeight:{type:[String,Number,Object],default:0},
  density:{type:String,default:'default'}, ariaLabel:{type:String,default:''},
})
const attrs=useAttrs(),root=ref(null)
const tag=computed(()=>/^[a-z][a-z0-9-]*$/i.test(props.tag)?props.tag:'section')
const directionNormalize=value=>safeEnum(value,['horizontal','vertical'],'vertical')==='horizontal'?'row':'column'
const alignNormalize=value=>safeEnum(value,['start','center','end','stretch','baseline'],'stretch')
const justifyNormalize=value=>safeEnum(value,['start','center','end','between','around','evenly','stretch'],'start').replace('between','space-between').replace('around','space-around').replace('evenly','space-evenly')
const wrapNormalize=value=>value===true||value==='wrap'?'wrap':'nowrap'
const styleVars=computed(()=>({
  ...cssResponsive('layout-gap',props.gap,safeLength),...cssResponsive('layout-direction',props.direction,directionNormalize),...cssResponsive('layout-align',props.align,alignNormalize),...cssResponsive('layout-justify',props.justify,justifyNormalize),...cssResponsive('layout-wrap',props.wrap,wrapNormalize),...cssResponsive('layout-max-width',props.maxWidth,v=>safeLength(v,'none')),...cssResponsive('layout-padding',props.padding,safeLength),...cssResponsive('layout-min-height',props.minHeight,safeLength),
}))
const classes=computed(()=>['ui-layout',typeof props.direction==='string'&&`direction-${props.direction}`,props.contained&&'contained',`density-${safeEnum(props.density,['default','compact','comfortable'],'default')}`,attrs.class])
const state=layoutState(root,()=>({tag:tag.value,direction:props.direction,gap:props.gap,contained:props.contained,density:props.density}))
defineExpose(state)
</script>

<template><component :is="tag" ref="root" v-bind="attrs" class="ui-layout" :class="classes" :style="[attrs.style,styleVars]" :aria-label="props.ariaLabel||attrs['aria-label']"><slot :root="root" :get-state="state.getState"/></component></template>

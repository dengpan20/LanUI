<script setup>
import { computed, ref, useAttrs, useSlots, Comment, Text } from 'vue'
import { cssResponsive, gapVars, layoutState, safeEnum, safeLength } from '../layout.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({ size:{type:[String,Number,Array,Object],default:8}, direction:{type:[String,Object],default:'horizontal'}, align:{type:[String,Object],default:'center'}, wrap:{type:[Boolean,String,Object],default:true}, tag:{type:String,default:'div'}, justify:{type:[String,Object],default:'start'}, inline:Boolean, density:{type:String,default:'default'}, separator:{type:[String,Boolean],default:false}, ariaLabel:{type:String,default:''} })
const attrs=useAttrs(),slots=useSlots(),root=ref(null)
const tag=computed(()=>/^[a-z][a-z0-9-]*$/i.test(props.tag)?props.tag:'div')
const directionNormalize=value=>safeEnum(value,['horizontal','vertical'],'horizontal')
const alignNormalize=value=>safeEnum(value,['start','center','end','stretch','baseline'],'center')
const justifyNormalize=value=>safeEnum(value,['start','center','end','space-between','space-around','space-evenly'],'start')
const wrapNormalize=value=>value===false||value==='nowrap'?'nowrap':'wrap'
const styleVars=computed(()=>({...cssResponsive('space-size',props.size,safeLength),...gapVars('space-gap',props.size,8),...cssResponsive('space-direction',props.direction,directionNormalize),...cssResponsive('space-align',props.align,alignNormalize),...cssResponsive('space-wrap',props.wrap,wrapNormalize),...cssResponsive('space-justify',props.justify,justifyNormalize)}))
const visibleChildren=computed(()=>slots.default?.().filter(vnode=>vnode.type!==Comment&&!(vnode.type===Text&&!String(vnode.children??'').trim()))||[])
const hasSeparator=computed(()=>Boolean(props.separator)||Boolean(slots.separator))
const classes=computed(()=>['ui-space',typeof props.direction==='string'&&`direction-${props.direction}`,props.inline&&'inline',`density-${safeEnum(props.density,['default','compact','comfortable'],'default')}`,attrs.class])
const state=layoutState(root,()=>({size:props.size,direction:props.direction,align:props.align,wrap:props.wrap,items:visibleChildren.value.length}))
defineExpose(state)
</script>

<template><component :is="tag" ref="root" v-bind="attrs" class="ui-space" :class="classes" :style="[attrs.style,styleVars]" :aria-label="props.ariaLabel||attrs['aria-label']">
  <template v-if="hasSeparator&&visibleChildren.length>1"><template v-for="(child,index) in visibleChildren" :key="child.key??`space-${index}`"><component :is="child"/><span v-if="index<visibleChildren.length-1" class="ui-space-separator" aria-hidden="true"><slot name="separator"><template v-if="typeof props.separator==='string'">{{ props.separator }}</template><template v-else>{{ props.separator?'•':'' }}</template></slot></span></template></template>
  <slot v-else/>
</component></template>

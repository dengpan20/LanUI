<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue'
import { cssResponsive, layoutState, safeEnum, safeLength } from '../layout.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({
  vertical:Boolean, dashed:Boolean, label:{type:String,default:''}, tag:{type:String,default:'div'}, orientation:{type:String,default:'horizontal',validator:value=>['horizontal','vertical'].includes(value)}, variant:{type:String,default:'solid',validator:value=>['solid','dashed','dotted'].includes(value)}, labelPosition:{type:String,default:'center',validator:value=>['start','center','end'].includes(value)}, decorative:Boolean, margin:{type:[String,Number,Object],default:14}, thickness:{type:[String,Number,Object],default:1}, color:{type:String,default:''}, ariaLabel:{type:String,default:''},
})
const attrs=useAttrs(),slots=useSlots(),root=ref(null)
const tag=computed(()=>/^[a-z][a-z0-9-]*$/i.test(props.tag)?props.tag:'div')
const effectiveOrientation=computed(()=>props.vertical?'vertical':safeEnum(props.orientation,['horizontal','vertical'],'horizontal'))
const effectiveVariant=computed(()=>props.dashed?'dashed':safeEnum(props.variant,['solid','dashed','dotted'],'solid'))
const hasLabel=computed(()=>Boolean(props.label)||Boolean(slots.label))
const styleVars=computed(()=>({...cssResponsive('divider-margin',props.margin,safeLength),...cssResponsive('divider-thickness',props.thickness,v=>safeLength(v,1)),...(props.color?{'--divider-color':props.color}:{})}))
const classes=computed(()=>['ui-divider',effectiveOrientation.value,effectiveVariant.value==='dashed'&&'dashed',`variant-${effectiveVariant.value}`,hasLabel.value&&'has-label',`label-${safeEnum(props.labelPosition,['start','center','end'],'center')}`,props.decorative&&'decorative',attrs.class])
const state=layoutState(root,()=>({orientation:effectiveOrientation.value,variant:effectiveVariant.value,hasLabel:hasLabel.value,decorative:props.decorative}))
defineExpose(state)
</script>

<template><component :is="tag" ref="root" v-bind="attrs" class="ui-divider" :class="classes" :style="[attrs.style,styleVars]" :role="props.decorative?undefined:'separator'" :aria-hidden="props.decorative?'true':undefined" :aria-orientation="props.decorative?undefined:effectiveOrientation" :aria-label="props.ariaLabel||attrs['aria-label']"><span v-if="hasLabel" class="ui-divider-label"><slot name="label">{{ props.label }}</slot></span></component></template>

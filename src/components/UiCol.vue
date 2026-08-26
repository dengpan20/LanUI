<script setup>
import { computed, ref, useAttrs } from 'vue'
import { cssResponsive, layoutState, safeEnum, safeInteger, useGridState } from '../layout.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({ span:{type:[Number,Object],default:12}, offset:{type:[Number,Object],default:0}, order:{type:[Number,Object],default:0}, tag:{type:String,default:'div'}, rowSpan:{type:[Number,Object],default:1}, alignSelf:{type:[String,Object],default:'auto'}, hidden:{type:[Boolean,Object],default:false}, ariaLabel:{type:String,default:''} })
const attrs=useAttrs(),root=ref(null),grid=useGridState()
const tag=computed(()=>/^[a-z][a-z0-9-]*$/i.test(props.tag)?props.tag:'div')
const gridColumns=computed(()=>{const value=grid?.columns?.value??grid?.columns??12;return safeInteger(value,12,1,24)})
const gridMode=computed(()=>grid?.mode?.value??grid?.mode??'fixed')
const normalizeSpan=value=>Math.min(gridColumns.value,safeInteger(value,gridColumns.value,1,24))
const normalizeOffset=value=>gridMode.value==='fixed'?Math.min(Math.max(0,safeInteger(value,0,0,24)),Math.max(0,gridColumns.value-1)):0
const normalizeStart=value=>{const offset=normalizeOffset(value);return offset>0?String(offset+1):'auto'}
const normalizeOrder=value=>safeInteger(value,0,-999,999)
const normalizeRowSpan=value=>safeInteger(value,1,1,24)
const normalizeAlign=value=>safeEnum(value,['auto','start','center','end','stretch','baseline'],'auto')
const styleVars=computed(()=>({...cssResponsive('col-span',props.span,normalizeSpan),...cssResponsive('col-offset',props.offset,normalizeOffset),...cssResponsive('col-start',props.offset,normalizeStart),...cssResponsive('col-order',props.order,normalizeOrder),...cssResponsive('col-row-span',props.rowSpan,normalizeRowSpan),...cssResponsive('col-align-self',props.alignSelf,normalizeAlign),...cssResponsive('col-hidden',props.hidden,v=>v===true?'none':'block')}))
const classes=computed(()=>['ui-col',attrs.class])
const state=layoutState(root,()=>({span:props.span,offset:props.offset,order:props.order,rowSpan:props.rowSpan,hidden:props.hidden,gridColumns:gridColumns.value,gridMode:gridMode.value}))
defineExpose(state)
</script>

<template><component :is="tag" ref="root" v-bind="attrs" class="ui-col" :class="classes" :style="[attrs.style,styleVars]" :aria-label="props.ariaLabel||attrs['aria-label']"><slot :get-state="state.getState"/></component></template>

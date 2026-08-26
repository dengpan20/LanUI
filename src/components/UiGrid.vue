<script setup>
import { computed, provide, ref, useAttrs } from 'vue'
import { cssResponsive, gapVars, layoutGridKey, layoutState, safeEnum, safeInteger, safeLength, responsiveEntries } from '../layout.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({
  columns:{type:[Number,String,Object],default:12}, gap:{type:[Number,String,Array,Object],default:16}, min:{type:[Number,String,Object],default:0}, align:{type:[String,Object],default:'stretch'},
  tag:{type:String,default:'div'}, mode:{type:String,default:'',validator:value=>value===''||['fixed','auto-fit','auto-fill'].includes(value)}, rowGap:{type:[Number,String,Object],default:undefined}, columnGap:{type:[Number,String,Object],default:undefined},
  justify:{type:[String,Object],default:'stretch'}, autoFlow:{type:String,default:'row',validator:value=>['row','column','dense','row dense','column dense'].includes(value)}, dense:Boolean, density:{type:String,default:'default'}, ariaLabel:{type:String,default:''},
})
const attrs=useAttrs(),root=ref(null)
const tag=computed(()=>/^[a-z][a-z0-9-]*$/i.test(props.tag)?props.tag:'div')
const mode=computed(()=>{
  if(props.mode)return props.mode
  const entries=responsiveEntries(props.min)
  return Object.prototype.hasOwnProperty.call(entries,'scalar') ? (entries.scalar===0||entries.scalar==='0'?'fixed':'auto-fit') : 'auto-fit'
})
const normalizeColumns=value=>safeInteger(value,12,1,24)
const normalizeAlign=value=>safeEnum(value,['start','center','end','stretch','baseline'],'stretch')
const normalizeJustify=value=>safeEnum(value,['start','center','end','stretch','space-between','space-around','space-evenly'],'stretch')
const normalizeFlow=value=>safeEnum(value,['row','column','dense','row dense','column dense'],'row')
const styleVars=computed(()=>({...cssResponsive('grid-columns',props.columns,normalizeColumns),...gapVars('grid-gap',props.gap,16),...gapVars('grid-row-gap',props.rowGap??props.gap,16),...gapVars('grid-column-gap',props.columnGap??props.gap,16),...cssResponsive('grid-min',props.min,v=>safeLength(v,0)),...cssResponsive('grid-align',props.align,normalizeAlign),...cssResponsive('grid-justify',props.justify,normalizeJustify),...(props.autoFlow?{'--grid-auto-flow':normalizeFlow(props.autoFlow)}:{})}))
const classes=computed(()=>['ui-grid',`mode-${mode.value}`,mode.value!=='fixed'&&'responsive',props.dense&&'dense',`density-${safeEnum(props.density,['default','compact','comfortable'],'default')}`,attrs.class])
const gridState={columns:computed(()=>props.columns),mode,register:()=>()=>{}}
provide(layoutGridKey,gridState)
const state=layoutState(root,()=>({tag:tag.value,columns:props.columns,gap:props.gap,min:props.min,mode:mode.value}))
defineExpose(state)
</script>

<template><component :is="tag" ref="root" v-bind="attrs" class="ui-grid" :class="classes" :style="[attrs.style,styleVars]" :aria-label="props.ariaLabel||attrs['aria-label']"><slot :columns="props.columns" :mode="mode" :get-state="state.getState"/></component></template>

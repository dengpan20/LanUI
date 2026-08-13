<script setup>
import { computed, inject, onBeforeUnmount, ref, useAttrs, useId, watch } from 'vue'
import { useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[Number,Array],default:0},
  min:{type:Number,default:0},
  max:{type:Number,default:100},
  step:{type:Number,default:1},
  range:Boolean,
  minDistance:{type:Number,default:0},
  vertical:Boolean,
  reverse:Boolean,
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  tooltip:{type:String,default:'auto',validator:value=>['auto','always','never'].includes(value)},
  formatter:Function,
  marks:{type:[Array,Object],default:()=>[]},
  ariaLabel:{type:[String,Array],default:''},
})
const emit=defineEmits(['update:modelValue','input','change','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const direction=useDirection()
const {t}=useLocale()
const rootRef=ref(null)
const thumbRefs=ref([])
const focusedThumb=ref(-1)
const hoveredThumb=ref(-1)
const draggingThumb=ref(-1)
let dragDocument=null

const minimum=computed(()=>Number.isFinite(props.min)?props.min:0)
const maximum=computed(()=>Number.isFinite(props.max)&&props.max>minimum.value?props.max:minimum.value+100)
const safeStep=computed(()=>Number.isFinite(props.step)&&props.step>0?props.step:1)
const safeDistance=computed(()=>Math.min(maximum.value-minimum.value,Math.max(0,Number.isFinite(props.minDistance)?props.minDistance:0)))
const rangeMode=computed(()=>props.range||Array.isArray(props.modelValue))
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const baseId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-slider-${uid}`)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const formLabelId=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value)||undefined)
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-label','aria-labelledby','aria-describedby'].includes(key))))

function decimalPlaces(value){
  if(!Number.isFinite(value))return 0
  const [coefficient,exponent='0']=String(Math.abs(value)).toLowerCase().split('e')
  return Math.max(0,(coefficient.split('.')[1]?.length||0)-Number(exponent))
}
const precision=computed(()=>Math.min(12,Math.max(decimalPlaces(safeStep.value),decimalPlaces(minimum.value),decimalPlaces(maximum.value))))
function clamp(value){return Math.min(maximum.value,Math.max(minimum.value,value))}
function align(value){
  const steps=Math.round((clamp(Number(value))-minimum.value)/safeStep.value)
  return clamp(Number((minimum.value+steps*safeStep.value).toFixed(precision.value)))
}
function alignDown(value){
  const steps=Math.floor((clamp(Number(value))-minimum.value)/safeStep.value+Number.EPSILON)
  return clamp(Number((minimum.value+steps*safeStep.value).toFixed(precision.value)))
}
function alignUp(value){
  const steps=Math.ceil((clamp(Number(value))-minimum.value)/safeStep.value-Number.EPSILON)
  return clamp(Number((minimum.value+steps*safeStep.value).toFixed(precision.value)))
}
function normalizeModel(value=props.modelValue){
  if(rangeMode.value){
    const source=Array.isArray(value)?value:[minimum.value,Number(value)]
    const first=align(Number.isFinite(Number(source[0]))?Number(source[0]):minimum.value)
    const second=align(Number.isFinite(Number(source[1]))?Number(source[1]):maximum.value)
    const ordered=first<=second?[first,second]:[second,first]
    if(ordered[1]-ordered[0]<safeDistance.value){
      const expandedEnd=alignUp(ordered[0]+safeDistance.value)
      if(expandedEnd<=maximum.value)return [ordered[0],expandedEnd]
      return [alignDown(ordered[1]-safeDistance.value),ordered[1]]
    }
    return ordered
  }
  const source=Array.isArray(value)?value[0]:value
  return [align(Number.isFinite(Number(source))?Number(source):minimum.value)]
}
const values=ref(normalizeModel())
watch(()=>[props.modelValue,props.min,props.max,props.step,props.range],()=>{if(draggingThumb.value<0)values.value=normalizeModel()},{deep:true})

function outputValue(source=values.value){return rangeMode.value?[source[0],source[1]]:source[0]}
function equal(left,right){return Array.isArray(left)&&Array.isArray(right)?left.length===right.length&&left.every((item,index)=>Object.is(item,right[index])):Object.is(left,right)}
function setValue(index,raw,source,commit=true){
  if(props.disabled||props.readonly)return
  const next=[...values.value]
  let value=align(raw)
  if(rangeMode.value){
    if(index===0)value=Math.min(value,alignDown(next[1]-safeDistance.value))
    else value=Math.max(value,alignUp(next[0]+safeDistance.value))
  }
  if(Object.is(next[index],value))return
  next[index]=value
  values.value=next
  const output=outputValue(next)
  if(!equal(props.modelValue,output))emit('update:modelValue',output)
  emit('input',output,{source,thumb:index})
  if(commit)emit('change',output,{source,thumb:index})
}
function rawPercent(value){return (value-minimum.value)/(maximum.value-minimum.value)}
function displayPercent(value){
  let ratio=rawPercent(value)
  if(props.reverse)ratio=1-ratio
  if(!props.vertical&&direction.value==='rtl')ratio=1-ratio
  return Math.min(100,Math.max(0,ratio*100))
}
const thumbPercents=computed(()=>values.value.map(displayPercent))
const trackStyle=computed(()=>{
  const origin=rangeMode.value?thumbPercents.value:[displayPercent(minimum.value),thumbPercents.value[0]]
  const start=Math.min(...origin);const end=Math.max(...origin)
  return props.vertical?{bottom:`${start}%`,height:`${end-start}%`}:{left:`${start}%`,width:`${end-start}%`}
})
function valueFromPointer(event){
  const rect=rootRef.value?.getBoundingClientRect()
  if(!rect)return minimum.value
  let ratio=props.vertical?(rect.bottom-event.clientY)/Math.max(1,rect.height):(event.clientX-rect.left)/Math.max(1,rect.width)
  ratio=Math.min(1,Math.max(0,ratio))
  if(!props.vertical&&direction.value==='rtl')ratio=1-ratio
  if(props.reverse)ratio=1-ratio
  return align(minimum.value+ratio*(maximum.value-minimum.value))
}
function nearestThumb(value){
  if(!rangeMode.value)return 0
  const distances=values.value.map(item=>Math.abs(item-value))
  if(distances[0]===distances[1])return value>=values.value[1]?1:0
  return distances[0]<distances[1]?0:1
}
function removePointerListeners(){
  dragDocument?.removeEventListener('pointermove',onPointerMove)
  dragDocument?.removeEventListener('pointerup',onPointerUp)
  dragDocument?.removeEventListener('pointercancel',onPointerUp)
  dragDocument=null
}
function onPointerDown(event,index){
  if(props.disabled||props.readonly||event.button!==0)return
  event.preventDefault()
  const value=valueFromPointer(event)
  const target=index??nearestThumb(value)
  draggingThumb.value=target
  setValue(target,value,'pointer',false)
  thumbRefs.value[target]?.focus()
  dragDocument=event.currentTarget?.ownerDocument||document
  dragDocument.addEventListener('pointermove',onPointerMove,{passive:false})
  dragDocument.addEventListener('pointerup',onPointerUp)
  dragDocument.addEventListener('pointercancel',onPointerUp)
}
function onPointerMove(event){
  if(draggingThumb.value<0)return
  event.preventDefault()
  setValue(draggingThumb.value,valueFromPointer(event),'pointer',false)
}
function onPointerUp(){
  if(draggingThumb.value>=0)emit('change',outputValue(),{source:'pointer',thumb:draggingThumb.value})
  draggingThumb.value=-1
  removePointerListeners()
}
onBeforeUnmount(removePointerListeners)

function keyboardDelta(key){
  if(key==='PageUp')return safeStep.value*10
  if(key==='PageDown')return -safeStep.value*10
  if(props.vertical){
    const visual=key==='ArrowUp'?1:key==='ArrowDown'?-1:0
    return props.reverse?-visual*safeStep.value:visual*safeStep.value
  }
  const visual=key==='ArrowRight'?1:key==='ArrowLeft'?-1:0
  const logical=direction.value==='rtl'?-visual:visual
  return props.reverse?-logical*safeStep.value:logical*safeStep.value
}
function onKeydown(event,index){
  if(props.disabled||props.readonly)return
  if(event.key==='Home'){event.preventDefault();setValue(index,minimum.value,'keyboard');return}
  if(event.key==='End'){event.preventDefault();setValue(index,maximum.value,'keyboard');return}
  const delta=keyboardDelta(event.key)
  if(delta){event.preventDefault();setValue(index,values.value[index]+delta,'keyboard')}
}
function formatValue(value){
  if(props.formatter){try{return String(props.formatter(value)??value)}catch{return String(value)}}
  return String(value)
}
function explicitLabel(index){
  const configured=props.ariaLabel||attrs['aria-label']
  if(Array.isArray(configured))return configured[index]||''
  if(configured&&rangeMode.value)return `${configured} ${t(index===0?'slider.start':'slider.end')}`
  return configured||''
}
function thumbLabel(index){
  const explicit=explicitLabel(index)
  if(explicit)return explicit
  if(!rangeMode.value&&!formLabelId.value)return t('slider.value')
  if(rangeMode.value&&!formLabelId.value)return t(index===0?'slider.start':'slider.end')
  return undefined
}
function thumbLabelledby(index){
  if(explicitLabel(index))return undefined
  if(rangeMode.value&&formLabelId.value)return `${formLabelId.value} ${baseId.value}-${index===0?'start':'end'}-label`
  return formLabelId.value
}
function showTooltip(index){return props.tooltip==='always'||(props.tooltip!=='never'&&(focusedThumb.value===index||hoveredThumb.value===index||draggingThumb.value===index))}
const normalizedMarks=computed(()=>{
  const source=Array.isArray(props.marks)?props.marks:Object.entries(props.marks||{}).map(([value,label])=>({value:Number(value),label}))
  const unique=new Map(source.map(item=>typeof item==='number'?{value:item,label:String(item)}:item).filter(item=>Number.isFinite(Number(item?.value))&&Number(item.value)>=minimum.value&&Number(item.value)<=maximum.value).map(item=>{const value=align(Number(item.value));return [value,{value,label:String(item.label??item.value)}]}))
  return [...unique.values()].sort((a,b)=>a.value-b.value)
})
function selectMark(value){const index=nearestThumb(value);setValue(index,value,'mark');thumbRefs.value[index]?.focus()}
</script>

<template>
  <div v-bind="rootAttrs" ref="rootRef" class="ui-slider" :class="[attrs.class,{range:rangeMode,vertical,reverse,disabled,readonly,invalid:resolvedInvalid,'has-marks':normalizedMarks.length}]" :style="attrs.style" :data-direction="direction" @pointerdown="onPointerDown($event)">
    <span class="ui-slider-rail" aria-hidden="true"/><span class="ui-slider-track" :style="trackStyle" aria-hidden="true"/>
    <template v-for="(value,index) in values" :key="index">
      <span v-if="rangeMode" :id="`${baseId}-${index===0?'start':'end'}-label`" class="sr-only">{{ t(index===0?'slider.start':'slider.end') }}</span>
      <span
        :id="index===0?baseId:`${baseId}-end`"
        :ref="element=>thumbRefs[index]=element"
        class="ui-slider-thumb"
        :class="{'is-dragging':draggingThumb===index}"
        role="slider"
        :tabindex="disabled?-1:0"
        :style="vertical?{bottom:`${thumbPercents[index]}%`}:{left:`${thumbPercents[index]}%`}"
        :aria-orientation="vertical?'vertical':'horizontal'"
        :aria-valuemin="minimum"
        :aria-valuemax="maximum"
        :aria-valuenow="value"
        :aria-valuetext="formatValue(value)"
        :aria-label="thumbLabel(index)"
        :aria-labelledby="thumbLabelledby(index)"
        :aria-describedby="describedby"
        :aria-disabled="disabled||undefined"
        :aria-readonly="readonly||undefined"
        :aria-invalid="resolvedInvalid||undefined"
        @pointerdown.stop="onPointerDown($event,index)"
        @keydown="onKeydown($event,index)"
        @focus="focusedThumb=index;emit('focus',$event,{thumb:index})"
        @blur="focusedThumb=-1;emit('blur',$event,{thumb:index})"
        @mouseenter="hoveredThumb=index"
        @mouseleave="hoveredThumb=-1"
      ><span v-if="showTooltip(index)" class="ui-slider-tooltip" role="tooltip">{{ formatValue(value) }}</span></span>
    </template>
    <span v-for="mark in normalizedMarks" :key="mark.value" class="ui-slider-mark" :style="vertical?{bottom:`${displayPercent(mark.value)}%`}:{left:`${displayPercent(mark.value)}%`}">
      <span class="ui-slider-mark-dot" aria-hidden="true"/><button type="button" class="ui-slider-mark-label" :disabled="disabled||readonly" :aria-label="t('slider.setValue',{value:formatValue(mark.value)})" @pointerdown.stop @click.stop="selectMark(mark.value)">{{ mark.label }}</button>
    </span>
  </div>
</template>

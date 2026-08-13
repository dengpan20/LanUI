<script setup>
import { computed, inject, ref, toRef, useAttrs, useId, watch } from 'vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:Number,default:0},
  max:{type:Number,default:5,validator:value=>Number.isInteger(value)&&value>0&&value<=20},
  step:{type:Number,default:1,validator:value=>Number.isFinite(value)&&value>0&&value<=1},
  allowClear:{type:Boolean,default:true},
  clearValue:{type:Number,default:0},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  showText:Boolean,
  texts:{type:Array,default:()=>[]},
  formatter:Function,
  color:{type:String,default:''},
  voidColor:{type:String,default:''},
  disabledColor:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','input','change','hover-change','clear','focus','blur'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const resolvedSize=useComponentSize(toRef(props,'size'))
const direction=useDirection()
const {t}=useLocale()
const controlRef=ref(null)
const focused=ref(false)
const hovering=ref(false)
const hoverValue=ref(null)

const maximum=computed(()=>Number.isInteger(props.max)&&props.max>0?Math.min(20,props.max):5)
const safeStep=computed(()=>Number.isFinite(props.step)&&props.step>0&&props.step<=1?props.step:1)
function decimalPlaces(value){
  if(!Number.isFinite(value))return 0
  const [coefficient,exponent='0']=String(Math.abs(value)).toLowerCase().split('e')
  return Math.max(0,(coefficient.split('.')[1]?.length||0)-Number(exponent))
}
const precision=computed(()=>Math.min(12,Math.max(decimalPlaces(safeStep.value),decimalPlaces(props.clearValue))))
function clamp(value){return Math.min(maximum.value,Math.max(0,value))}
function normalize(value){
  const numeric=Number(value)
  const fallback=Number.isFinite(props.clearValue)?props.clearValue:0
  const source=Number.isFinite(numeric)?numeric:fallback
  const aligned=Math.round(source/safeStep.value)*safeStep.value
  return Number(clamp(aligned).toFixed(precision.value))
}
const value=ref(normalize(props.modelValue))
watch(()=>[props.modelValue,props.max,props.step],()=>{value.value=normalize(props.modelValue)})

const displayValue=computed(()=>hoverValue.value===null?value.value:hoverValue.value)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-rate-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value)||undefined)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-label','aria-labelledby','aria-describedby'].includes(key))))
const rootStyle=computed(()=>({
  ...(props.color?{'--ui-rate-color':props.color}:{}),
  ...(props.voidColor?{'--ui-rate-void-color':props.voidColor}:{}),
  ...(props.disabledColor?{'--ui-rate-disabled-color':props.disabledColor}:{}),
}))
const items=computed(()=>Array.from({length:maximum.value},(_,index)=>index))
function fillFor(index){return Math.min(100,Math.max(0,(displayValue.value-index)*100))}

function valueText(target=displayValue.value){
  if(target<=0)return t('rate.unrated')
  const configured=props.texts[Math.max(0,Math.min(props.texts.length-1,Math.ceil(target)-1))]
  if(configured!==undefined)return String(configured)
  if(props.formatter){try{return String(props.formatter(target,maximum.value)??target)}catch{return t('rate.value',{value:target,max:maximum.value})}}
  return t('rate.value',{value:target,max:maximum.value})
}
function commit(raw,source){
  if(props.disabled||props.readonly)return
  let next=normalize(raw)
  const cleared=props.allowClear&&source==='pointer'&&Object.is(next,value.value)
  if(cleared)next=normalize(props.clearValue)
  const previous=value.value
  if(Object.is(next,previous))return
  value.value=next
  emit('update:modelValue',next)
  emit('input',next,{source})
  emit('change',next,{source,previous})
  if(cleared)emit('clear')
}
function pointerValue(event,index){
  const rect=event.currentTarget?.getBoundingClientRect()
  if(!rect)return index+1
  let ratio=(event.clientX-rect.left)/Math.max(1,rect.width)
  if(direction.value==='rtl')ratio=1-ratio
  ratio=Math.min(1,Math.max(0,ratio))
  const steps=Math.max(1,Math.ceil((ratio-Number.EPSILON)/safeStep.value))
  return normalize(index+Math.min(1,steps*safeStep.value))
}
function preview(event,index){
  if(props.disabled||props.readonly)return
  const next=pointerValue(event,index)
  hovering.value=true
  if(!Object.is(hoverValue.value,next)){
    hoverValue.value=next
    emit('hover-change',next)
  }
}
function select(event,index){
  if(event.button!==undefined&&event.button!==0)return
  controlRef.value?.focus()
  commit(pointerValue(event,index),'pointer')
}
function leave(){
  if(hoverValue.value!==null)emit('hover-change',null)
  hoverValue.value=null
  hovering.value=false
}
function keyDelta(key){
  if(key==='ArrowUp')return safeStep.value
  if(key==='ArrowDown')return -safeStep.value
  if(key==='PageUp')return safeStep.value*5
  if(key==='PageDown')return -safeStep.value*5
  const visual=key==='ArrowRight'?1:key==='ArrowLeft'?-1:0
  return (direction.value==='rtl'?-visual:visual)*safeStep.value
}
function onKeydown(event){
  if(props.disabled||props.readonly)return
  if(event.key==='Home'){event.preventDefault();commit(props.clearValue,'keyboard');return}
  if(event.key==='End'){event.preventDefault();commit(maximum.value,'keyboard');return}
  if((event.key==='Delete'||event.key==='Backspace')&&props.allowClear){event.preventDefault();commit(props.clearValue,'keyboard');emit('clear');return}
  const delta=keyDelta(event.key)
  if(delta){event.preventDefault();commit(value.value+delta,'keyboard')}
}
function onFocus(event){focused.value=true;emit('focus',event)}
function onBlur(event){focused.value=false;leave();emit('blur',event)}
</script>

<template>
  <span v-bind="rootAttrs" class="ui-rate" :class="[`size-${resolvedSize}`,attrs.class,{focused,hovering,disabled,readonly,invalid:resolvedInvalid}]" :style="[attrs.style,rootStyle]" :data-direction="direction" @pointerleave="leave">
    <span
      :id="controlId"
      ref="controlRef"
      class="ui-rate-control"
      role="slider"
      :tabindex="disabled?-1:0"
      aria-orientation="horizontal"
      :aria-valuemin="0"
      :aria-valuemax="maximum"
      :aria-valuenow="value"
      :aria-valuetext="valueText(value)"
      :aria-label="attrs['aria-label']||ariaLabel||(!labelledby?t('rate.label'):undefined)"
      :aria-labelledby="labelledby"
      :aria-describedby="describedby"
      :aria-disabled="disabled||undefined"
      :aria-readonly="readonly||undefined"
      :aria-invalid="resolvedInvalid||undefined"
      :aria-keyshortcuts="disabled||readonly?undefined:'ArrowLeft ArrowRight ArrowUp ArrowDown Home End PageUp PageDown Delete'"
      :aria-description="disabled||readonly?undefined:t('rate.keyboardHint')"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    >
      <span v-for="index in items" :key="index" class="ui-rate-item" aria-hidden="true" @pointermove="preview($event,index)" @pointerdown.prevent="select($event,index)">
        <slot name="item" :index="index" :value="index+1" :fill="fillFor(index)" :active="fillFor(index)>0">
          <span class="ui-rate-star ui-rate-star-void"/>
          <span class="ui-rate-fill" :style="{width:`${fillFor(index)}%`}"><span class="ui-rate-star ui-rate-star-filled"/></span>
        </slot>
      </span>
    </span>
    <span v-if="showText" class="ui-rate-text" aria-hidden="true"><slot name="text" :value="displayValue" :max="maximum" :text="valueText()">{{ valueText() }}</slot></span>
  </span>
</template>

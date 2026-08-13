<script setup>
import { computed, inject, nextTick, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:Number,default:null},
  min:{type:Number,default:-Infinity},
  max:{type:Number,default:Infinity},
  step:{type:Number,default:1},
  precision:Number,
  placeholder:String,
  size:{type:String,default:''},
  controls:{type:Boolean,default:true},
  controlsPosition:{type:String,default:'sides'},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  clampOnBlur:{type:Boolean,default:true},
  wheel:Boolean,
  formatter:Function,
  parser:Function,
})
const emit=defineEmits(['update:modelValue','input','change','step','invalid','focus','blur'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const inputRef=ref(null)
const focused=ref(false)
const draft=ref('')
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()

const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-number-input-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const inputAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-labelledby','aria-describedby'].includes(key))))
const safeStep=computed(()=>Number.isFinite(props.step)&&props.step>0?props.step:1)
const lowerBound=computed(()=>Number.isFinite(props.min)?props.min:-Infinity)
const upperBound=computed(()=>Number.isFinite(props.max)?Math.max(props.max,lowerBound.value):Infinity)

function decimalPlaces(value){
  if(!Number.isFinite(value))return 0
  const [coefficient,exponent='0']=String(Math.abs(value)).toLowerCase().split('e')
  return Math.max(0,(coefficient.split('.')[1]?.length||0)-Number(exponent))
}
const resolvedPrecision=computed(()=>{
  const value=props.precision===undefined?Math.max(decimalPlaces(safeStep.value),decimalPlaces(props.modelValue)):Number(props.precision)
  return Math.min(12,Math.max(0,Number.isFinite(value)?Math.trunc(value):0))
})
function round(value){return Number(value.toFixed(resolvedPrecision.value))}
function clamp(value){return Math.min(upperBound.value,Math.max(lowerBound.value,value))}
function normalize(value,shouldClamp=true){return round(shouldClamp?clamp(value):value)}
function format(value){
  if(value===null||value===undefined||!Number.isFinite(value))return ''
  if(props.formatter){
    try{return String(props.formatter(value)??'')}
    catch{return props.precision===undefined?String(value):value.toFixed(resolvedPrecision.value)}
  }
  return props.precision===undefined?String(value):value.toFixed(resolvedPrecision.value)
}
function parse(text){
  const raw=String(text??'').trim()
  if(!raw)return null
  let parsed
  try{parsed=props.parser?props.parser(raw):Number(raw)}
  catch{return undefined}
  if(parsed===null||parsed===undefined||parsed==='')return null
  const value=Number(parsed)
  return Number.isFinite(value)?value:undefined
}
function setDraftFromModel(){draft.value=format(props.modelValue)}
watch(()=>[props.modelValue,props.precision,props.formatter],()=>{if(!focused.value)setDraftFromModel()},{immediate:true})

function emitValue(value,source,{input=true,change=true}={}){
  const previous=props.modelValue
  if(!Object.is(previous,value))emit('update:modelValue',value)
  if(input)emit('input',value)
  if(change&&!Object.is(previous,value))emit('change',value,{source,previous})
}
function commit(source='blur'){
  const parsed=parse(draft.value)
  if(parsed===undefined){
    const payload={reason:'parse',input:draft.value}
    emit('invalid',payload);setDraftFromModel();return false
  }
  if(parsed===null){emitValue(null,source);draft.value='';return true}
  const value=normalize(parsed,props.clampOnBlur)
  emitValue(value,source);draft.value=format(value);return true
}
function onInput(event){
  draft.value=event.target.value
  const parsed=parse(draft.value)
  if(parsed===null){emitValue(null,'input',{change:false});return}
  if(parsed!==undefined)emitValue(parsed,'input',{change:false})
}
function currentValue(){
  const parsed=parse(draft.value)
  if(parsed!==undefined&&parsed!==null)return parsed
  if(Number.isFinite(props.modelValue))return props.modelValue
  return Number.isFinite(lowerBound.value)?lowerBound.value:0
}
function stepBy(direction,multiplier=1,source='control'){
  if(props.disabled||props.readonly)return
  const value=normalize(currentValue()+direction*safeStep.value*multiplier)
  draft.value=format(value)
  emitValue(value,source)
  emit('step',value,{direction,step:safeStep.value*multiplier,source})
  nextTick(()=>inputRef.value?.focus())
}
const atMin=computed(()=>Number.isFinite(lowerBound.value)&&currentValue()<=lowerBound.value)
const atMax=computed(()=>Number.isFinite(upperBound.value)&&currentValue()>=upperBound.value)
function onKeydown(event){
  if(props.disabled||props.readonly)return
  const actions={ArrowUp:()=>stepBy(1,1,'keyboard'),ArrowDown:()=>stepBy(-1,1,'keyboard'),PageUp:()=>stepBy(1,10,'keyboard'),PageDown:()=>stepBy(-1,10,'keyboard')}
  if(actions[event.key]){event.preventDefault();actions[event.key]();return}
  if(event.key==='Home'&&Number.isFinite(lowerBound.value)){event.preventDefault();draft.value=format(lowerBound.value);emitValue(lowerBound.value,'keyboard');return}
  if(event.key==='End'&&Number.isFinite(upperBound.value)){event.preventDefault();draft.value=format(upperBound.value);emitValue(upperBound.value,'keyboard');return}
  if(event.key==='Enter'){event.preventDefault();commit('enter');inputRef.value?.select()}
  if(event.key==='Escape'){event.preventDefault();setDraftFromModel();inputRef.value?.select()}
}
function onWheel(event){if(props.wheel&&focused.value){event.preventDefault();stepBy(event.deltaY<0?1:-1,1,'wheel')}}
function onFocus(event){focused.value=true;draft.value=format(props.modelValue);emit('focus',event)}
function onBlur(event){commit('blur');focused.value=false;emit('blur',event)}
</script>

<template>
  <span class="ui-number-input" :class="[`size-${resolvedSize}`,`controls-${controlsPosition}`,attrs.class,{focused,disabled,readonly,invalid:resolvedInvalid,'without-controls':!controls}]" :style="attrs.style">
    <button v-if="controls&&controlsPosition==='sides'" type="button" class="ui-number-input-control is-decrease" :disabled="disabled||readonly||atMin" :aria-label="t('number.decrease')" :aria-controls="controlId" @mousedown.prevent @click="stepBy(-1)"><span class="ui-number-input-minus" aria-hidden="true"/></button>
    <span v-if="$slots.prefix" class="ui-number-input-affix is-prefix"><slot name="prefix"/></span>
    <input v-bind="inputAttrs" :id="controlId" ref="inputRef" class="ui-number-input-native" type="text" role="spinbutton" inputmode="decimal" autocomplete="off" :value="draft" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :aria-valuemin="Number.isFinite(lowerBound)?lowerBound:undefined" :aria-valuemax="Number.isFinite(upperBound)?upperBound:undefined" :aria-valuenow="Number.isFinite(modelValue)?modelValue:undefined" :aria-valuetext="Number.isFinite(modelValue)?format(modelValue):undefined" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" @input="onInput" @keydown="onKeydown" @wheel="onWheel" @focus="onFocus" @blur="onBlur"/>
    <span v-if="$slots.suffix" class="ui-number-input-affix is-suffix"><slot name="suffix"/></span>
    <button v-if="controls&&controlsPosition==='sides'" type="button" class="ui-number-input-control is-increase" :disabled="disabled||readonly||atMax" :aria-label="t('number.increase')" :aria-controls="controlId" @mousedown.prevent @click="stepBy(1)"><AppIcon name="plus" :size="14"/></button>
    <span v-if="controls&&controlsPosition==='right'" class="ui-number-input-controls">
      <button type="button" class="ui-number-input-control is-increase" :disabled="disabled||readonly||atMax" :aria-label="t('number.increase')" :aria-controls="controlId" @mousedown.prevent @click="stepBy(1)"><AppIcon class="ui-number-input-up" name="chevronDown" :size="12"/></button>
      <button type="button" class="ui-number-input-control is-decrease" :disabled="disabled||readonly||atMin" :aria-label="t('number.decrease')" :aria-controls="controlId" @mousedown.prevent @click="stepBy(-1)"><AppIcon name="chevronDown" :size="12"/></button>
    </span>
  </span>
</template>

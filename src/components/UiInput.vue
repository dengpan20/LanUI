<script setup>
import { computed, inject, nextTick, onMounted, ref, toRef, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number],default:''},
  type:{type:String,default:'text'},
  placeholder:String,
  icon:String,
  size:{type:String,default:''},
  clearable:Boolean,
  passwordToggle:Boolean,
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:Boolean,
  maxlength:[String,Number],
  minlength:[String,Number],
  name:String,
  form:String,
  autocomplete:String,
  inputMode:String,
  pattern:String,
  min:[String,Number],
  max:[String,Number],
  step:[String,Number],
  required:Boolean,
  autofocus:Boolean,
  selectOnFocus:Boolean,
  showCount:Boolean,
  formatter:Function,
  parser:Function,
  modelModifiers:{type:Object,default:()=>({})},
  clearValue:{type:[String,Number],default:''},
  clearOnEscape:Boolean,
  ariaLabel:String,
  passwordVisible:{type:Boolean,default:undefined},
  defaultPasswordVisible:Boolean,
})
const emit=defineEmits([
  'update:modelValue','input','change','clear','focus','blur','keydown','enter','invalid',
  'composition-start','composition-end','update:passwordVisible','password-visibility-change',
])
const attrs=useAttrs()
const slots=useSlots()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const inputRef=ref(null)
const focused=ref(false)
const composing=ref(false)
const skipNextInput=ref(null)
const draft=ref('')
const internalPasswordVisible=ref(props.defaultPasswordVisible)
const suppressNativeChange=ref(false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()

const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-input-${uid}`)
const countId=computed(()=>`${controlId.value}-count`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const baseDescribedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||'')
const describedby=computed(()=>[baseDescribedby.value,props.showCount?countId.value:''].filter(Boolean).join(' ')||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const resolvedPasswordVisible=computed(()=>props.passwordVisible===undefined?internalPasswordVisible.value:props.passwordVisible)
const actualType=computed(()=>props.passwordToggle&&props.type==='password'&&resolvedPasswordVisible.value?'text':props.type)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||undefined)
const safeMaxlength=computed(()=>{
  if(props.maxlength===undefined||props.maxlength===null||props.maxlength==='')return undefined
  const value=Number(props.maxlength)
  return Number.isFinite(value)&&value>=0?Math.trunc(value):undefined
})
const count=computed(()=>String(draft.value??'').length)
const hasValue=computed(()=>String(draft.value??'').length>0)
const hasPrefix=computed(()=>Boolean(props.icon||slots.prefix))
const hasSuffix=computed(()=>Boolean(slots.suffix))
const hasActions=computed(()=>Boolean(props.loading||(props.passwordToggle&&props.type==='password'&&hasValue.value)||(props.clearable&&hasValue.value)))
const state=computed(()=>props.loading?'loading':props.disabled?'disabled':props.readonly?'readonly':resolvedInvalid.value?'invalid':focused.value?'focused':'ready')
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','value','type','placeholder','name','form','autocomplete','inputmode','pattern','min','max','step',
  'maxlength','minlength','required','autofocus','disabled','readonly','aria-label','aria-labelledby','aria-describedby',
  'aria-invalid','aria-busy','aria-required',
].includes(key))))

function valuesEqual(left,right){return Object.is(left,right)||String(left??'')===String(right??'')}
function editable(value){return value===null||value===undefined?'':String(value)}
function format(value){
  if(!props.formatter)return editable(value)
  try{return editable(props.formatter(value))}
  catch{return editable(value)}
}
function parse(input,source='input',report=true){
  const raw=String(input??'')
  let value=raw
  try{if(props.parser)value=props.parser(raw)}
  catch(error){if(report)emit('invalid',{reason:'parse',source,input:raw,error});return {valid:false,value:props.modelValue}}
  if(props.modelModifiers.trim&&typeof value==='string')value=value.trim()
  if(props.modelModifiers.number&&typeof value==='string'&&value!==''){
    const numeric=Number(value)
    if(Number.isFinite(numeric))value=numeric
  }
  return {valid:true,value}
}
function detail(source,value,previous=props.modelValue){return {source,value,previous,composing:composing.value}}
function syncFromModel(){draft.value=focused.value?editable(props.modelValue):format(props.modelValue)}
watch(()=>[props.modelValue,props.formatter],()=>{
  if(composing.value)return
  const current=parse(draft.value,'sync',false)
  if(!focused.value||!current.valid||!valuesEqual(current.value,props.modelValue))syncFromModel()
},{immediate:true})

function emitUpdate(value,source,{input=true,change=false,previous=props.modelValue}={}){
  const meta=detail(source,value,previous)
  if(!valuesEqual(value,previous))emit('update:modelValue',value)
  if(input)emit('input',value,meta)
  if(change)emit('change',value,meta)
  return meta
}
function onInput(event){
  draft.value=event.target.value
  if(composing.value)return
  if(skipNextInput.value!==null){
    const duplicate=skipNextInput.value===event.target.value
    skipNextInput.value=null
    if(duplicate)return
  }
  const result=parse(draft.value,'input')
  if(!result.valid)return
  const meta=detail('input',result.value)
  if(!props.modelModifiers.lazy&&!valuesEqual(result.value,props.modelValue))emit('update:modelValue',result.value)
  emit('input',result.value,meta)
}
function onChange(event){
  if(suppressNativeChange.value){suppressNativeChange.value=false;return}
  draft.value=event.target.value
  const result=parse(draft.value,'change')
  if(!result.valid)return
  const previous=props.modelValue
  if(props.modelModifiers.lazy&&!valuesEqual(result.value,previous))emit('update:modelValue',result.value)
  emit('change',result.value,detail('change',result.value,previous))
}
function onCompositionStart(event){composing.value=true;emit('composition-start',event)}
function onCompositionEnd(event){
  composing.value=false
  draft.value=event.target.value
  const result=parse(draft.value,'composition')
  if(result.valid){
    if(!props.modelModifiers.lazy&&!valuesEqual(result.value,props.modelValue))emit('update:modelValue',result.value)
    emit('input',result.value,detail('composition',result.value))
  }
  skipNextInput.value=event.target.value
  emit('composition-end',result.value,event)
}
function dispatchNativeChange(){
  if(typeof Event!=='function'||!inputRef.value)return
  suppressNativeChange.value=true
  inputRef.value.dispatchEvent(new Event('change',{bubbles:true}))
}
function setValue(value,source='api'){
  if(props.disabled||props.readonly)return false
  const previous=props.modelValue
  const changed=!valuesEqual(value,previous)
  draft.value=editable(value)
  emitUpdate(value,source,{change:true,previous})
  nextTick(dispatchNativeChange)
  return changed
}
function clear(source='clear'){
  if(props.disabled||props.readonly||props.loading)return false
  const previous=props.modelValue
  const value=props.clearValue
  const changed=!valuesEqual(value,previous)||hasValue.value
  draft.value=editable(value)
  const meta=emitUpdate(value,source,{change:true,previous})
  emit('clear',value,meta)
  nextTick(()=>{dispatchNativeChange();inputRef.value?.focus()})
  return changed
}
function togglePassword(source='control'){
  if(props.disabled||props.readonly||props.loading||props.type!=='password'||!props.passwordToggle)return false
  const previous=resolvedPasswordVisible.value
  const value=!previous
  if(props.passwordVisible===undefined)internalPasswordVisible.value=value
  emit('update:passwordVisible',value)
  emit('password-visibility-change',value,{source,previous})
  nextTick(()=>inputRef.value?.focus())
  return true
}
function onKeydown(event){
  emit('keydown',event)
  if(event.key==='Enter'&&!event.isComposing){
    const result=parse(draft.value,'enter')
    if(result.valid)emit('enter',result.value,event,detail('enter',result.value))
  }
  if(event.key==='Escape'&&props.clearOnEscape&&hasValue.value&&!props.disabled&&!props.readonly){event.preventDefault();clear('escape')}
}
function onFocus(event){
  focused.value=true
  draft.value=editable(props.modelValue)
  if(props.selectOnFocus)nextTick(()=>inputRef.value?.select())
  emit('focus',event,detail('focus',props.modelValue))
}
function onBlur(event){
  focused.value=false
  const result=parse(draft.value,'blur')
  if(result.valid){
    if(!valuesEqual(result.value,props.modelValue))emit('update:modelValue',result.value)
    draft.value=format(result.value)
  }else syncFromModel()
  emit('blur',event,detail('blur',result.value))
}
function focus(options){if(props.disabled)return false;inputRef.value?.focus(options);return Boolean(inputRef.value)}
function blur(){inputRef.value?.blur();return Boolean(inputRef.value)}
function select(){if(props.disabled)return false;inputRef.value?.select();return Boolean(inputRef.value)}

onMounted(()=>{if(props.autofocus)nextTick(()=>focus())})
defineExpose({root:rootRef,input:inputRef,focus,blur,select,clear,setValue,togglePassword})
</script>

<template>
  <span ref="rootRef" class="ui-input" :class="[`size-${resolvedSize}`,attrs.class,{focused,invalid:resolvedInvalid,disabled,readonly,loading,'has-prefix':hasPrefix,'has-suffix':hasSuffix,'has-actions':hasActions,'has-prepend':$slots.prepend,'has-append':$slots.append}]" :style="attrs.style" data-ui-input :data-state="state">
    <span v-if="$slots.prepend" class="ui-input-addon is-prepend"><slot name="prepend"/></span>
    <span class="ui-input-control">
      <span v-if="hasPrefix" class="ui-input-affix ui-input-prefix"><slot name="prefix"><AppIcon v-if="icon" :name="icon" :size="16"/></slot></span>
      <input v-bind="passthroughAttrs" :id="controlId" ref="inputRef" class="ui-input-native" :value="draft" :type="actualType" :placeholder="placeholder" :name="name" :form="form" :autocomplete="autocomplete" :inputmode="inputMode" :pattern="pattern" :min="min" :max="max" :step="step" :maxlength="safeMaxlength" :minlength="minlength" :required="resolvedRequired" :autofocus="autofocus" :disabled="disabled" :readonly="readonly" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-busy="loading||undefined" :aria-required="resolvedRequired||undefined" @input="onInput" @change="onChange" @compositionstart="onCompositionStart" @compositionend="onCompositionEnd" @keydown="onKeydown" @focus="onFocus" @blur="onBlur" />
      <span v-if="hasSuffix" class="ui-input-affix ui-input-suffix"><slot name="suffix"/></span>
      <span v-if="hasActions" class="ui-input-actions">
        <span v-if="loading" class="ui-input-loading" role="status" :aria-label="t('common.loading')"><slot name="loading"><span class="spinner ui-input-spinner"/></slot></span>
        <button v-else-if="passwordToggle&&type==='password'&&hasValue" type="button" class="ui-input-action" :aria-label="t(resolvedPasswordVisible?'input.hidePassword':'input.showPassword')" :aria-controls="controlId" :aria-pressed="resolvedPasswordVisible" @mousedown.prevent @click="togglePassword()"><slot name="password-icon" :visible="resolvedPasswordVisible"><AppIcon name="eye" :size="15"/></slot></button>
        <button v-else-if="clearable&&hasValue&&!disabled&&!readonly" type="button" class="ui-input-action clear-action" :aria-label="t('input.clear')" :aria-controls="controlId" @mousedown.prevent @click="clear()"><slot name="clear-icon"><AppIcon name="close" :size="13"/></slot></button>
      </span>
    </span>
    <span v-if="$slots.append" class="ui-input-addon is-append"><slot name="append"/></span>
    <span v-if="showCount" :id="countId" class="ui-input-count" aria-live="polite">{{ safeMaxlength===undefined?count:`${count}/${safeMaxlength}` }}</span>
  </span>
</template>

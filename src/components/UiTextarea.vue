<script setup>
import { computed, inject, nextTick, onMounted, ref, toRef, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:String,default:''},
  placeholder:String,
  rows:{type:Number,default:3},
  maxlength:[String,Number],
  minlength:[String,Number],
  showCount:Boolean,
  size:{type:String,default:''},
  resize:{type:String,default:'vertical'},
  autoSize:{type:[Boolean,Object],default:false},
  clearable:Boolean,
  clearOnEscape:Boolean,
  clearValue:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:Boolean,
  name:String,
  form:String,
  autocomplete:String,
  inputMode:String,
  wrap:String,
  required:Boolean,
  autofocus:Boolean,
  selectOnFocus:Boolean,
  spellcheck:{type:[Boolean,String],default:undefined},
  formatter:Function,
  parser:Function,
  modelModifiers:{type:Object,default:()=>({})},
  ariaLabel:String,
  submitOnEnter:{type:[Boolean,String],default:false},
})
const emit=defineEmits([
  'update:modelValue','input','change','clear','focus','blur','keydown','submit','invalid',
  'composition-start','composition-end','resize',
])
const attrs=useAttrs()
const slots=useSlots()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const textareaRef=ref(null)
const focused=ref(false)
const composing=ref(false)
const skipNextInput=ref(null)
const draft=ref('')
const suppressNativeChange=ref(false)
const lastHeight=ref('')
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()

const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-textarea-${uid}`)
const countId=computed(()=>`${controlId.value}-count`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const baseDescribedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||'')
const describedby=computed(()=>[baseDescribedby.value,props.showCount?countId.value:''].filter(Boolean).join(' ')||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||undefined)
const safeRows=computed(()=>Number.isFinite(Number(props.rows))&&Number(props.rows)>0?Math.trunc(Number(props.rows)):3)
const safeMaxlength=computed(()=>safeLength(props.maxlength))
const safeMinlength=computed(()=>safeLength(props.minlength))
const count=computed(()=>String(draft.value??'').length)
const hasValue=computed(()=>count.value>0)
const hasPrefix=computed(()=>Boolean(slots.prefix))
const hasSuffix=computed(()=>Boolean(slots.suffix))
const hasActions=computed(()=>Boolean(props.loading||(props.clearable&&hasValue.value&&!props.disabled&&!props.readonly)))
const hasFooter=computed(()=>Boolean(props.showCount||slots.footer))
const autosizeConfig=computed(()=>{
  if(!props.autoSize)return null
  const value=typeof props.autoSize==='object'&&props.autoSize?props.autoSize:{}
  const minRows=positiveInteger(value.minRows,safeRows.value)
  const maxRows=value.maxRows===undefined?Infinity:Math.max(minRows,positiveInteger(value.maxRows,minRows))
  return {minRows,maxRows}
})
const nativeStyle=computed(()=>({resize:autosizeConfig.value?'none':normalizeResize(props.resize)}))
const state=computed(()=>props.loading?'loading':props.disabled?'disabled':props.readonly?'readonly':resolvedInvalid.value?'invalid':focused.value?'focused':'ready')
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','value','placeholder','rows','maxlength','minlength','name','form','autocomplete','inputmode','wrap',
  'required','autofocus','spellcheck','disabled','readonly','aria-label','aria-labelledby','aria-describedby','aria-invalid',
  'aria-busy','aria-required',
].includes(key))))

function safeLength(value){
  if(value===undefined||value===null||value==='')return undefined
  const number=Number(value)
  return Number.isFinite(number)&&number>=0?Math.trunc(number):undefined
}
function positiveInteger(value,fallback){
  const number=Number(value)
  return Number.isFinite(number)&&number>0?Math.trunc(number):fallback
}
function normalizeResize(value){return ['none','horizontal','vertical','both'].includes(value)?value:'vertical'}
function valuesEqual(left,right){return String(left??'')===String(right??'')}
function editable(value){return value===null||value===undefined?'':String(value)}
function format(value){
  if(!props.formatter)return editable(value)
  try{return editable(props.formatter(editable(value)))}
  catch{return editable(value)}
}
function parse(input,source='input',report=true){
  const raw=editable(input)
  let value=raw
  try{if(props.parser)value=editable(props.parser(raw))}
  catch(error){if(report)emit('invalid',{reason:'parse',source,input:raw,error});return {valid:false,value:editable(props.modelValue)}}
  if(props.modelModifiers.trim)value=value.trim()
  return {valid:true,value}
}
function detail(source,value,previous=props.modelValue){return {source,value,previous:editable(previous),composing:composing.value}}
function syncFromModel(){draft.value=focused.value?editable(props.modelValue):format(props.modelValue)}
watch(()=>[props.modelValue,props.formatter],()=>{
  if(composing.value)return
  const current=parse(draft.value,'sync',false)
  if(!focused.value||!current.valid||!valuesEqual(current.value,props.modelValue))syncFromModel()
},{immediate:true})

function emitUpdate(value,source,{input=true,change=false,previous=props.modelValue}={}){
  const normalized=editable(value)
  const meta=detail(source,normalized,previous)
  if(!valuesEqual(normalized,previous))emit('update:modelValue',normalized)
  if(input)emit('input',normalized,meta)
  if(change)emit('change',normalized,meta)
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
  if(typeof Event!=='function'||!textareaRef.value)return
  suppressNativeChange.value=true
  textareaRef.value.dispatchEvent(new Event('change',{bubbles:true}))
}
function setValue(value,source='api'){
  if(props.disabled||props.readonly)return false
  const normalized=editable(value)
  const previous=props.modelValue
  const changed=!valuesEqual(normalized,previous)
  draft.value=normalized
  emitUpdate(normalized,source,{change:true,previous})
  nextTick(dispatchNativeChange)
  return changed
}
function clear(source='clear'){
  if(props.disabled||props.readonly||props.loading)return false
  const previous=props.modelValue
  const value=editable(props.clearValue)
  const changed=!valuesEqual(value,previous)||hasValue.value
  draft.value=value
  const meta=emitUpdate(value,source,{change:true,previous})
  emit('clear',value,meta)
  nextTick(()=>{dispatchNativeChange();textareaRef.value?.focus()})
  return changed
}
function matchesSubmit(event){
  if(event.key!=='Enter'||event.isComposing||!props.submitOnEnter)return false
  const mode=props.submitOnEnter===true?'ctrl-or-meta':props.submitOnEnter
  if(mode==='plain')return !event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey
  if(mode==='ctrl')return event.ctrlKey&&!event.metaKey
  if(mode==='meta')return event.metaKey&&!event.ctrlKey
  if(mode==='both')return event.ctrlKey&&event.metaKey
  return mode==='ctrl-or-meta'&&(event.ctrlKey||event.metaKey)
}
function onKeydown(event){
  emit('keydown',event)
  if(event.key==='Escape'&&props.clearOnEscape&&hasValue.value&&!props.disabled&&!props.readonly){event.preventDefault();clear('escape');return}
  if(!matchesSubmit(event))return
  event.preventDefault()
  const result=parse(draft.value,'submit')
  if(!result.valid)return
  if(props.modelModifiers.lazy&&!valuesEqual(result.value,props.modelValue))emit('update:modelValue',result.value)
  emit('submit',result.value,event,detail('submit',result.value))
}
function onFocus(event){
  focused.value=true
  draft.value=editable(props.modelValue)
  if(props.selectOnFocus)nextTick(()=>textareaRef.value?.select())
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
function resizeTextarea(source='api'){
  const textarea=textareaRef.value
  const config=autosizeConfig.value
  if(!textarea||!config)return false
  textarea.style.height='auto'
  let lineHeight=24
  let padding=20
  if(typeof window!=='undefined'&&typeof window.getComputedStyle==='function'){
    const computedStyle=window.getComputedStyle(textarea)
    const parsedLineHeight=Number.parseFloat(computedStyle.lineHeight)
    const fontSize=Number.parseFloat(computedStyle.fontSize)
    if(Number.isFinite(parsedLineHeight))lineHeight=parsedLineHeight
    else if(Number.isFinite(fontSize))lineHeight=fontSize*1.5
    padding=(Number.parseFloat(computedStyle.paddingTop)||0)+(Number.parseFloat(computedStyle.paddingBottom)||0)
  }
  const minHeight=Math.ceil(lineHeight*config.minRows+padding)
  const maxHeight=Number.isFinite(config.maxRows)?Math.ceil(lineHeight*config.maxRows+padding):Infinity
  const scrollHeight=Math.max(Number(textarea.scrollHeight)||0,minHeight)
  const height=Math.min(Math.max(scrollHeight,minHeight),maxHeight)
  const overflow=scrollHeight>maxHeight?'auto':'hidden'
  const nextHeight=`${height}px`
  textarea.style.height=nextHeight
  textarea.style.overflowY=overflow
  if(lastHeight.value!==nextHeight){
    lastHeight.value=nextHeight
    emit('resize',{source,height,scrollHeight,minRows:config.minRows,maxRows:config.maxRows,overflow})
  }
  return true
}
function resetAutosize(){
  if(!textareaRef.value)return
  textareaRef.value.style.height=''
  textareaRef.value.style.overflowY=''
  lastHeight.value=''
}
function scheduleResize(source){nextTick(()=>autosizeConfig.value?resizeTextarea(source):resetAutosize())}
function focus(options){if(props.disabled)return false;textareaRef.value?.focus(options);return Boolean(textareaRef.value)}
function blur(){textareaRef.value?.blur();return Boolean(textareaRef.value)}
function select(){if(props.disabled)return false;textareaRef.value?.select();return Boolean(textareaRef.value)}

watch(draft,()=>scheduleResize('content'),{flush:'post'})
watch(()=>[props.autoSize,props.rows],()=>scheduleResize('config'),{deep:true})
onMounted(()=>{scheduleResize('mount');if(props.autofocus)nextTick(()=>focus())})
defineExpose({root:rootRef,textarea:textareaRef,focus,blur,select,clear,setValue,resize:resizeTextarea})
</script>

<template>
  <span ref="rootRef" class="ui-textarea" :class="[`size-${resolvedSize}`,attrs.class,{focused,invalid:resolvedInvalid,disabled,readonly,loading,autosize:autosizeConfig,'has-prefix':hasPrefix,'has-suffix':hasSuffix,'has-actions':hasActions,'has-footer':hasFooter}]" :style="attrs.style" data-ui-textarea :data-state="state">
    <span class="ui-textarea-control">
      <span v-if="hasPrefix" class="ui-textarea-affix ui-textarea-prefix"><slot name="prefix" :value="draft" :focused="focused"/></span>
      <textarea v-bind="passthroughAttrs" :id="controlId" ref="textareaRef" class="ui-textarea-native" :value="draft" :rows="safeRows" :placeholder="placeholder" :maxlength="safeMaxlength" :minlength="safeMinlength" :name="name" :form="form" :autocomplete="autocomplete" :inputmode="inputMode" :wrap="wrap" :required="resolvedRequired" :autofocus="autofocus" :spellcheck="spellcheck" :disabled="disabled" :readonly="readonly" :style="nativeStyle" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-busy="loading||undefined" :aria-required="resolvedRequired||undefined" @input="onInput" @change="onChange" @compositionstart="onCompositionStart" @compositionend="onCompositionEnd" @keydown="onKeydown" @focus="onFocus" @blur="onBlur" />
      <span v-if="hasSuffix" class="ui-textarea-affix ui-textarea-suffix"><slot name="suffix" :value="draft" :focused="focused"/></span>
      <span v-if="hasActions" class="ui-textarea-actions">
        <span v-if="loading" class="ui-textarea-loading" role="status" :aria-label="t('common.loading')"><slot name="loading"><span class="spinner ui-textarea-spinner"/></slot></span>
        <button v-else-if="clearable&&hasValue&&!disabled&&!readonly" type="button" class="ui-textarea-action" :aria-label="t('input.clear')" :aria-controls="controlId" @mousedown.prevent @click="clear()"><slot name="clear-icon"><AppIcon name="close" :size="13"/></slot></button>
      </span>
    </span>
    <span v-if="hasFooter" class="ui-textarea-footer">
      <span v-if="$slots.footer" class="ui-textarea-footer-content"><slot name="footer" :value="draft" :count="count" :maxlength="safeMaxlength" :resize="resizeTextarea"/></span>
      <span v-if="showCount" :id="countId" class="ui-textarea-count" aria-live="polite"><slot name="count" :value="draft" :count="count" :maxlength="safeMaxlength">{{ safeMaxlength===undefined?count:`${count}/${safeMaxlength}` }}</slot></span>
    </span>
  </span>
</template>

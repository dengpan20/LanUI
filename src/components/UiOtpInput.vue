<script setup>
import { computed, inject, nextTick, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number],default:''},
  length:{type:Number,default:6},
  mode:{type:String,default:'numeric'},
  size:{type:String,default:''},
  placeholder:{type:String,default:''},
  mask:Boolean,
  uppercase:Boolean,
  separator:{type:String,default:''},
  separatorEvery:{type:Number,default:0},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  autofocus:Boolean,
  selectOnFocus:{type:Boolean,default:true},
  name:{type:String,default:''},
  autocomplete:{type:String,default:'one-time-code'},
  ariaLabel:{type:String,default:''},
  transform:Function,
})
const emit=defineEmits(['update:modelValue','input','change','complete','focus','blur','invalid'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const inputRefs=ref([])
const cells=ref([])
const composing=ref(false)
const focusedIndex=ref(-1)
const resolvedSize=useComponentSize(toRef(props,'size'))
const direction=useDirection()
const {t}=useLocale()

const resolvedLength=computed(()=>Math.min(12,Math.max(1,Number.isFinite(props.length)?Math.trunc(props.length):6)))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-otp-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedName=computed(()=>props.name||attrs.name||'')
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(!labelledby.value?t('otp.label'):undefined))
const resolvedInputMode=computed(()=>props.mode==='numeric'?'numeric':'text')
const value=computed(()=>cells.value.join(''))
const complete=computed(()=>cells.value.length===resolvedLength.value&&cells.value.every(Boolean))
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','type','value','maxlength','placeholder','autocomplete','inputmode','pattern',
  'aria-label','aria-labelledby','aria-describedby','aria-invalid','role',
].includes(key))))

function normalize(input){
  let text=String(input??'').normalize('NFKC')
  if(props.transform){
    try{text=String(props.transform(text)??'')}
    catch{text=String(input??'').normalize('NFKC')}
  }
  if(props.uppercase)text=text.toUpperCase()
  const accepted=Array.from(text).filter(character=>{
    if(props.mode==='numeric')return /^[0-9]$/.test(character)
    if(props.mode==='alphanumeric')return /^[0-9A-Za-z]$/.test(character)
    return !/^\s$/u.test(character)
  })
  return accepted.slice(0,resolvedLength.value)
}
function contiguous(input){
  const next=normalize(input)
  return Array.from({length:resolvedLength.value},(_,index)=>next[index]||'')
}
function syncFromModel(input){
  const normalized=normalize(input).join('')
  if(normalized===value.value&&cells.value.length===resolvedLength.value)return
  cells.value=contiguous(normalized)
}
watch(()=>[props.modelValue,props.length,props.mode,props.uppercase,props.transform],()=>syncFromModel(props.modelValue),{immediate:true})

function meta(source,index){return {source,index,value:value.value,complete:complete.value}}
function commit(next,source,index,{emitInput=true}={}){
  const previous=value.value
  cells.value=next.slice(0,resolvedLength.value)
  while(cells.value.length<resolvedLength.value)cells.value.push('')
  const current=value.value
  const detail=meta(source,index)
  if(current!==previous)emit('update:modelValue',current)
  if(emitInput&&current!==previous)emit('input',current,detail)
  if(current!==previous)emit('change',current,{...detail,previous})
  if(detail.complete&&current!==previous)emit('complete',current,detail)
  return detail
}
function focus(index){
  if(props.disabled)return false
  const fallback=Math.max(0,cells.value.findIndex(character=>!character))
  const target=Number.isFinite(index)?Math.min(resolvedLength.value-1,Math.max(0,Math.trunc(index))):fallback
  inputRefs.value[target]?.focus()
  return Boolean(inputRefs.value[target])
}
function blur(){inputRefs.value.forEach(input=>input?.blur())}
function clear(source='api'){
  if(props.disabled||props.readonly)return false
  const changed=Boolean(value.value)
  commit(Array(resolvedLength.value).fill(''),source,0)
  nextTick(()=>focus(0))
  return changed
}
function setValue(input,source='api'){
  if(props.disabled||props.readonly)return false
  const next=contiguous(input)
  const changed=next.join('')!==value.value
  commit(next,source,Math.min(next.filter(Boolean).length,resolvedLength.value-1))
  return changed
}
function apply(index,input,source){
  const accepted=normalize(input)
  if(!accepted.length&&String(input??'')){
    emit('invalid',{source,index,input:String(input),mode:props.mode})
    cells.value=[...cells.value]
    return false
  }
  const next=[...cells.value]
  if(!accepted.length)next[index]=''
  else for(let offset=0;offset<accepted.length&&index+offset<resolvedLength.value;offset+=1)next[index+offset]=accepted[offset]
  const detail=commit(next,source,index)
  const target=detail.complete?Math.min(resolvedLength.value-1,index+accepted.length-1):Math.min(resolvedLength.value-1,index+Math.max(accepted.length,1))
  nextTick(()=>focus(target))
  return true
}
function onInput(event,index){
  if(composing.value)return
  apply(index,event.target.value,'input')
}
function onPaste(event,index){
  if(props.disabled||props.readonly)return
  event.preventDefault()
  apply(index,event.clipboardData?.getData('text')||'','paste')
}
function onKeydown(event,index){
  if(props.disabled||props.readonly)return
  const previous=Math.max(0,index-1)
  const next=Math.min(resolvedLength.value-1,index+1)
  if(event.key==='Backspace'){
    event.preventDefault()
    const target=cells.value[index]?index:previous
    const draft=[...cells.value];draft[target]='';commit(draft,'backspace',target);nextTick(()=>focus(target));return
  }
  if(event.key==='Delete'){
    event.preventDefault();const draft=[...cells.value];draft[index]='';commit(draft,'delete',index);return
  }
  const backward=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  const forward=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  if(event.key===backward){event.preventDefault();focus(previous);return}
  if(event.key===forward){event.preventDefault();focus(next);return}
  if(event.key==='Home'){event.preventDefault();focus(0);return}
  if(event.key==='End'){event.preventDefault();focus(resolvedLength.value-1);return}
  if(event.key==='Enter'&&complete.value){event.preventDefault();emit('complete',value.value,meta('enter',index))}
}
function onFocus(event,index){
  focusedIndex.value=index
  if(props.selectOnFocus)event.target.select()
  emit('focus',event,meta('focus',index))
}
function onBlur(event,index){
  nextTick(()=>{
    if(typeof document==='undefined'||!rootRef.value?.contains(document.activeElement)){
      focusedIndex.value=-1
      emit('blur',event,meta('blur',index))
    }
  })
}
function cellLabel(index){return t('otp.position',{index:index+1,total:resolvedLength.value})}
function showSeparator(index){return props.separator&&props.separatorEvery>0&&index<resolvedLength.value-1&&(index+1)%props.separatorEvery===0}

onMounted(()=>{if(props.autofocus)nextTick(()=>focus())})
defineExpose({root:rootRef,inputs:inputRefs,focus,blur,clear,setValue})
</script>

<template>
  <span ref="rootRef" class="ui-otp-input" :class="[`size-${resolvedSize}`,attrs.class,{disabled,readonly,invalid:resolvedInvalid,complete,'is-focused':focusedIndex>=0}]" :style="[attrs.style,{'--ui-otp-length':resolvedLength}]" role="group" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-disabled="disabled||undefined" :aria-readonly="readonly||undefined">
    <template v-for="(_,index) in resolvedLength" :key="index">
      <input v-bind="passthroughAttrs" :id="index===0?controlId:`${controlId}-${index+1}`" :ref="element=>inputRefs[index]=element" class="ui-otp-input-cell" :type="mask?'password':'text'" :value="cells[index]||''" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :inputmode="resolvedInputMode" :autocomplete="index===0?autocomplete:'off'" maxlength="1" :aria-label="cellLabel(index)" :aria-invalid="resolvedInvalid||undefined" @input="onInput($event,index)" @paste="onPaste($event,index)" @keydown="onKeydown($event,index)" @focus="onFocus($event,index)" @blur="onBlur($event,index)" @compositionstart="composing=true" @compositionend="composing=false;onInput($event,index)" />
      <span v-if="showSeparator(index)" class="ui-otp-input-separator" aria-hidden="true">{{ separator }}</span>
    </template>
    <input v-if="resolvedName" type="hidden" :name="resolvedName" :value="value" />
    <span class="sr-only" aria-live="polite">{{ complete?t('otp.complete'):'' }}</span>
  </span>
</template>

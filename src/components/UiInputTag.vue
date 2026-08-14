<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:Array,default:()=>[]},
  placeholder:{type:String,default:''},
  size:{type:String,default:''},
  separators:{type:Array,default:()=>[',','，',';','；','\n']},
  submitKeys:{type:Array,default:()=>['Enter']},
  addOnBlur:{type:Boolean,default:true},
  addOnTab:Boolean,
  trim:{type:Boolean,default:true},
  allowDuplicates:Boolean,
  caseSensitive:Boolean,
  maxTags:{type:Number,default:0},
  maxLength:{type:Number,default:0},
  editable:Boolean,
  clearable:Boolean,
  collapseTags:Boolean,
  maxVisibleTags:{type:Number,default:3},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:Boolean,
  autofocus:Boolean,
  name:{type:String,default:''},
  autocomplete:{type:String,default:'off'},
  inputmode:{type:String,default:'text'},
  ariaLabel:{type:String,default:''},
  transform:Function,
  validate:Function,
  beforeAdd:Function,
})
const emit=defineEmits(['update:modelValue','input','change','add','remove','edit','clear','invalid','focus','blur'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const inputRef=ref(null)
const editInputRef=ref(null)
const draft=ref('')
const editDraft=ref('')
const editIndex=ref(-1)
const activeIndex=ref(-1)
const composing=ref(false)
const focused=ref(false)
const pendingCount=ref(0)
const liveMessage=ref('')
const blurTimer=ref(0)
let addQueue=Promise.resolve([])
const resolvedSize=useComponentSize(toRef(props,'size'))
const direction=useDirection()
const {t}=useLocale()

const tags=computed(()=>props.modelValue.map(value=>String(value??'')))
const maxTags=computed(()=>Math.max(0,Number.isFinite(props.maxTags)?Math.trunc(props.maxTags):0))
const maxLength=computed(()=>Math.max(0,Number.isFinite(props.maxLength)?Math.trunc(props.maxLength):0))
const visibleLimit=computed(()=>Math.max(0,Number.isFinite(props.maxVisibleTags)?Math.trunc(props.maxVisibleTags):3))
const busy=computed(()=>props.loading||pendingCount.value>0)
const resolvedPlaceholder=computed(()=>props.placeholder||t('inputTag.placeholder'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-input-tag-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedName=computed(()=>props.name||attrs.name||'')
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(!labelledby.value?t('inputTag.label'):undefined))
const collapsed=computed(()=>props.collapseTags&&!focused.value&&tags.value.length>visibleLimit.value)
const visibleTags=computed(()=>collapsed.value?tags.value.slice(0,visibleLimit.value):tags.value)
const hiddenCount=computed(()=>Math.max(0,tags.value.length-visibleTags.value.length))
const inputSize=computed(()=>Math.min(32,Math.max(1,Array.from(draft.value).length+1)))
const mutationDisabled=computed(()=>props.disabled||props.readonly||busy.value)
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','type','value','maxlength','placeholder','autocomplete','inputmode','role',
  'aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-disabled','aria-readonly','aria-busy',
].includes(key))))
const separatorList=computed(()=>[...new Set(props.separators.map(value=>String(value)).filter(Boolean))].sort((a,b)=>b.length-a.length))
const separatorPattern=computed(()=>separatorList.value.length?new RegExp(separatorList.value.map(escapeRegExp).join('|'),'gu'):null)
const trailingSeparatorPattern=computed(()=>separatorList.value.length?new RegExp(`(?:${separatorList.value.map(escapeRegExp).join('|')})$`,'u'):null)

function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function valuesEqual(left,right){return left.length===right.length&&left.every((value,index)=>value===right[index])}
function comparisonKey(value){return props.caseSensitive?value:value.toLocaleLowerCase()}
function focus(){if(props.disabled)return false;inputRef.value?.focus();return Boolean(inputRef.value)}
function blur(){inputRef.value?.blur();editInputRef.value?.blur()}
function announce(message){liveMessage.value='';nextTick(()=>{liveMessage.value=message})}
function invalidCandidate(value,reason,source,message,index){
  const resolvedMessage=message||t(`inputTag.${reason}`,{value,max:maxTags.value,length:maxLength.value})
  announce(resolvedMessage)
  emit('invalid',{value,reason,source,index,message:resolvedMessage})
  return null
}
function normalizeCandidate(input,source,index){
  let value=String(input??'').normalize('NFKC')
  if(props.trim)value=value.trim()
  if(props.transform){
    try{value=String(props.transform(value,{source,index,values:[...tags.value]})??'')}
    catch(error){return invalidCandidate(value,'transformError',source,error?.message,index)}
    if(props.trim)value=value.trim()
  }
  if(!value)return null
  if(maxLength.value&&Array.from(value).length>maxLength.value)return invalidCandidate(value,'tooLong',source,'',index)
  return value
}
async function acceptCandidate(value,current,source,index,{ignoreIndex=-1}={}){
  if(maxTags.value&&current.length>=maxTags.value)return invalidCandidate(value,'maxReached',source,'',index)
  const key=comparisonKey(value)
  const duplicate=current.some((item,itemIndex)=>itemIndex!==ignoreIndex&&comparisonKey(item)===key)
  if(!props.allowDuplicates&&duplicate)return invalidCandidate(value,'duplicate',source,'',index)
  if(props.validate){
    let result
    try{result=await props.validate(value,{source,index,values:[...current]})}
    catch(error){return invalidCandidate(value,'validationError',source,error?.message,index)}
    if(result===false||typeof result==='string')return invalidCandidate(value,'validationFailed',source,typeof result==='string'?result:'',index)
  }
  if(props.beforeAdd){
    let result
    try{result=await props.beforeAdd(value,{source,index,values:[...current]})}
    catch(error){return invalidCandidate(value,'addError',source,error?.message,index)}
    if(result===false||typeof result==='string')return invalidCandidate(value,'addRejected',source,typeof result==='string'?result:'',index)
  }
  return value
}
function splitTokens(value){return separatorPattern.value?String(value).split(separatorPattern.value):[String(value)]}
function containsSeparator(value){separatorPattern.value.lastIndex=0;return separatorPattern.value.test(String(value))}
function emitChange(next,source,detail={}){
  const previous=[...tags.value]
  if(valuesEqual(previous,next))return false
  emit('update:modelValue',next)
  emit('change',next,{source,previous,...detail})
  return true
}
async function performAdd(values,source='api'){
  if(props.disabled||props.readonly||props.loading)return []
  const candidates=Array.isArray(values)?values:[values]
  const current=[...tags.value]
  const added=[]
  pendingCount.value+=1
  try{
    for(let index=0;index<candidates.length;index+=1){
      const normalized=normalizeCandidate(candidates[index],source,index)
      if(!normalized)continue
      const accepted=await acceptCandidate(normalized,current,source,index)
      if(!accepted)continue
      current.push(accepted);added.push(accepted)
      emit('add',accepted,{source,index:current.length-1,values:[...current]})
    }
    if(added.length){emitChange(current,source,{added:[...added]});announce(t('inputTag.added',{count:added.length}));await nextTick()}
    return added
  }finally{pendingCount.value=Math.max(0,pendingCount.value-1)}
}
function add(values,source='api'){
  const execute=()=>performAdd(values,source)
  addQueue=addQueue.then(execute,execute)
  return addQueue
}
function queueAdd(values,source){void add(values,source)}
function remove(index,source='api'){
  if(mutationDisabled.value||index<0||index>=tags.value.length)return false
  const next=[...tags.value]
  const [value]=next.splice(index,1)
  if(!emitChange(next,source,{removed:value,index}))return false
  activeIndex.value=Math.min(index-1,next.length-1)
  emit('remove',value,{source,index,values:next})
  announce(t('inputTag.removed',{value}))
  nextTick(()=>focus())
  return true
}
function clear(source='api'){
  if(mutationDisabled.value||!tags.value.length)return false
  const previous=[...tags.value]
  emit('update:modelValue',[]);emit('change',[],{source,previous,cleared:true});emit('clear',{source,previous})
  if(draft.value){draft.value='';if(inputRef.value)inputRef.value.value='';emit('input','',{source})}
  activeIndex.value=-1;announce(t('inputTag.cleared'));nextTick(()=>focus());return true
}
function beginEdit(index){
  if(!props.editable||mutationDisabled.value||index<0||index>=tags.value.length)return false
  editIndex.value=index;editDraft.value=tags.value[index];activeIndex.value=-1
  nextTick(()=>{editInputRef.value?.focus();editInputRef.value?.select()})
  return true
}
function setEditInput(element){editInputRef.value=element||null}
function cancelEdit(){editIndex.value=-1;editDraft.value='';nextTick(()=>focus())}
async function commitEdit(source='edit'){
  const index=editIndex.value
  if(index<0||mutationDisabled.value)return false
  const previousValue=tags.value[index]
  const normalized=normalizeCandidate(editDraft.value,source,index)
  if(!normalized)return false
  if(normalized===previousValue){cancelEdit();return false}
  const current=[...tags.value]
  pendingCount.value+=1
  try{
    const accepted=await acceptCandidate(normalized,current,source,index,{ignoreIndex:index})
    if(!accepted)return false
    current[index]=accepted
    emitChange(current,source,{edited:{index,previous:previousValue,value:accepted}})
    emit('edit',accepted,{source,index,previous:previousValue,values:current})
    announce(t('inputTag.edited',{value:accepted}))
    editIndex.value=-1;editDraft.value='';nextTick(()=>focus());return true
  }finally{pendingCount.value=Math.max(0,pendingCount.value-1)}
}
function onInput(event){
  const value=event.target.value
  activeIndex.value=-1
  if(composing.value){draft.value=value;return}
  if(!containsSeparator(value)){draft.value=value;emit('input',value,{source:'input'});return}
  const parts=splitTokens(value)
  const trailing=trailingSeparatorPattern.value?.test(value)
  draft.value=trailing?'':parts.pop()??''
  event.target.value=draft.value
  emit('input',draft.value,{source:'separator'})
  queueAdd(parts,'separator')
}
function onCompositionEnd(event){composing.value=false;onInput(event)}
function onPaste(event){
  if(mutationDisabled.value)return
  const value=event.clipboardData?.getData('text')||''
  if(!containsSeparator(value))return
  event.preventDefault();draft.value='';if(inputRef.value)inputRef.value.value='';emit('input','',{source:'paste'});queueAdd(splitTokens(value),'paste')
}
function moveActive(delta){
  if(!tags.value.length){activeIndex.value=-1;return}
  if(activeIndex.value<0)activeIndex.value=delta<0?tags.value.length-1:0
  else{const next=activeIndex.value+delta;activeIndex.value=next<0?0:next>=tags.value.length?-1:next}
  if(activeIndex.value>=0)announce(t('inputTag.selected',{value:tags.value[activeIndex.value]}))
}
function onKeydown(event){
  if(props.disabled||props.readonly)return
  if(composing.value||event.isComposing)return
  const submit=props.submitKeys.map(String).includes(event.key)||(props.addOnTab&&event.key==='Tab')
  if(submit&&draft.value){event.preventDefault();const value=draft.value;draft.value='';if(inputRef.value)inputRef.value.value='';emit('input','',{source:event.key.toLowerCase()});queueAdd(value,event.key.toLowerCase());return}
  const backward=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  const forward=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  if(!draft.value&&event.key===backward&&inputRef.value?.selectionStart===0){event.preventDefault();moveActive(-1);return}
  if(!draft.value&&event.key===forward&&activeIndex.value>=0){event.preventDefault();moveActive(1);return}
  if(!draft.value&&event.key==='Backspace'){
    event.preventDefault();if(activeIndex.value>=0)remove(activeIndex.value,'backspace');else moveActive(-1);return
  }
  if(!draft.value&&activeIndex.value>=0&&event.key==='Delete'){event.preventDefault();remove(activeIndex.value,'delete');return}
  if(activeIndex.value>=0&&(event.key==='Enter'||event.key==='F2')){event.preventDefault();beginEdit(activeIndex.value);return}
  if(event.key==='Escape'){activeIndex.value=-1;draft.value='';emit('input','',{source:'escape'})}
}
function onFocus(event){
  if(blurTimer.value){clearTimeout(blurTimer.value);blurTimer.value=0}
  const first=!focused.value;focused.value=true
  if(first)emit('focus',event,{values:[...tags.value]})
}
function onBlur(event){
  if(props.addOnBlur&&draft.value&&!composing.value){const value=draft.value;draft.value='';if(inputRef.value)inputRef.value.value='';emit('input','',{source:'blur'});queueAdd(value,'blur')}
  blurTimer.value=setTimeout(()=>{
    if(typeof document!=='undefined'&&rootRef.value?.contains(document.activeElement))return
    focused.value=false;activeIndex.value=-1;emit('blur',event,{values:[...tags.value]})
  },0)
}
function onEditKeydown(event){
  if(event.key==='Enter'){event.preventDefault();void commitEdit('edit-enter')}
  else if(event.key==='Escape'){event.preventDefault();cancelEdit()}
}
function tagId(index){return `ui-input-tag-item-${uid}-${index}`}

watch(()=>props.disabled,value=>{if(value){draft.value='';cancelEdit()}})
onMounted(()=>{if(props.autofocus)nextTick(()=>focus())})
onBeforeUnmount(()=>{if(blurTimer.value)clearTimeout(blurTimer.value)})
defineExpose({root:rootRef,input:inputRef,focus,blur,add,remove,clear,edit:beginEdit,cancelEdit,commitEdit})
</script>

<template>
  <div ref="rootRef" class="ui-input-tag" :class="[`size-${resolvedSize}`,attrs.class,{focused,disabled,readonly,invalid:resolvedInvalid,busy,'has-value':tags.length}]" :style="attrs.style" @click.self="focus">
    <span v-if="$slots.prefix" class="ui-input-tag-prefix"><slot name="prefix" /></span>
    <TransitionGroup tag="span" name="input-tag-list" class="ui-input-tag-list">
      <span v-for="(tag,index) in visibleTags" :id="tagId(index)" :key="`${tag}-${index}`" class="ui-input-tag-chip" :class="{active:index===activeIndex,editing:index===editIndex}" @click="activeIndex=index;focus()" @dblclick="beginEdit(index)">
        <input v-if="index===editIndex" :ref="setEditInput" v-model="editDraft" class="ui-input-tag-edit" :maxlength="maxLength||undefined" :aria-label="t('inputTag.edit',{value:tag})" @focus="onFocus" @blur="commitEdit('edit-blur')" @keydown="onEditKeydown" />
        <slot v-else name="tag" :tag="tag" :index="index" :remove="()=>remove(index,'slot')" :edit="()=>beginEdit(index)"><span class="ui-input-tag-label">{{ tag }}</span></slot>
        <button v-if="!disabled&&!readonly&&index!==editIndex" type="button" class="ui-input-tag-remove" :aria-label="t('inputTag.remove',{value:tag})" @click.stop="remove(index,'button')"><AppIcon name="close" :size="10" /></button>
      </span>
      <span v-if="hiddenCount" key="__collapsed" class="ui-input-tag-chip ui-input-tag-collapsed" :aria-label="t('inputTag.hidden',{count:hiddenCount})">+{{ hiddenCount }}</span>
    </TransitionGroup>
    <input v-bind="passthroughAttrs" :id="controlId" ref="inputRef" class="ui-input-tag-native" type="text" :value="draft" :size="inputSize" :maxlength="maxLength||undefined" :placeholder="tags.length?'':resolvedPlaceholder" :disabled="disabled" :readonly="readonly" :autocomplete="autocomplete" :inputmode="inputmode" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-disabled="disabled||undefined" :aria-readonly="readonly||undefined" :aria-busy="busy||undefined" @input="onInput" @paste="onPaste" @keydown="onKeydown" @focus="onFocus" @blur="onBlur" @compositionstart="composing=true" @compositionend="onCompositionEnd" />
    <span v-if="busy||clearable&&tags.length&&!disabled&&!readonly" class="ui-input-tag-actions">
      <span v-if="busy" class="ui-input-tag-spinner" role="status" :aria-label="t('inputTag.loading')" />
      <button v-else type="button" class="ui-input-tag-clear" :aria-label="t('inputTag.clear')" @click.stop="clear('button')"><AppIcon name="close" :size="14" /></button>
    </span>
    <template v-if="resolvedName"><input v-for="(tag,index) in tags" :key="`form-${index}`" type="hidden" :name="resolvedName" :value="tag" /></template>
    <span class="sr-only" aria-live="polite">{{ liveMessage }}</span>
  </div>
</template>

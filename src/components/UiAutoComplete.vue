<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useComponentSize, useDirection, useLocale } from '../config.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number],default:''},
  options:{type:Array,default:()=>[]},
  fetchSuggestions:Function,
  debounce:{type:Number,default:200},
  minChars:{type:Number,default:0},
  placeholder:{type:String,default:''},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  clearable:{type:Boolean,default:true},
  allowCustom:{type:Boolean,default:true},
  openOnFocus:{type:Boolean,default:true},
  highlightFirst:{type:Boolean,default:true},
  matchMode:{type:String,default:'contains',validator:value=>['contains','startsWith'].includes(value)},
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  placement:{type:String,default:'bottom-start',validator:value=>['top-start','top-end','bottom-start','bottom-end'].includes(value)},
  appendToBody:{type:Boolean,default:true},
  cache:{type:Boolean,default:true},
})
const emit=defineEmits(['update:modelValue','input','change','select','search','open-change','clear','focus','blur','load-error'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const inputRef=ref(null)
const panelRef=ref(null)
const open=ref(false)
const focused=ref(false)
const composing=ref(false)
const loading=ref(false)
const remoteError=ref(null)
const remoteOptions=ref([])
const activeIndex=ref(-1)
const draft=ref('')
const committedValue=ref(props.modelValue)
const committedDraft=ref('')
let debounceTimer=null
let requestController=null
let requestSequence=0
const requestCache=new Map()

const {t}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(toRef(props,'size'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-autocomplete-${uid}`)
const listboxId=`ui-autocomplete-list-${uid}`
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedPlaceholder=computed(()=>props.placeholder||t('autocomplete.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('autocomplete.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('autocomplete.loading'))
const normalizedOptions=computed(()=>props.options.map(normalizeOption))
const resolvedPlacement=computed(()=>{
  if(direction.value!=='rtl')return props.placement
  if(props.placement.endsWith('-start'))return props.placement.replace(/-start$/,'-end')
  if(props.placement.endsWith('-end'))return props.placement.replace(/-end$/,'-start')
  return props.placement
})
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-labelledby','aria-describedby'].includes(key))))

function normalizeOption(option){
  if(option&&typeof option==='object')return {label:String(option.label??option.value??''),value:option.value??option.label??'',disabled:!!option.disabled,keywords:Array.isArray(option.keywords)?option.keywords:[],description:option.description==null?'':String(option.description)}
  return {label:String(option),value:option,disabled:false,keywords:[],description:''}
}
function matches(option,query){
  const needle=String(query).trim().toLocaleLowerCase()
  if(!needle)return true
  const terms=[option.label,option.value,...option.keywords].map(value=>String(value??'').toLocaleLowerCase())
  return props.matchMode==='startsWith'?terms.some(term=>term.startsWith(needle)):terms.some(term=>term.includes(needle))
}
const localMatches=computed(()=>draft.value.length<Math.max(0,props.minChars)?[]:normalizedOptions.value.filter(option=>matches(option,draft.value)))
const suggestions=computed(()=>props.fetchSuggestions?remoteOptions.value:localMatches.value)
const optionId=index=>`ui-autocomplete-option-${uid}-${index}`
const activeDescendant=computed(()=>open.value&&activeIndex.value>=0&&suggestions.value[activeIndex.value]?optionId(activeIndex.value):undefined)
const menuWidth=computed(()=>`${Math.max(180,rootRef.value?.getBoundingClientRect().width||0)}px`)
const optionKey=(option,index)=>`${typeof option.value}:${String(option.value)}:${index}`

const {floatingStyle,resolvedPlacement:actualPlacement,update:updatePosition}=useFloatingPosition({
  triggerRef:rootRef,
  panelRef,
  open:computed(()=>open.value&&props.appendToBody),
  placement:resolvedPlacement,
  offset:6,
  zIndex:335,
})
const panelStyle=computed(()=>props.appendToBody?{...floatingStyle.value,width:menuWidth.value,minWidth:menuWidth.value}:undefined)

function initialDraft(value=props.modelValue){
  const option=normalizedOptions.value.find(item=>Object.is(item.value,value))
  return option?.label??String(value??'')
}
draft.value=initialDraft()
committedDraft.value=draft.value

function enabledIndex(start,delta){
  if(!suggestions.value.length)return -1
  let index=start
  for(let count=0;count<suggestions.value.length;count+=1){
    index=(index+delta+suggestions.value.length)%suggestions.value.length
    if(!suggestions.value[index]?.disabled)return index
  }
  return -1
}
function resetActive(){
  activeIndex.value=props.highlightFirst?enabledIndex(-1,1):-1
  nextTick(updatePosition)
}
function setOpen(value){
  if(props.disabled||props.readonly)value=false
  if(open.value===value)return
  open.value=value
  emit('open-change',value)
  if(value)resetActive()
  else activeIndex.value=-1
}
function abortRequest(){
  requestController?.abort()
  requestController=null
  loading.value=false
}
function clearDebounce(){if(debounceTimer){clearTimeout(debounceTimer);debounceTimer=null}}
function normalizedRemoteResult(result){return Array.isArray(result)?result.map(normalizeOption):[]}
async function loadSuggestions(query){
  if(!props.fetchSuggestions)return
  const text=String(query)
  emit('search',text)
  if(text.length<Math.max(0,props.minChars)){
    abortRequest();remoteOptions.value=[];remoteError.value=null;resetActive();return
  }
  if(props.cache&&requestCache.has(text)){
    abortRequest();remoteOptions.value=requestCache.get(text);remoteError.value=null;resetActive();return
  }
  abortRequest()
  const sequence=++requestSequence
  requestController=typeof AbortController==='undefined'?null:new AbortController()
  loading.value=true
  remoteError.value=null
  try{
    const result=await props.fetchSuggestions(text,{signal:requestController?.signal})
    if(sequence!==requestSequence||requestController?.signal.aborted)return
    const normalized=normalizedRemoteResult(result)
    remoteOptions.value=normalized
    if(props.cache)requestCache.set(text,normalized)
    resetActive()
  }catch(error){
    if(sequence!==requestSequence||error?.name==='AbortError'||requestController?.signal.aborted)return
    remoteOptions.value=[]
    remoteError.value=error
    emit('load-error',{error,query:text})
    resetActive()
  }finally{
    if(sequence===requestSequence){loading.value=false;requestController=null}
  }
}
function scheduleSuggestions(query,{immediate=false}={}){
  clearDebounce()
  if(!props.fetchSuggestions){emit('search',String(query));resetActive();return}
  const delay=immediate?0:Math.max(0,Number.isFinite(props.debounce)?props.debounce:200)
  if(!delay){void loadSuggestions(query);return}
  debounceTimer=setTimeout(()=>{debounceTimer=null;void loadSuggestions(query)},delay)
}
function onInput(event){
  const value=event.target.value
  draft.value=value
  if(composing.value||event.isComposing)return
  emit('input',value)
  if(props.allowCustom)emit('update:modelValue',value)
  setOpen(true)
  scheduleSuggestions(value)
}
function onCompositionEnd(event){
  composing.value=false
  draft.value=event.target.value
  emit('input',draft.value)
  if(props.allowCustom)emit('update:modelValue',draft.value)
  setOpen(true)
  scheduleSuggestions(draft.value)
}
function selectOption(option,index=activeIndex.value){
  if(!option||option.disabled)return
  draft.value=option.label
  committedValue.value=option.value
  committedDraft.value=option.label
  emit('update:modelValue',option.value)
  emit('input',option.label)
  emit('select',option)
  emit('change',option.value,{source:'option',option,index})
  setOpen(false)
  nextTick(()=>inputRef.value?.focus())
}
function restoreCommitted(){
  const value=committedValue.value
  draft.value=committedDraft.value
  if(!Object.is(props.modelValue,value))emit('update:modelValue',value)
}
function commitCustom(source='input'){
  if(!props.allowCustom){restoreCommitted();return}
  if(draft.value===committedDraft.value)return
  committedValue.value=draft.value
  committedDraft.value=draft.value
  emit('change',draft.value,{source})
}
function clear(event){
  event?.preventDefault();event?.stopPropagation()
  clearDebounce();abortRequest();requestSequence+=1
  draft.value='';committedValue.value='';committedDraft.value='';remoteOptions.value=[];remoteError.value=null
  emit('update:modelValue','');emit('input','');emit('change','',{source:'clear'});emit('clear')
  inputRef.value?.focus()
  if(focused.value){setOpen(true);scheduleSuggestions('',{immediate:true})}
}
function onFocus(event){
  focused.value=true
  committedValue.value=props.modelValue
  committedDraft.value=draft.value
  emit('focus',event)
  if(!props.disabled&&!props.readonly&&props.openOnFocus){setOpen(true);scheduleSuggestions(draft.value,{immediate:!draft.value})}
}
function onBlur(event){
  focused.value=false
  commitCustom('blur')
  setOpen(false)
  emit('blur',event)
}
function onKeydown(event){
  if(props.disabled||props.readonly||composing.value||event.isComposing||event.keyCode===229)return
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault()
    if(!open.value){setOpen(true);scheduleSuggestions(draft.value,{immediate:true})}
    else activeIndex.value=enabledIndex(activeIndex.value,event.key==='ArrowDown'?1:-1)
  }else if(open.value&&event.key==='Home'&&event.ctrlKey){event.preventDefault();activeIndex.value=enabledIndex(-1,1)}
  else if(open.value&&event.key==='End'&&event.ctrlKey){event.preventDefault();activeIndex.value=enabledIndex(0,-1)}
  else if(event.key==='Enter'){
    if(open.value&&activeIndex.value>=0&&suggestions.value[activeIndex.value]){event.preventDefault();selectOption(suggestions.value[activeIndex.value]);return}
    commitCustom('enter');setOpen(false)
  }else if(event.key==='Escape'&&open.value){event.preventDefault();setOpen(false)}
  else if(event.key==='Tab'&&open.value){commitCustom('tab');setOpen(false)}
}
function outside(event){
  if(rootRef.value?.contains(event.target)||panelRef.value?.contains(event.target))return
  setOpen(false)
}
function highlightSegments(label){
  const text=String(label)
  const needle=draft.value.trim()
  if(!needle)return [{text,match:false}]
  const source=text.toLocaleLowerCase();const query=needle.toLocaleLowerCase();const segments=[]
  let cursor=0,index=source.indexOf(query)
  while(index>=0){
    if(index>cursor)segments.push({text:text.slice(cursor,index),match:false})
    segments.push({text:text.slice(index,index+needle.length),match:true})
    cursor=index+needle.length;index=source.indexOf(query,cursor)
  }
  if(cursor<text.length)segments.push({text:text.slice(cursor),match:false})
  return segments.length?segments:[{text,match:false}]
}

watch(()=>props.modelValue,value=>{
  if(!focused.value){draft.value=initialDraft(value);committedValue.value=value;committedDraft.value=draft.value}
})
watch(suggestions,()=>{
  if(open.value)resetActive()
})
watch(()=>props.fetchSuggestions,()=>{clearDebounce();abortRequest();requestSequence+=1;requestCache.clear();remoteOptions.value=[];remoteError.value=null})
watch(()=>props.options,()=>requestCache.clear(),{deep:true})
onMounted(()=>document.addEventListener('pointerdown',outside))
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);clearDebounce();abortRequest();requestSequence+=1})
</script>

<template>
  <div ref="rootRef" class="ui-autocomplete" :class="[`size-${resolvedSize}`,attrs.class,{open,disabled,readonly,invalid:resolvedInvalid,loading}]" :style="attrs.style">
    <span class="ui-autocomplete-control">
      <AppIcon class="ui-autocomplete-search" name="search" :size="15"/>
      <input
        v-bind="controlAttrs"
        :id="controlId"
        ref="inputRef"
        class="ui-autocomplete-input"
        type="text"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :value="draft"
        :placeholder="resolvedPlaceholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-expanded="open"
        :aria-controls="open?listboxId:undefined"
        :aria-activedescendant="activeDescendant"
        :aria-labelledby="labelledby"
        :aria-describedby="describedby"
        :aria-invalid="resolvedInvalid||undefined"
        :aria-busy="loading||undefined"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
        @compositionstart="composing=true"
        @compositionend="onCompositionEnd"
      />
      <span v-if="loading" class="ui-autocomplete-spinner" aria-hidden="true"/>
      <button v-else-if="clearable&&draft&&!disabled&&!readonly" type="button" class="ui-autocomplete-clear" :aria-label="t('autocomplete.clear')" :aria-controls="controlId" @pointerdown.prevent @click="clear"><AppIcon name="close" :size="12"/></button>
      <span class="ui-autocomplete-arrow" aria-hidden="true"><AppIcon name="chevronDown" :size="14"/></span>
    </span>
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="autocomplete-menu">
        <div v-if="open" class="ui-autocomplete-portal" :class="{teleported:appendToBody}" :role="appendToBody?'region':undefined" :aria-label="appendToBody?t('autocomplete.suggestions'):undefined">
          <div :id="listboxId" ref="panelRef" class="ui-autocomplete-menu" :class="{'ui-floating-panel':appendToBody}" :style="panelStyle" :data-placement="actualPlacement" role="listbox" :aria-labelledby="labelledby" :aria-label="labelledby?undefined:t('autocomplete.suggestions')">
          <div v-if="loading" class="ui-autocomplete-status" role="status"><slot name="loading"><span class="ui-autocomplete-spinner" aria-hidden="true"/><span>{{ resolvedLoadingText }}</span></slot></div>
          <div v-else-if="remoteError" class="ui-autocomplete-status error" role="alert"><slot name="error" :error="remoteError"><AppIcon name="alert" :size="16"/><span>{{ t('autocomplete.error') }}</span></slot></div>
          <template v-else-if="suggestions.length">
            <button v-for="(option,index) in suggestions" :id="optionId(index)" :key="optionKey(option,index)" type="button" class="ui-autocomplete-option" :class="{active:index===activeIndex,selected:Object.is(option.value,modelValue)}" role="option" tabindex="-1" :aria-selected="Object.is(option.value,modelValue)" :disabled="option.disabled" @pointerdown.prevent @mouseenter="!option.disabled&&(activeIndex=index)" @click="selectOption(option,index)">
              <slot name="option" :option="option" :index="index" :active="index===activeIndex" :selected="Object.is(option.value,modelValue)" :segments="highlightSegments(option.label)">
                <span class="ui-autocomplete-option-copy"><span><template v-for="(segment,segmentIndex) in highlightSegments(option.label)" :key="segmentIndex"><mark v-if="segment.match">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></span><small v-if="option.description">{{ option.description }}</small></span>
                <AppIcon v-if="Object.is(option.value,modelValue)" name="check" :size="14"/>
              </slot>
            </button>
          </template>
            <div v-else class="ui-autocomplete-status"><slot name="empty"><AppIcon name="search" :size="18"/><span>{{ resolvedEmptyText }}</span></slot></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useComponentSize, useDirection, useLanUiConfig, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:Array,
  defaultValue:{type:Array,default:()=>[]},
  open:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  options:{type:Array,default:()=>[]},
  fieldNames:{type:Object,default:()=>({})},
  placeholder:{type:String,default:''},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:Boolean,
  clearable:Boolean,
  searchable:Boolean,
  filterOption:{type:[Boolean,Function],default:true},
  remoteMethod:Function,
  remoteDebounce:{type:Number,default:200},
  remoteMinChars:{type:Number,default:0},
  remoteCache:{type:Boolean,default:true},
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  errorText:{type:String,default:''},
  searchPlaceholder:{type:String,default:''},
  maxTagCount:{type:Number,default:2},
  maxCount:{type:Number,default:Infinity},
  minCount:{type:Number,default:0},
  hideSelected:Boolean,
  showSelectAll:Boolean,
  closeOnSelect:Boolean,
  clearSearchOnSelect:{type:Boolean,default:true},
  removeOnBackspace:{type:Boolean,default:true},
  placement:{type:String,default:'bottom-start',validator:value=>['top-start','top-end','bottom-start','bottom-end'].includes(value)},
  appendToBody:{type:Boolean,default:true},
  name:String,
  form:String,
  required:Boolean,
  autofocus:Boolean,
  ariaLabel:String,
})
const emit=defineEmits([
  'update:modelValue','update:open','input','change','select','deselect','remove','clear','search',
  'open-change','select-all','max','focus','blur','load-error','invalid',
])
const attrs=useAttrs()
const slots=useSlots()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const triggerRef=ref(null)
const panelRef=ref(null)
const searchInputRef=ref(null)
const nativeRef=ref(null)
const internalValue=ref(uniqueValues(props.modelValue===undefined?props.defaultValue:props.modelValue))
const internalOpen=ref(props.defaultOpen)
const activeIndex=ref(-1)
const query=ref('')
const focused=ref(false)
const composing=ref(false)
const remoteLoading=ref(false)
const remoteError=ref(null)
const remoteOptions=ref([])
const selectedMemory=ref(new Map())
const dropUp=ref(false)
let debounceTimer=null
let requestController=null
let requestSequence=0
let typeaheadTimer=null
let typeahead=''
let resetForm=null
const requestCache=new Map()

const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const config=useLanUiConfig()
const direction=useDirection()
const {t}=useLocale()
const resolvedSize=useComponentSize(toRef(props,'size'))
const resolvedValue=computed(()=>uniqueValues(props.modelValue===undefined?internalValue.value:props.modelValue))
const isControlledOpen=computed(()=>props.open!==undefined)
const resolvedOpen=computed(()=>isControlledOpen.value?props.open:internalOpen.value)
const resolvedLoading=computed(()=>props.loading||remoteLoading.value)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const resolvedPlaceholder=computed(()=>props.placeholder||t('multiselect.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('multiselect.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('multiselect.loading'))
const resolvedErrorText=computed(()=>props.errorText||t('multiselect.error'))
const resolvedSearchPlaceholder=computed(()=>props.searchPlaceholder||t('multiselect.search'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-multi-select-${uid}`)
const listboxId=`ui-multi-select-list-${uid}`
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||undefined)
const fieldMap=computed(()=>({
  label:props.fieldNames.label||'label',
  value:props.fieldNames.value||'value',
  disabled:props.fieldNames.disabled||'disabled',
  description:props.fieldNames.description||'description',
  keywords:props.fieldNames.keywords||'keywords',
}))
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','form','required','autofocus','disabled','readonly','aria-label','aria-labelledby',
  'aria-describedby','aria-invalid','aria-busy','aria-required','role','tabindex',
].includes(key))))
const state=computed(()=>props.disabled?'disabled':props.readonly?'readonly':resolvedLoading.value?'loading':remoteError.value?'error':resolvedInvalid.value?'invalid':resolvedOpen.value?'open':focused.value?'focused':'ready')
const maxSelectionCount=computed(()=>Number.isFinite(props.maxCount)?Math.max(0,Math.floor(props.maxCount)):Infinity)
const minSelectionCount=computed(()=>Number.isFinite(props.minCount)?Math.max(0,Math.floor(props.minCount)):0)
const visibleTagCount=computed(()=>Number.isFinite(props.maxTagCount)?Math.max(0,Math.floor(props.maxTagCount)):Infinity)

function valuesEqual(left,right){return Object.is(left,right)}
function includesValue(values,value){return values.some(item=>valuesEqual(item,value))}
function uniqueValues(values){
  const result=[]
  for(const value of Array.isArray(values)?values:[])if(!includesValue(result,value))result.push(value)
  return result
}
function arraysEqual(left,right){return left.length===right.length&&left.every((value,index)=>valuesEqual(value,right[index]))}
function normalizeOption(option,index,source='local'){
  if(option&&typeof option==='object'){
    const fields=fieldMap.value
    const value=option[fields.value]??option[fields.label]??''
    const keywords=option[fields.keywords]
    return {
      raw:option,
      key:option.key??value,
      label:String(option[fields.label]??value??''),
      value,
      disabled:Boolean(option[fields.disabled]),
      description:option[fields.description]==null?'':String(option[fields.description]),
      keywords:Array.isArray(keywords)?keywords:keywords==null?[]:[keywords],
      source,index,
    }
  }
  return {raw:option,key:option,label:String(option??''),value:option,disabled:false,description:'',keywords:[],source,index}
}
const localOptions=computed(()=>props.options.map((option,index)=>normalizeOption(option,index,'local')))
const normalizedRemoteOptions=computed(()=>remoteOptions.value.map((option,index)=>normalizeOption(option,index,'remote')))
const sourceOptions=computed(()=>props.remoteMethod?normalizedRemoteOptions.value:localOptions.value)

function publicOption(option){
  if(!option)return undefined
  return {key:option.key,label:option.label,value:option.value,disabled:option.disabled,description:option.description,keywords:[...option.keywords],raw:option.raw}
}
function rememberOption(option){
  if(!option)return
  const memory=new Map(selectedMemory.value)
  memory.set(option.value,option)
  selectedMemory.value=memory
}
function rememberOptions(options){
  const memory=new Map(selectedMemory.value)
  for(const option of options)if(includesValue(resolvedValue.value,option.value))memory.set(option.value,option)
  selectedMemory.value=memory
}
const allKnownOptions=computed(()=>[...localOptions.value,...normalizedRemoteOptions.value])
const selectedOptions=computed(()=>resolvedValue.value.map((value,index)=>{
  const found=allKnownOptions.value.find(option=>valuesEqual(option.value,value))||selectedMemory.value.get(value)
  return found||normalizeOption({label:String(value??''),value},index,'value')
}))
const hasValue=computed(()=>resolvedValue.value.length>0)
const visibleSelectedOptions=computed(()=>selectedOptions.value.slice(0,visibleTagCount.value))
const hiddenTagCount=computed(()=>Math.max(0,selectedOptions.value.length-visibleSelectedOptions.value.length))
const hasPrefix=computed(()=>Boolean(slots.prefix))
const hasSuffix=computed(()=>Boolean(slots.suffix))
const hasActions=computed(()=>Boolean(resolvedLoading.value||(props.clearable&&hasValue.value&&!props.disabled&&!props.readonly)))
const atLimit=computed(()=>resolvedValue.value.length>=maxSelectionCount.value)
function matches(option,text){
  if(props.filterOption===false)return true
  if(typeof props.filterOption==='function'){
    try{return props.filterOption(String(text),publicOption(option),option.index)!==false}
    catch(error){emitInvalid('filter-error','filter',{error,query:String(text)});return false}
  }
  const needle=String(text??'').trim().toLocaleLowerCase()
  if(!needle)return true
  return [option.label,option.value,option.description,...option.keywords]
    .map(value=>String(value??'').toLocaleLowerCase())
    .some(value=>value.includes(needle))
}
const filteredOptions=computed(()=>sourceOptions.value.filter(option=>{
  if(props.hideSelected&&includesValue(resolvedValue.value,option.value))return false
  if(props.remoteMethod)return true
  return !props.searchable||!query.value||matches(option,query.value)
}))
const enabledVisibleOptions=computed(()=>filteredOptions.value.filter(option=>!option.disabled))
const allVisibleSelected=computed(()=>Boolean(enabledVisibleOptions.value.length)&&enabledVisibleOptions.value.every(option=>includesValue(resolvedValue.value,option.value)))
const optionId=index=>`${listboxId}-option-${index}`
const optionIsDisabled=option=>Boolean(option?.disabled||(atLimit.value&&!includesValue(resolvedValue.value,option?.value)))
const activeDescendant=computed(()=>resolvedOpen.value&&activeIndex.value>=0&&filteredOptions.value[activeIndex.value]?optionId(activeIndex.value):undefined)
const menuWidth=computed(()=>`${Math.max(160,rootRef.value?.getBoundingClientRect().width||0)}px`)
const resolvedPlacement=computed(()=>{
  if(direction.value!=='rtl')return props.placement
  if(props.placement.endsWith('-start'))return props.placement.replace(/-start$/,'-end')
  if(props.placement.endsWith('-end'))return props.placement.replace(/-end$/,'-start')
  return props.placement
})
const {floatingStyle,resolvedPlacement:actualPlacement,update:updatePosition}=useFloatingPosition({
  triggerRef:rootRef,
  panelRef,
  open:computed(()=>resolvedOpen.value&&props.appendToBody),
  placement:resolvedPlacement,
  offset:6,
  zIndex:computed(()=>config.value.zIndex+55),
})
const panelStyle=computed(()=>props.appendToBody?{...floatingStyle.value,width:menuWidth.value,minWidth:menuWidth.value}:undefined)
const opensUp=computed(()=>props.appendToBody?actualPlacement.value.startsWith('top'):dropUp.value)

function openMeta(source,previous,nativeEvent){return {source,previous,query:query.value,nativeEvent}}
function emitInvalid(reason,source,extra={}){
  const payload={reason,source,value:[...resolvedValue.value],query:query.value,...extra}
  emit('invalid',payload)
  return false
}
function enabledIndex(start,delta){
  const options=filteredOptions.value
  if(!options.length)return -1
  let index=start
  for(let count=0;count<options.length;count+=1){
    index=(index+delta+options.length)%options.length
    if(!optionIsDisabled(options[index])||includesValue(resolvedValue.value,options[index]?.value))return index
  }
  return -1
}
function selectedIndex(){return filteredOptions.value.findIndex(option=>includesValue(resolvedValue.value,option.value)&&!option.disabled)}
function resetActive(){
  const index=selectedIndex()
  activeIndex.value=index>=0?index:enabledIndex(-1,1)
  nextTick(()=>{updatePosition();scrollToActive()})
}
function prepareOpen(){
  const rect=rootRef.value?.getBoundingClientRect()
  const viewportHeight=typeof innerHeight==='number'?innerHeight:0
  dropUp.value=props.placement.startsWith('top')||Boolean(rect&&viewportHeight-rect.bottom<260&&rect.top>260)
  resetActive()
  if(props.remoteMethod)reload(query.value,{source:'open',useCache:true})
  nextTick(()=>{if(props.searchable)searchInputRef.value?.focus();else triggerRef.value?.focus()})
}
function cleanupClose({focusTrigger=false}={}){
  activeIndex.value=-1
  if(props.searchable&&query.value){query.value='';emit('search','',{source:'close'});if(!props.remoteMethod)nextTick(updatePosition)}
  if(focusTrigger)nextTick(()=>triggerRef.value?.focus())
}
function setOpen(value,source='api',nativeEvent){
  const next=Boolean(value)
  if(next&&(props.disabled||props.readonly))return emitInvalid(props.disabled?'disabled':'readonly',source,{nativeEvent})
  const previous=resolvedOpen.value
  if(previous===next)return false
  if(!isControlledOpen.value){
    internalOpen.value=next
    if(next)prepareOpen()
    else cleanupClose({focusTrigger:source==='escape'||source==='select'})
  }
  emit('update:open',next)
  emit('open-change',next,openMeta(source,previous,nativeEvent))
  return true
}
function toggleOpen(source='api',nativeEvent){return setOpen(!resolvedOpen.value,source,nativeEvent)}
function dispatchNativeChange(){
  if(typeof Event!=='function'||!nativeRef.value)return
  nativeRef.value.dispatchEvent(new Event('input',{bubbles:true}))
  nativeRef.value.dispatchEvent(new Event('change',{bubbles:true}))
}
function changeMeta(source,previous,next,option,index,nativeEvent){return {source,previous:[...previous],next:[...next],option:publicOption(option),index,nativeEvent}}
function commitValues(values,source='api',option,index=-1,nativeEvent){
  if(props.disabled)return emitInvalid('disabled',source,{nativeEvent})
  if(props.readonly)return emitInvalid('readonly',source,{nativeEvent})
  if(resolvedLoading.value)return emitInvalid('loading',source,{nativeEvent})
  const next=uniqueValues(values)
  if(next.length>maxSelectionCount.value){
    const payload={source,maxCount:maxSelectionCount.value,value:[...resolvedValue.value],requested:next,nativeEvent}
    emit('max',payload);return emitInvalid('max-count',source,payload)
  }
  if(next.length<minSelectionCount.value)return emitInvalid('min-count',source,{minCount:minSelectionCount.value,requested:next,nativeEvent})
  const previous=resolvedValue.value
  const meta=changeMeta(source,previous,next,option,index,nativeEvent)
  if(props.modelValue===undefined)internalValue.value=next
  if(!arraysEqual(previous,next)){
    emit('update:modelValue',next)
    emit('input',next,meta)
    emit('change',next,meta)
    nextTick(dispatchNativeChange)
  }
  return meta
}
function clearQueryAfterSelect(){
  if(!props.clearSearchOnSelect||!query.value)return
  query.value=''
  scheduleRemote('','select')
}
function selectOption(option,index=activeIndex.value,source='api',nativeEvent){
  if(!option)return emitInvalid('unknown-option',source,{nativeEvent})
  if(option.disabled)return emitInvalid('option-disabled',source,{option:publicOption(option),nativeEvent})
  if(includesValue(resolvedValue.value,option.value))return deselectOption(option,index,source,nativeEvent)
  if(atLimit.value){
    const payload={source,maxCount:maxSelectionCount.value,value:[...resolvedValue.value],option:publicOption(option),nativeEvent}
    emit('max',payload);return emitInvalid('max-count',source,payload)
  }
  const next=[...resolvedValue.value,option.value]
  rememberOption(option)
  const meta=commitValues(next,source,option,index,nativeEvent)
  if(meta===false)return false
  emit('select',publicOption(option),meta)
  clearQueryAfterSelect()
  if(props.closeOnSelect)setOpen(false,'select',nativeEvent)
  else nextTick(()=>props.searchable?searchInputRef.value?.focus():triggerRef.value?.focus())
  return meta
}
function deselectOption(option,index=activeIndex.value,source='api',nativeEvent){
  if(!option)return emitInvalid('unknown-option',source,{nativeEvent})
  if(option.disabled)return emitInvalid('option-disabled',source,{option:publicOption(option),nativeEvent})
  const next=resolvedValue.value.filter(value=>!valuesEqual(value,option.value))
  if(next.length===resolvedValue.value.length)return false
  const meta=commitValues(next,source,option,index,nativeEvent)
  if(meta===false)return false
  emit('deselect',publicOption(option),meta)
  if(source==='tag'||source==='backspace')emit('remove',publicOption(option),meta)
  clearQueryAfterSelect()
  if(props.closeOnSelect)setOpen(false,'select',nativeEvent)
  else nextTick(()=>props.searchable?searchInputRef.value?.focus():triggerRef.value?.focus())
  return meta
}
function select(valueOrOption,source='api',nativeEvent){
  const value=valueOrOption&&typeof valueOrOption==='object'
    ?valueOrOption[fieldMap.value.value]??valueOrOption.value
    :valueOrOption
  const option=allKnownOptions.value.find(item=>valuesEqual(item.value,value))
  if(!option)return emitInvalid('unknown-option',source,{requested:value,nativeEvent})
  const index=filteredOptions.value.findIndex(item=>valuesEqual(item.value,value))
  return selectOption(option,index,source,nativeEvent)
}
function remove(valueOrOption,source='api',nativeEvent){
  const value=valueOrOption&&typeof valueOrOption==='object'
    ?valueOrOption[fieldMap.value.value]??valueOrOption.value
    :valueOrOption
  const option=selectedOptions.value.find(item=>valuesEqual(item.value,value))
  if(!option)return emitInvalid('unknown-option',source,{requested:value,nativeEvent})
  return deselectOption(option,-1,source,nativeEvent)
}
function setValue(values,source='api'){return commitValues(values,source)}
function clear(source='clear',nativeEvent){
  if(!hasValue.value)return false
  const previous=resolvedValue.value
  const meta=commitValues([],source,undefined,-1,nativeEvent)
  if(meta===false)return false
  selectedMemory.value=new Map()
  emit('clear',[],{...meta,previous:[...previous]})
  query.value=''
  nextTick(()=>triggerRef.value?.focus())
  return meta
}
function clearFromControl(event){event.preventDefault();event.stopPropagation();clear('clear',event)}
function removeTag(option,event){event.preventDefault();event.stopPropagation();deselectOption(option,-1,'tag',event)}
function toggleSelectAll(source='select-all',nativeEvent){
  const candidates=enabledVisibleOptions.value
  if(!candidates.length)return false
  const previous=resolvedValue.value
  let selected
  let next
  if(allVisibleSelected.value){
    const candidateValues=candidates.map(option=>option.value)
    next=previous.filter(value=>!includesValue(candidateValues,value))
    selected=false
    if(next.length<minSelectionCount.value)return emitInvalid('min-count',source,{minCount:minSelectionCount.value,requested:next,nativeEvent})
  }else{
    next=[...previous]
    for(const option of candidates){
      if(next.length>=maxSelectionCount.value)break
      if(!includesValue(next,option.value)){next.push(option.value);rememberOption(option)}
    }
    selected=true
  }
  const meta=commitValues(next,source,undefined,-1,nativeEvent)
  if(meta===false)return false
  emit('select-all',selected,next,meta)
  return meta
}

function clearDebounce(){if(debounceTimer){clearTimeout(debounceTimer);debounceTimer=null}}
function abortRequest(){requestController?.abort();requestController=null;remoteLoading.value=false}
async function loadRemote(text,{source='search',useCache=true}={}){
  if(!props.remoteMethod)return []
  const normalizedQuery=String(text??'')
  emit('search',normalizedQuery,{source})
  if(normalizedQuery.length<Math.max(0,props.remoteMinChars)){
    abortRequest();remoteOptions.value=[];remoteError.value=null;resetActive();return []
  }
  if(useCache&&props.remoteCache&&requestCache.has(normalizedQuery)){
    abortRequest();remoteOptions.value=requestCache.get(normalizedQuery);remoteError.value=null;rememberOptions(normalizedRemoteOptions.value);resetActive();return normalizedRemoteOptions.value.map(publicOption)
  }
  abortRequest()
  const sequence=++requestSequence
  requestController=typeof AbortController==='undefined'?null:new AbortController()
  remoteLoading.value=true
  remoteError.value=null
  try{
    const result=await props.remoteMethod(normalizedQuery,{signal:requestController?.signal})
    if(sequence!==requestSequence||requestController?.signal.aborted)return []
    const next=Array.isArray(result)?result:[]
    remoteOptions.value=next
    if(props.remoteCache)requestCache.set(normalizedQuery,next)
    rememberOptions(normalizedRemoteOptions.value)
    resetActive()
    return normalizedRemoteOptions.value.map(publicOption)
  }catch(error){
    if(sequence!==requestSequence||error?.name==='AbortError'||requestController?.signal.aborted)return []
    remoteOptions.value=[]
    remoteError.value=error
    emit('load-error',{error,query:normalizedQuery,source})
    emitInvalid('remote-error',source,{error,query:normalizedQuery})
    resetActive()
    return []
  }finally{
    if(sequence===requestSequence){remoteLoading.value=false;requestController=null}
  }
}
function scheduleRemote(text,source='search'){
  clearDebounce()
  if(!props.remoteMethod){emit('search',String(text??''),{source});resetActive();return}
  const delay=Math.max(0,Number.isFinite(props.remoteDebounce)?props.remoteDebounce:200)
  if(!delay){void loadRemote(text,{source});return}
  debounceTimer=setTimeout(()=>{debounceTimer=null;void loadRemote(text,{source})},delay)
}
function reload(text=query.value,{source='api',useCache=false}={}){
  clearDebounce()
  if(!props.remoteMethod){resetActive();return Promise.resolve(filteredOptions.value.map(publicOption))}
  return loadRemote(text,{source,useCache})
}
function onSearchInput(event){
  query.value=event.target.value
  if(composing.value||event.isComposing)return
  scheduleRemote(query.value,'input')
}
function onCompositionEnd(event){
  composing.value=false
  query.value=event.target.value
  scheduleRemote(query.value,'composition')
}
function closeOutside(event){
  if(rootRef.value?.contains(event.target)||panelRef.value?.contains(event.target))return
  setOpen(false,'outside',event)
}
function scrollToActive(){
  if(activeIndex.value<0||typeof document==='undefined')return false
  const element=document.getElementById(optionId(activeIndex.value))
  element?.scrollIntoView?.({block:'nearest'})
  return Boolean(element)
}
function moveActive(delta){activeIndex.value=enabledIndex(activeIndex.value,delta);nextTick(scrollToActive)}
function moveBoundary(end=false){activeIndex.value=enabledIndex(end?0:-1,end?-1:1);nextTick(scrollToActive)}
function findTypeahead(text){
  const needle=text.toLocaleLowerCase()
  const options=filteredOptions.value
  if(!needle||!options.length)return
  const start=Math.max(activeIndex.value,0)
  for(let offset=1;offset<=options.length;offset+=1){
    const index=(start+offset)%options.length
    if(!optionIsDisabled(options[index])&&options[index].label.toLocaleLowerCase().startsWith(needle)){activeIndex.value=index;nextTick(scrollToActive);return}
  }
}
function handleTypeahead(event){
  if(props.searchable||event.ctrlKey||event.metaKey||event.altKey||event.key.length!==1)return false
  typeahead+=event.key
  if(typeaheadTimer)clearTimeout(typeaheadTimer)
  typeaheadTimer=setTimeout(()=>{typeahead='';typeaheadTimer=null},500)
  if(!resolvedOpen.value)setOpen(true,'typeahead',event)
  findTypeahead(typeahead)
  return true
}
function removeLast(event){
  if(!props.removeOnBackspace||query.value)return false
  const option=[...selectedOptions.value].reverse().find(item=>!item.disabled)
  if(!option)return false
  event.preventDefault()
  return deselectOption(option,-1,'backspace',event)
}
function onKeydown(event){
  if(props.disabled)return
  if(props.readonly){
    if(['ArrowDown','ArrowUp','Enter',' ','Backspace'].includes(event.key)){event.preventDefault();emitInvalid('readonly','keyboard',{nativeEvent:event})}
    return
  }
  if(event.isComposing||event.keyCode===229)return
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault()
    if(!resolvedOpen.value)setOpen(true,'keyboard',event)
    else moveActive(event.key==='ArrowDown'?1:-1)
  }else if(event.key==='Home'&&resolvedOpen.value){event.preventDefault();moveBoundary(false)}
  else if(event.key==='End'&&resolvedOpen.value){event.preventDefault();moveBoundary(true)}
  else if((event.key==='Enter'||event.key===' ')&&!props.searchable){
    event.preventDefault()
    if(!resolvedOpen.value)setOpen(true,'keyboard',event)
    else if(activeIndex.value>=0)selectOption(filteredOptions.value[activeIndex.value],activeIndex.value,'keyboard',event)
  }else if(event.key==='Enter'&&resolvedOpen.value){
    if(activeIndex.value>=0){event.preventDefault();selectOption(filteredOptions.value[activeIndex.value],activeIndex.value,'keyboard',event)}
  }else if(event.key==='Backspace')removeLast(event)
  else if(event.key==='Escape'&&resolvedOpen.value){event.preventDefault();setOpen(false,'escape',event)}
  else if(event.key==='Tab'&&resolvedOpen.value)setOpen(false,'tab',event)
  else handleTypeahead(event)
}
function handleFocusIn(event){
  if(focused.value)return
  focused.value=true
  emit('focus',event,{value:[...resolvedValue.value],query:query.value})
}
function handleFocusOut(event){
  setTimeout(()=>{
    const active=typeof document==='undefined'?null:document.activeElement
    if(rootRef.value?.contains(active)||panelRef.value?.contains(active))return
    if(!focused.value)return
    focused.value=false
    emit('blur',event,{value:[...resolvedValue.value],query:query.value})
  },0)
}
function focus(options){if(props.disabled)return false;triggerRef.value?.focus(options);return Boolean(triggerRef.value)}
function blur(){searchInputRef.value?.blur();triggerRef.value?.blur();return Boolean(triggerRef.value)}
function show(source='api'){return setOpen(true,source)}
function hide(source='api'){return setOpen(false,source)}
function onNativeInvalid(event){emitInvalid('required','native',{nativeEvent:event});nextTick(()=>focus())}
function onFormReset(){
  const next=uniqueValues(props.defaultValue)
  const previous=resolvedValue.value
  if(props.modelValue===undefined)internalValue.value=next
  const meta=changeMeta('reset',previous,next,undefined,-1,undefined)
  emit('update:modelValue',next);emit('input',next,meta);emit('change',next,meta)
  selectedMemory.value=new Map();setOpen(false,'reset')
}

watch(()=>props.modelValue,value=>{
  if(value!==undefined)internalValue.value=uniqueValues(value)
  rememberOptions(allKnownOptions.value)
})
watch(localOptions,options=>{rememberOptions(options);if(resolvedOpen.value)resetActive()})
watch(filteredOptions,()=>{if(resolvedOpen.value)resetActive()})
watch(()=>props.open,(value,previous)=>{
  if(value===undefined||value===previous)return
  if(value)prepareOpen()
  else cleanupClose()
})
watch(()=>props.remoteMethod,()=>{clearDebounce();abortRequest();requestSequence+=1;requestCache.clear();remoteOptions.value=[];remoteError.value=null})

onMounted(()=>{
  document.addEventListener('pointerdown',closeOutside)
  resetForm=nativeRef.value?.form||null
  resetForm?.addEventListener('reset',onFormReset)
  rememberOptions(localOptions.value)
  if(props.autofocus)nextTick(()=>focus())
  if(resolvedOpen.value)prepareOpen()
})
onBeforeUnmount(()=>{
  document.removeEventListener('pointerdown',closeOutside)
  resetForm?.removeEventListener('reset',onFormReset)
  clearDebounce();abortRequest()
  if(typeaheadTimer)clearTimeout(typeaheadTimer)
})

defineExpose({
  root:rootRef,trigger:triggerRef,panel:panelRef,native:nativeRef,
  value:resolvedValue,open:resolvedOpen,query,loading:resolvedLoading,activeIndex,
  focus,blur,show,hide,toggle:toggleOpen,clear,select,remove,setValue,toggleSelectAll,reload,scrollToActive,
})
</script>

<template>
  <div ref="rootRef" class="ui-multi-select" :class="[`size-${resolvedSize}`,attrs.class,{open:resolvedOpen,'drop-up':opensUp,disabled,readonly,loading:resolvedLoading,invalid:resolvedInvalid,clearable,'has-prefix':hasPrefix,'has-suffix':hasSuffix,'has-actions':hasActions}]" :style="attrs.style" data-ui-multi-select :data-state="state" @focusin="handleFocusIn" @focusout="handleFocusOut" @keydown="onKeydown">
    <select v-if="name||resolvedRequired" ref="nativeRef" class="ui-multi-select-native" :name="name" :form="form" :required="resolvedRequired" :disabled="disabled" multiple tabindex="-1" aria-hidden="true" @invalid="onNativeInvalid">
      <option v-for="option in localOptions" :key="`native-${String(option.key)}`" :value="String(option.value)" :selected="includesValue(resolvedValue,option.value)">{{ option.label }}</option>
      <option v-for="option in selectedOptions.filter(item=>!localOptions.some(local=>valuesEqual(local.value,item.value)))" :key="`native-selected-${typeof option.value}-${String(option.value)}`" :value="String(option.value)" selected>{{ option.label }}</option>
    </select>
    <div v-bind="passthroughAttrs" :id="controlId" ref="triggerRef" class="control ui-multi-select-trigger" :tabindex="disabled?-1:0" role="combobox" aria-haspopup="listbox" :aria-expanded="resolvedOpen" :aria-controls="resolvedOpen&&!resolvedLoading&&!remoteError?listboxId:undefined" :aria-activedescendant="!searchable?activeDescendant:undefined" :aria-autocomplete="searchable?'list':undefined" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-disabled="disabled||undefined" :aria-invalid="resolvedInvalid||undefined" :aria-required="resolvedRequired||undefined" :aria-readonly="readonly||undefined" :aria-busy="resolvedLoading||undefined" @click="toggleOpen('pointer',$event)">
      <span v-if="hasPrefix" class="ui-multi-select-affix ui-multi-select-prefix"><slot name="prefix" :values="resolvedValue" :options="selectedOptions.map(publicOption)"/></span>
      <span v-if="hasValue" class="ui-multi-tags">
        <span v-for="option in visibleSelectedOptions" :key="`${typeof option.value}-${String(option.value)}`" class="ui-multi-tag" :class="{disabled:option.disabled}">
          <slot name="tag" :option="publicOption(option)" :remove="event=>removeTag(option,event)"><span class="ui-multi-tag-label">{{ option.label }}</span><button v-if="!disabled&&!readonly&&!option.disabled" type="button" :aria-label="t('multiselect.remove',{label:option.label})" @mousedown.prevent @click="removeTag(option,$event)"><AppIcon name="close" :size="10"/></button></slot>
        </span>
        <span v-if="hiddenTagCount" class="ui-multi-tag ui-multi-overflow-tag"><slot name="overflow-tag" :count="hiddenTagCount" :options="selectedOptions.slice(visibleTagCount).map(publicOption)">+{{ hiddenTagCount }}</slot></span>
      </span>
      <span v-else class="placeholder ui-multi-placeholder"><slot name="placeholder">{{ resolvedPlaceholder }}</slot></span>
      <span v-if="hasSuffix" class="ui-multi-select-affix ui-multi-select-suffix"><slot name="suffix" :values="resolvedValue" :options="selectedOptions.map(publicOption)"/></span>
      <span class="ui-multi-select-arrow" aria-hidden="true"><slot name="arrow" :open="resolvedOpen"><AppIcon name="chevronDown" :size="15"/></slot></span>
    </div>
    <span v-if="resolvedLoading" class="ui-multi-select-loading" role="status" :aria-label="resolvedLoadingText"><slot name="loading"><span class="spinner ui-multi-select-spinner"/></slot></span>
    <button v-else-if="clearable&&hasValue&&!disabled&&!readonly" type="button" class="ui-multi-select-clear" :aria-label="t('multiselect.clear')" :aria-controls="controlId" @mousedown.prevent @click="clearFromControl"><slot name="clear-icon"><AppIcon name="close" :size="12"/></slot></button>
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="select-menu">
        <div v-if="resolvedOpen" v-bind="portalThemeAttrs" class="ui-multi-select-portal" :style="portalThemeStyle" :role="appendToBody?'region':undefined" :aria-label="appendToBody?`${resolvedAriaLabel||resolvedPlaceholder} popup`:undefined" @focusin="handleFocusIn" @focusout="handleFocusOut" @keydown="onKeydown">
          <div ref="panelRef" class="ui-multi-menu" :class="{'ui-floating-panel':appendToBody}" :style="panelStyle" :data-placement="appendToBody?actualPlacement:(dropUp?'top-start':'bottom-start')" :dir="direction" :aria-busy="resolvedLoading||undefined">
            <label v-if="searchable" class="ui-multi-search"><AppIcon name="search" :size="14"/><input ref="searchInputRef" :value="query" type="search" autocomplete="off" :placeholder="resolvedSearchPlaceholder" :aria-label="resolvedSearchPlaceholder" :aria-controls="!resolvedLoading&&!remoteError?listboxId:undefined" :aria-activedescendant="activeDescendant" @input="onSearchInput" @compositionstart="composing=true" @compositionend="onCompositionEnd" @keydown.stop="onKeydown"/></label>
            <div v-if="resolvedLoading" class="ui-select-state ui-multi-loading-state" role="status" aria-live="polite"><slot name="loading"><span class="spinner ui-multi-select-spinner"/><span>{{ resolvedLoadingText }}</span></slot></div>
            <div v-else-if="remoteError" class="ui-select-state ui-multi-error" role="alert"><slot name="error" :error="remoteError" :retry="reload"><AppIcon name="warning" :size="18"/><span>{{ resolvedErrorText }}</span><button type="button" @click="reload(query)">{{ t('multiselect.retry') }}</button></slot></div>
            <button v-if="showSelectAll&&!resolvedLoading&&!remoteError&&enabledVisibleOptions.length" type="button" class="ui-multi-select-all" :aria-pressed="allVisibleSelected" @click="toggleSelectAll('pointer',$event)"><slot name="select-all" :selected="allVisibleSelected" :toggle="toggleSelectAll"><span class="ui-option-check"><AppIcon v-if="allVisibleSelected" name="check" :size="11"/></span><span>{{ t(allVisibleSelected?'multiselect.deselectAll':'multiselect.selectAll') }}</span></slot></button>
            <div v-if="!resolvedLoading&&!remoteError" :id="listboxId" class="ui-multi-options" role="listbox" aria-multiselectable="true" :aria-label="resolvedAriaLabel||resolvedPlaceholder">
              <template v-if="filteredOptions.length">
                <div v-for="(option,index) in filteredOptions" :id="optionId(index)" :key="`${option.source}-${typeof option.key}-${String(option.key)}-${option.index}`" class="ui-multi-option" :class="{selected:includesValue(resolvedValue,option.value),active:index===activeIndex,disabled:optionIsDisabled(option)}" role="option" :aria-selected="includesValue(resolvedValue,option.value)" :aria-disabled="optionIsDisabled(option)||undefined" @pointerdown.prevent @mouseenter="!optionIsDisabled(option)&&(activeIndex=index)" @click="selectOption(option,index,'pointer',$event)">
                  <slot name="option" :option="publicOption(option)" :index="index" :selected="includesValue(resolvedValue,option.value)" :active="index===activeIndex" :disabled="optionIsDisabled(option)">
                    <span class="ui-option-check"><AppIcon v-if="includesValue(resolvedValue,option.value)" name="check" :size="11"/></span>
                    <span class="ui-multi-option-copy"><span class="ui-multi-option-label">{{ option.label }}</span><span v-if="option.description" class="ui-multi-option-description">{{ option.description }}</span></span>
                  </slot>
                </div>
              </template>
              <div v-else class="ui-select-state ui-select-empty" role="option" aria-selected="false" aria-disabled="true"><slot name="empty" :query="query"><AppIcon name="search" :size="18"/><span>{{ resolvedEmptyText }}</span></slot></div>
            </div>
            <div v-if="$slots.footer" class="ui-select-footer"><slot name="footer" :query="query" :options="filteredOptions.map(publicOption)" :values="resolvedValue" :reload="reload"/></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

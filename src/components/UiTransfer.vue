<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiVirtualList from './UiVirtualList.vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:Array,
  defaultValue:{type:Array,default:()=>[]},
  selectedKeys:Array,
  defaultSelectedKeys:{type:Array,default:()=>[]},
  searchValues:Array,
  defaultSearchValues:{type:Array,default:()=>['','']},
  options:{type:Array,default:()=>[]},
  fieldNames:{type:Object,default:()=>({})},
  disabledKeys:{type:Array,default:()=>[]},
  titles:{type:Array,default:()=>[]},
  operations:{type:Array,default:()=>[]},
  searchable:Boolean,
  filterOption:{type:[Boolean,Function],default:true},
  showSelectAll:{type:Boolean,default:true},
  oneWay:Boolean,
  targetOrder:{type:String,default:'push',validator:value=>['original','push','unshift'].includes(value)},
  minCount:{type:Number,default:0},
  maxCount:{type:Number,default:Infinity},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:{type:[Boolean,Object],default:false},
  error:{type:[String,Boolean,Object],default:''},
  emptyText:{type:[String,Array],default:''},
  loadingText:{type:[String,Array],default:''},
  errorText:{type:[String,Array],default:''},
  searchPlaceholder:{type:[String,Array],default:''},
  listHeight:{type:[Number,String],default:196},
  itemHeight:{type:Number,default:32},
  overscan:{type:Number,default:4},
  measure:Boolean,
  name:String,
  form:String,
  required:Boolean,
  autofocus:Boolean,
  ariaLabel:String,
})
const emit=defineEmits([
  'update:modelValue','input','change','move','update:selectedKeys','selection-change',
  'update:searchValues','search','select-all','clear','limit','retry','focus','blur','invalid',
])
const attrs=useAttrs()
const slots=useSlots()
const formItem=inject('uiFormItemContext',null)
const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'')
const rootRef=ref(null)
const leftListRef=ref(null)
const rightListRef=ref(null)
const leftSearchRef=ref(null)
const rightSearchRef=ref(null)
const nativeRef=ref(null)
const internalValue=ref(uniqueValues(props.modelValue===undefined?props.defaultValue:props.modelValue))
const internalSelected=ref(uniqueValues(props.selectedKeys===undefined?props.defaultSelectedKeys:props.selectedKeys))
const internalSearch=ref(normalizePair(props.searchValues===undefined?props.defaultSearchValues:props.searchValues))
const activeIndexes=ref({left:0,right:0})
const composing=ref({left:false,right:false})
const focused=ref(false)
let resetForm=null

const {t,formatNumber}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(toRef(props,'size'))
const fieldMap=computed(()=>(
  {
    label:props.fieldNames.label||'label',
    value:props.fieldNames.value||'value',
    disabled:props.fieldNames.disabled||'disabled',
    description:props.fieldNames.description||'description',
    keywords:props.fieldNames.keywords||'keywords',
  }
))
const resolvedValue=computed(()=>uniqueValues(props.modelValue===undefined?internalValue.value:props.modelValue))
const resolvedSelected=computed(()=>uniqueValues(props.selectedKeys===undefined?internalSelected.value:props.selectedKeys))
const resolvedSearch=computed(()=>normalizePair(props.searchValues===undefined?internalSearch.value:props.searchValues))
const resolvedTitles=computed(()=>[props.titles[0]||t('transfer.available'),props.titles[1]||t('transfer.selected')])
const resolvedOperations=computed(()=>[props.operations[0]||t('transfer.add'),props.operations[1]||t('transfer.remove')])
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const minTargetCount=computed(()=>Number.isFinite(props.minCount)?Math.max(0,Math.floor(props.minCount)):0)
const maxTargetCount=computed(()=>Number.isFinite(props.maxCount)?Math.max(0,Math.floor(props.maxCount)):Infinity)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-transfer-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||t('transfer.label'))
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','form','required','autofocus','disabled','readonly','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-busy','aria-required','role','tabindex',
].includes(key))))

function valuesEqual(left,right){return Object.is(left,right)}
function includesValue(values,value){return values.some(item=>valuesEqual(item,value))}
function uniqueValues(values){
  const result=[]
  for(const value of Array.isArray(values)?values:[])if(!includesValue(result,value))result.push(value)
  return result
}
function arraysEqual(left,right){return left.length===right.length&&left.every((value,index)=>valuesEqual(value,right[index]))}
function normalizePair(value){return [String(Array.isArray(value)?value[0]??'':''),String(Array.isArray(value)?value[1]??'':'')]}
function sideIndex(side){return side==='left'?0:1}
function oppositeSide(side){return side==='left'?'right':'left'}
function normalizeOption(option,index){
  if(option&&typeof option==='object'){
    const fields=fieldMap.value
    const value=option[fields.value]??option[fields.label]??index
    const keywords=option[fields.keywords]
    return {
      raw:option,key:option.key??value,value,label:String(option[fields.label]??value??''),
      disabled:Boolean(option[fields.disabled]),description:option[fields.description]==null?'':String(option[fields.description]),
      keywords:Array.isArray(keywords)?keywords:keywords==null?[]:[keywords],sourceIndex:index,unknown:false,
    }
  }
  return {raw:option,key:option,value:option,label:String(option??''),disabled:false,description:'',keywords:[],sourceIndex:index,unknown:false}
}
const normalizedOptions=computed(()=>{
  const result=[]
  props.options.forEach((option,index)=>{
    const record=normalizeOption(option,index)
    if(!result.some(item=>valuesEqual(item.value,record.value)))result.push(record)
  })
  return result
})
function unknownOption(value,index){return {raw:value,key:value,value,label:String(value??''),disabled:false,description:'',keywords:[],sourceIndex:normalizedOptions.value.length+index,unknown:true}}
function publicOption(option){
  return option?{key:option.key,value:option.value,label:option.label,disabled:option.disabled,description:option.description,keywords:[...option.keywords],raw:option.raw,unknown:option.unknown}:undefined
}
const additionalDisabled=computed(()=>uniqueValues(props.disabledKeys))
function optionDisabled(option){return Boolean(props.disabled||props.readonly||option?.disabled||includesValue(additionalDisabled.value,option?.value))}
const leftBase=computed(()=>normalizedOptions.value.filter(option=>!includesValue(resolvedValue.value,option.value)))
const targetCurrent=computed(()=>resolvedValue.value.map((value,index)=>normalizedOptions.value.find(option=>valuesEqual(option.value,value))||unknownOption(value,index)))
const rightBase=computed(()=>props.targetOrder==='original'
  ?[...normalizedOptions.value.filter(option=>includesValue(resolvedValue.value,option.value)),...targetCurrent.value.filter(option=>option.unknown)]
  :targetCurrent.value)
function publicRecords(records){return records.map(publicOption)}
function matches(option,text,side){
  if(props.filterOption===false)return true
  const query=String(text??'').trim()
  if(!query)return true
  if(typeof props.filterOption==='function'){
    try{return props.filterOption(query,publicOption(option),side)!==false}
    catch(error){emitInvalid('filter-error','search',{direction:side,error,query});return false}
  }
  const needle=query.toLocaleLowerCase()
  return [option.label,option.value,option.description,...option.keywords].some(value=>String(value??'').toLocaleLowerCase().includes(needle))
}
const leftRecords=computed(()=>leftBase.value.filter(option=>!props.searchable||matches(option,resolvedSearch.value[0],'left')))
const rightRecords=computed(()=>rightBase.value.filter(option=>!props.searchable||matches(option,resolvedSearch.value[1],'right')))
function baseRecords(side){return side==='left'?leftBase.value:rightBase.value}
function visibleRecords(side){return side==='left'?leftRecords.value:rightRecords.value}
function sideSelected(side){return resolvedSelected.value.filter(value=>baseRecords(side).some(option=>valuesEqual(option.value,value)))}
const leftSelected=computed(()=>sideSelected('left'))
const rightSelected=computed(()=>sideSelected('right'))
function enabledVisible(side){return visibleRecords(side).filter(option=>!optionDisabled(option))}
function allVisibleSelected(side){const records=enabledVisible(side);return Boolean(records.length)&&records.every(option=>includesValue(resolvedSelected.value,option.value))}
function someVisibleSelected(side){const records=enabledVisible(side);return records.some(option=>includesValue(resolvedSelected.value,option.value))&&!allVisibleSelected(side)}
function pairText(value,side,fallback){
  if(Array.isArray(value)&&value[sideIndex(side)])return String(value[sideIndex(side)])
  if(typeof value==='string'&&value)return value
  return fallback
}
function panelLoading(side){return typeof props.loading==='object'&&props.loading!==null?Boolean(props.loading[side]):Boolean(props.loading)}
function rawPanelError(side){
  if(props.error&&typeof props.error==='object'&&!Array.isArray(props.error)&&('left' in props.error||'right' in props.error))return props.error[side]
  return props.error
}
function panelError(side){return Boolean(rawPanelError(side))}
function panelErrorMessage(side){
  const error=rawPanelError(side)
  if(typeof error==='string'&&error)return error
  if(error instanceof Error&&error.message)return error.message
  return pairText(props.errorText,side,t('transfer.error'))
}
function panelEmptyText(side){return pairText(props.emptyText,side,t('transfer.empty'))}
function panelLoadingText(side){return pairText(props.loadingText,side,t('transfer.loading'))}
function panelSearchPlaceholder(side){return pairText(props.searchPlaceholder,side,t('transfer.searchPlaceholder'))}
const busy=computed(()=>panelLoading('left')||panelLoading('right'))
const failed=computed(()=>panelError('left')||panelError('right'))
const state=computed(()=>props.disabled?'disabled':props.readonly?'readonly':busy.value?'loading':failed.value?'error':resolvedInvalid.value?'invalid':focused.value?'focused':'ready')
function panelScope(side){
  const records=baseRecords(side);const selected=sideSelected(side)
  return {direction:side,title:resolvedTitles.value[sideIndex(side)],total:records.length,visible:visibleRecords(side).length,selectedCount:selected.length,selectedKeys:[...selected],query:resolvedSearch.value[sideIndex(side)],options:publicRecords(records),selectAll:()=>toggleSelectAll(side,'slot'),clearSelection:()=>clearSelection(side,'slot')}
}

function emitInvalid(reason,source,extra={}){
  const payload={reason,source,value:[...resolvedValue.value],selectedKeys:[...resolvedSelected.value],...extra}
  emit('invalid',payload)
  return false
}
function selectionMeta(side,source,previous,next,nativeEvent){
  return {direction:side,source,previous:[...previous],next:[...next],addedKeys:next.filter(value=>!includesValue(previous,value)),removedKeys:previous.filter(value=>!includesValue(next,value)),nativeEvent}
}
function commitSelected(values,side='left',source='api',nativeEvent){
  if(props.disabled)return emitInvalid('disabled',source,{direction:side,nativeEvent})
  if(props.readonly)return emitInvalid('readonly',source,{direction:side,nativeEvent})
  if(busy.value)return emitInvalid('loading',source,{direction:side,nativeEvent})
  if(failed.value)return emitInvalid('error',source,{direction:side,nativeEvent})
  const known=[...leftBase.value,...rightBase.value].map(option=>option.value)
  const next=uniqueValues(values).filter(value=>includesValue(known,value))
  const previous=resolvedSelected.value
  if(arraysEqual(previous,next))return false
  if(props.selectedKeys===undefined)internalSelected.value=next
  const meta=selectionMeta(side,source,previous,next,nativeEvent)
  emit('update:selectedKeys',next);emit('selection-change',next,meta)
  return meta
}
function mergeVisibleSelection(side,visibleValues){
  const visible=visibleRecords(side).map(option=>option.value)
  const retained=resolvedSelected.value.filter(value=>!includesValue(visible,value))
  return uniqueValues([...retained,...visibleValues])
}
function onPanelSelection(side,values){commitSelected(mergeVisibleSelection(side,values),side,'pointer')}
function toggleSelectAll(side,source='select-all',nativeEvent){
  const enabled=enabledVisible(side).map(option=>option.value)
  if(!enabled.length)return false
  const selected=allVisibleSelected(side)
  const next=selected?resolvedSelected.value.filter(value=>!includesValue(enabled,value)):uniqueValues([...resolvedSelected.value,...enabled])
  const meta=commitSelected(next,side,source,nativeEvent)
  if(meta!==false)emit('select-all',{...meta,selected:!selected,visibleKeys:enabled})
  return meta
}
function clearSelection(side,source='clear-selection'){
  const values=baseRecords(side).map(option=>option.value)
  return commitSelected(resolvedSelected.value.filter(value=>!includesValue(values,value)),side,source)
}
function setSearch(side,value,source='input',nativeEvent,force=false){
  const index=sideIndex(side);const previous=resolvedSearch.value[index];const next=[...resolvedSearch.value];next[index]=String(value??'')
  if(props.searchValues===undefined)internalSearch.value=next
  emit('update:searchValues',next)
  if((!composing.value[side]||force)&&(force||previous!==next[index]))emit('search',next[index],side,{source,previous,nativeEvent})
  return next
}
function onSearchInput(side,event){setSearch(side,event.target.value,'input',event)}
function startComposition(side){composing.value={...composing.value,[side]:true}}
function endComposition(side,event){composing.value={...composing.value,[side]:false};setSearch(side,event.target.value,'compositionend',event,true)}
function clearSearch(side,source='clear-search'){return setSearch(side,'',source)}

function dispatchNativeChange(){
  if(typeof Event!=='function'||!nativeRef.value)return
  nativeRef.value.dispatchEvent(new Event('input',{bubbles:true}));nativeRef.value.dispatchEvent(new Event('change',{bubbles:true}))
}
function orderTarget(values,previous,moved,destination){
  if(destination==='left')return previous.filter(value=>includesValue(values,value))
  if(props.targetOrder==='original')return [...normalizedOptions.value.filter(option=>includesValue(values,option.value)).map(option=>option.value),...values.filter(value=>!normalizedOptions.value.some(option=>valuesEqual(option.value,value)))]
  if(props.targetOrder==='unshift')return uniqueValues([...moved,...previous])
  return uniqueValues([...previous,...moved])
}
function commitValue(values,metaBase={source:'api',direction:'right',movedKeys:[]},nativeEvent){
  if(props.disabled)return emitInvalid('disabled',metaBase.source,{direction:metaBase.direction,nativeEvent})
  if(props.readonly)return emitInvalid('readonly',metaBase.source,{direction:metaBase.direction,nativeEvent})
  if(busy.value)return emitInvalid('loading',metaBase.source,{direction:metaBase.direction,nativeEvent})
  if(failed.value)return emitInvalid('error',metaBase.source,{direction:metaBase.direction,nativeEvent})
  const next=uniqueValues(values);const previous=resolvedValue.value
  if(next.length>maxTargetCount.value){const meta={reason:'max',limit:maxTargetCount.value,attempted:next.length,direction:metaBase.direction,source:metaBase.source,value:[...previous],movedKeys:[...metaBase.movedKeys]};emit('limit',meta);return emitInvalid('max',metaBase.source,meta)}
  if(next.length<minTargetCount.value){const meta={reason:'min',limit:minTargetCount.value,attempted:next.length,direction:metaBase.direction,source:metaBase.source,value:[...previous],movedKeys:[...metaBase.movedKeys]};emit('limit',meta);return emitInvalid('min',metaBase.source,meta)}
  if(arraysEqual(previous,next))return false
  if(props.modelValue===undefined)internalValue.value=next
  const meta={...metaBase,previous:[...previous],next:[...next],movedKeys:[...metaBase.movedKeys],nativeEvent}
  emit('update:modelValue',next);emit('input',next,meta);emit('change',next,meta);emit('move',meta)
  commitSelected(resolvedSelected.value.filter(value=>!includesValue(metaBase.movedKeys,value)),oppositeSide(metaBase.direction),`${metaBase.source}:move`,nativeEvent)
  nextTick(dispatchNativeChange)
  return meta
}
function moveTo(destination,keys,source='api',nativeEvent){
  const origin=destination==='right'?'left':'right'
  if(destination==='left'&&props.oneWay)return emitInvalid('one-way',source,{direction:destination,nativeEvent})
  const candidates=baseRecords(origin).filter(option=>!optionDisabled(option))
  const requested=Array.isArray(keys)?uniqueValues(keys):sideSelected(origin)
  const moved=candidates.filter(option=>includesValue(requested,option.value)).map(option=>option.value)
  if(!moved.length)return false
  const previous=resolvedValue.value
  const unordered=destination==='right'?uniqueValues([...previous,...moved]):previous.filter(value=>!includesValue(moved,value))
  const next=orderTarget(unordered,previous,moved,destination)
  return commitValue(next,{source,direction:destination,movedKeys:moved},nativeEvent)
}
function moveRight(source='button',event){return moveTo('right',undefined,source,event)}
function moveLeft(source='button',event){return moveTo('left',undefined,source,event)}
function setValue(values,source='api'){return commitValue(values,{source,direction:'right',movedKeys:uniqueValues(values).filter(value=>!includesValue(resolvedValue.value,value))})}
function clear(source='clear'){
  const removable=rightBase.value.filter(option=>!optionDisabled(option)).map(option=>option.value)
  const meta=moveTo('left',removable,source)
  if(meta!==false)emit('clear',[],meta)
  return meta
}
function moveButtonDisabled(destination){
  const origin=destination==='right'?'left':'right'
  return props.disabled||props.readonly||busy.value||failed.value||(destination==='left'&&props.oneWay)||!sideSelected(origin).some(value=>baseRecords(origin).some(option=>valuesEqual(option.value,value)&&!optionDisabled(option)))
}
function onListKeydown(side,event){
  if(event.key==='Enter'&&sideSelected(side).length){event.preventDefault();event.stopImmediatePropagation();moveTo(oppositeSide(side),undefined,'keyboard',event)}
  else if(event.altKey&&((side==='left'&&event.key==='ArrowRight')||(side==='right'&&event.key==='ArrowLeft'))){event.preventDefault();event.stopImmediatePropagation();moveTo(oppositeSide(side),undefined,'keyboard',event)}
}
function listElement(side){const exposed=(side==='left'?leftListRef:rightListRef).value?.root;return exposed?.value||exposed||null}
function focus(side='left',options){const element=props.searchable?(side==='left'?leftSearchRef:rightSearchRef).value:listElement(side);if(!element?.focus)return false;element.focus(options);return true}
function blur(){const active=typeof document==='undefined'?null:document.activeElement;if(rootRef.value?.contains(active)){active?.blur?.();return true}return false}
function scrollTo(side,index,options={}){return (side==='left'?leftListRef:rightListRef).value?.scrollToIndex?.(index,options)??-1}
function getSelectedKeys(side){return side?[...sideSelected(side)]:[...resolvedSelected.value]}
function retry(side){emit('retry',side,{query:resolvedSearch.value[sideIndex(side)]})}
function handleFocusIn(event){
  if(focused.value)return
  focused.value=true;emit('focus',{direction:rootRef.value?.querySelector('[data-direction="right"]')?.contains(event.target)?'right':'left',nativeEvent:event})
}
function handleFocusOut(event){
  if(rootRef.value?.contains(event.relatedTarget))return
  focused.value=false;emit('blur',{value:[...resolvedValue.value],selectedKeys:[...resolvedSelected.value],nativeEvent:event})
}
function onNativeInvalid(event){emitInvalid(resolvedValue.value.length<minTargetCount.value?'min':'required','native',{nativeEvent:event});nextTick(()=>focus('right'))}
function syncValidity(){
  if(!nativeRef.value?.setCustomValidity)return
  nativeRef.value.setCustomValidity(resolvedValue.value.length<minTargetCount.value?t('transfer.minimum',{count:formatNumber(minTargetCount.value)}):'')
}
function onFormReset(){
  const next=uniqueValues(props.defaultValue);const previous=resolvedValue.value;const previousSelected=resolvedSelected.value;const nextSelected=uniqueValues(props.defaultSelectedKeys);const nextSearch=normalizePair(props.defaultSearchValues)
  if(props.modelValue===undefined)internalValue.value=next
  if(props.selectedKeys===undefined)internalSelected.value=nextSelected
  if(props.searchValues===undefined)internalSearch.value=nextSearch
  const meta={source:'reset',direction:'right',movedKeys:[],previous:[...previous],next:[...next]}
  emit('update:modelValue',next);emit('input',next,meta);emit('change',next,meta)
  emit('update:selectedKeys',nextSelected);emit('selection-change',nextSelected,selectionMeta('left','reset',previousSelected,nextSelected))
  emit('update:searchValues',nextSearch)
  nextTick(syncValidity)
}

watch([()=>resolvedValue.value.length,minTargetCount],syncValidity,{flush:'post'})
watch(()=>[leftRecords.value.length,rightRecords.value.length],()=>{
  activeIndexes.value={left:Math.min(activeIndexes.value.left,Math.max(0,leftRecords.value.length-1)),right:Math.min(activeIndexes.value.right,Math.max(0,rightRecords.value.length-1))}
})
onMounted(()=>{
  resetForm=nativeRef.value?.form||null;resetForm?.addEventListener('reset',onFormReset);syncValidity()
  if(props.autofocus)nextTick(()=>focus('left'))
})
onBeforeUnmount(()=>resetForm?.removeEventListener('reset',onFormReset))

defineExpose({
  root:rootRef,native:nativeRef,leftList:leftListRef,rightList:rightListRef,value:resolvedValue,selectedKeys:resolvedSelected,searchValues:resolvedSearch,
  focus,blur,moveTo,moveRight,moveLeft,setValue,clear,selectAll:toggleSelectAll,clearSelection,clearSearch,scrollTo,getSelectedKeys,
})
</script>

<template>
  <div v-bind="passthroughAttrs" :id="controlId" ref="rootRef" class="ui-transfer" :class="[`size-${resolvedSize}`,attrs.class,{disabled,readonly,invalid:resolvedInvalid,loading:busy,error:failed,'one-way':oneWay,'has-operation-text':operations.length}]" :style="attrs.style" role="group" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-disabled="disabled||undefined" :aria-readonly="readonly||undefined" :aria-invalid="resolvedInvalid||undefined" :aria-required="resolvedRequired||undefined" :aria-busy="busy||undefined" data-ui-transfer :data-state="state" :data-direction="direction" @focusin="handleFocusIn" @focusout="handleFocusOut">
    <select v-if="name||resolvedRequired||minTargetCount" ref="nativeRef" class="ui-transfer-native" :name="name" :form="form" :required="resolvedRequired" :disabled="disabled" multiple tabindex="-1" aria-hidden="true" @invalid="onNativeInvalid">
      <option v-for="option in rightBase" :key="`native-${typeof option.value}-${String(option.value)}`" :value="String(option.value)" selected>{{ option.label }}</option>
    </select>

    <section class="ui-transfer-panel" data-direction="left" :aria-label="resolvedTitles[0]">
      <header class="ui-transfer-header">
        <slot name="left-header" v-bind="panelScope('left')"><slot name="header" v-bind="panelScope('left')">
          <button v-if="showSelectAll" type="button" class="ui-transfer-select-all" role="checkbox" :aria-checked="someVisibleSelected('left')?'mixed':String(allVisibleSelected('left'))" :disabled="disabled||readonly||busy||failed||!enabledVisible('left').length" @click="toggleSelectAll('left','header',$event)"><span class="ui-transfer-check" aria-hidden="true"><AppIcon v-if="allVisibleSelected('left')" name="check" :size="10"/><span v-else-if="someVisibleSelected('left')" class="ui-transfer-indeterminate"/></span><strong>{{ resolvedTitles[0] }}</strong></button>
          <strong v-else>{{ resolvedTitles[0] }}</strong>
          <span>{{ t('transfer.countSelected',{selected:formatNumber(leftSelected.length),count:formatNumber(leftBase.length)}) }}</span>
        </slot></slot>
      </header>
      <label v-if="searchable" class="ui-transfer-search"><AppIcon name="search" :size="13"/><input ref="leftSearchRef" :value="resolvedSearch[0]" :aria-label="t('transfer.search',{title:resolvedTitles[0]})" :placeholder="panelSearchPlaceholder('left')" :disabled="disabled" @input="onSearchInput('left',$event)" @compositionstart="startComposition('left')" @compositionend="endComposition('left',$event)"><button v-if="resolvedSearch[0]&&!disabled" type="button" :aria-label="t('transfer.clearSearch')" @click="clearSearch('left')"><AppIcon name="close" :size="10"/></button></label>
      <UiVirtualList ref="leftListRef" class="ui-transfer-list" :items="leftRecords" item-key="value" text-field="label" selection-mode="multiple" :model-value="leftSelected" :active-index="activeIndexes.left" :disabled-keys="leftRecords.filter(optionDisabled).map(option=>option.value)" :item-size="itemHeight" :estimated-item-size="itemHeight" :height="listHeight" :overscan="overscan" :measure="measure" :loading="panelLoading('left')" :error="rawPanelError('left')" :aria-label="resolvedTitles[0]" :tabindex="disabled?-1:0" @update:model-value="onPanelSelection('left',$event)" @update:active-index="activeIndexes={...activeIndexes,left:$event}" @keydown.capture="onListKeydown('left',$event)">
        <template #item="scope"><div class="ui-transfer-option-content"><span class="ui-transfer-check" aria-hidden="true"><AppIcon v-if="scope.selected" name="check" :size="10"/></span><slot name="left-option" :option="publicOption(scope.item)" v-bind="scope"><slot name="option" :option="publicOption(scope.item)" direction="left" v-bind="scope"><span class="ui-transfer-option-copy"><span>{{ scope.item.label }}</span><small v-if="scope.item.description">{{ scope.item.description }}</small></span></slot></slot></div></template>
        <template #loading><slot name="loading" direction="left"><div class="ui-transfer-state"><AppIcon name="refresh" :size="18" class="ui-transfer-spinner"/><span>{{ panelLoadingText('left') }}</span></div></slot></template>
        <template #error><slot name="error" direction="left" :error="rawPanelError('left')" :retry="()=>retry('left')"><div class="ui-transfer-state is-error"><AppIcon name="alert" :size="18"/><span>{{ panelErrorMessage('left') }}</span><button type="button" class="btn btn-outline btn-sm" @click="retry('left')">{{ t('common.reload') }}</button></div></slot></template>
        <template #empty><slot name="empty" direction="left" :query="resolvedSearch[0]"><div class="ui-transfer-state"><AppIcon name="search" :size="18"/><span>{{ panelEmptyText('left') }}</span></div></slot></template>
      </UiVirtualList>
      <footer v-if="slots.footer||slots['left-footer']" class="ui-transfer-footer"><slot name="left-footer" v-bind="panelScope('left')"><slot name="footer" v-bind="panelScope('left')"/></slot></footer>
    </section>

    <div class="ui-transfer-actions">
      <slot name="operation" direction="right" :disabled="moveButtonDisabled('right')" :count="leftSelected.length" :move="moveRight"><button type="button" class="btn btn-outline btn-sm" :disabled="moveButtonDisabled('right')" :aria-label="resolvedOperations[0]" @click="moveRight('button',$event)"><AppIcon class="ui-transfer-forward" name="chevronRight" :size="13"/><span v-if="operations.length">{{ resolvedOperations[0] }}</span></button></slot>
      <slot v-if="!oneWay" name="operation" direction="left" :disabled="moveButtonDisabled('left')" :count="rightSelected.length" :move="moveLeft"><button type="button" class="btn btn-outline btn-sm" :disabled="moveButtonDisabled('left')" :aria-label="resolvedOperations[1]" @click="moveLeft('button',$event)"><AppIcon class="ui-transfer-back" name="chevronRight" :size="13"/><span v-if="operations.length">{{ resolvedOperations[1] }}</span></button></slot>
    </div>

    <section class="ui-transfer-panel" data-direction="right" :aria-label="resolvedTitles[1]">
      <header class="ui-transfer-header">
        <slot name="right-header" v-bind="panelScope('right')"><slot name="header" v-bind="panelScope('right')">
          <button v-if="showSelectAll" type="button" class="ui-transfer-select-all" role="checkbox" :aria-checked="someVisibleSelected('right')?'mixed':String(allVisibleSelected('right'))" :disabled="disabled||readonly||busy||failed||!enabledVisible('right').length" @click="toggleSelectAll('right','header',$event)"><span class="ui-transfer-check" aria-hidden="true"><AppIcon v-if="allVisibleSelected('right')" name="check" :size="10"/><span v-else-if="someVisibleSelected('right')" class="ui-transfer-indeterminate"/></span><strong>{{ resolvedTitles[1] }}</strong></button>
          <strong v-else>{{ resolvedTitles[1] }}</strong>
          <span>{{ t('transfer.countSelected',{selected:formatNumber(rightSelected.length),count:formatNumber(rightBase.length)}) }}</span>
        </slot></slot>
      </header>
      <label v-if="searchable" class="ui-transfer-search"><AppIcon name="search" :size="13"/><input ref="rightSearchRef" :value="resolvedSearch[1]" :aria-label="t('transfer.search',{title:resolvedTitles[1]})" :placeholder="panelSearchPlaceholder('right')" :disabled="disabled" @input="onSearchInput('right',$event)" @compositionstart="startComposition('right')" @compositionend="endComposition('right',$event)"><button v-if="resolvedSearch[1]&&!disabled" type="button" :aria-label="t('transfer.clearSearch')" @click="clearSearch('right')"><AppIcon name="close" :size="10"/></button></label>
      <UiVirtualList ref="rightListRef" class="ui-transfer-list" :items="rightRecords" item-key="value" text-field="label" selection-mode="multiple" :model-value="rightSelected" :active-index="activeIndexes.right" :disabled-keys="rightRecords.filter(optionDisabled).map(option=>option.value)" :item-size="itemHeight" :estimated-item-size="itemHeight" :height="listHeight" :overscan="overscan" :measure="measure" :loading="panelLoading('right')" :error="rawPanelError('right')" :aria-label="resolvedTitles[1]" :tabindex="disabled?-1:0" @update:model-value="onPanelSelection('right',$event)" @update:active-index="activeIndexes={...activeIndexes,right:$event}" @keydown.capture="onListKeydown('right',$event)">
        <template #item="scope"><div class="ui-transfer-option-content"><span class="ui-transfer-check" aria-hidden="true"><AppIcon v-if="scope.selected" name="check" :size="10"/></span><slot name="right-option" :option="publicOption(scope.item)" v-bind="scope"><slot name="option" :option="publicOption(scope.item)" direction="right" v-bind="scope"><span class="ui-transfer-option-copy"><span>{{ scope.item.label }}</span><small v-if="scope.item.description">{{ scope.item.description }}</small></span></slot></slot></div></template>
        <template #loading><slot name="loading" direction="right"><div class="ui-transfer-state"><AppIcon name="refresh" :size="18" class="ui-transfer-spinner"/><span>{{ panelLoadingText('right') }}</span></div></slot></template>
        <template #error><slot name="error" direction="right" :error="rawPanelError('right')" :retry="()=>retry('right')"><div class="ui-transfer-state is-error"><AppIcon name="alert" :size="18"/><span>{{ panelErrorMessage('right') }}</span><button type="button" class="btn btn-outline btn-sm" @click="retry('right')">{{ t('common.reload') }}</button></div></slot></template>
        <template #empty><slot name="empty" direction="right" :query="resolvedSearch[1]"><div class="ui-transfer-state"><AppIcon name="search" :size="18"/><span>{{ panelEmptyText('right') }}</span></div></slot></template>
      </UiVirtualList>
      <footer v-if="slots.footer||slots['right-footer']" class="ui-transfer-footer"><slot name="right-footer" v-bind="panelScope('right')"><slot name="footer" v-bind="panelScope('right')"/></slot></footer>
    </section>
    <span class="sr-only" aria-live="polite">{{ t('transfer.summary',{selected:formatNumber(resolvedValue.length),available:formatNumber(leftBase.length)}) }}</span>
  </div>
</template>

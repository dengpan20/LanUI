<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'

defineOptions({inheritAttrs:false})

const props=defineProps({
  items:{type:Array,default:()=>[]},
  itemKey:{type:[String,Function],default:'id'},
  itemSize:{type:[Number,Function],default:44},
  estimatedItemSize:{type:Number,default:44},
  height:{type:[String,Number],default:320},
  width:{type:[String,Number],default:'100%'},
  overscan:{type:Number,default:4},
  measure:Boolean,
  selectionMode:{type:String,default:'none'},
  modelValue:{type:[String,Number,Array],default:undefined},
  activeIndex:{type:Number,default:undefined},
  defaultActiveIndex:{type:Number,default:0},
  disabledKeys:{type:Array,default:()=>[]},
  textField:{type:[String,Function],default:'label'},
  ariaLabel:{type:String,default:''},
  tabindex:{type:Number,default:0},
  loop:Boolean,
  deselectable:Boolean,
  bordered:Boolean,
  striped:Boolean,
  loading:Boolean,
  error:{type:[String,Boolean],default:''},
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  errorText:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','update:activeIndex','active-change','item-click','scroll','range-change','reach-start','reach-end','retry'])
const {t,tc}=useLocale()
const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'')
const root=ref(null)
const scrollTop=ref(0)
const viewportSize=ref(numericLength(props.height)||320)
const sizeVersion=ref(0)
const measuredSizes=new Map()
const itemElements=new Map()
const elementRecords=new WeakMap()
const internalActive=ref(Number.isFinite(props.defaultActiveIndex)?Math.floor(props.defaultActiveIndex):0)
const disabledSet=computed(()=>new Set(props.disabledKeys))
const selectionMode=computed(()=>['single','multiple'].includes(props.selectionMode)?props.selectionMode:'none')
const selectedSet=computed(()=>new Set(selectionMode.value==='multiple'?(Array.isArray(props.modelValue)?props.modelValue:[]):props.modelValue===undefined||props.modelValue===null?[]:[props.modelValue]))
const resolvedActive=computed(()=>Number.isFinite(props.activeIndex)?Math.floor(props.activeIndex):internalActive.value)
const rootStyle=computed(()=>({height:cssLength(props.height),width:cssLength(props.width)}))
const resolvedEmptyText=computed(()=>props.emptyText||t('virtualList.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('virtualList.loading'))
const resolvedErrorText=computed(()=>typeof props.error==='string'&&props.error?props.error:props.errorText||t('virtualList.error'))

function numericLength(value){
  if(typeof value==='number'&&Number.isFinite(value))return Math.max(1,value)
  if(typeof value==='string'&&/^\s*\d+(?:\.\d+)?px\s*$/.test(value))return Math.max(1,parseFloat(value))
  return 0
}
function cssLength(value){
  if(typeof value==='number'&&Number.isFinite(value))return `${Math.max(0,value)}px`
  if(typeof value==='string'&&/^\s*\d+(?:\.\d+)?\s*$/.test(value))return `${Math.max(0,Number(value))}px`
  return value||undefined
}
function rawKey(item,index){
  const value=typeof props.itemKey==='function'?props.itemKey(item,index):item&&typeof item==='object'?item[props.itemKey]:undefined
  return typeof value==='string'||typeof value==='number'?value:index
}
function itemText(item,index){
  const value=typeof props.textField==='function'?props.textField(item,index):item&&typeof item==='object'?item[props.textField]:item
  return value===undefined||value===null?'':String(value)
}
const records=computed(()=>props.items.map((item,index)=>({item,index,key:rawKey(item,index),domKey:`${typeof rawKey(item,index)}-${String(rawKey(item,index))}-${index}`})))
function estimate(record){
  const candidate=typeof props.itemSize==='function'?props.itemSize(record.item,record.index):props.itemSize
  const fallback=Number.isFinite(props.estimatedItemSize)?props.estimatedItemSize:44
  return Math.max(1,Number.isFinite(Number(candidate))?Number(candidate):fallback)
}
function recordSize(record){sizeVersion.value;return props.measure?(measuredSizes.get(record.key)||estimate(record)):estimate(record)}
const offsets=computed(()=>{
  sizeVersion.value
  const values=new Array(records.value.length+1);values[0]=0
  for(let index=0;index<records.value.length;index+=1)values[index+1]=values[index]+recordSize(records.value[index])
  return values
})
const totalSize=computed(()=>offsets.value.at(-1)||0)
function indexAt(offset){
  const length=records.value.length
  if(!length)return 0
  const values=offsets.value;let low=0;let high=length
  while(low<high){const middle=(low+high)>>1;if(values[middle+1]<=offset)low=middle+1;else high=middle}
  return Math.min(length-1,low)
}
const range=computed(()=>{
  const length=records.value.length
  if(!length)return{start:0,end:0,visibleStart:0,visibleEnd:0}
  const visibleStart=indexAt(Math.max(0,scrollTop.value))
  const visibleEnd=Math.min(length,indexAt(Math.max(0,scrollTop.value)+Math.max(1,viewportSize.value)-.001)+1)
  const extra=Math.max(0,Math.floor(props.overscan)||0)
  return{start:Math.max(0,visibleStart-extra),end:Math.min(length,visibleEnd+extra),visibleStart,visibleEnd}
})
const renderedRecords=computed(()=>records.value.slice(range.value.start,range.value.end))
const contentStyle=computed(()=>({height:`${totalSize.value}px`}))
function itemStyle(record){
  const size=recordSize(record)
  return{transform:`translateY(${offsets.value[record.index]}px)`,height:props.measure?undefined:`${size}px`,minHeight:props.measure?`${estimate(record)}px`:undefined,'--ui-virtual-item-size':`${size}px`}
}
function isDisabled(record){return disabledSet.value.has(record.key)}
function isSelected(record){return selectedSet.value.has(record.key)}
function itemId(record){return `ui-virtual-list-${uid}-${record.index}`}
const activeDescendant=computed(()=>selectionMode.value!=='none'&&records.value[resolvedActive.value]&&!isDisabled(records.value[resolvedActive.value])?itemId(records.value[resolvedActive.value]):undefined)

let rootObserver=null;let itemObserver=null;let typeaheadTimer=null;let typeahead='';let reachedStart=false;let reachedEnd=false
function readViewport(){const value=root.value?.clientHeight;if(value>0)viewportSize.value=value;else viewportSize.value=numericLength(props.height)||viewportSize.value||320}
function measureEntries(entries){
  let beforeDelta=0;let changed=false
  for(const entry of entries){
    const record=elementRecords.get(entry.target);if(!record)continue
    const next=Math.max(1,entry.borderBoxSize?.[0]?.blockSize||entry.contentRect?.height||entry.target.getBoundingClientRect?.().height||0)
    if(!Number.isFinite(next)||next<=1)continue
    const previous=measuredSizes.get(record.key)||estimate(record)
    if(Math.abs(previous-next)<.5)continue
    measuredSizes.set(record.key,next);changed=true
    if(record.index<range.value.visibleStart)beforeDelta+=next-previous
  }
  if(changed){sizeVersion.value+=1;if(beforeDelta&&root.value){root.value.scrollTop=Math.max(0,root.value.scrollTop+beforeDelta);scrollTop.value=root.value.scrollTop}}
}
function createItemObserver(){
  itemObserver?.disconnect();itemObserver=null
  if(!props.measure||typeof ResizeObserver==='undefined')return
  itemObserver=new ResizeObserver(measureEntries)
  for(const element of itemElements.values())itemObserver.observe(element)
}
function setItemRef(element,record){
  const existing=itemElements.get(record.domKey)
  if(existing&&existing!==element)itemObserver?.unobserve(existing)
  if(!element){if(existing)itemObserver?.unobserve(existing);itemElements.delete(record.domKey);return}
  itemElements.set(record.domKey,element);elementRecords.set(element,record)
  if(itemObserver)itemObserver.observe(element)
  else if(props.measure)nextTick(()=>measureEntries([{target:element,contentRect:{height:element.getBoundingClientRect?.().height||0}}]))
}
function setScroll(value,behavior='auto'){
  const next=Math.max(0,Math.min(Number(value)||0,Math.max(0,totalSize.value-viewportSize.value)))
  if(root.value?.scrollTo)root.value.scrollTo({top:next,behavior});else if(root.value)root.value.scrollTop=next
  scrollTop.value=next
  return next
}
function scrollToIndex(index,options={}){
  if(!records.value.length)return 0
  const target=Math.max(0,Math.min(records.value.length-1,Math.floor(Number(index)||0)))
  const start=offsets.value[target];const end=offsets.value[target+1];const viewport=Math.max(1,viewportSize.value)
  let next=start
  if(options.align==='end')next=end-viewport
  else if(options.align==='center')next=start-(viewport-(end-start))/2
  else if(options.align==='auto')next=start<scrollTop.value?start:end>scrollTop.value+viewport?end-viewport:scrollTop.value
  return setScroll(next,options.behavior||'auto')
}
function scrollToKey(key,options={}){const index=records.value.findIndex(record=>record.key===key);return index<0?-1:scrollToIndex(index,options)}
function resetAfterIndex(index=0,force=true){
  const start=Math.max(0,Math.floor(Number(index)||0))
  for(const record of records.value)if(record.index>=start)measuredSizes.delete(record.key)
  if(force)sizeVersion.value+=1
}
function getVisibleRange(){return{...range.value,total:records.value.length}}
function findEnabled(start,step,allowLoop=props.loop){
  const length=records.value.length;if(!length)return-1
  let index=start
  for(let visited=0;visited<length;visited+=1){
    if(index<0||index>=length){if(!allowLoop)return-1;index=(index+length)%length}
    if(!isDisabled(records.value[index]))return index
    index+=step
  }
  return-1
}
function setActive(index,source='api'){
  const target=findEnabled(index,index<resolvedActive.value?-1:1,false)
  if(target<0||target===resolvedActive.value)return target
  if(!Number.isFinite(props.activeIndex))internalActive.value=target
  emit('update:activeIndex',target);emit('active-change',{index:target,key:records.value[target].key,item:records.value[target].item,source})
  nextTick(()=>scrollToIndex(target,{align:'auto'}));return target
}
function selectRecord(record,source='pointer'){
  if(selectionMode.value==='none'||isDisabled(record))return
  let value;let selected
  if(selectionMode.value==='multiple'){
    const values=new Set(selectedSet.value);selected=values.has(record.key)?(values.delete(record.key),false):(values.add(record.key),true);value=records.value.filter(item=>values.has(item.key)).map(item=>item.key)
  }else{
    const same=selectedSet.value.has(record.key);selected=!(same&&props.deselectable);value=selected?record.key:undefined
  }
  emit('update:modelValue',value);emit('change',value,{key:record.key,index:record.index,item:record.item,selected,source})
}
function activateRecord(record,event){
  if(isDisabled(record))return
  setActive(record.index,'pointer');selectRecord(record,'pointer');emit('item-click',record.item,record.index,event)
}
function moveActive(step,source){
  const current=resolvedActive.value>=0?resolvedActive.value:step>0?-1:records.value.length
  let target=findEnabled(current+step,step)
  if(target<0&&props.loop)target=findEnabled(step>0?0:records.value.length-1,step,false)
  if(target>=0)setActive(target,source)
}
function typeaheadSearch(character){
  clearTimeout(typeaheadTimer);typeahead+=character.toLocaleLowerCase();typeaheadTimer=setTimeout(()=>{typeahead=''},500)
  const length=records.value.length
  for(let offset=1;offset<=length;offset+=1){const index=(Math.max(-1,resolvedActive.value)+offset)%length;const record=records.value[index];if(!isDisabled(record)&&itemText(record.item,index).trim().toLocaleLowerCase().startsWith(typeahead)){setActive(index,'typeahead');break}}
}
function onKeydown(event){
  if(selectionMode.value==='none'||props.loading||props.error||!records.value.length)return
  const page=Math.max(1,Math.floor(viewportSize.value/Math.max(1,props.estimatedItemSize||44)))
  if(event.key==='ArrowDown'){event.preventDefault();moveActive(1,'keyboard')}
  else if(event.key==='ArrowUp'){event.preventDefault();moveActive(-1,'keyboard')}
  else if(event.key==='Home'){event.preventDefault();const target=findEnabled(0,1,false);if(target>=0)setActive(target,'keyboard')}
  else if(event.key==='End'){event.preventDefault();const target=findEnabled(records.value.length-1,-1,false);if(target>=0)setActive(target,'keyboard')}
  else if(event.key==='PageDown'){event.preventDefault();setActive(Math.min(records.value.length-1,resolvedActive.value+page),'keyboard')}
  else if(event.key==='PageUp'){event.preventDefault();setActive(Math.max(0,resolvedActive.value-page),'keyboard')}
  else if(event.key==='Enter'||event.key===' '){event.preventDefault();const record=records.value[resolvedActive.value];if(record)selectRecord(record,'keyboard')}
  else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'&&selectionMode.value==='multiple'){event.preventDefault();const value=records.value.filter(record=>!isDisabled(record)).map(record=>record.key);emit('update:modelValue',value);emit('change',value,{source:'keyboard',selected:true})}
  else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)typeaheadSearch(event.key)
}
function onFocus(){if(selectionMode.value!=='none'&&(!records.value[resolvedActive.value]||isDisabled(records.value[resolvedActive.value]))){const target=findEnabled(0,1,false);if(target>=0)setActive(target,'focus')}}
function onScroll(event){
  const element=event.currentTarget;scrollTop.value=Math.max(0,element.scrollTop||0);readViewport()
  const payload={scrollTop:scrollTop.value,scrollHeight:element.scrollHeight||totalSize.value,viewportHeight:viewportSize.value,range:getVisibleRange()};emit('scroll',payload)
  const atStart=scrollTop.value<=1;const atEnd=scrollTop.value+viewportSize.value>=totalSize.value-1
  if(atStart&&!reachedStart)emit('reach-start',payload)
  if(atEnd&&!reachedEnd)emit('reach-end',payload)
  reachedStart=atStart;reachedEnd=atEnd
}

watch(()=>props.height,readViewport)
watch(()=>props.measure,()=>{createItemObserver();sizeVersion.value+=1})
watch(()=>records.value.map(record=>record.key),keys=>{
  const current=new Set(keys);for(const key of measuredSizes.keys())if(!current.has(key))measuredSizes.delete(key)
  if(resolvedActive.value>=records.value.length)internalActive.value=Math.max(0,records.value.length-1)
  sizeVersion.value+=1
},{deep:true})
watch(()=>`${range.value.start}:${range.value.end}:${records.value.length}`,()=>emit('range-change',getVisibleRange()),{immediate:true})
onMounted(()=>{
  readViewport()
  if(typeof ResizeObserver!=='undefined'){rootObserver=new ResizeObserver(readViewport);if(root.value)rootObserver.observe(root.value)}
  createItemObserver()
})
onBeforeUnmount(()=>{rootObserver?.disconnect();itemObserver?.disconnect();clearTimeout(typeaheadTimer)})
defineExpose({root,scrollToIndex,scrollToKey,resetAfterIndex,getVisibleRange})
</script>

<template>
  <div class="ui-virtual-list-shell">
    <div v-bind="$attrs" ref="root" class="ui-virtual-list" :class="{'is-bordered':bordered,'is-striped':striped,'is-measured':measure,'is-selectable':selectionMode!=='none'}" :style="rootStyle" :role="selectionMode==='none'?'list':'listbox'" :tabindex="selectionMode==='none'?undefined:tabindex" :aria-label="ariaLabel||t('virtualList.label')" :aria-busy="loading?'true':undefined" :aria-multiselectable="selectionMode==='multiple'?'true':undefined" :aria-activedescendant="activeDescendant" @scroll="onScroll" @keydown="onKeydown" @focus="onFocus">
      <div v-if="loading" class="ui-virtual-list-state" role="status" aria-live="polite"><slot name="loading"><AppIcon name="refresh" :size="20" class="ui-virtual-list-spinner"/><span>{{ resolvedLoadingText }}</span></slot></div>
      <div v-else-if="error" class="ui-virtual-list-state is-error" role="alert"><slot name="error" :error="error" :retry="()=>emit('retry')"><AppIcon name="alert" :size="22"/><strong>{{ t('virtualList.errorTitle') }}</strong><span>{{ resolvedErrorText }}</span><button type="button" class="btn btn-outline btn-sm" @click="emit('retry')">{{ t('common.reload') }}</button></slot></div>
      <div v-else-if="!records.length" class="ui-virtual-list-state"><slot name="empty"><AppIcon name="search" :size="22"/><span>{{ resolvedEmptyText }}</span></slot></div>
      <div v-else class="ui-virtual-list-content" :style="contentStyle">
        <div v-for="record in renderedRecords" :id="selectionMode==='none'?undefined:itemId(record)" :key="record.domKey" :ref="element=>setItemRef(element,record)" class="ui-virtual-list-item" :class="{'is-active':record.index===resolvedActive,'is-selected':isSelected(record),'is-disabled':isDisabled(record),'is-selectable':selectionMode!=='none'}" :style="itemStyle(record)" :role="selectionMode==='none'?'listitem':'option'" :aria-selected="selectionMode==='none'?undefined:String(isSelected(record))" :aria-disabled="isDisabled(record)?'true':undefined" :aria-setsize="records.length" :aria-posinset="record.index+1" @click="activateRecord(record,$event)">
          <slot name="item" :item="record.item" :index="record.index" :item-key="record.key" :active="record.index===resolvedActive" :selected="isSelected(record)" :disabled="isDisabled(record)"><slot :item="record.item" :index="record.index" :item-key="record.key" :active="record.index===resolvedActive" :selected="isSelected(record)" :disabled="isDisabled(record)">{{ itemText(record.item,record.index) }}</slot></slot>
        </div>
      </div>
    </div>
    <span v-if="selectionMode!=='none'" class="sr-only" aria-live="polite">{{ tc('virtualList.selectedCount',selectedSet.size,{count:selectedSet.size}) }}</span>
  </div>
</template>

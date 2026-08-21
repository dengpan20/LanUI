<script setup>
import { computed, nextTick, ref, useAttrs, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  items:{type:Array,default:()=>[]},
  itemKey:{type:[String,Function],default:'key'},
  labelField:{type:[String,Function],default:'label'},
  hrefField:{type:[String,Function],default:'href'},
  iconField:{type:[String,Function],default:'icon'},
  disabledField:{type:[String,Function],default:'disabled'},
  currentField:{type:[String,Function],default:'current'},
  currentKey:{type:[String,Number],default:undefined},
  separator:{type:String,default:'chevronRight'},
  separatorMode:{type:String,default:'icon',validator:value=>['icon','text'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  maxItems:{type:Number,default:0},
  itemsBeforeCollapse:{type:Number,default:1},
  itemsAfterCollapse:{type:Number,default:1},
  expanded:{type:Boolean,default:undefined},
  defaultExpanded:Boolean,
  interactive:Boolean,
  wrap:{type:Boolean,default:true},
  truncate:Boolean,
  maxItemWidth:{type:[Number,String],default:160},
  loading:Boolean,
  loadingCount:{type:Number,default:3},
  emptyText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['navigate','item-click','item-focus','update:expanded','expand-change'])
const attrs=useAttrs()
const {t}=useLocale()
const root=ref(null)
const actionRefs=ref([])
const internalExpanded=ref(props.defaultExpanded)

function fieldValue(item,index,field,fallback=''){
  const value=typeof field==='function'?field(item,index):item&&typeof item==='object'?item[field]:fallback
  return value===undefined||value===null?fallback:value
}
function keyFor(item,index){
  const value=fieldValue(item,index,props.itemKey,index)
  return typeof value==='string'||typeof value==='number'?value:index
}
function sourceOf(event){return event?.detail===0?'keyboard':'pointer'}
function sizeValue(value){return typeof value==='number'?`${value}px`:String(value||'160px')}

const sourceRecords=computed(()=>props.items.map((item,index)=>{
  const key=keyFor(item,index)
  const rawHref=fieldValue(item,index,props.hrefField,'')||(item&&typeof item==='object'&&typeof item.to==='string'?item.to:'')
  return{
    item,index,key,
    label:String(fieldValue(item,index,props.labelField,typeof item==='string'||typeof item==='number'?item:'')||''),
    href:String(rawHref||''),
    icon:String(fieldValue(item,index,props.iconField,'')||''),
    disabled:Boolean(fieldValue(item,index,props.disabledField,false)),
    explicitCurrent:Boolean(fieldValue(item,index,props.currentField,false)),
    target:item&&typeof item==='object'?String(item.target||''):'',
    rel:item&&typeof item==='object'?String(item.rel||''):'',
    onClick:item&&typeof item==='object'&&typeof item.onClick==='function'?item.onClick:null,
    domKey:`${typeof key}-${String(key)}-${index}`,
  }
}))
const currentIndex=computed(()=>{
  if(props.currentKey!==undefined){
    const index=sourceRecords.value.findIndex(record=>record.key===props.currentKey)
    if(index>=0)return index
  }
  for(let index=sourceRecords.value.length-1;index>=0;index-=1)if(sourceRecords.value[index].explicitCurrent)return index
  return sourceRecords.value.length-1
})
const records=computed(()=>sourceRecords.value.map(record=>({...record,current:record.index===currentIndex.value})))
const resolvedExpanded=computed(()=>props.expanded===undefined?internalExpanded.value:props.expanded)
const normalizedMaxItems=computed(()=>{
  const value=Math.floor(Number(props.maxItems)||0)
  return value>=3?value:0
})
const collapseRange=computed(()=>{
  const count=records.value.length
  const max=normalizedMaxItems.value
  if(!max||count<=max)return null
  const budget=max-1
  const before=Math.min(Math.max(1,Math.floor(Number(props.itemsBeforeCollapse)||1)),budget-1)
  const after=Math.min(Math.max(1,Math.floor(Number(props.itemsAfterCollapse)||1)),budget-before)
  return{before,after,hidden:records.value.slice(before,count-after)}
})
const isCollapsed=computed(()=>Boolean(collapseRange.value&&!resolvedExpanded.value))
const entries=computed(()=>{
  if(!isCollapsed.value)return records.value.map(record=>({kind:'item',record,key:record.domKey}))
  const {before,after,hidden}=collapseRange.value
  return[
    ...records.value.slice(0,before).map(record=>({kind:'item',record,key:record.domKey})),
    {kind:'overflow',key:'breadcrumb-overflow',hidden},
    ...records.value.slice(records.value.length-after).map(record=>({kind:'item',record,key:record.domKey})),
  ]
})
const skeletonCount=computed(()=>Math.max(1,Math.min(8,Math.floor(Number(props.loadingCount)||3))))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const rootStyle=computed(()=>[{'--ui-breadcrumb-max-item-width':sizeValue(props.maxItemWidth)},attrs.style])

function itemRel(record){return record.rel||(record.target==='_blank'?'noopener noreferrer':undefined)}
function isActionable(record){return Boolean(record&&!record.current&&!record.disabled&&(record.href||record.onClick||props.interactive))}
function itemTag(record){return record.current||record.disabled?'span':record.href?'a':record.onClick||props.interactive?'button':'span'}
function metaFor(record,source){return{key:record.key,index:record.index,item:record.item,label:record.label,href:record.href||undefined,current:record.current,disabled:record.disabled,source}}
function setActionRef(element,index){if(element)actionRefs.value[index]=element}
function navigate(record,source='api',event){
  if(!isActionable(record)){event?.preventDefault();event?.stopPropagation();return false}
  const meta=metaFor(record,source)
  record.onClick?.(event,meta)
  emit('item-click',record.item,meta,event)
  emit('navigate',record.item,meta,event)
  return meta
}
function onActivate(record,event){return navigate(record,sourceOf(event),event)}
function onFocus(record,event){emit('item-focus',metaFor(record,'focus'),event)}
function expandTo(value,source='api',event){
  const expanded=Boolean(value)
  const previous=resolvedExpanded.value
  const meta={expanded,previous,source,hiddenCount:collapseRange.value?.hidden.length||0}
  if(expanded===previous)return meta
  if(props.expanded===undefined)internalExpanded.value=expanded
  emit('update:expanded',expanded)
  emit('expand-change',expanded,meta,event)
  if(expanded&&source==='keyboard'){
    const target=collapseRange.value?.hidden.find(isActionable)
    if(target)nextTick(()=>focusItem(target.index))
  }
  return meta
}
function toggle(source='api',event){return expandTo(!resolvedExpanded.value,source,event)}
function onOverflow(event){return toggle(sourceOf(event),event)}
function resolveIndex(keyOrIndex){
  if(typeof keyOrIndex==='number'&&Number.isInteger(keyOrIndex)&&records.value[keyOrIndex])return keyOrIndex
  return records.value.findIndex(record=>record.key===keyOrIndex)
}
function navigateItem(keyOrIndex,source='api'){
  const index=resolveIndex(keyOrIndex)
  return index>=0?navigate(records.value[index],source):false
}
function focusItem(keyOrIndex,options){
  const index=resolveIndex(keyOrIndex)
  if(index<0||!isActionable(records.value[index])||(isCollapsed.value&&collapseRange.value?.hidden.includes(records.value[index])))return false
  actionRefs.value[index]?.focus(options)
  return typeof document!=='undefined'&&document.activeElement===actionRefs.value[index]
}
function focusFirst(options){const record=records.value.find(isActionable);return record?focusItem(record.index,options):false}
function focusLast(options){
  for(let index=records.value.length-1;index>=0;index-=1)if(isActionable(records.value[index]))return focusItem(index,options)
  return false
}

watch(records,()=>{actionRefs.value=[]})

defineExpose({root,focusItem,focusFirst,focusLast,navigate:navigateItem,expand:(source='api')=>expandTo(true,source),collapse:(source='api')=>expandTo(false,source),toggle})
</script>

<template>
  <nav
    ref="root"
    v-bind="rootAttrs"
    class="ui-breadcrumb"
    :class="[`size-${size}`,{'is-nowrap':!wrap,'is-truncated':truncate,'is-collapsed':isCollapsed,'is-loading':loading},attrs.class]"
    :style="rootStyle"
    :aria-label="ariaLabel||t('breadcrumb.label')"
    :aria-busy="loading||undefined"
    data-ui-breadcrumb
  >
    <ol>
      <template v-if="loading">
        <slot name="loading" :count="skeletonCount">
          <li v-for="index in skeletonCount" :key="`skeleton-${index}`" class="ui-breadcrumb-skeleton" aria-hidden="true">
            <span class="ui-breadcrumb-skeleton-label"/><span v-if="index<skeletonCount" class="ui-breadcrumb-skeleton-separator"/>
          </li>
        </slot>
        <li class="sr-only"><span role="status">{{ t('breadcrumb.loading') }}</span></li>
      </template>
      <template v-else-if="entries.length">
        <li
          v-for="(entry,entryIndex) in entries"
          :key="entry.key"
          class="ui-breadcrumb-node"
          :class="entry.kind==='item'?{current:entry.record.current,disabled:entry.record.disabled,actionable:isActionable(entry.record)}:{overflow:true}"
        >
          <template v-if="entry.kind==='overflow'">
            <button
              type="button"
              class="ui-breadcrumb-item ui-breadcrumb-overflow"
              :aria-label="t('breadcrumb.expand',{count:entry.hidden.length})"
              :title="t('breadcrumb.expand',{count:entry.hidden.length})"
              :aria-expanded="false"
              @click="onOverflow"
            ><slot name="overflow" :items="entry.hidden.map(record=>record.item)" :count="entry.hidden.length" :expand="expandTo">…</slot></button>
          </template>
          <component
            :is="itemTag(entry.record)"
            v-else
            :ref="element=>setActionRef(element,entry.record.index)"
            class="ui-breadcrumb-item"
            :type="itemTag(entry.record)==='button'?'button':undefined"
            :href="itemTag(entry.record)==='a'?entry.record.href:undefined"
            :target="itemTag(entry.record)==='a'&&entry.record.target?entry.record.target:undefined"
            :rel="itemTag(entry.record)==='a'?itemRel(entry.record):undefined"
            :aria-current="entry.record.current?'page':undefined"
            :aria-disabled="entry.record.disabled||undefined"
            :title="truncate?entry.record.label:undefined"
            :data-index="entry.record.index"
            :data-key="String(entry.record.key)"
            @click="isActionable(entry.record)?onActivate(entry.record,$event):undefined"
            @focus="isActionable(entry.record)?onFocus(entry.record,$event):undefined"
          >
            <slot name="icon" v-bind="entry.record"><AppIcon v-if="entry.record.icon" class="ui-breadcrumb-icon" :name="entry.record.icon" :size="14" aria-hidden="true"/></slot>
            <slot name="item" v-bind="entry.record" :navigate="source=>navigate(entry.record,source)"><span class="ui-breadcrumb-label">{{ entry.record.label }}</span></slot>
          </component>
          <span v-if="entryIndex<entries.length-1" class="ui-breadcrumb-separator" aria-hidden="true">
            <slot name="separator" :index="entryIndex" :from="entry.kind==='item'?entry.record.item:undefined" :to="entries[entryIndex+1]?.record?.item">
              <AppIcon v-if="separatorMode==='icon'" class="ui-directional-icon" :name="separator" :size="12"/>
              <span v-else>{{ separator }}</span>
            </slot>
          </span>
        </li>
      </template>
      <li v-else class="ui-breadcrumb-empty"><slot name="empty">{{ emptyText||t('breadcrumb.empty') }}</slot></li>
    </ol>
  </nav>
</template>

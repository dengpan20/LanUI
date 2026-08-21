<script setup>
import { computed, nextTick, ref, useAttrs, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  items:{type:Array,default:()=>[]},
  itemKey:{type:[String,Function],default:'key'},
  titleField:{type:[String,Function],default:'title'},
  descriptionField:{type:[String,Function],default:'description'},
  timeField:{type:[String,Function],default:'time'},
  datetimeField:{type:[String,Function],default:'datetime'},
  statusField:{type:[String,Function],default:'status'},
  colorField:{type:[String,Function],default:'color'},
  iconField:{type:[String,Function],default:'icon'},
  hrefField:{type:[String,Function],default:'href'},
  disabledField:{type:[String,Function],default:'disabled'},
  modelValue:{type:[String,Number],default:undefined},
  defaultValue:{type:[String,Number],default:undefined},
  disabledKeys:{type:Array,default:()=>[]},
  selectable:Boolean,
  interactive:Boolean,
  keyboard:{type:Boolean,default:true},
  loop:Boolean,
  reverse:Boolean,
  orientation:{type:String,default:'vertical',validator:value=>['vertical','horizontal'].includes(value)},
  placement:{type:String,default:'start',validator:value=>['start','end','alternate'].includes(value)},
  timePosition:{type:String,default:'content',validator:value=>['content','opposite'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  line:{type:String,default:'solid',validator:value=>['solid','dashed','dotted','none'].includes(value)},
  dotVariant:{type:String,default:'outlined',validator:value=>['outlined','solid'].includes(value)},
  pending:{type:[Boolean,String],default:false},
  pendingText:{type:String,default:''},
  loading:Boolean,
  loadingCount:{type:Number,default:3},
  emptyText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','item-click','activate','item-focus'])
const attrs=useAttrs()
const {t}=useLocale()
const direction=useDirection()
const root=ref(null)
const actionRefs=ref([])
const internalValue=ref(props.defaultValue)
const activeIndex=ref(0)
const disabledSet=computed(()=>new Set(props.disabledKeys))
const knownStatuses=new Set(['default','normal','primary','success','warning','error','info','pending'])

function fieldValue(item,index,field,fallback=''){
  const value=typeof field==='function'?field(item,index):item&&typeof item==='object'?item[field]:fallback
  return value===undefined||value===null?fallback:value
}
function itemKey(item,index){
  const value=fieldValue(item,index,props.itemKey,index)
  return typeof value==='string'||typeof value==='number'?value:index
}
function normalizeStatus(value){
  const status=String(value||'default').toLowerCase()
  return knownStatuses.has(status)?(status==='normal'?'default':status):'default'
}
function sourceOf(event){return event?.detail===0?'keyboard':'pointer'}

const sourceRecords=computed(()=>props.items.map((item,index)=>({
  item,
  sourceIndex:index,
  key:itemKey(item,index),
  title:fieldValue(item,index,props.titleField,''),
  description:fieldValue(item,index,props.descriptionField,''),
  time:fieldValue(item,index,props.timeField,''),
  datetime:fieldValue(item,index,props.datetimeField,''),
  status:normalizeStatus(fieldValue(item,index,props.statusField,'default')),
  color:String(fieldValue(item,index,props.colorField,'')||''),
  icon:String(fieldValue(item,index,props.iconField,'')||''),
  href:String(fieldValue(item,index,props.hrefField,'')||''),
  target:item&&typeof item==='object'?String(item.target||''):'',
  rel:item&&typeof item==='object'?String(item.rel||''):'',
  current:Boolean(item&&typeof item==='object'&&item.current),
  disabled:disabledSet.value.has(itemKey(item,index))||Boolean(fieldValue(item,index,props.disabledField,false)),
})))
const records=computed(()=>{
  const values=sourceRecords.value.slice()
  if(props.reverse)values.reverse()
  return values.map((record,index)=>({...record,index,domKey:`${typeof record.key}-${String(record.key)}-${record.sourceIndex}`}))
})
const resolvedValue=computed(()=>props.modelValue===undefined?internalValue.value:props.modelValue)
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const skeletonCount=computed(()=>Math.max(1,Math.min(8,Math.floor(Number(props.loadingCount)||3))))
const resolvedPendingText=computed(()=>typeof props.pending==='string'?props.pending:props.pendingText||t('timeline.pending'))

function isSelected(record){return props.selectable&&resolvedValue.value===record.key}
function isActionable(record){return !record.disabled&&Boolean(props.interactive||props.selectable||record.href)}
function itemTag(record){return record.href?'a':props.interactive||props.selectable?'button':'div'}
function itemRel(record){return record.rel||(record.target==='_blank'?'noopener noreferrer':undefined)}
function itemStyle(record){return record.color?{'--ui-timeline-color':record.color}:undefined}
function metaFor(record,source){return{key:record.key,index:record.index,sourceIndex:record.sourceIndex,item:record.item,status:record.status,selected:isSelected(record),source,href:record.href||undefined}}
function setActionRef(element,index){if(element)actionRefs.value[index]=element}
function enabledIndex(start,step,allowLoop=props.loop){
  const length=records.value.length
  if(!length)return -1
  let index=start
  for(let visited=0;visited<length;visited+=1){
    if(index<0||index>=length){if(!allowLoop)return -1;index=(index+length)%length}
    if(isActionable(records.value[index]))return index
    index+=step
  }
  return -1
}
function setActive(index,source='api',focus=false,event){
  if(!records.value[index]||!isActionable(records.value[index]))return false
  activeIndex.value=index
  const meta=metaFor(records.value[index],source)
  if(focus)nextTick(()=>actionRefs.value[index]?.focus())
  return meta
}
function onFocus(record,event){
  activeIndex.value=record.index
  emit('item-focus',metaFor(record,'focus'),event)
}
function selectRecord(record,source='api',event){
  if(!record||record.disabled)return false
  const selected=props.selectable?!isSelected(record):isSelected(record)
  const previous=resolvedValue.value
  const value=props.selectable?(selected?record.key:undefined):previous
  if(props.selectable){
    if(props.modelValue===undefined)internalValue.value=value
    emit('update:modelValue',value)
    emit('change',value,{...metaFor(record,source),selected,previous},event)
  }
  const meta={...metaFor(record,source),selected}
  emit('activate',meta,event)
  return meta
}
function onActivate(record,event){
  if(record.disabled){event.preventDefault();event.stopPropagation();return false}
  activeIndex.value=record.index
  emit('item-click',record.item,record.sourceIndex,event)
  return selectRecord(record,sourceOf(event),event)
}
function move(step,event){
  let target=enabledIndex(activeIndex.value+step,step)
  if(target<0&&props.loop)target=enabledIndex(step>0?0:records.value.length-1,step,false)
  if(target>=0){event.preventDefault();setActive(target,'keyboard',true,event)}
}
function onKeydown(record,event){
  if(!props.keyboard||record.disabled)return
  const rtl=direction.value==='rtl'
  const previous=props.orientation==='horizontal'?(rtl?'ArrowRight':'ArrowLeft'):'ArrowUp'
  const next=props.orientation==='horizontal'?(rtl?'ArrowLeft':'ArrowRight'):'ArrowDown'
  if(event.key===previous)move(-1,event)
  else if(event.key===next)move(1,event)
  else if(event.key==='Home'){
    const target=enabledIndex(0,1,false)
    if(target>=0){event.preventDefault();setActive(target,'keyboard',true,event)}
  }else if(event.key==='End'){
    const target=enabledIndex(records.value.length-1,-1,false)
    if(target>=0){event.preventDefault();setActive(target,'keyboard',true,event)}
  }
}
function focusItem(keyOrIndex,options){
  const index=typeof keyOrIndex==='number'&&Number.isInteger(keyOrIndex)&&records.value[keyOrIndex]?keyOrIndex:records.value.findIndex(record=>record.key===keyOrIndex)
  if(index<0||!isActionable(records.value[index]))return false
  activeIndex.value=index
  actionRefs.value[index]?.focus(options)
  return typeof document!=='undefined'&&document.activeElement===actionRefs.value[index]
}
function focusFirst(options){const index=enabledIndex(0,1,false);return index>=0?focusItem(index,options):false}
function focusLast(options){const index=enabledIndex(records.value.length-1,-1,false);return index>=0?focusItem(index,options):false}
function select(key,source='api'){
  const record=records.value.find(item=>item.key===key)
  return selectRecord(record,source)
}

watch(records,()=>{
  actionRefs.value=[]
  if(!records.value[activeIndex.value]||!isActionable(records.value[activeIndex.value])){
    const selected=records.value.findIndex(record=>record.key===resolvedValue.value&&isActionable(record))
    activeIndex.value=selected>=0?selected:Math.max(0,enabledIndex(0,1,false))
  }
},{immediate:true})
watch(resolvedValue,value=>{
  const index=records.value.findIndex(record=>record.key===value&&isActionable(record))
  if(index>=0)activeIndex.value=index
})

defineExpose({root,focusItem,focusFirst,focusLast,select})
</script>

<template>
  <ol
    ref="root"
    v-bind="rootAttrs"
    class="ui-timeline"
    :class="[`direction-${orientation}`,`placement-${placement}`,`time-${timePosition}`,`size-${size}`,`line-${line}`,`dot-${dotVariant}`,attrs.class]"
    :style="attrs.style"
    :aria-label="ariaLabel||t('timeline.label')"
    :aria-busy="loading||undefined"
    data-ui-timeline
  >
    <template v-if="loading">
      <li v-for="index in skeletonCount" :key="`skeleton-${index}`" class="ui-timeline-item ui-timeline-skeleton" aria-hidden="true">
        <span class="ui-timeline-dot"/><div class="ui-timeline-content"><span/><span/><span/></div>
      </li>
      <li class="sr-only" role="status">{{ t('timeline.loading') }}</li>
    </template>
    <template v-else-if="records.length">
      <li
        v-for="record in records"
        :key="record.domKey"
        class="ui-timeline-item"
        :class="[`status-${record.status}`,{selected:isSelected(record),current:record.current,disabled:record.disabled,actionable:isActionable(record),'custom-color':record.color}]"
        :style="itemStyle(record)"
        :data-key="String(record.key)"
        :data-selected="selectable?String(isSelected(record)):undefined"
      >
        <span class="ui-timeline-dot" aria-hidden="true">
          <slot name="dot" v-bind="record" :selected="isSelected(record)"><AppIcon v-if="record.icon" :name="record.icon" :size="12"/></slot>
        </span>
        <div v-if="timePosition==='opposite'" class="ui-timeline-opposite">
          <slot name="opposite" v-bind="record" :selected="isSelected(record)">
            <slot name="time" v-bind="record"><time v-if="record.time" :datetime="record.datetime||undefined">{{ record.time }}</time></slot>
          </slot>
        </div>
        <component
          :is="itemTag(record)"
          :ref="element=>setActionRef(element,record.index)"
          class="ui-timeline-content"
          :type="itemTag(record)==='button'?'button':undefined"
          :disabled="itemTag(record)==='button'?record.disabled:undefined"
          :href="itemTag(record)==='a'&&!record.disabled?record.href:undefined"
          :target="itemTag(record)==='a'&&!record.disabled&&record.target?record.target:undefined"
          :rel="itemTag(record)==='a'&&!record.disabled?itemRel(record):undefined"
          :tabindex="isActionable(record)?(record.index===activeIndex?0:-1):undefined"
          :aria-disabled="itemTag(record)==='a'&&record.disabled||undefined"
          :aria-pressed="selectable&&itemTag(record)==='button'?isSelected(record):undefined"
          :aria-current="record.current||isSelected(record)?'step':undefined"
          @click="isActionable(record)||record.disabled?onActivate(record,$event):undefined"
          @keydown="onKeydown(record,$event)"
          @focus="isActionable(record)?onFocus(record,$event):undefined"
        >
          <slot name="item" v-bind="record" :selected="isSelected(record)" :activate="source=>selectRecord(record,source)">
            <span class="ui-timeline-heading">
              <slot name="title" v-bind="record" :selected="isSelected(record)"><strong>{{ record.title }}</strong></slot>
              <slot v-if="timePosition==='content'" name="time" v-bind="record"><time v-if="record.time" :datetime="record.datetime||undefined">{{ record.time }}</time></slot>
            </span>
            <slot name="description" v-bind="record"><p v-if="record.description">{{ record.description }}</p></slot>
          </slot>
        </component>
      </li>
      <li v-if="pending" class="ui-timeline-item status-pending pending" aria-live="polite">
        <span class="ui-timeline-dot" aria-hidden="true"/>
        <div class="ui-timeline-content"><slot name="pending">{{ resolvedPendingText }}</slot></div>
      </li>
    </template>
    <li v-else class="ui-timeline-empty"><slot name="empty">{{ emptyText||t('timeline.empty') }}</slot></li>
  </ol>
</template>

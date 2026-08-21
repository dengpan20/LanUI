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
  subtitleField:{type:[String,Function],default:'subtitle'},
  statusField:{type:[String,Function],default:'status'},
  iconField:{type:[String,Function],default:'icon'},
  disabledField:{type:[String,Function],default:'disabled'},
  modelValue:{type:Number,default:undefined},
  current:{type:Number,default:undefined},
  defaultCurrent:{type:Number,default:0},
  disabledIndexes:{type:Array,default:()=>[]},
  interactive:Boolean,
  linear:Boolean,
  keyboard:{type:Boolean,default:true},
  loop:Boolean,
  disabled:Boolean,
  direction:{type:String,default:'horizontal',validator:value=>['horizontal','vertical'].includes(value)},
  labelPlacement:{type:String,default:'horizontal',validator:value=>['horizontal','vertical'].includes(value)},
  type:{type:String,default:'default',validator:value=>['default','navigation','inline'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  status:{type:String,default:'process',validator:value=>['wait','process','finish','error'].includes(value)},
  responsive:{type:Boolean,default:true},
  loading:Boolean,
  loadingCount:{type:Number,default:3},
  emptyText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','update:current','change','item-click','item-focus'])
const attrs=useAttrs()
const {t}=useLocale()
const directionMode=useDirection()
const root=ref(null)
const actionRefs=ref([])
const internalCurrent=ref(normalizeCurrent(props.defaultCurrent))
const activeIndex=ref(0)
const disabledSet=computed(()=>new Set(props.disabledIndexes.map(value=>Number(value))))
const knownStatuses=new Set(['wait','process','finish','error'])

function normalizeCurrent(value){
  const number=Number(value)
  return Number.isFinite(number)?Math.trunc(number):0
}
function fieldValue(item,index,field,fallback=''){
  const value=typeof field==='function'?field(item,index):item&&typeof item==='object'?item[field]:fallback
  return value===undefined||value===null?fallback:value
}
function keyFor(item,index){
  const value=fieldValue(item,index,props.itemKey,index)
  return typeof value==='string'||typeof value==='number'?value:index
}
function normalizeStatus(value,fallback='wait'){
  const status=String(value||fallback).toLowerCase()
  return knownStatuses.has(status)?status:fallback
}
function sourceOf(event){return event?.detail===0?'keyboard':'pointer'}

const resolvedCurrent=computed(()=>normalizeCurrent(props.modelValue??props.current??internalCurrent.value))
const records=computed(()=>props.items.map((item,index)=>{
  const explicitStatus=fieldValue(item,index,props.statusField,'')
  const status=explicitStatus?normalizeStatus(explicitStatus):index<resolvedCurrent.value?'finish':index===resolvedCurrent.value?props.status:'wait'
  const key=keyFor(item,index)
  return{
    item,index,key,status,
    title:fieldValue(item,index,props.titleField,''),
    description:fieldValue(item,index,props.descriptionField,''),
    subtitle:fieldValue(item,index,props.subtitleField,''),
    icon:String(fieldValue(item,index,props.iconField,'')||''),
    disabled:props.disabled||disabledSet.value.has(index)||Boolean(fieldValue(item,index,props.disabledField,false)),
    domKey:`${typeof key}-${String(key)}-${index}`,
  }
}))
const isInteractive=computed(()=>props.interactive||props.type==='navigation')
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const skeletonCount=computed(()=>Math.max(1,Math.min(8,Math.floor(Number(props.loadingCount)||3))))

function canActivate(record){
  if(!record||record.disabled||!isInteractive.value)return false
  return !props.linear||record.index<=Math.max(0,resolvedCurrent.value+1)
}
function metaFor(record,source,previous=resolvedCurrent.value){return{index:record.index,previous,key:record.key,item:record.item,status:record.status,source}}
function setActionRef(element,index){if(element)actionRefs.value[index]=element}
function enabledIndex(start,step,allowLoop=props.loop){
  const length=records.value.length
  if(!length)return -1
  let index=start
  for(let visited=0;visited<length;visited+=1){
    if(index<0||index>=length){if(!allowLoop)return -1;index=(index+length)%length}
    if(canActivate(records.value[index]))return index
    index+=step
  }
  return -1
}
function setActive(index,focus=false){
  if(!canActivate(records.value[index]))return false
  activeIndex.value=index
  if(focus)nextTick(()=>actionRefs.value[index]?.focus())
  return true
}
function changeTo(index,source='api',event){
  const record=records.value[index]
  if(!canActivate(record))return false
  const previous=resolvedCurrent.value
  const meta=metaFor(record,source,previous)
  activeIndex.value=index
  if(index===previous)return meta
  if(props.modelValue===undefined&&props.current===undefined)internalCurrent.value=index
  emit('update:modelValue',index)
  emit('update:current',index)
  emit('change',index,meta,event)
  return meta
}
function onActivate(record,event){
  if(!canActivate(record)){event?.preventDefault();event?.stopPropagation();return false}
  emit('item-click',record.item,record.index,event)
  return changeTo(record.index,sourceOf(event),event)
}
function onFocus(record,event){
  activeIndex.value=record.index
  emit('item-focus',metaFor(record,'focus'),event)
}
function move(step,event){
  const target=enabledIndex(activeIndex.value+step,step)
  if(target>=0){event.preventDefault();setActive(target,true)}
}
function onKeydown(record,event){
  if(!props.keyboard||!canActivate(record))return
  const rtl=directionMode.value==='rtl'
  const previousHorizontal=rtl?'ArrowRight':'ArrowLeft'
  const nextHorizontal=rtl?'ArrowLeft':'ArrowRight'
  const previousKeys=props.direction==='vertical'||props.responsive?['ArrowUp',previousHorizontal]:[previousHorizontal]
  const nextKeys=props.direction==='vertical'||props.responsive?['ArrowDown',nextHorizontal]:[nextHorizontal]
  if(previousKeys.includes(event.key))move(-1,event)
  else if(nextKeys.includes(event.key))move(1,event)
  else if(event.key==='Home'){
    const target=enabledIndex(0,1,false)
    if(target>=0){event.preventDefault();setActive(target,true)}
  }else if(event.key==='End'){
    const target=enabledIndex(records.value.length-1,-1,false)
    if(target>=0){event.preventDefault();setActive(target,true)}
  }
}
function resolveIndex(keyOrIndex){
  if(typeof keyOrIndex==='number'&&Number.isInteger(keyOrIndex)&&records.value[keyOrIndex])return keyOrIndex
  return records.value.findIndex(record=>record.key===keyOrIndex)
}
function focusItem(keyOrIndex,options){
  const index=resolveIndex(keyOrIndex)
  if(index<0||!canActivate(records.value[index]))return false
  activeIndex.value=index
  actionRefs.value[index]?.focus(options)
  return typeof document!=='undefined'&&document.activeElement===actionRefs.value[index]
}
function focusCurrent(options){return focusItem(resolvedCurrent.value,options)}
function focusFirst(options){const index=enabledIndex(0,1,false);return index>=0?focusItem(index,options):false}
function focusLast(options){const index=enabledIndex(records.value.length-1,-1,false);return index>=0?focusItem(index,options):false}
function goTo(keyOrIndex,source='api'){
  const index=resolveIndex(keyOrIndex)
  return index>=0?changeTo(index,source):false
}
function next(source='api'){const index=enabledIndex(Math.max(-1,resolvedCurrent.value)+1,1);return index>=0?changeTo(index,source):false}
function previous(source='api'){const index=enabledIndex(Math.min(records.value.length,resolvedCurrent.value)-1,-1);return index>=0?changeTo(index,source):false}

watch([records,resolvedCurrent,isInteractive],()=>{
  actionRefs.value=[]
  const preferred=records.value[resolvedCurrent.value]&&canActivate(records.value[resolvedCurrent.value])?resolvedCurrent.value:-1
  if(!canActivate(records.value[activeIndex.value]))activeIndex.value=preferred>=0?preferred:Math.max(0,enabledIndex(0,1,false))
},{immediate:true})

defineExpose({root,focusItem,focusCurrent,focusFirst,focusLast,goTo,next,previous})
</script>

<template>
  <ol
    ref="root"
    v-bind="rootAttrs"
    class="ui-steps"
    :class="[`direction-${direction}`,`label-${labelPlacement}`,`type-${type}`,`size-${size}`,{'is-responsive':responsive,'is-interactive':isInteractive,'is-disabled':disabled},attrs.class]"
    :style="attrs.style"
    :aria-label="ariaLabel||t('steps.label')"
    :aria-busy="loading||undefined"
    data-ui-steps
  >
    <template v-if="loading">
      <slot name="loading" :count="skeletonCount">
        <li v-for="index in skeletonCount" :key="`skeleton-${index}`" class="ui-step ui-step-skeleton" aria-hidden="true">
          <span v-if="index<skeletonCount" class="ui-step-connector"/><div class="ui-step-main"><span class="ui-step-mark"/><span class="ui-step-copy"><span/><span/></span></div>
        </li>
        <li class="sr-only" role="status">{{ t('steps.loading') }}</li>
      </slot>
    </template>
    <template v-else-if="records.length">
      <li
        v-for="record in records"
        :key="record.domKey"
        class="ui-step"
        :class="[`status-${record.status}`,{done:record.status==='finish',active:record.index===resolvedCurrent,error:record.status==='error',disabled:record.disabled,actionable:canActivate(record)}]"
        :data-index="record.index"
        :data-key="String(record.key)"
      >
        <span v-if="record.index<records.length-1" class="ui-step-connector" aria-hidden="true"/>
        <component
          :is="isInteractive?'button':'div'"
          :ref="element=>setActionRef(element,record.index)"
          class="ui-step-main"
          :type="isInteractive?'button':undefined"
          :disabled="isInteractive&&!canActivate(record)"
          :tabindex="isInteractive&&canActivate(record)?(record.index===activeIndex?0:-1):undefined"
          :aria-current="record.index===resolvedCurrent?'step':undefined"
          @click="isInteractive?onActivate(record,$event):undefined"
          @keydown="onKeydown(record,$event)"
          @focus="isInteractive&&canActivate(record)?onFocus(record,$event):undefined"
        >
          <span class="ui-step-mark" aria-hidden="true">
            <slot name="icon" v-bind="record">
              <AppIcon v-if="record.icon" :name="record.icon" :size="14"/>
              <AppIcon v-else-if="record.status==='finish'" name="check" :size="14"/>
              <template v-else>{{ record.index+1 }}</template>
            </slot>
          </span>
          <slot name="item" v-bind="record" :activate="source=>changeTo(record.index,source)">
            <span class="ui-step-copy">
              <span class="ui-step-heading">
                <slot name="title" v-bind="record"><strong>{{ record.title }}</strong></slot>
                <slot name="subtitle" v-bind="record"><small v-if="record.subtitle" class="ui-step-subtitle">{{ record.subtitle }}</small></slot>
              </span>
              <slot name="description" v-bind="record"><small v-if="record.description" class="ui-step-description">{{ record.description }}</small></slot>
            </span>
          </slot>
        </component>
      </li>
    </template>
    <li v-else class="ui-steps-empty"><slot name="empty">{{ emptyText||t('steps.empty') }}</slot></li>
  </ol>
</template>

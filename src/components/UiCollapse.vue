<script setup>
import { computed, nextTick, ref, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  items:{type:Array,default:()=>[]},
  itemKey:{type:[String,Function],default:'key'},
  labelField:{type:[String,Function],default:'label'},
  contentField:{type:[String,Function],default:'content'},
  extraField:{type:[String,Function],default:'extra'},
  disabledField:{type:[String,Function],default:'disabled'},
  modelValue:{type:[Array,String,Number],default:undefined},
  defaultValue:{type:[Array,String,Number],default:()=>[]},
  accordion:Boolean,
  collapsible:{type:Boolean,default:true},
  bordered:{type:Boolean,default:true},
  ghost:Boolean,
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  disabled:Boolean,
  keyboard:{type:Boolean,default:true},
  loop:Boolean,
  lazy:Boolean,
  destroyOnHide:Boolean,
  animated:{type:Boolean,default:true},
  duration:{type:Number,default:200},
  expandIconPosition:{type:String,default:'start',validator:value=>['start','end'].includes(value)},
  headingLevel:{type:Number,default:3},
  beforeToggle:{type:Function,default:null},
  loading:Boolean,
  loadingCount:{type:Number,default:3},
  emptyText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','toggle','before-change','toggle-blocked','toggle-error','item-focus','after-open','after-close'])
const attrs=useAttrs()
const slots=useSlots()
const {t}=useLocale()
const reducedMotion=useReducedMotion()
const uid=useId()
const root=ref(null)
const triggerRefs=ref([])
const internalValue=ref(props.defaultValue)
const mountedKeys=ref(new Set())
const pendingKeys=ref(new Set())
let nextFocusSource='focus'

function fieldValue(item,index,field,fallback=''){
  const value=typeof field==='function'?field(item,index):item&&typeof item==='object'?item[field]:fallback
  return value===undefined||value===null?fallback:value
}
function itemKey(item,index){
  const value=fieldValue(item,index,props.itemKey,index)
  return typeof value==='string'||typeof value==='number'?value:index
}
function headingTag(item){
  const value=Number(item?.headingLevel??props.headingLevel)
  return `h${Math.max(2,Math.min(6,Number.isFinite(value)?Math.round(value):3))}`
}
function sourceOf(event){return event?.detail===0?'keyboard':'pointer'}
function normalizedKeys(value){
  const values=Array.isArray(value)?value:(value===''||value===null||value===undefined?[]:[value])
  return props.accordion?values.slice(0,1):values
}
function outputValue(keys){return props.accordion?(keys[0]??''):keys}

const records=computed(()=>props.items.map((item,index)=>{
  const key=itemKey(item,index)
  return{
    item,index,key,
    domKey:`${typeof key}-${String(key)}-${index}`,
    label:fieldValue(item,index,props.labelField,''),
    content:fieldValue(item,index,props.contentField,''),
    extra:fieldValue(item,index,props.extraField,''),
    disabled:props.disabled||Boolean(fieldValue(item,index,props.disabledField,false)),
    forceRender:Boolean(item?.forceRender),
    showArrow:item?.showArrow!==false,
    icon:String(item?.icon||'chevronRight'),
    headerClass:item?.headerClass,
    panelClass:item?.panelClass,
  }
}))
const resolvedRaw=computed(()=>props.modelValue===undefined?internalValue.value:props.modelValue)
function enforceOpenKeys(keys){
  if(!props.accordion||props.collapsible||keys.length)return keys
  const first=records.value.find(record=>!record.disabled)
  return first?[first.key]:[]
}
const openKeys=computed(()=>enforceOpenKeys(normalizedKeys(resolvedRaw.value)))
const openSet=computed(()=>new Set(openKeys.value))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style','aria-label'].includes(key))))
const resolvedEmptyText=computed(()=>props.emptyText||t('collapse.empty'))
const skeletonCount=computed(()=>Math.max(1,Math.min(8,Math.floor(Number(props.loadingCount)||3))))
const motionEnabled=computed(()=>props.animated&&!reducedMotion.value&&props.duration>0)
const rootStyle=computed(()=>({'--motion-time-collapse':`${Math.max(0,Number(props.duration)||0)}ms`}))

function isOpen(recordOrKey){return openSet.value.has(typeof recordOrKey==='object'?recordOrKey.key:recordOrKey)}
function isPending(recordOrKey){return pendingKeys.value.has(typeof recordOrKey==='object'?recordOrKey.key:recordOrKey)}
function shouldRender(record){return record.forceRender||isOpen(record)||(!props.lazy&&!props.destroyOnHide)||(!props.destroyOnHide&&mountedKeys.value.has(record.key))}
function markMounted(keys){
  const next=new Set(mountedKeys.value)
  for(const key of keys)next.add(key)
  mountedKeys.value=next
}
function setPending(key,value){
  const next=new Set(pendingKeys.value)
  if(value)next.add(key);else next.delete(key)
  pendingKeys.value=next
}
function metaFor(record,open,source,previous,value){return{key:record.key,index:record.index,item:record.item,open,source,previous,value,accordion:props.accordion}}

async function requestToggle(record,open=!isOpen(record),source='api',event){
  if(!record||record.disabled||isPending(record))return false
  const previous=outputValue(openKeys.value.slice())
  if(props.accordion&&!props.collapsible&&!open&&isOpen(record)&&openKeys.value.length===1){
    const meta=metaFor(record,false,source,previous,previous)
    emit('toggle-blocked',meta,event)
    return false
  }
  let nextKeys
  if(open)nextKeys=props.accordion?[record.key]:openKeys.value.includes(record.key)?openKeys.value.slice():[...openKeys.value,record.key]
  else nextKeys=openKeys.value.filter(key=>key!==record.key)
  const value=outputValue(nextKeys)
  const meta=metaFor(record,open,source,previous,value)
  emit('before-change',meta,event)
  if(props.beforeToggle){
    setPending(record.key,true)
    try{
      const allowed=await props.beforeToggle(record.item,open,meta,event)
      if(allowed===false){emit('toggle-blocked',{...meta,reason:'guard'},event);return false}
    }catch(error){emit('toggle-error',error,{...meta,reason:'guard'},event);return false}
    finally{setPending(record.key,false)}
  }
  if(open)markMounted([record.key])
  if(props.modelValue===undefined)internalValue.value=value
  emit('update:modelValue',value)
  emit('change',value,meta,event)
  emit('toggle',meta,event)
  return meta
}
function recordFor(keyOrIndex){
  const keyed=records.value.find(record=>record.key===keyOrIndex)
  if(keyed)return keyed
  return typeof keyOrIndex==='number'&&Number.isInteger(keyOrIndex)?records.value[keyOrIndex]:undefined
}
function setOpenKeys(keys,source='api'){
  const allowed=new Set(records.value.filter(record=>!record.disabled).map(record=>record.key))
  const normalized=enforceOpenKeys(normalizedKeys(keys).filter(key=>allowed.has(key)))
  const previousKeys=openKeys.value.slice()
  const previous=outputValue(previousKeys),value=outputValue(normalized)
  const changedKey=[...previousKeys,...normalized].find(key=>previousKeys.includes(key)!==normalized.includes(key))
  if(changedKey===undefined)return value
  const record=recordFor(changedKey)||{key:changedKey,index:-1,item:null}
  const meta=metaFor(record,normalized.includes(changedKey),source,previous,value)
  if(props.modelValue===undefined)internalValue.value=value
  markMounted(normalized)
  emit('update:modelValue',value)
  emit('change',value,meta)
  emit('toggle',meta)
  return value
}
function open(key,source='api'){const record=recordFor(key);return record&&!isOpen(record)?requestToggle(record,true,source):false}
function close(key,source='api'){const record=recordFor(key);return record&&isOpen(record)?requestToggle(record,false,source):false}
function toggle(key,source='api'){const record=recordFor(key);return record?requestToggle(record,!isOpen(record),source):false}
function openAll(source='api'){
  const enabled=records.value.filter(record=>!record.disabled)
  return setOpenKeys(props.accordion?(enabled[0]?[enabled[0].key]:[]):enabled.map(record=>record.key),source)
}
function closeAll(source='api'){
  if(props.accordion&&!props.collapsible&&openKeys.value.length)return outputValue(openKeys.value.slice())
  return setOpenKeys([],source)
}
function enabledIndex(start,step,allowLoop=props.loop){
  const length=records.value.length
  if(!length)return -1
  let index=start
  for(let visited=0;visited<length;visited+=1){
    if(index<0||index>=length){if(!allowLoop)return -1;index=(index+length)%length}
    if(!records.value[index].disabled)return index
    index+=step
  }
  return -1
}
function focusIndex(index,source='api',options){
  const record=records.value[index]
  if(!record||record.disabled)return false
  nextFocusSource=source
  triggerRefs.value[index]?.focus(options)
  if(typeof document==='undefined'||document.activeElement!==triggerRefs.value[index])nextFocusSource='focus'
  return typeof document!=='undefined'&&document.activeElement===triggerRefs.value[index]
}
function focusItem(keyOrIndex,options){const record=recordFor(keyOrIndex);return record?focusIndex(record.index,'api',options):false}
function focusFirst(options){const index=enabledIndex(0,1,false);return index>=0?focusIndex(index,'api',options):false}
function focusLast(options){const index=enabledIndex(records.value.length-1,-1,false);return index>=0?focusIndex(index,'api',options):false}
function onFocus(record,event){const source=nextFocusSource;nextFocusSource='focus';emit('item-focus',metaFor(record,isOpen(record),source,outputValue(openKeys.value),outputValue(openKeys.value)),event)}
function onKeydown(record,event){
  if(!props.keyboard||record.disabled)return
  let target=-1
  if(event.key==='ArrowDown')target=enabledIndex(record.index+1,1)
  else if(event.key==='ArrowUp')target=enabledIndex(record.index-1,-1)
  else if(event.key==='Home')target=enabledIndex(0,1,false)
  else if(event.key==='End')target=enabledIndex(records.value.length-1,-1,false)
  else return
  if(target>=0){event.preventDefault();focusIndex(target,'keyboard')}
}
function slotScope(record){return{item:record.item,index:record.index,key:record.key,label:record.label,content:record.content,extra:record.extra,open:isOpen(record),disabled:record.disabled,pending:isPending(record),toggle:(source='slot')=>requestToggle(record,!isOpen(record),source)}}
function afterEnter(record){emit('after-open',metaFor(record,true,'transition',outputValue(openKeys.value),outputValue(openKeys.value)))}
function afterLeave(record){emit('after-close',metaFor(record,false,'transition',outputValue(openKeys.value),outputValue(openKeys.value)))}

watch([records,openKeys],([nextRecords,nextKeys])=>{
  const known=new Set(nextRecords.map(record=>record.key))
  const visible=nextKeys.filter(key=>known.has(key))
  markMounted(props.lazy?visible:nextRecords.map(record=>record.key))
  if(props.modelValue===undefined){
    const internal=enforceOpenKeys(normalizedKeys(internalValue.value).filter(key=>known.has(key)))
    const normalized=outputValue(internal)
    if(JSON.stringify(normalized)!==JSON.stringify(internalValue.value))internalValue.value=normalized
  }
},{immediate:true})
watch([()=>props.accordion,()=>props.collapsible],()=>{if(props.modelValue===undefined)internalValue.value=outputValue(enforceOpenKeys(normalizedKeys(internalValue.value)))})
watch(()=>props.disabled,disabled=>{if(disabled&&typeof document!=='undefined'&&root.value?.contains(document.activeElement))nextTick(()=>root.value?.focus?.())})

defineExpose({root,openKeys,pendingKeys,isOpen,open,close,toggle,openAll,closeAll,setOpenKeys,focusItem,focusFirst,focusLast})
</script>

<template>
  <div ref="root" v-bind="rootAttrs" class="ui-collapse" :class="[attrs.class,`size-${size}`,{bordered,ghost,disabled,loading,'icon-end':expandIconPosition==='end','motion-disabled':!motionEnabled}]" :style="[rootStyle,attrs.style]" role="group" :aria-label="ariaLabel||undefined" :aria-busy="loading||pendingKeys.size>0||undefined" data-ui-collapse tabindex="-1">
    <template v-if="loading">
      <slot name="loading" :count="skeletonCount">
        <div class="ui-collapse-loading" role="status" :aria-label="t('collapse.loading')">
          <div v-for="index in skeletonCount" :key="index" class="ui-collapse-skeleton" aria-hidden="true"><span/><i/></div>
        </div>
      </slot>
    </template>
    <template v-else-if="records.length">
      <section v-for="record in records" :key="record.domKey" class="ui-collapse-item" :class="[{open:isOpen(record),disabled:record.disabled,pending:isPending(record)},record.item?.class]" :data-key="String(record.key)" :data-open="isOpen(record)" :data-pending="isPending(record)||undefined">
        <component :is="headingTag(record.item)" class="ui-collapse-heading">
          <button :ref="element=>{if(element)triggerRefs[record.index]=element}" type="button" class="ui-collapse-trigger" :class="record.headerClass" :id="`${uid}-${record.index}-trigger`" :aria-expanded="isOpen(record)" :aria-controls="`${uid}-${record.index}-panel`" :aria-busy="isPending(record)||undefined" :disabled="record.disabled||isPending(record)" @click="requestToggle(record,!isOpen(record),sourceOf($event),$event)" @focus="onFocus(record,$event)" @keydown="onKeydown(record,$event)">
            <span v-if="record.showArrow" class="ui-collapse-expand-icon" aria-hidden="true"><slot name="expand-icon" v-bind="slotScope(record)"><AppIcon class="ui-directional-icon" :name="record.icon" :size="15"/></slot></span>
            <span class="ui-collapse-label"><slot name="header" v-bind="slotScope(record)">{{ record.label }}</slot></span>
            <span v-if="record.extra||slots.extra" class="ui-collapse-extra"><slot name="extra" v-bind="slotScope(record)">{{ record.extra }}</slot></span>
            <span v-if="isPending(record)" class="ui-collapse-pending" aria-hidden="true"/>
          </button>
        </component>
        <Transition :name="motionEnabled?'ui-collapse-motion':''" :css="motionEnabled" @after-enter="afterEnter(record)" @after-leave="afterLeave(record)">
          <div v-if="shouldRender(record)" v-show="isOpen(record)" :id="`${uid}-${record.index}-panel`" class="ui-collapse-panel" :class="record.panelClass" role="region" :aria-labelledby="`${uid}-${record.index}-trigger`">
            <div class="ui-collapse-panel-content">
              <slot :name="`item-${record.key}`" v-bind="slotScope(record)"><slot name="content" v-bind="slotScope(record)">{{ record.content }}</slot></slot>
            </div>
          </div>
        </Transition>
      </section>
    </template>
    <slot v-else name="empty"><div class="ui-collapse-empty" role="status">{{ resolvedEmptyText }}</div></slot>
  </div>
</template>

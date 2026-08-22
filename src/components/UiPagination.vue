<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiSelect from './UiSelect.vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:Number,default:undefined},
  page:{type:Number,default:undefined},
  defaultPage:{type:Number,default:1},
  pageSize:{type:Number,default:undefined},
  defaultPageSize:{type:Number,default:10},
  total:{type:Number,default:0},
  pageSizeOptions:{type:Array,default:()=>[10,20,50]},
  pagerCount:{type:Number,default:7},
  showTotal:{type:Boolean,default:true},
  showSizeChanger:{type:Boolean,default:true},
  showQuickJumper:Boolean,
  showFirstLast:Boolean,
  showPrevNext:{type:Boolean,default:true},
  hideOnSinglePage:Boolean,
  ellipsisInteractive:{type:Boolean,default:true},
  simple:Boolean,
  compact:Boolean,
  responsive:{type:Boolean,default:true},
  size:{type:String,default:'',validator:value=>!value||['sm','md','lg'].includes(value)},
  disabled:Boolean,
  readonly:Boolean,
  loading:Boolean,
  keyboard:{type:Boolean,default:true},
  autofocus:Boolean,
  pageSizeChangeBehavior:{type:String,default:'reset',validator:value=>['reset','preserve-page','preserve-item'].includes(value)},
  totalFormatter:Function,
  pageAriaLabel:Function,
  beforeChange:Function,
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits([
  'update:modelValue','update:page','update:pageSize','change','page-change','page-size-change',
  'quick-jump','invalid','focus','blur',
])
const attrs=useAttrs()
const {t,formatNumber}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(toRef(props,'size'))
const rootRef=ref(null)
const simpleInputRef=ref(null)
const quickInputRef=ref(null)
const pageRefs=new Map()
const internalPage=ref(positiveInteger(props.defaultPage,1))
const internalPageSize=ref(positiveInteger(props.defaultPageSize,10))
const jumpValue=ref('')
const pending=ref(false)
const viewportWidth=ref(Infinity)
let observer=null

function positiveInteger(value,fallback=1){
  const number=Number(value)
  return Number.isFinite(number)&&number>0?Math.max(1,Math.trunc(number)):fallback
}
function clamp(value,min,max){return Math.min(max,Math.max(min,value))}
function range(from,to){return Array.from({length:Math.max(0,to-from+1)},(_,index)=>from+index)}
function sourceOf(event,fallback='pointer'){return event?.detail===0?'keyboard':fallback}
function isPromise(value){return Boolean(value&&typeof value.then==='function')}
function eventSafe(event){return event&&typeof event==='object'?event:undefined}

const normalizedTotal=computed(()=>{
  const value=Number(props.total)
  return Number.isFinite(value)?Math.max(0,Math.trunc(value)):0
})
const requestedPageSize=computed(()=>props.pageSize===undefined?internalPageSize.value:props.pageSize)
const resolvedPageSize=computed(()=>positiveInteger(requestedPageSize.value,positiveInteger(props.defaultPageSize,10)))
const pageCount=computed(()=>Math.max(1,Math.ceil(normalizedTotal.value/resolvedPageSize.value)))
const requestedPage=computed(()=>props.page??props.modelValue??internalPage.value)
const resolvedPage=computed(()=>clamp(positiveInteger(requestedPage.value,1),1,pageCount.value))
const start=computed(()=>normalizedTotal.value?(resolvedPage.value-1)*resolvedPageSize.value+1:0)
const end=computed(()=>Math.min(normalizedTotal.value,resolvedPage.value*resolvedPageSize.value))
const normalizedPagerCount=computed(()=>{
  const value=clamp(positiveInteger(props.pagerCount,7),5,21)
  return value%2===0?value+1:value
})
const pageSizeChoices=computed(()=>{
  const result=[]
  for(const raw of [...props.pageSizeOptions,resolvedPageSize.value]){
    const value=positiveInteger(raw,0)
    if(value&&!result.includes(value))result.push(value)
  }
  return result.sort((left,right)=>left-right).map(value=>({value,label:formatNumber(value,{useGrouping:false})}))
})
const totalText=computed(()=>{
  const context={start:start.value,end:end.value,total:normalizedTotal.value,page:resolvedPage.value,pageSize:resolvedPageSize.value,pageCount:pageCount.value}
  if(typeof props.totalFormatter==='function'){
    try{
      const value=props.totalFormatter(context)
      if(value!==undefined&&value!==null)return String(value)
    }catch(error){emitInvalid('formatter-error','render',{error,value:context})}
  }
  return t('pagination.total',{start:formatNumber(start.value),end:formatNumber(end.value),total:formatNumber(normalizedTotal.value)})
})
const hidden=computed(()=>props.hideOnSinglePage&&pageCount.value<=1)
const blocked=computed(()=>props.disabled||props.readonly||props.loading||pending.value)
const actuallyDisabled=computed(()=>props.disabled||props.loading||pending.value)
const narrow=computed(()=>props.responsive&&viewportWidth.value<620)
const tight=computed(()=>props.responsive&&viewportWidth.value<390)
const effectiveSimple=computed(()=>props.simple||tight.value)
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'class','style','id','aria-label','aria-disabled','aria-busy','tabindex',
].includes(key))))

const items=computed(()=>{
  const count=pageCount.value
  const current=resolvedPage.value
  const visible=normalizedPagerCount.value
  if(effectiveSimple.value)return[]
  if(count<=visible)return range(1,count).map(page=>({type:'page',page,key:`page-${page}`}))
  const result=[]
  const middleCount=visible-4
  if(current<=visible-3){
    for(const page of range(1,visible-2))result.push({type:'page',page,key:`page-${page}`})
    result.push({type:'gap',direction:'forward',target:Math.min(count-1,visible-1),key:'gap-forward'})
    result.push({type:'page',page:count,key:`page-${count}`})
  }else if(current>=count-(visible-4)){
    result.push({type:'page',page:1,key:'page-1'})
    result.push({type:'gap',direction:'backward',target:Math.max(2,count-visible+2),key:'gap-backward'})
    for(const page of range(count-(visible-3),count))result.push({type:'page',page,key:`page-${page}`})
  }else{
    const half=Math.floor(middleCount/2)
    result.push({type:'page',page:1,key:'page-1'})
    result.push({type:'gap',direction:'backward',target:Math.max(2,current-middleCount),key:'gap-backward'})
    for(const page of range(current-half,current+half))result.push({type:'page',page,key:`page-${page}`})
    result.push({type:'gap',direction:'forward',target:Math.min(count-1,current+middleCount),key:'gap-forward'})
    result.push({type:'page',page:count,key:`page-${count}`})
  }
  return result
})

function emitInvalid(reason,source='api',extra={}){
  const payload={reason,source,page:resolvedPage.value,pageSize:resolvedPageSize.value,total:normalizedTotal.value,...extra}
  emit('invalid',payload)
  return payload
}
function metaFor(page,pageSize,source,event){
  const count=Math.max(1,Math.ceil(normalizedTotal.value/pageSize))
  return{
    page:clamp(positiveInteger(page,1),1,count),previousPage:resolvedPage.value,
    pageSize,previousPageSize:resolvedPageSize.value,total:normalizedTotal.value,pageCount:count,
    source,event:eventSafe(event),
  }
}
function applyChange(meta){
  const pageChanged=meta.page!==meta.previousPage
  const sizeChanged=meta.pageSize!==meta.previousPageSize
  if(!pageChanged&&!sizeChanged)return meta
  if(props.pageSize===undefined&&sizeChanged)internalPageSize.value=meta.pageSize
  if(props.page===undefined&&props.modelValue===undefined&&pageChanged)internalPage.value=meta.page
  if(sizeChanged)emit('update:pageSize',meta.pageSize)
  if(pageChanged){emit('update:page',meta.page);emit('update:modelValue',meta.page)}
  if(sizeChanged)emit('page-size-change',meta)
  if(pageChanged)emit('page-change',meta)
  emit('change',meta)
  return meta
}
function approve(meta,event){
  if(typeof props.beforeChange!=='function')return applyChange(meta)
  let verdict
  try{verdict=props.beforeChange(meta,event)}catch(error){emitInvalid('guard-error',meta.source,{error,value:meta});return false}
  if(!isPromise(verdict)){
    if(verdict===false){emitInvalid('guard-rejected',meta.source,{value:meta});return false}
    return applyChange(meta)
  }
  pending.value=true
  return Promise.resolve(verdict).then(value=>{
    if(value===false){emitInvalid('guard-rejected',meta.source,{value:meta});return false}
    return applyChange(meta)
  }).catch(error=>{emitInvalid('guard-error',meta.source,{error,value:meta});return false}).finally(()=>{pending.value=false})
}
function commit(page,pageSize,source='api',event){
  if(blocked.value){emitInvalid(props.readonly?'readonly':'blocked',source,{value:{page,pageSize}});return false}
  const normalizedSize=positiveInteger(pageSize,0)
  if(!normalizedSize){emitInvalid('page-size',source,{value:pageSize});return false}
  const rawPage=Number(page)
  if(!Number.isFinite(rawPage)){emitInvalid('page',source,{value:page});return false}
  return approve(metaFor(rawPage,normalizedSize,source,event),event)
}
function goTo(page,source='api',event){return commit(page,resolvedPageSize.value,source,event)}
function next(source='api',event){return goTo(resolvedPage.value+1,source,event)}
function previous(source='api',event){return goTo(resolvedPage.value-1,source,event)}
function first(source='api',event){return goTo(1,source,event)}
function last(source='api',event){return goTo(pageCount.value,source,event)}
function setPageSize(value,source='size',event){
  const nextSize=positiveInteger(value,0)
  if(!nextSize)return commit(resolvedPage.value,value,source,event)
  const nextPage=props.pageSizeChangeBehavior==='preserve-page'?resolvedPage.value
    :props.pageSizeChangeBehavior==='preserve-item'?Math.floor(((resolvedPage.value-1)*resolvedPageSize.value)/nextSize)+1:1
  return commit(nextPage,nextSize,source,event)
}
function onPageClick(page,event){return goTo(page,sourceOf(event),event)}
function onGapClick(item,event){if(!props.ellipsisInteractive)return false;return goTo(item.target,item.direction==='forward'?'jump-forward':'jump-backward',event)}
function submitJump(source='quick-jump',event,kind='quick'){
  const input=kind==='simple'?simpleInputRef.value:quickInputRef.value
  const value=Number(input?.value??jumpValue.value)
  if(!Number.isFinite(value)){emitInvalid('page',source,{value:input?.value??jumpValue.value});return false}
  const result=goTo(value,source,event)
  if(kind==='quick'){
    if(isPromise(result))result.then(meta=>{if(meta)emit('quick-jump',meta)})
    else if(result)emit('quick-jump',result)
  }
  jumpValue.value=''
  return result
}
function onJumpInput(event){jumpValue.value=event.target.value}
function onJumpKeydown(event,kind='quick'){
  if(event.key==='Enter'){event.preventDefault();submitJump(kind==='simple'?'simple':'quick-jump',event,kind)}
  else if(event.key==='Escape'){
    event.preventDefault();jumpValue.value=''
    event.currentTarget.value=kind==='simple'?String(resolvedPage.value):''
  }
}
function pageLabel(page,active=false){
  const context={page,active,pageCount:pageCount.value,total:normalizedTotal.value}
  if(typeof props.pageAriaLabel==='function'){
    try{
      const value=props.pageAriaLabel(page,context)
      if(value!==undefined&&value!==null)return String(value)
    }catch(error){emitInvalid('formatter-error','render',{error,value:context})}
  }
  return t(active?'pagination.currentPage':'pagination.page',{page:formatNumber(page,{useGrouping:false})})
}
function gapLabel(item){return t(item.direction==='forward'?'pagination.jumpForward':'pagination.jumpBackward',{count:formatNumber(Math.abs(item.target-resolvedPage.value),{useGrouping:false})})}
function setPageRef(element,page){if(element)pageRefs.set(page,element);else pageRefs.delete(page)}
function focusPage(page,options){
  const target=pageRefs.get(clamp(positiveInteger(page,resolvedPage.value),1,pageCount.value))
  if(!target)return false
  target.focus(options)
  return typeof document!=='undefined'&&document.activeElement===target
}
function focus(options){
  if(effectiveSimple.value&&simpleInputRef.value){simpleInputRef.value.focus(options);return document.activeElement===simpleInputRef.value}
  if(focusPage(resolvedPage.value,options))return true
  const target=rootRef.value?.querySelector('button:not(:disabled),input:not(:disabled),[role="combobox"]')
  target?.focus(options)
  return typeof document!=='undefined'&&document.activeElement===target
}
function blur(){
  const active=typeof document!=='undefined'?document.activeElement:null
  if(active&&rootRef.value?.contains(active)){active.blur();return true}
  return false
}
function onFocusIn(event){if(!rootRef.value?.contains(event.relatedTarget))emit('focus',{page:resolvedPage.value,pageSize:resolvedPageSize.value,source:'focus'},event)}
function onFocusOut(event){if(!rootRef.value?.contains(event.relatedTarget))emit('blur',{page:resolvedPage.value,pageSize:resolvedPageSize.value,source:'blur'},event)}
function onRootKeydown(event){
  if(!props.keyboard||blocked.value||event.altKey||event.ctrlKey||event.metaKey)return
  if(['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName)||event.target?.closest?.('[role="combobox"]'))return
  const backward=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  const forward=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  if(event.key===backward){event.preventDefault();previous('keyboard',event)}
  else if(event.key===forward){event.preventDefault();next('keyboard',event)}
  else if(event.key==='Home'){event.preventDefault();first('keyboard',event)}
  else if(event.key==='End'){event.preventDefault();last('keyboard',event)}
}
function measure(entries){viewportWidth.value=entries?.[0]?.contentRect?.width??rootRef.value?.getBoundingClientRect?.().width??Infinity}

watch(resolvedPage,value=>{if(simpleInputRef.value&&document.activeElement!==simpleInputRef.value)simpleInputRef.value.value=String(value)})
watch([requestedPage,pageCount],([raw])=>{
  const number=positiveInteger(raw,1)
  if(number!==Number(raw)||number!==resolvedPage.value)emitInvalid('page-clamped','sync',{value:raw,normalized:resolvedPage.value})
})
watch(requestedPageSize,raw=>{if(positiveInteger(raw,0)!==Number(raw))emitInvalid('page-size','sync',{value:raw,normalized:resolvedPageSize.value})})

onMounted(()=>{
  if(props.responsive&&typeof ResizeObserver!=='undefined'){
    observer=new ResizeObserver(measure)
    if(rootRef.value)observer.observe(rootRef.value)
    measure()
  }
  if(props.autofocus)nextTick(()=>focus())
})
onBeforeUnmount(()=>observer?.disconnect())

defineExpose({
  root:rootRef,simpleInput:simpleInputRef,quickInput:quickInputRef,
  page:resolvedPage,pageSize:resolvedPageSize,pageCount,total:normalizedTotal,pending,
  goTo,next,previous,first,last,setPageSize,focusPage,focus,blur,
})
</script>

<template>
  <nav
    v-if="!hidden"
    ref="rootRef"
    v-bind="passthroughAttrs"
    :id="attrs.id"
    class="ui-pagination"
    :class="[`size-${resolvedSize}`,{compact,'is-simple':effectiveSimple,'is-narrow':narrow,'is-tight':tight,'is-disabled':disabled,'is-readonly':readonly,'is-loading':loading||pending},attrs.class]"
    :style="attrs.style"
    :aria-label="ariaLabel||attrs['aria-label']||t('pagination.label')"
    :aria-disabled="blocked||undefined"
    :aria-busy="loading||pending||undefined"
    data-ui-pagination
    @keydown="onRootKeydown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot name="total" :start="start" :end="end" :total="normalizedTotal" :page="resolvedPage" :page-size="resolvedPageSize" :page-count="pageCount" :text="totalText">
      <span v-if="showTotal" class="ui-pagination-total" aria-live="polite">{{ totalText }}</span>
    </slot>

    <div class="ui-pagination-controls">
      <slot name="size-changer" :page-size="resolvedPageSize" :options="pageSizeChoices" :change="setPageSize" :disabled="blocked">
        <UiSelect
          v-if="showSizeChanger&&!effectiveSimple"
          class="ui-pagination-size"
          :size="resolvedSize"
          :aria-label="t('pagination.size')"
          :model-value="resolvedPageSize"
          :options="pageSizeChoices"
          :disabled="actuallyDisabled"
          :readonly="readonly"
          @update:model-value="setPageSize($event,'size')"
        />
      </slot>

      <slot v-if="showFirstLast&&!effectiveSimple" name="first" :page="resolvedPage" :disabled="blocked||resolvedPage<=1" :go="first">
        <button type="button" class="page-number page-direction page-first" :disabled="actuallyDisabled||resolvedPage<=1" :aria-disabled="readonly||undefined" :aria-label="t('pagination.first')" @click="first(sourceOf($event),$event)"><AppIcon name="chevronRight" :size="13" class="page-direction-icon first"/><AppIcon name="chevronRight" :size="13" class="page-direction-icon first"/></button>
      </slot>
      <slot v-if="showPrevNext" name="previous" :page="resolvedPage" :disabled="blocked||resolvedPage<=1" :go="previous">
        <button type="button" class="page-number page-direction page-previous" :disabled="actuallyDisabled||resolvedPage<=1" :aria-disabled="readonly||undefined" :aria-label="t('pagination.previous')" @click="previous(sourceOf($event),$event)"><AppIcon class="page-direction-icon previous" name="chevronRight" :size="13"/></button>
      </slot>

      <template v-if="effectiveSimple">
        <div class="ui-pagination-simple">
          <span class="sr-only">{{ t('pagination.quick') }}</span>
          <input ref="simpleInputRef" type="number" inputmode="numeric" min="1" :max="pageCount" :value="resolvedPage" :disabled="actuallyDisabled" :readonly="readonly" :aria-label="t('pagination.currentInput')" @keydown="onJumpKeydown($event,'simple')" @blur="submitJump('simple-blur',$event,'simple')">
          <span aria-hidden="true">/</span><strong>{{ formatNumber(pageCount,{useGrouping:false}) }}</strong>
        </div>
      </template>
      <template v-else v-for="item in items" :key="item.key">
        <slot v-if="item.type==='page'" name="page" :page="item.page" :active="resolvedPage===item.page" :disabled="blocked" :go="goTo">
          <button
            :ref="element=>setPageRef(element,item.page)"
            type="button"
            class="page-number page-item"
            :class="{active:resolvedPage===item.page}"
            :data-page="item.page"
            :disabled="actuallyDisabled"
            :aria-disabled="readonly||undefined"
            :aria-current="resolvedPage===item.page?'page':undefined"
            :aria-label="pageLabel(item.page,resolvedPage===item.page)"
            @click="onPageClick(item.page,$event)"
          >{{ formatNumber(item.page,{useGrouping:false}) }}</button>
        </slot>
        <slot v-else name="ellipsis" :direction="item.direction" :target="item.target" :disabled="blocked||!ellipsisInteractive" :go="goTo">
          <button v-if="ellipsisInteractive" type="button" class="page-number page-ellipsis is-interactive" :class="`direction-${item.direction}`" :disabled="actuallyDisabled" :aria-disabled="readonly||undefined" :aria-label="gapLabel(item)" @click="onGapClick(item,$event)"><span class="page-ellipsis-dots" aria-hidden="true">•••</span><AppIcon class="page-ellipsis-arrow" name="chevronRight" :size="13"/></button>
          <span v-else class="page-ellipsis" aria-hidden="true">•••</span>
        </slot>
      </template>

      <slot v-if="showPrevNext" name="next" :page="resolvedPage" :disabled="blocked||resolvedPage>=pageCount" :go="next">
        <button type="button" class="page-number page-direction page-next" :disabled="actuallyDisabled||resolvedPage>=pageCount" :aria-disabled="readonly||undefined" :aria-label="t('pagination.next')" @click="next(sourceOf($event),$event)"><AppIcon class="page-direction-icon next" name="chevronRight" :size="13"/></button>
      </slot>
      <slot v-if="showFirstLast&&!effectiveSimple" name="last" :page="resolvedPage" :disabled="blocked||resolvedPage>=pageCount" :go="last">
        <button type="button" class="page-number page-direction page-last" :disabled="actuallyDisabled||resolvedPage>=pageCount" :aria-disabled="readonly||undefined" :aria-label="t('pagination.last')" @click="last(sourceOf($event),$event)"><AppIcon name="chevronRight" :size="13" class="page-direction-icon last"/><AppIcon name="chevronRight" :size="13" class="page-direction-icon last"/></button>
      </slot>

      <slot v-if="showQuickJumper&&!effectiveSimple" name="quick-jumper" :value="jumpValue" :set-value="value=>jumpValue=String(value??'')" :submit="submitJump" :disabled="blocked">
        <div class="ui-pagination-jumper">
          <span>{{ t('pagination.goTo') }}</span>
          <input ref="quickInputRef" type="number" inputmode="numeric" min="1" :max="pageCount" :value="jumpValue" :disabled="actuallyDisabled" :readonly="readonly" :aria-label="t('pagination.quick')" @input="onJumpInput" @keydown="onJumpKeydown($event,'quick')">
          <button type="button" class="ui-pagination-go" :disabled="actuallyDisabled" :aria-disabled="readonly||undefined" @click="submitJump('quick-jump',$event,'quick')">{{ t('pagination.go') }}</button>
        </div>
      </slot>
    </div>
    <span v-if="loading||pending" class="sr-only" role="status">{{ t('pagination.loading') }}</span>
  </nav>
</template>

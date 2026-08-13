<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { closeOverlay, isTopOverlay, openOverlay } from './overlayManager.js'
import { captureFocusOrigin, focusWithRetry, registerFocusOriginTracking } from './focusUtils.js'
import { useDirection, useLanUiConfig, useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'
import { useReducedMotion } from '../motion.js'
import { useTeleportThemeScope } from '../theme-scope.js'

const props=defineProps({
  modelValue:Boolean,
  current:{type:Number,default:0},
  steps:{type:Array,default:()=>[]},
  placement:{type:String,default:'bottom'},
  mask:{type:Boolean,default:true},
  showArrow:{type:Boolean,default:true},
  showClose:{type:Boolean,default:true},
  closeOnEsc:{type:Boolean,default:true},
  closeOnMask:Boolean,
  scrollIntoView:{type:Boolean,default:true},
  targetClickable:{type:Boolean,default:true},
  targetPadding:{type:Number,default:8},
  offset:{type:Number,default:12},
  width:{type:[String,Number],default:320},
  zIndex:{type:Number,default:0},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','update:current','open','close','change','finish','target-missing'])
const panel=ref(null)
const target=ref(null)
const targetBox=ref(null)
const panelStyle=ref({position:'fixed',left:'50%',top:'50%',visibility:'hidden'})
const resolvedPlacement=ref('center')
const internalCurrent=ref(0)
const overlayZ=ref(380)
const config=useLanUiConfig()
const direction=useDirection()
const reducedMotion=useReducedMotion()
const {t}=useLocale()
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const uid=useId()
const panelId=`ui-tour-${uid}`
const titleId=`${panelId}-title`
const descriptionId=`${panelId}-description`
const overlayId=`tour-${uid}`
let returnFocus=null
let stopFocusOriginTracking=()=>{}
let resizeObserver=null
let frame=0
let describedTarget=null
let describedValue=null

const total=computed(()=>props.steps.length)
const activeIndex=computed(()=>Math.min(Math.max(0,internalCurrent.value),Math.max(0,total.value-1)))
const activeStep=computed(()=>props.steps[activeIndex.value]||{})
const activeMask=computed(()=>activeStep.value.mask??props.mask)
const activePlacement=computed(()=>activeStep.value.placement||props.placement)
const panelWidth=computed(()=>typeof props.width==='number'?`${Math.max(240,props.width)}px`:props.width)
const indicatorText=computed(()=>t('tour.step',{current:activeIndex.value+1,total:total.value}))
const canPrevious=computed(()=>activeIndex.value>0)
const isLast=computed(()=>activeIndex.value>=total.value-1)
const maskStyle=computed(()=>({background:activeStep.value.maskColor||undefined}))

function resolveTarget(value){
  if(!isClient)return null
  let resolved=typeof value==='function'?value():value
  if(typeof resolved==='string'){try{resolved=document.querySelector(resolved)}catch{return null}}
  resolved=resolved?.$el||resolved
  return resolved instanceof Element?resolved:null
}
function restoreDescription(){
  if(!describedTarget)return
  if(describedValue===null)describedTarget.removeAttribute('aria-describedby')
  else describedTarget.setAttribute('aria-describedby',describedValue)
  describedTarget=null;describedValue=null
}
function describeTarget(element){
  restoreDescription()
  if(!element)return
  describedTarget=element
  describedValue=element.getAttribute('aria-describedby')
  const values=new Set((describedValue||'').split(/\s+/).filter(Boolean));values.add(panelId)
  element.setAttribute('aria-describedby',[...values].join(' '))
}
function viewport(){return {width:document.documentElement.clientWidth||window.innerWidth,height:document.documentElement.clientHeight||window.innerHeight}}
function coordinates(rect,panelRect,placement,offset){
  const [side,align='center']=String(placement||'bottom').split('-')
  let left=rect.left+(rect.width-panelRect.width)/2
  let top=rect.top+(rect.height-panelRect.height)/2
  if(side==='top')top=rect.top-panelRect.height-offset
  else if(side==='bottom')top=rect.bottom+offset
  else if(side==='left')left=rect.left-panelRect.width-offset
  else if(side==='right')left=rect.right+offset
  if(side==='top'||side==='bottom'){
    if(align==='left'||align==='start')left=rect.left
    if(align==='right'||align==='end')left=rect.right-panelRect.width
  }else{
    if(align==='start')top=rect.top
    if(align==='end')top=rect.bottom-panelRect.height
  }
  return {left,top,side,align}
}
function score(point,panelRect,padding=10){
  const size=viewport()
  return Math.max(0,padding-point.left)+Math.max(0,padding-point.top)+Math.max(0,point.left+panelRect.width+padding-size.width)+Math.max(0,point.top+panelRect.height+padding-size.height)
}
function position(){
  if(!isClient||!props.modelValue||!panel.value)return
  const size=viewport();const panelRect=panel.value.getBoundingClientRect();const element=target.value
  if(!element){
    targetBox.value=null;resolvedPlacement.value='center'
    panelStyle.value={position:'fixed',left:`${Math.round((size.width-panelRect.width)/2)}px`,top:`${Math.round((size.height-panelRect.height)/2)}px`,zIndex:overlayZ.value+2,visibility:'visible',width:panelWidth.value}
    return
  }
  const raw=element.getBoundingClientRect();const padding=Math.max(0,props.targetPadding)
  const rect={left:Math.max(0,raw.left-padding),top:Math.max(0,raw.top-padding),right:Math.min(size.width,raw.right+padding),bottom:Math.min(size.height,raw.bottom+padding)}
  rect.width=Math.max(0,rect.right-rect.left);rect.height=Math.max(0,rect.bottom-rect.top);targetBox.value=rect
  const preferred=activePlacement.value
  const side=String(preferred).split('-')[0]
  const opposite={top:'bottom',bottom:'top',left:'right',right:'left'}[side]||'bottom'
  const suffix=String(preferred).includes('-')?`-${String(preferred).split('-').slice(1).join('-')}`:''
  const candidates=[preferred,`${opposite}${suffix}`,...(side==='top'||side==='bottom'?['right','left']:['bottom','top'])]
  let best=coordinates(rect,panelRect,candidates[0],props.offset);let bestPlacement=candidates[0];let bestScore=score(best,panelRect)
  for(const candidate of candidates.slice(1)){const point=coordinates(rect,panelRect,candidate,props.offset);const nextScore=score(point,panelRect);if(nextScore<bestScore){best=point;bestPlacement=candidate;bestScore=nextScore}}
  const edge=10;const maxLeft=Math.max(edge,size.width-panelRect.width-edge);const maxTop=Math.max(edge,size.height-panelRect.height-edge)
  const finalLeft=Math.round(Math.min(maxLeft,Math.max(edge,best.left)));const finalTop=Math.round(Math.min(maxTop,Math.max(edge,best.top)))
  const finalSide=String(bestPlacement).split('-')[0];const arrowInset=18
  const arrowX=Math.min(Math.max(arrowInset,rect.left+rect.width/2-finalLeft),Math.max(arrowInset,panelRect.width-arrowInset))
  const arrowY=Math.min(Math.max(arrowInset,rect.top+rect.height/2-finalTop),Math.max(arrowInset,panelRect.height-arrowInset))
  resolvedPlacement.value=bestPlacement
  panelStyle.value={position:'fixed',left:`${finalLeft}px`,top:`${finalTop}px`,zIndex:overlayZ.value+2,visibility:'visible',width:panelWidth.value,...(finalSide==='top'||finalSide==='bottom'?{'--ui-tour-arrow-x':`${Math.round(arrowX)}px`}:{'--ui-tour-arrow-y':`${Math.round(arrowY)}px`})}
}
function schedulePosition(){cancelAnimationFrame(frame);frame=requestAnimationFrame(position)}
function maskPart(part){
  const box=targetBox.value;if(!box)return {}
  const size=viewport()
  if(part==='top')return {left:'0px',top:'0px',width:`${size.width}px`,height:`${box.top}px`}
  if(part==='bottom')return {left:'0px',top:`${box.bottom}px`,width:`${size.width}px`,height:`${Math.max(0,size.height-box.bottom)}px`}
  if(part==='start')return {left:'0px',top:`${box.top}px`,width:`${box.left}px`,height:`${box.height}px`}
  return {left:`${box.right}px`,top:`${box.top}px`,width:`${Math.max(0,size.width-box.right)}px`,height:`${box.height}px`}
}
function blockerStyle(){const box=targetBox.value;return box?{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`}:undefined}
function focusable(){return [...(panel.value?.querySelectorAll('button:not(:disabled),[href],[tabindex]:not([tabindex="-1"])')||[])]}
function focusPanel(){nextTick(()=>focusWithRetry(()=>focusable()[0]||panel.value))}
function attachPositioning(){
  if(!isClient)return
  window.addEventListener('resize',schedulePosition);window.addEventListener('scroll',schedulePosition,true)
  if('ResizeObserver'in window){resizeObserver=new ResizeObserver(schedulePosition);if(target.value)resizeObserver.observe(target.value);if(panel.value)resizeObserver.observe(panel.value)}
}
function detachPositioning(){
  if(!isClient)return
  window.removeEventListener('resize',schedulePosition);window.removeEventListener('scroll',schedulePosition,true);resizeObserver?.disconnect();resizeObserver=null;cancelAnimationFrame(frame)
}
async function syncStep({focus=true,scroll=true}={}){
  if(!isClient||!props.modelValue)return
  overlayZ.value=openOverlay(overlayId,props.zIndex||config.value.zIndex+100,{lockScroll:activeMask.value})
  detachPositioning();target.value=resolveTarget(activeStep.value.target);describeTarget(target.value)
  if(activeStep.value.target&&!target.value)emit('target-missing',{step:activeStep.value,index:activeIndex.value})
  if(target.value&&props.scrollIntoView&&scroll)target.value.scrollIntoView?.({block:'center',inline:'center',behavior:reducedMotion.value?'auto':'smooth'})
  await nextTick();position();attachPositioning();if(focus)focusPanel()
}
function setCurrent(value,source){
  if(!total.value)return false
  const next=Math.min(Math.max(0,Number(value)||0),total.value-1);const previous=activeIndex.value
  if(next===previous)return false
  internalCurrent.value=next;emit('update:current',next);emit('change',next,previous,{source,step:props.steps[next]});nextTick(()=>syncStep({focus:false}));return true
}
function requestClose(source='api'){
  if(!props.modelValue)return
  emit('update:modelValue',false);emit('close',{source,current:activeIndex.value,step:activeStep.value})
}
function previous(){setCurrent(activeIndex.value-1,'previous')}
function next(){if(isLast.value)finish();else setCurrent(activeIndex.value+1,'next')}
function finish(){emit('finish',{current:activeIndex.value,step:activeStep.value});requestClose('finish')}
function onMask(){if(props.closeOnMask)requestClose('mask')}
function keydown(event){
  if(!props.modelValue||!isTopOverlay(overlayId))return
  if(event.key==='Escape'&&props.closeOnEsc){event.preventDefault();requestClose('escape');return}
  if(event.key==='Tab'&&activeMask.value){
    const items=focusable();if(!items.length){event.preventDefault();panel.value?.focus();return}
    const first=items[0],last=items.at(-1)
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  if(event.target===panel.value){
    const previousKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft';const nextKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
    if(event.key===previousKey){event.preventDefault();previous()}
    else if(event.key===nextKey){event.preventDefault();next()}
    else if(event.key==='Home'){event.preventDefault();setCurrent(0,'keyboard')}
    else if(event.key==='End'){event.preventDefault();setCurrent(total.value-1,'keyboard')}
  }
}

watch(()=>props.current,value=>{const next=Number.isFinite(Number(value))?Number(value):0;if(next!==internalCurrent.value){internalCurrent.value=next;if(props.modelValue)nextTick(()=>syncStep({focus:false}))}},{immediate:true})
watch(()=>props.steps,()=>{if(internalCurrent.value>=total.value){internalCurrent.value=Math.max(0,total.value-1);emit('update:current',internalCurrent.value)}if(props.modelValue)nextTick(()=>syncStep({focus:false,scroll:false}))},{deep:true})
watch(()=>props.modelValue,async open=>{
  if(!isClient)return
  if(open){
    returnFocus=captureFocusOrigin();overlayZ.value=openOverlay(overlayId,props.zIndex||config.value.zIndex+100,{lockScroll:activeMask.value});document.addEventListener('keydown',keydown);emit('open',{current:activeIndex.value,step:activeStep.value});await nextTick();await syncStep()
  }else{
    document.removeEventListener('keydown',keydown);detachPositioning();restoreDescription();target.value=null;targetBox.value=null;panelStyle.value={position:'fixed',left:'50%',top:'50%',visibility:'hidden'};closeOverlay(overlayId);await nextTick();focusWithRetry(returnFocus)
  }
},{immediate:true})
onMounted(()=>{stopFocusOriginTracking=registerFocusOriginTracking()})
onBeforeUnmount(()=>{stopFocusOriginTracking();document.removeEventListener('keydown',keydown);detachPositioning();restoreDescription();closeOverlay(overlayId)})
defineExpose({next,previous,close:requestClose,finish,goTo:(index)=>setCurrent(index,'api'),update:position})
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-tour-fade">
      <div v-if="modelValue" v-bind="portalThemeAttrs" class="ui-tour-layer" :dir="direction" :style="[portalThemeStyle,{zIndex:overlayZ}]" data-ui-tour>
        <template v-if="activeMask">
          <div v-if="!targetBox" class="ui-tour-mask ui-tour-mask-full" :style="maskStyle" aria-hidden="true" @click="onMask" />
          <template v-else><div v-for="part in ['top','end','bottom','start']" :key="part" class="ui-tour-mask" :style="[maskPart(part),maskStyle]" aria-hidden="true" @click="onMask" /></template>
          <span v-if="targetBox&&!targetClickable" class="ui-tour-target-blocker" :style="blockerStyle()" aria-hidden="true" />
          <span v-if="targetBox" class="ui-tour-highlight" :style="blockerStyle()" aria-hidden="true" />
        </template>
        <section :id="panelId" ref="panel" class="ui-tour-panel" :class="`placement-${resolvedPlacement}`" :style="[panelStyle,{width:panelWidth}]" role="dialog" :aria-modal="activeMask?'true':undefined" :aria-label="ariaLabel||(!activeStep.title?t('tour.label'):undefined)" :aria-labelledby="!ariaLabel&&activeStep.title?titleId:undefined" :aria-describedby="activeStep.description?descriptionId:undefined" tabindex="-1">
          <span v-if="showArrow&&targetBox" class="ui-tour-arrow" aria-hidden="true" />
          <header class="ui-tour-header"><div class="ui-tour-heading"><slot name="title" :step="activeStep" :current="activeIndex" :total="total"><h2 v-if="activeStep.title" :id="titleId">{{ activeStep.title }}</h2></slot><slot name="indicator" :current="activeIndex" :total="total"><span class="ui-tour-indicator" aria-live="polite">{{ indicatorText }}</span></slot></div><button v-if="showClose" type="button" class="ui-tour-close" :aria-label="t('tour.close')" @click="requestClose('close')"><AppIcon name="close" :size="14" /></button></header>
          <div v-if="activeStep.description||$slots.description" :id="descriptionId" class="ui-tour-description"><slot name="description" :step="activeStep" :current="activeIndex" :total="total">{{ activeStep.description }}</slot></div>
          <footer class="ui-tour-actions"><slot name="actions" :step="activeStep" :current="activeIndex" :total="total" :previous="previous" :next="next" :close="requestClose" :finish="finish"><button v-if="canPrevious" type="button" class="btn btn-secondary btn-sm" @click="previous">{{ activeStep.prevText||t('tour.previous') }}</button><button type="button" class="btn btn-primary btn-sm" @click="next">{{ isLast?(activeStep.finishText||t('tour.finish')):(activeStep.nextText||t('tour.next')) }}</button></slot></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

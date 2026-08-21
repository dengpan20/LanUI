<script setup>
import { computed, nextTick, onBeforeUnmount, ref, toRef, useId, useSlots, watch } from 'vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

const triggerValues=['hover','focus','click','manual']
const props=defineProps({
  content:{type:[String,Number],default:''},
  placement:{type:String,default:'top'},
  disabled:Boolean,
  offset:{type:Number,default:8},
  open:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  trigger:{type:[String,Array],default:()=>['hover','focus']},
  showDelay:{type:Number,default:0},
  hideDelay:{type:Number,default:0},
  arrow:{type:Boolean,default:true},
  maxWidth:{type:[String,Number],default:260},
  wrap:Boolean,
  appendToBody:{type:Boolean,default:true},
  teleportTo:{type:[String,Object],default:'body'},
  closeOnEscape:{type:Boolean,default:true},
  closeOnOutside:{type:Boolean,default:true},
  tooltipId:{type:String,default:''},
  zIndex:{type:Number,default:undefined},
})
const emit=defineEmits(['update:open','open-change','show','hide'])
const slots=useSlots()
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const config=useLanUiConfig()
const root=ref(null)
const panel=ref(null)
const internalOpen=ref(props.defaultOpen)
const generatedId=`ui-tooltip-${useId()}`
const id=computed(()=>props.tooltipId||generatedId)
const controlled=computed(()=>props.open!==undefined)
const open=computed(()=>controlled.value?props.open:internalOpen.value)
const hasContent=computed(()=>Boolean(slots.content)||String(props.content??'').trim().length>0)
const visible=computed(()=>open.value&&!props.disabled&&hasContent.value)
const triggerModes=computed(()=>{
  const raw=Array.isArray(props.trigger)?props.trigger:String(props.trigger||'').split(/[\s,]+/)
  const modes=raw.map(value=>String(value).trim().toLowerCase()).filter(value=>triggerValues.includes(value))
  return new Set(modes.length?modes:['manual'])
})
const maxWidthValue=computed(()=>typeof props.maxWidth==='number'?`${Math.max(0,props.maxWidth)}px`:props.maxWidth)
const floatingZIndex=computed(()=>props.zIndex??config.value.zIndex+70)
const {floatingStyle,resolvedPlacement,update}=useFloatingPosition({
  triggerRef:root,
  panelRef:panel,
  open:visible,
  placement:toRef(props,'placement'),
  offset:toRef(props,'offset'),
  zIndex:floatingZIndex,
})

const activeReasons=new Set()
let showTimer=0
let hideTimer=0
let describedElement=null
let previousDescribedby=''

function supports(mode){return triggerModes.value.has(mode)}
function clearTimer(name){
  if(name==='show'&&showTimer){clearTimeout(showTimer);showTimer=0}
  if(name==='hide'&&hideTimer){clearTimeout(hideTimer);hideTimer=0}
}
function triggerElement(event){
  const candidate=event?.target instanceof Element&&root.value?.contains(event.target)?event.target:null
  return candidate?.matches?.('button,[href],input,textarea,select,[role="button"],[tabindex]')
    ? candidate
    : root.value?.querySelector('button,[href],input,textarea,select,[role="button"],[tabindex]')||root.value
}
function openMeta(value,source,event){return {open:value,previous:open.value,source,placement:resolvedPlacement.value,event}}
function requestOpen(value,source='api',event){
  if(value&&(props.disabled||!hasContent.value))return false
  if(value===open.value)return false
  const meta=openMeta(value,source,event)
  if(!controlled.value)internalOpen.value=value
  emit('update:open',value)
  emit('open-change',value,meta)
  emit(value?'show':'hide',meta)
  return true
}
function scheduleOpen(source,event){
  clearTimer('hide')
  if(visible.value||open.value)return
  clearTimer('show')
  const delay=Math.max(0,Number(props.showDelay)||0)
  if(!delay){requestOpen(true,source,event);return}
  showTimer=setTimeout(()=>{showTimer=0;requestOpen(true,source,event)},delay)
}
function scheduleClose(source,event){
  clearTimer('show')
  if(activeReasons.size)return
  clearTimer('hide')
  const delay=Math.max(0,Number(props.hideDelay)||0)
  if(!delay){requestOpen(false,source,event);return}
  hideTimer=setTimeout(()=>{hideTimer=0;if(!activeReasons.size)requestOpen(false,source,event)},delay)
}
function activate(source,event){
  if(!supports(source)||props.disabled||!hasContent.value)return
  activeReasons.add(source)
  scheduleOpen(source,event)
}
function deactivate(source,event){
  if(!supports(source))return
  activeReasons.delete(source)
  scheduleClose(source,event)
}
function show(source='api',event){
  if(props.disabled||!hasContent.value)return false
  activeReasons.add(source)
  scheduleOpen(source,event)
  return true
}
function hide(source='api',event){
  activeReasons.clear()
  clearTimer('show')
  scheduleClose(source,event)
}
function toggle(source='api',event){
  if(open.value)hide(source,event)
  else show(source,event)
}
function onClick(event){
  if(!supports('click')||props.disabled||!hasContent.value)return
  if(activeReasons.has('click'))deactivate('click',event)
  else{activeReasons.add('click');scheduleOpen('click',event)}
}
function onFocusOut(event){
  if(event.relatedTarget instanceof Node&&root.value?.contains(event.relatedTarget))return
  deactivate('focus',event)
}
function onDocumentPointerDown(event){
  if(!visible.value||!props.closeOnOutside||!supports('click'))return
  if(root.value?.contains(event.target)||panel.value?.contains(event.target))return
  activeReasons.delete('click')
  scheduleClose('outside',event)
}
function onDocumentKeydown(event){
  if(event.key!=='Escape'||!visible.value||!props.closeOnEscape)return
  event.preventDefault()
  hide('escape',event)
}
function addDocumentListeners(){
  if(typeof document==='undefined')return
  document.addEventListener('pointerdown',onDocumentPointerDown,true)
  document.addEventListener('keydown',onDocumentKeydown)
}
function removeDocumentListeners(){
  if(typeof document==='undefined')return
  document.removeEventListener('pointerdown',onDocumentPointerDown,true)
  document.removeEventListener('keydown',onDocumentKeydown)
}
function clearDescription(){
  if(!describedElement)return
  const values=(describedElement.getAttribute('aria-describedby')||'').split(/\s+/).filter(value=>value&&value!==id.value)
  const restored=previousDescribedby.split(/\s+/).filter(Boolean)
  const next=[...new Set([...values,...restored])].join(' ')
  if(next)describedElement.setAttribute('aria-describedby',next)
  else describedElement.removeAttribute('aria-describedby')
  describedElement=null
  previousDescribedby=''
}
async function syncDescription(value){
  if(!value){clearDescription();return}
  if(typeof document==='undefined')return
  await nextTick()
  if(!visible.value)return
  const target=triggerElement()
  if(!target)return
  if(describedElement&&describedElement!==target)clearDescription()
  describedElement=target
  const current=target.getAttribute('aria-describedby')||''
  previousDescribedby=current.split(/\s+/).filter(value=>value&&value!==id.value).join(' ')
  target.setAttribute('aria-describedby',[previousDescribedby,id.value].filter(Boolean).join(' '))
  update()
}
function focusTrigger(options){triggerElement()?.focus?.(options)}

watch(visible,(value)=>{
  removeDocumentListeners()
  if(value)addDocumentListeners()
  syncDescription(value)
},{immediate:true})
watch(()=>props.disabled,(value)=>{if(value)hide('disabled')})
watch(hasContent,(value)=>{if(!value)hide('content')})
watch(open,(value)=>{if(!value)activeReasons.clear()})
onBeforeUnmount(()=>{
  clearTimer('show');clearTimer('hide');removeDocumentListeners();clearDescription()
})
defineExpose({root,panel,show,hide,toggle,focusTrigger,updatePosition:update})
</script>

<template>
  <span
    ref="root"
    class="ui-tooltip"
    :class="{open:visible,disabled}"
    :data-state="visible?'open':'closed'"
    :data-trigger="[...triggerModes].join(' ')"
    @mouseenter="activate('hover',$event)"
    @mouseleave="deactivate('hover',$event)"
    @focusin="activate('focus',$event)"
    @focusout="onFocusOut"
    @click="onClick"
  >
    <slot :open="visible" :describedby="visible?id:undefined" :show="show" :hide="hide" :toggle="toggle"/>
    <Teleport :to="teleportTo" :disabled="!appendToBody">
      <Transition name="tooltip">
        <span
          v-if="visible"
          v-bind="portalThemeAttrs"
          :id="id"
          ref="panel"
          class="ui-tooltip-content ui-floating-panel"
          :class="{'can-wrap':wrap,'has-arrow':arrow}"
          :dir="config.direction"
          role="tooltip"
          :data-placement="resolvedPlacement"
          :style="[portalThemeStyle,floatingStyle,{'--ui-tooltip-max-width':maxWidthValue}]"
        >
          <slot name="content" :open="visible" :placement="resolvedPlacement">{{ content }}</slot>
          <span v-if="arrow" class="ui-tooltip-arrow" aria-hidden="true"><slot name="arrow" :placement="resolvedPlacement"/></span>
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

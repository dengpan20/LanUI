<script setup>
import { computed, nextTick, onBeforeUnmount, ref, toRef, useId, useSlots, watch } from 'vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig, useLocale } from '../config-runtime.js'
import { focusWithRetry } from './focusUtils.js'
import { useTeleportThemeScope } from '../theme-scope.js'

const triggerValues=['click','hover','focus','manual']
const props=defineProps({
  modelValue:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  trigger:{type:[String,Array],default:'click'},
  disabled:Boolean,
  loading:Boolean,
  placement:{type:String,default:'bottom'},
  width:{type:[String,Number],default:240},
  minWidth:{type:[String,Number],default:0},
  maxWidth:{type:[String,Number],default:'calc(100vw - 16px)'},
  title:{type:String,default:''},
  offset:{type:Number,default:8},
  showDelay:{type:Number,default:0},
  hideDelay:{type:Number,default:0},
  arrow:{type:Boolean,default:true},
  closeOnOutside:{type:Boolean,default:true},
  closeOnEscape:{type:Boolean,default:true},
  closeOnContentClick:Boolean,
  autoFocus:Boolean,
  trapFocus:Boolean,
  returnFocus:{type:Boolean,default:true},
  appendToBody:{type:Boolean,default:true},
  teleportTo:{type:[String,Object],default:'body'},
  role:{type:String,default:'dialog'},
  ariaLabel:{type:String,default:''},
  popoverId:{type:String,default:''},
  zIndex:{type:Number,default:undefined},
})
const emit=defineEmits(['update:modelValue','open-change','open','close'])
const slots=useSlots()
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const config=useLanUiConfig()
const {t}=useLocale()
const root=ref(null)
const triggerRef=ref(null)
const panel=ref(null)
const internalOpen=ref(props.defaultOpen)
const generatedId=`ui-popover-${useId()}`
const id=computed(()=>props.popoverId||generatedId)
const titleId=computed(()=>`${id.value}-title`)
const controlled=computed(()=>props.modelValue!==undefined)
const open=computed(()=>controlled.value?props.modelValue:internalOpen.value)
const visible=computed(()=>open.value&&!props.disabled)
const hasTitle=computed(()=>Boolean(slots.title)||Boolean(props.title))
const triggerModes=computed(()=>{
  const raw=Array.isArray(props.trigger)?props.trigger:String(props.trigger||'').split(/[\s,]+/)
  const modes=raw.map(value=>String(value).trim().toLowerCase()).filter(value=>triggerValues.includes(value))
  return new Set(modes.length?modes:['manual'])
})
const toSize=value=>typeof value==='number'?`${Math.max(0,value)}px`:value
const widthValue=computed(()=>toSize(props.width))
const minWidthValue=computed(()=>toSize(props.minWidth))
const maxWidthValue=computed(()=>toSize(props.maxWidth))
const floatingZIndex=computed(()=>props.zIndex??config.value.zIndex+60)
const {floatingStyle,resolvedPlacement,update}=useFloatingPosition({
  triggerRef,
  panelRef:panel,
  open:visible,
  placement:toRef(props,'placement'),
  offset:toRef(props,'offset'),
  zIndex:floatingZIndex,
})

const activeReasons=new Set()
const focusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
let showTimer=0
let hideTimer=0
let annotatedTrigger=null
let originalTriggerAttributes=null
let restoreFocusAfterClose=false

function supports(mode){return triggerModes.value.has(mode)}
function clearTimer(name){
  if(name==='show'&&showTimer){clearTimeout(showTimer);showTimer=0}
  if(name==='hide'&&hideTimer){clearTimeout(hideTimer);hideTimer=0}
}
function triggerElement(){return triggerRef.value?.querySelector('button,[href],input,select,textarea,summary,[role="button"],[tabindex]')||triggerRef.value}
function restoreAttribute(element,name,value){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value)}
function restoreTriggerAttributes(){
  if(!annotatedTrigger||!originalTriggerAttributes)return
  for(const [name,value] of Object.entries(originalTriggerAttributes))restoreAttribute(annotatedTrigger,name,value)
  annotatedTrigger=null
  originalTriggerAttributes=null
}
function syncTrigger(){
  if(typeof document==='undefined')return
  const element=triggerElement()
  if(!element)return
  if(annotatedTrigger&&annotatedTrigger!==element)restoreTriggerAttributes()
  if(!annotatedTrigger){
    annotatedTrigger=element
    originalTriggerAttributes=Object.fromEntries(['aria-expanded','aria-controls','aria-haspopup','aria-disabled'].map(name=>[name,element.getAttribute(name)]))
  }
  element.setAttribute('aria-expanded',String(visible.value))
  const controls=[originalTriggerAttributes['aria-controls'],visible.value?id.value:''].filter(Boolean).join(' ')
  restoreAttribute(element,'aria-controls',controls||null)
  const popupRole=['menu','listbox','tree','grid','dialog'].includes(props.role)?props.role:'dialog'
  element.setAttribute('aria-haspopup',popupRole)
  restoreAttribute(element,'aria-disabled',props.disabled?'true':originalTriggerAttributes['aria-disabled'])
}
function openMeta(value,source,event){return {open:value,previous:open.value,source,placement:resolvedPlacement.value,event}}
function requestOpen(value,source='api',event,returnFocus=false){
  if(value&&props.disabled)return false
  if(value===open.value)return false
  const meta=openMeta(value,source,event)
  if(!value&&returnFocus)restoreFocusAfterClose=true
  if(!controlled.value)internalOpen.value=value
  emit('update:modelValue',value)
  emit('open-change',value,meta)
  emit(value?'open':'close',meta)
  return true
}
function scheduleOpen(source,event){
  clearTimer('hide')
  if(open.value)return
  clearTimer('show')
  const delay=Math.max(0,Number(props.showDelay)||0)
  if(!delay){requestOpen(true,source,event);return}
  showTimer=setTimeout(()=>{showTimer=0;requestOpen(true,source,event)},delay)
}
function scheduleClose(source,event,returnFocus=false){
  clearTimer('show')
  if(activeReasons.size)return
  clearTimer('hide')
  const delay=Math.max(0,Number(props.hideDelay)||0)
  if(!delay){requestOpen(false,source,event,returnFocus);return}
  hideTimer=setTimeout(()=>{hideTimer=0;if(!activeReasons.size)requestOpen(false,source,event,returnFocus)},delay)
}
function activate(source,event){
  if(!supports(source)||props.disabled)return
  activeReasons.add(source)
  scheduleOpen(source,event)
}
function deactivate(source,event){
  if(!supports(source))return
  activeReasons.delete(source)
  scheduleClose(source,event)
}
function show(source='api',event){
  if(props.disabled)return false
  activeReasons.add(source)
  scheduleOpen(source,event)
  return true
}
function hide(source='api',event,returnFocus=props.returnFocus){
  activeReasons.clear()
  clearTimer('show')
  scheduleClose(source,event,returnFocus)
}
function toggle(source='api',event){if(open.value)hide(source,event,false);else show(source,event)}
function onTriggerClick(event){
  if(!supports('click'))return
  if(props.disabled){event.preventDefault();return}
  if(activeReasons.has('click')||(open.value&&!activeReasons.size)){activeReasons.delete('click');scheduleClose('click',event)}
  else{activeReasons.add('click');scheduleOpen('click',event)}
}
function onTriggerKeydown(event){
  if(!supports('click')||props.disabled||!['Enter',' '].includes(event.key))return
  const element=triggerElement()
  if(element?.matches('button,a[href],input,select,textarea,summary'))return
  event.preventDefault()
  onTriggerClick(event)
}
function onTriggerMouseleave(event){if(!panel.value?.contains(event.relatedTarget))deactivate('hover',event)}
function onTriggerFocusout(event){if(!panel.value?.contains(event.relatedTarget)&&!triggerRef.value?.contains(event.relatedTarget))deactivate('focus',event)}
function onPanelMouseleave(event){if(!triggerRef.value?.contains(event.relatedTarget))deactivate('hover',event)}
function onPanelFocusout(event){if(!panel.value?.contains(event.relatedTarget)&&!triggerRef.value?.contains(event.relatedTarget))deactivate('focus',event)}
function onContentClick(event){
  if(!props.closeOnContentClick||event.defaultPrevented||event.target.closest?.('[data-popover-keep-open]'))return
  hide('content',event,props.returnFocus)
}
function onDocumentPointerDown(event){
  if(!visible.value||!props.closeOnOutside)return
  if(root.value?.contains(event.target)||panel.value?.contains(event.target))return
  hide('outside',event,false)
}
function onDocumentKeydown(event){
  if(event.key!=='Escape'||!visible.value||!props.closeOnEscape)return
  event.preventDefault()
  hide('escape',event,props.returnFocus)
}
function focusableElements(){return [...(panel.value?.querySelectorAll(focusableSelector)||[])].filter(element=>!element.hidden&&element.getAttribute('aria-hidden')!=='true')}
function focusTrigger(){return focusWithRetry(()=>triggerElement())}
function focusPanel(){return focusWithRetry(()=>focusableElements()[0]||panel.value)}
function onPanelKeydown(event){
  if(event.key!=='Tab'||!props.trapFocus)return
  const elements=focusableElements()
  if(!elements.length){event.preventDefault();panel.value?.focus();return}
  const first=elements[0];const last=elements.at(-1)
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
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
async function afterOpen(){await nextTick();update();if(props.autoFocus||props.trapFocus)focusPanel()}

watch(visible,async(value,previous)=>{
  removeDocumentListeners()
  if(value)addDocumentListeners()
  await nextTick();syncTrigger()
  if(value&&!previous)afterOpen()
  if(!value&&previous&&restoreFocusAfterClose){restoreFocusAfterClose=false;focusTrigger()}
},{immediate:true})
watch(()=>[props.role,props.disabled,id.value],()=>nextTick(syncTrigger))
watch(()=>props.disabled,value=>{if(value)hide('disabled',undefined,false)})
watch(open,value=>{if(!value)activeReasons.clear()})
onBeforeUnmount(()=>{
  clearTimer('show');clearTimer('hide');removeDocumentListeners();restoreTriggerAttributes()
})
defineExpose({root,trigger:triggerRef,panel,show,hide,toggle,focusTrigger,focusPanel,updatePosition:update})
</script>

<template>
  <span ref="root" class="ui-popover" :class="{open:visible,disabled,loading}" :data-state="visible?'open':'closed'" :data-trigger="[...triggerModes].join(' ')">
    <span ref="triggerRef" class="ui-popover-trigger" @click="onTriggerClick" @keydown="onTriggerKeydown" @mouseenter="activate('hover',$event)" @mouseleave="onTriggerMouseleave" @focusin="activate('focus',$event)" @focusout="onTriggerFocusout">
      <slot name="trigger" :open="visible" :show="show" :hide="hide" :toggle="toggle" :controls="visible?id:undefined"/>
    </span>
    <Teleport :to="teleportTo" :disabled="!appendToBody">
      <Transition name="select-menu" @after-enter="afterOpen">
        <div v-if="visible" v-bind="portalThemeAttrs" :id="id" ref="panel" class="ui-popover-panel ui-floating-panel" :class="{'has-arrow':arrow}" :dir="config.direction" :role="role" :aria-labelledby="hasTitle?titleId:undefined" :aria-label="hasTitle?undefined:(ariaLabel||t('popover.label'))" :aria-busy="loading?'true':undefined" :data-placement="resolvedPlacement" :style="[portalThemeStyle,floatingStyle,{width:widthValue,minWidth:minWidthValue,maxWidth:maxWidthValue}]" tabindex="-1" @mouseenter="activate('hover',$event)" @mouseleave="onPanelMouseleave" @focusin="activate('focus',$event)" @focusout="onPanelFocusout" @keydown="onPanelKeydown" @click="onContentClick">
          <span v-if="arrow" class="ui-popover-arrow" aria-hidden="true"><slot name="arrow" :placement="resolvedPlacement"/></span>
          <strong v-if="hasTitle" :id="titleId" class="ui-popover-title"><slot name="title" :close="hide">{{ title }}</slot></strong>
          <div class="ui-popover-body"><slot :close="hide" :open="visible" :placement="resolvedPlacement" :loading="loading"/></div>
          <footer v-if="$slots.footer" class="ui-popover-footer"><slot name="footer" :close="hide" :open="visible"/></footer>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

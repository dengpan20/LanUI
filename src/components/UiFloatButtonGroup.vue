<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, ssrContextKey, useAttrs, useId, useSlots } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale, useDirection } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({
  open:{type:Boolean,default:undefined},defaultOpen:Boolean,trigger:{type:String,default:'click',validator:v=>['click','hover'].includes(v)},placement:{type:String,default:'bottom',validator:v=>['top','bottom','inline-start','inline-end'].includes(v)},shape:{type:String,default:'circle'},size:{type:String,default:'md'},variant:{type:String,default:'primary'},disabled:Boolean,
  closeOnSelect:{type:Boolean,default:true},closeOnEscape:{type:Boolean,default:true},closeOnOutside:{type:Boolean,default:true},beforeOpenChange:{type:Function,default:null},openDelay:{type:Number,default:0},closeDelay:{type:Number,default:100},triggerIcon:{type:String,default:'plus'},triggerLabel:{type:String,default:''},ariaLabel:{type:String,default:''},fixed:{type:Boolean,default:true},offsetInline:{type:[Number,String],default:24},offsetBlock:{type:[Number,String],default:24},zIndex:{type:Number,default:100},teleportTo:{type:[String,Object,Boolean],default:'body'},
})
const emit=defineEmits(['update:open','open-change','open','close','select','guard-error'])
const attrs=useAttrs();const slots=useSlots();const ssrContext=inject(ssrContextKey,null);const {t}=useLocale();const direction=useDirection();const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope();const uid=`ui-float-group-${useId()}`;const triggerRef=ref(null);const root=ref(null);const internalOpen=ref(props.defaultOpen);const pending=ref(false);const records=ref([]);const queued=ref(null);const effectiveDirection=computed(()=>portalThemeAttrs.value.dir||direction.value);let serial=0;let openTimer=0;let closeTimer=0
const controlled=computed(()=>props.open!==undefined);const isOpen=computed(()=>controlled.value?Boolean(props.open):internalOpen.value);const controlsId=`${uid}-actions`;const label=computed(()=>props.ariaLabel||props.triggerLabel||t('floatButton.groupLabel')||t('floatButton.action')||'Actions');const shouldTeleport=computed(()=>!ssrContext&&typeof window!=='undefined'&&props.teleportTo!==false&&props.teleportTo!==''&&props.teleportTo!==null);const resolvedTeleportTo=computed(()=>shouldTeleport.value?(props.teleportTo||'body'):'body');const triggerDisabled=computed(()=>Boolean(props.disabled||pending.value));
const rootStyle=computed(()=>[portalThemeStyle.value,attrs.style,{'--ui-float-offset-inline':typeof props.offsetInline==='number'?`${Math.max(0,props.offsetInline)}px`:props.offsetInline,'--ui-float-offset-block':typeof props.offsetBlock==='number'?`${Math.max(0,props.offsetBlock)}px`:props.offsetBlock,'--ui-float-z-index':String(Math.max(0,Number(props.zIndex)||0))}])
function meta(value,source,event,reason){return {open:value,previous:isOpen.value,source,reason,event,nativeEvent:event,pending:pending.value}}
function queueRequest(value,source,event,reason){queued.value={value,source,event,reason}}
async function guarded(value,source='api',event,reason='api'){
  if(props.disabled||value===isOpen.value)return false
  if(pending.value){queueRequest(value,source,event,reason);return false}
  pending.value=true
  const token=++serial
  const nextMeta=meta(value,source,event,reason)
  try{
    const result=props.beforeOpenChange?await props.beforeOpenChange(value,nextMeta):true
    if(token!==serial)return false
    if(result===false)return false
    if(!controlled.value)internalOpen.value=value
    emit('update:open',value);emit('open-change',value,{...nextMeta,pending:false});emit(value?'open':'close',{...nextMeta,pending:false});return true
  }catch(error){
    if(token===serial)emit('guard-error',error,{...nextMeta,pending:false})
    return false
  }finally{
    pending.value=false
    const next=queued.value;queued.value=null
    if(next&&next.value!==isOpen.value)void guarded(next.value,next.source,next.event,next.reason)
  }
}
function request(value,source='api',event,reason=source,immediate=false){if(pending.value){queueRequest(value,source,event,reason);return false}if(value===isOpen.value)return false;clearTimeout(openTimer);clearTimeout(closeTimer);const delay=immediate?0:Math.max(0,Number(value?props.openDelay:props.closeDelay)||0);if(delay){const timer=setTimeout(()=>void guarded(value,source,event,reason),delay);if(value)openTimer=timer;else closeTimer=timer;return true}return guarded(value,source,event,reason)}
function show(source='api',event){return request(true,source,event,source)}
function hide(source='api',event){return request(false,source,event,source,['select','escape'].includes(source))}
function toggle(source='api',event){return isOpen.value?hide(source,event):show(source,event)}
function register(record){if(!records.value.includes(record))records.value.push(record);return()=>unregister(record)}
function unregister(record){const index=records.value.indexOf(record);if(index>=0)records.value.splice(index,1)}
function select(record,event,childMeta={}){if(record?.disabled)return false;const payload={...childMeta,key:record.key,source:childMeta.source||'select',nativeEvent:event,groupId:uid};emit('select',payload);if(props.closeOnSelect)hide('select',event);return true}
function focusRecord(index){const enabled=records.value.filter(item=>!item.disabled);const target=enabled[index];if(!target)return false;target.focus?.();return true}
function focusFirst(){return focusRecord(0)}
function focusLast(){return focusRecord(Math.max(0,records.value.filter(item=>!item.disabled).length-1))}
function setTriggerElement(value){triggerRef.value=value?.$el||value||null;return triggerRef.value}
function focusTrigger(){const target=triggerRef.value?.isConnected?triggerRef.value:root.value?.querySelector?.(`[aria-controls="${controlsId}"]`);target?.focus?.();return typeof document==='undefined'||document.activeElement===target}
function onTrigger(event){if(triggerDisabled.value){event?.preventDefault?.();return}if(event?.currentTarget?.tagName==='A')event.preventDefault();if(props.trigger==='click')toggle('click',event);else show('trigger',event)}
function onTriggerKeydown(event){if(event.key==='Escape'&&isOpen.value&&props.closeOnEscape){event.preventDefault();event.stopPropagation();const result=hide('escape',event);Promise.resolve(result).then(()=>nextTick(focusTrigger));return}if(['ArrowDown','ArrowRight','ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();const result=isOpen.value?true:show('keyboard',event);Promise.resolve(result).then(()=>nextTick(()=>event.key==='ArrowUp'||event.key==='ArrowLeft'?focusLast():focusFirst()));return}const tag=String(event.currentTarget?.tagName||'').toUpperCase();if((event.key==='Enter'||event.key===' ')&&!['BUTTON','A'].includes(tag)){event.preventDefault();onTrigger(event)}}
function onTriggerFocus(event){if(props.trigger==='hover')show('focus',event)}
function onTriggerBlur(event){if(props.trigger==='hover')hide('blur',event)}
function triggerPointerEnter(event){if(props.trigger==='hover')show('hover',event)}
function triggerPointerLeave(event){if(props.trigger==='hover')hide('hover',event)}
const triggerAttrs=computed(()=>({type:'button','aria-label':label.value,'aria-expanded':isOpen.value,'aria-controls':controlsId,'aria-haspopup':'true',disabled:triggerDisabled.value||undefined,ref:setTriggerElement,onClick:onTrigger,onFocus:onTriggerFocus,onBlur:onTriggerBlur,onMouseenter:triggerPointerEnter,onMouseleave:triggerPointerLeave,onKeydown:onTriggerKeydown}))
const triggerScope=computed(()=>({open:isOpen.value,pending:pending.value,disabled:triggerDisabled.value,controls:controlsId,attrs:triggerAttrs.value,triggerAttrs:triggerAttrs.value,trigger:triggerAttrs.value,ref:setTriggerElement,setRef:setTriggerElement,show,hide,toggle}))
const handledKeyEvents=new WeakSet()
function onKeydown(event){if(handledKeyEvents.has(event))return;handledKeyEvents.add(event);if(event.key==='Escape'&&isOpen.value&&props.closeOnEscape){event.preventDefault();event.stopPropagation();const result=hide('escape',event);Promise.resolve(result).then(()=>nextTick(focusTrigger));return}if(!isOpen.value)return;const horizontal=effectiveDirection.value==='rtl'?['ArrowRight','ArrowLeft']:['ArrowLeft','ArrowRight'];if(!['ArrowUp','ArrowDown',...horizontal,'Home','End'].includes(event.key))return;event.preventDefault();const enabled=records.value.filter(item=>!item.disabled);if(!enabled.length)return;const activeIndex=enabled.findIndex(item=>item.element===document.activeElement);const current=activeIndex<0?-1:activeIndex;let next=current;if(event.key==='Home')next=0;else if(event.key==='End')next=enabled.length-1;else if(current<0)next=event.key==='ArrowUp'||event.key===horizontal[0]?enabled.length-1:0;else if(event.key==='ArrowDown'||event.key===horizontal[1])next=Math.min(enabled.length-1,current+1);else next=Math.max(0,current-1);focusRecord(next)}
function onPointerDown(event){if(isOpen.value&&props.closeOnOutside&&!root.value?.contains(event.target))hide('outside',event)}
function onEnter(event){if(props.trigger==='hover')show('hover',event)}
function onLeave(event){if(props.trigger==='hover')hide('hover',event)}
provide('uiFloatButtonGroupContext',{id:uid,shape:computed(()=>props.shape),size:computed(()=>props.size),variant:computed(()=>props.variant),disabled:computed(()=>props.disabled||pending.value),open:isOpen,pending,register,unregister,select})
onMounted(()=>{if(typeof document!=='undefined')document.addEventListener('pointerdown',onPointerDown,true)})
onBeforeUnmount(()=>{clearTimeout(openTimer);clearTimeout(closeTimer);if(typeof document!=='undefined')document.removeEventListener('pointerdown',onPointerDown,true)})
defineExpose({root,trigger:triggerRef,open:isOpen,pending,show,hide,toggle,focusTrigger,focusFirst,focusLast,getState:()=>({open:isOpen.value,pending:pending.value,actions:records.value.length})})
</script>
<template>
  <Teleport :to="resolvedTeleportTo" :disabled="!shouldTeleport">
    <div ref="root" v-bind="portalThemeAttrs" class="ui-float-button-group" :class="[attrs.class,`placement-${placement}`,{open:isOpen,fixed,disabled}]" :style="rootStyle" :dir="effectiveDirection" :data-state="isOpen?'open':'closed'" data-ui-float-button-group @mouseenter="onEnter" @mouseleave="onLeave">
      <div :id="controlsId" class="ui-float-button-group-actions" role="toolbar" :aria-label="label" :aria-hidden="!isOpen" :inert="!isOpen ? '' : undefined" @keydown="onKeydown"><slot :open="isOpen" :pending="pending" :show="show" :hide="hide" :toggle="toggle"/></div>
      <slot v-if="slots.trigger" name="trigger" v-bind="triggerScope" />
      <button v-else ref="triggerRef" type="button" class="ui-float-button ui-float-button-group-trigger" :class="[`is-${variant}`,`shape-${shape}`,`size-${size}`,{active:isOpen,loading:pending}]" :disabled="triggerDisabled" :aria-label="label" :aria-expanded="isOpen" :aria-controls="controlsId" aria-haspopup="true" @click="onTrigger" @focus="onTriggerFocus" @blur="onTriggerBlur" @mouseenter="triggerPointerEnter" @mouseleave="triggerPointerLeave" @keydown="onTriggerKeydown"><span class="ui-float-button-icon" aria-hidden="true"><AppIcon :name="triggerIcon" :size="size==='lg'?22:18"/></span><span class="ui-float-button-label">{{ triggerLabel||label }}</span></button>
    </div>
  </Teleport>
</template>

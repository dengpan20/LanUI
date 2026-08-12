<script setup>
import { computed, nextTick, onBeforeUnmount, ref, toRef, useId } from 'vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig } from '../config.js'
const props=defineProps({content:{type:String,default:''},placement:{type:String,default:'top'},disabled:Boolean,offset:{type:Number,default:8}})
const open=ref(false)
const root=ref(null)
const panel=ref(null)
const id=`ui-tooltip-${useId()}`
let describedElement=null
let previousDescribedby=''
const config=useLanUiConfig();const {floatingStyle,resolvedPlacement}=useFloatingPosition({triggerRef:root,panelRef:panel,open,placement:toRef(props,'placement'),offset:props.offset,zIndex:computed(()=>config.value.zIndex+70)})
async function show(){
  if(props.disabled||!props.content)return
  open.value=true
  await nextTick()
  describedElement=root.value?.querySelector(':focus,button,[href],input,textarea,[tabindex]')
  if(describedElement){previousDescribedby=describedElement.getAttribute('aria-describedby')||'';describedElement.setAttribute('aria-describedby',[previousDescribedby,id].filter(Boolean).join(' '))}
}
function clearDescription(){if(!describedElement)return;if(previousDescribedby)describedElement.setAttribute('aria-describedby',previousDescribedby);else describedElement.removeAttribute('aria-describedby');describedElement=null;previousDescribedby=''}
function hide(){open.value=false;clearDescription()}
onBeforeUnmount(clearDescription)
</script>
<template><span ref="root" class="ui-tooltip" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide"><slot :describedby="id"/><Teleport to="body"><Transition name="tooltip"><span v-if="open&&content" :id="id" ref="panel" class="ui-tooltip-content ui-floating-panel" :dir="config.direction" role="tooltip" :data-placement="resolvedPlacement" :style="floatingStyle">{{ content }}</span></Transition></Teleport></span></template>

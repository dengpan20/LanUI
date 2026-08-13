<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFeedback } from '../feedback.js'
import { useDirection, useLanUiConfig, useLocale } from '../config-runtime.js'
import { topOverlayZIndex } from './overlayManager.js'
const props=defineProps({items:{type:Array,default:null},feedback:{type:Object,default:null}})
defineEmits(['remove','pause','resume'])
const injectedFeedback=useFeedback()
const activeFeedback=computed(()=>props.feedback??injectedFeedback)
const source=computed(()=>props.items??activeFeedback.value.toastState.items)
const controlled=computed(()=>props.items!==null)
const config=useLanUiConfig()
const direction=useDirection()
const {t}=useLocale()
const toastZIndex=computed(()=>Math.max(config.value.zIndex+100,topOverlayZIndex.value+10))
const placements=['top-center','top-end','bottom-end','top-right','bottom-right']
function remove(id){if(!controlled.value)activeFeedback.value.toast.close(id)}
function pause(id){if(!controlled.value)activeFeedback.value.toast.pause(id)}
function resume(id){if(!controlled.value)activeFeedback.value.toast.resume(id)}
const icon=name=>name==='error'?'close':name==='warning'?'alert':name==='info'?'info':'check'
const title=name=>t(`toast.title.${name==='error'?'error':name==='warning'?'warning':name==='info'?'info':'success'}`)
</script>
<template><Teleport to="body"><div v-for="placement in placements" :key="placement" class="toasts" :class="`toasts-${placement}`" :dir="direction" :style="{zIndex:toastZIndex}" aria-live="polite"><TransitionGroup name="toast-list"><div v-for="item in source.filter(entry=>entry.placement===placement)" :key="item.id" class="toast" :class="[item.type,{out:item.out}]" :role="item.type==='error'?'alert':'status'" @mouseenter="pause(item.id);$emit('pause',item.id)" @mouseleave="resume(item.id);$emit('resume',item.id)"><span class="toast-icon"><AppIcon :name="icon(item.type)" :size="14"/></span><div class="toast-copy"><strong>{{ item.title||title(item.type) }}</strong><p>{{ item.message }}</p></div><button class="icon-btn" style="width:24px;height:24px" :aria-label="t('toast.close')" @click="remove(item.id);$emit('remove',item.id)"><AppIcon name="close" :size="13"/></button></div></TransitionGroup></div></Teleport></template>

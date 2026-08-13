<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiButton from './UiButton.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig, useLocale } from '../config-runtime.js'
import { focusWithRetry } from './focusUtils.js'
import { useTeleportThemeScope } from '../theme-scope.js'
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const props=defineProps({title:{type:String,default:''},message:{type:String,default:''},confirmText:{type:String,default:''},cancelText:{type:String,default:''},danger:Boolean,beforeConfirm:{type:Function,default:null},placement:{type:String,default:'top'},offset:{type:Number,default:8}})
const emit=defineEmits(['confirm','cancel','error'])
const root=ref(null)
const trigger=ref(null)
const panel=ref(null)
const open=ref(false)
const loading=ref(false)
const panelId=`ui-popconfirm-${useId()}`
const titleId=`${panelId}-title`
const messageId=`${panelId}-message`
const {t}=useLocale()
const config=useLanUiConfig();const {floatingStyle,resolvedPlacement}=useFloatingPosition({triggerRef:trigger,panelRef:panel,open,placement:toRef(props,'placement'),offset:props.offset,zIndex:computed(()=>config.value.zIndex+65)})
const triggerElement=()=>trigger.value?.querySelector('button,[href],input,[role="button"],[tabindex]')
function syncTrigger(){const element=triggerElement();if(!element)return;element.setAttribute('aria-expanded',String(open.value));element.setAttribute('aria-controls',panelId);element.setAttribute('aria-haspopup','dialog')}
function restore(){nextTick(()=>focusWithRetry(triggerElement))}
function setOpen(value){if(loading.value&&!value)return;open.value=value;nextTick(syncTrigger)}
function cancel(){if(loading.value)return;setOpen(false);emit('cancel');restore()}
async function confirm(){if(loading.value)return;loading.value=true;try{if(props.beforeConfirm)await props.beforeConfirm();emit('confirm');open.value=false;restore()}catch(error){emit('error',error)}finally{loading.value=false;nextTick(syncTrigger)}}
function outside(event){if(open.value&&root.value&&!root.value.contains(event.target)&&panel.value&&!panel.value.contains(event.target)&&!loading.value)setOpen(false)}
function keydown(event){if(event.key==='Escape'&&open.value&&!loading.value){event.preventDefault();cancel()}}
function focusPanel(){focusWithRetry(()=>open.value?panel.value?.querySelector('button'):null)}
watch(open,async value=>{await nextTick();syncTrigger();if(value)focusPanel()})
watch(panel,value=>{if(value&&open.value){syncTrigger();focusPanel()}})
onMounted(()=>{document.addEventListener('pointerdown',outside);document.addEventListener('keydown',keydown);syncTrigger()})
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',keydown)})
</script>
<template><span ref="root" class="ui-popconfirm"><span ref="trigger" class="ui-popover-trigger" @click="setOpen(!open)"><slot :open="open"/></span><Teleport to="body"><Transition name="select-menu" @after-enter="focusPanel"><span v-if="open" v-bind="portalThemeAttrs" :id="panelId" ref="panel" class="ui-popconfirm-panel ui-floating-panel" :dir="config.direction" role="alertdialog" :aria-labelledby="titleId" :aria-describedby="message?messageId:undefined" :data-placement="resolvedPlacement" :style="[portalThemeStyle,floatingStyle]"><span class="ui-popconfirm-mark"><AppIcon name="alert" :size="16"/></span><span class="ui-popconfirm-copy"><strong :id="titleId">{{ title||t('popconfirm.title') }}</strong><small v-if="message" :id="messageId">{{ message }}</small><span class="ui-popconfirm-actions"><UiButton size="sm" variant="text" :disabled="loading" @click="cancel">{{ cancelText||t('common.cancel') }}</UiButton><UiButton size="sm" :variant="danger?'danger':'primary'" :loading="loading" @click="confirm">{{ confirmText||t('common.confirm') }}</UiButton></span></span></span></Transition></Teleport></span></template>

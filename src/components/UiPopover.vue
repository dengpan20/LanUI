<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useId, watch } from 'vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const props=defineProps({modelValue:Boolean,placement:{type:String,default:'bottom'},width:{type:[String,Number],default:240},closeOnOutside:{type:Boolean,default:true},title:{type:String,default:''},offset:{type:Number,default:8}})
const emit=defineEmits(['update:modelValue','open','close'])
const root=ref(null)
const trigger=ref(null)
const panel=ref(null)
const panelId=`ui-popover-${useId()}`
const titleId=`${panelId}-title`
const config=useLanUiConfig();const {floatingStyle,resolvedPlacement}=useFloatingPosition({triggerRef:trigger,panelRef:panel,open:toRef(props,'modelValue'),placement:toRef(props,'placement'),offset:props.offset,zIndex:computed(()=>config.value.zIndex+60)})
const {t}=useLocale()
const triggerElement=()=>trigger.value?.querySelector('button,[href],input,[role="button"],[tabindex]')
function syncTrigger(){const element=triggerElement();if(!element)return;element.setAttribute('aria-expanded',String(props.modelValue));element.setAttribute('aria-controls',panelId);element.setAttribute('aria-haspopup','dialog')}
function focusTrigger(){nextTick(()=>triggerElement()?.focus())}
function setOpen(value,returnFocus=false){emit('update:modelValue',value);emit(value?'open':'close');if(!value&&returnFocus)focusTrigger()}
function toggle(){setOpen(!props.modelValue)}
function outside(event){if(props.closeOnOutside&&root.value&&!root.value.contains(event.target)&&panel.value&&!panel.value.contains(event.target))setOpen(false)}
function keydown(event){if(event.key==='Escape'&&props.modelValue){event.preventDefault();setOpen(false,true)}}
watch(()=>props.modelValue,()=>nextTick(syncTrigger),{immediate:true})
onMounted(()=>{document.addEventListener('pointerdown',outside);document.addEventListener('keydown',keydown);syncTrigger()})
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',keydown)})
</script>
<template><span ref="root" class="ui-popover"><span ref="trigger" class="ui-popover-trigger" @click="toggle"><slot name="trigger" :open="modelValue"/></span><Teleport to="body"><Transition name="select-menu"><span v-if="modelValue" v-bind="portalThemeAttrs" :id="panelId" ref="panel" class="ui-popover-panel ui-floating-panel" :dir="config.direction" role="dialog" :aria-labelledby="title?titleId:undefined" :aria-label="title?undefined:t('popover.label')" :data-placement="resolvedPlacement" :style="[portalThemeStyle,floatingStyle,{width:typeof width==='number'?`${width}px`:width}]" tabindex="-1"><strong v-if="title" :id="titleId" class="ui-popover-title">{{ title }}</strong><slot :close="()=>setOpen(false,true)"/></span></Transition></Teleport></span></template>

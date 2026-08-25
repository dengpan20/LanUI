<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, ssrContextKey, useAttrs, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiTooltip from './UiTooltip.vue'
import { useLocale as useLanLocale } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })
const props=defineProps({
  icon:{type:String,default:'plus'}, label:{type:String,default:''},
  variant:{type:String,default:undefined,validator:v=>['default','primary','danger'].includes(v)},
  badge:{type:[String,Number],default:''}, active:Boolean, disabled:Boolean,
  shape:{type:String,default:undefined,validator:v=>['circle','square'].includes(v)},
  size:{type:String,default:undefined,validator:v=>['sm','md','lg'].includes(v)},
  tooltip:{type:String,default:''}, tooltipPlacement:{type:String,default:'top'}, badgeMax:{type:Number,default:99}, badgeAriaLabel:{type:String,default:''}, loading:Boolean,
  href:{type:String,default:''}, target:{type:String,default:''}, rel:{type:String,default:''}, nativeType:{type:String,default:'button',validator:v=>['button','submit','reset'].includes(v)}, ariaLabel:{type:String,default:''}, actionKey:{type:[String,Number],default:undefined},
  visible:{type:Boolean,default:undefined}, defaultVisible:{type:Boolean,default:true}, backTop:Boolean, visibilityHeight:{type:Number,default:200}, scrollTarget:{type:[String,Object,Function],default:null}, smooth:{type:Boolean,default:true}, fixed:{type:Boolean,default:false}, offsetInline:{type:[Number,String],default:24}, offsetBlock:{type:[Number,String],default:24}, zIndex:{type:Number,default:100}, teleportTo:{type:[String,Object,Boolean],default:false},
})
const emit=defineEmits(['click','action','visible-change','back-top'])
const attrs=useAttrs();const slots=useSlots();const ssrContext=inject(ssrContextKey,null);const {t}=useLanLocale();const reducedMotion=useReducedMotion();const group=inject('uiFloatButtonGroupContext',null);const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const root=ref(null);const internalVisible=ref(props.defaultVisible);const controlledVisible=computed(()=>props.visible!==undefined);const visible=computed(()=>controlledVisible.value?Boolean(props.visible):internalVisible.value)
const resolvedShape=computed(()=>props.shape??group?.shape?.value??'circle');const resolvedSize=computed(()=>props.size??group?.size?.value??'md');const resolvedVariant=computed(()=>props.variant??group?.variant?.value??'default');const inheritedDisabled=computed(()=>Boolean(props.disabled||props.loading||group?.disabled?.value));const hasLabel=computed(()=>Boolean(props.label||slots.default));const tooltipText=computed(()=>props.tooltip||props.label||'');const accessibleLabel=computed(()=>props.ariaLabel||props.label||props.tooltip||t('floatButton.action')||'Action');const isLink=computed(()=>Boolean(props.href))
const badgeValue=computed(()=>{if(props.badge===''||props.badge===null||props.badge===undefined)return '';const max=Math.max(0,Number.isFinite(props.badgeMax)?Math.floor(props.badgeMax):99);const numeric=typeof props.badge==='number'?props.badge:Number(props.badge);return Number.isFinite(numeric)&&numeric>max?`${max}+`:String(props.badge)})
const badgeLabel=computed(()=>props.badgeAriaLabel||String(props.badge||''));const state=computed(()=>inheritedDisabled.value?(props.loading?'loading':'disabled'):props.backTop&&!visible.value?'hidden':props.active?'active':'ready')
const rootAttrs=computed(()=>{const {class:_class,style:_style,onClick:_click,...forwarded}=attrs;const common={...forwarded,'aria-label':accessibleLabel.value,'aria-busy':props.loading||undefined,'aria-disabled':inheritedDisabled.value||undefined,'data-ui-float-button':true};if(isLink.value)return {...common,href:inheritedDisabled.value?undefined:props.href,target:props.target||undefined,rel:props.rel||(props.target==='_blank'?'noopener noreferrer':undefined),tabindex:inheritedDisabled.value?-1:forwarded.tabindex};return {...common,type:props.nativeType,disabled:inheritedDisabled.value||undefined}})
const rootClasses=computed(()=>[`is-${resolvedVariant.value}`,`shape-${resolvedShape.value}`,`size-${resolvedSize.value}`,{active:props.active,loading:props.loading,disabled:inheritedDisabled.value,fixed:props.fixed},attrs.class])
const rootStyle=computed(()=>({...((attrs.style&&typeof attrs.style==='object')?attrs.style:{}),'--ui-float-offset-inline':typeof props.offsetInline==='number'?`${Math.max(0,props.offsetInline)}px`:String(props.offsetInline),'--ui-float-offset-block':typeof props.offsetBlock==='number'?`${Math.max(0,props.offsetBlock)}px`:String(props.offsetBlock),'--ui-float-z-index':String(Math.max(0,Number(props.zIndex)||0))}))
const shouldTeleport=computed(()=>!ssrContext&&!group&&typeof window!=='undefined'&&props.teleportTo!==false&&props.teleportTo!==''&&props.teleportTo!==null);const resolvedTeleportTo=computed(()=>shouldTeleport.value?(props.teleportTo||'body'):'body');const tooltipTeleportTo=computed(()=>props.teleportTo===false?'body':props.teleportTo||'body')
let target=null;let removeScroll=()=>{}
function resolveTarget(){const value=typeof props.scrollTarget==='function'?props.scrollTarget():props.scrollTarget;if(typeof window==='undefined')return null;if(!value||value==='window')return window;if(typeof value==='string')return document.querySelector(value)||window;return value}
function scrollTopOf(value){return value===window?window.scrollY||document.documentElement.scrollTop||0:value?.scrollTop||0}
function setVisible(value,source='api',event){const next=Boolean(value);if(visible.value===next)return false;const previous=visible.value;if(!controlledVisible.value)internalVisible.value=next;emit('visible-change',next,{visible:next,previous,source,event});return true}
function onScroll(event){if(!props.backTop||controlledVisible.value)return;setVisible(scrollTopOf(target)>Math.max(0,Number(props.visibilityHeight)||0),'scroll',event)}
function attachScroll(){removeScroll();if(!props.backTop||typeof window==='undefined')return;target=resolveTarget();if(!target?.addEventListener)return;target.addEventListener('scroll',onScroll,{passive:true});removeScroll=()=>target?.removeEventListener?.('scroll',onScroll);onScroll()}
function scrollToTop(event){const value=target||resolveTarget()||window;const behavior=props.smooth&&!reducedMotion.value?'smooth':'auto';try{if(value===window)window.scrollTo({top:0,behavior});else{value?.scrollTo?.({top:0,behavior});if(value)value.scrollTop=0}}catch{if(value===window)window.scrollTo(0,0);else if(value)value.scrollTop=0}setVisible(false,'back-top',event);const meta={source:'back-top',target:value,nativeEvent:event};emit('back-top',meta);return true}
function activate(event){if(inheritedDisabled.value){event?.preventDefault?.();event?.stopPropagation?.();return false}const source=event?.detail===0?'keyboard':'pointer';emit('click',event);if(props.backTop)scrollToTop(event);const meta={key:props.actionKey,source,nativeEvent:event,backTop:props.backTop||undefined};emit('action',meta);group?.select?.({key:props.actionKey,element:root.value,disabled:inheritedDisabled.value},event,meta);return true}
function focus(options){if(!root.value||inheritedDisabled.value)return false;root.value.focus(options);return true}
function blur(){if(!root.value)return false;root.value.blur();return true}function click(){if(!root.value||inheritedDisabled.value)return false;root.value.click();return true}function getElement(){return root.value}function getState(){return {visible:visible.value,disabled:inheritedDisabled.value,loading:Boolean(props.loading),active:Boolean(props.active),backTop:Boolean(props.backTop),key:props.actionKey}}
let groupRecord={}
function registerGroup(){if(!group?.register)return;group.unregister?.(groupRecord);groupRecord={__v_skip:true,key:props.actionKey,element:root.value,disabled:inheritedDisabled.value,focus};group.register(groupRecord)}
onMounted(()=>{attachScroll();registerGroup()});watch(()=>[props.backTop,props.scrollTarget,props.visibilityHeight],attachScroll,{deep:true});watch(()=>[props.actionKey,props.disabled,props.loading,inheritedDisabled.value],registerGroup);onBeforeUnmount(()=>{removeScroll();group?.unregister?.(groupRecord)})
defineExpose({root,visible,focus,blur,click,scrollToTop,getElement,getState})
</script>
<template>
  <Teleport :to="resolvedTeleportTo" :disabled="!shouldTeleport">
    <span v-bind="portalThemeAttrs" class="ui-float-button-teleport-scope" :style="portalThemeStyle" :dir="portalThemeAttrs.dir">
  <UiTooltip v-if="tooltipText" :content="tooltipText" :placement="tooltipPlacement" :disabled="inheritedDisabled" :teleport-to="tooltipTeleportTo" :append-to-body="Boolean(teleportTo)" class="ui-float-button-tooltip-wrap">
    <component :is="isLink?'a':'button'" ref="root" v-bind="rootAttrs" class="ui-float-button" :class="rootClasses" :style="rootStyle" :data-state="state" :data-action-key="actionKey" @click="activate">
      <span v-if="props.loading" class="ui-float-button-loading spinner" aria-hidden="true"/><span v-else class="ui-float-button-icon" aria-hidden="true"><slot name="icon"><AppIcon :name="icon" :size="resolvedSize==='lg'?22:18"/></slot></span><span v-if="hasLabel" class="ui-float-button-label"><slot>{{ label }}</slot></span><span v-if="badgeValue!==''" class="ui-float-badge" aria-hidden="true">{{ badgeValue }}</span><span v-if="badgeValue!==''" class="ui-sr-only">{{ badgeLabel }}</span><slot name="badge" :value="badgeValue" :label="badgeLabel"/>
    </component>
    <template #content><span class="ui-float-tooltip"><slot name="tooltip" :open="true">{{ tooltipText }}</slot></span></template>
  </UiTooltip>
  <component v-else :is="isLink?'a':'button'" ref="root" v-bind="rootAttrs" class="ui-float-button" :class="rootClasses" :style="rootStyle" :data-state="state" :data-action-key="actionKey" @click="activate">
    <span v-if="props.loading" class="ui-float-button-loading spinner" aria-hidden="true"/><span v-else class="ui-float-button-icon" aria-hidden="true"><slot name="icon"><AppIcon :name="icon" :size="resolvedSize==='lg'?22:18"/></slot></span><span v-if="hasLabel" class="ui-float-button-label"><slot>{{ label }}</slot></span><span v-if="badgeValue!==''" class="ui-float-badge" aria-hidden="true">{{ badgeValue }}</span><span v-if="badgeValue!==''" class="ui-sr-only">{{ badgeLabel }}</span><slot name="badge" :value="badgeValue" :label="badgeLabel"/>
  </component>
    </span>
  </Teleport>
</template>

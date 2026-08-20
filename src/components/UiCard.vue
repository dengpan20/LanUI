<script setup>
import { computed, ref, useAttrs, useId, useSlots } from 'vue'
import { useLocale } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  as:{type:[String,Object,Function],default:''},
  title:{type:String,default:''},
  subtitle:{type:String,default:''},
  titleTag:{type:String,default:'h3',validator:value=>['h2','h3','h4','h5','h6'].includes(value)},
  mark:{type:Boolean,default:true},
  bodyClass:{type:[String,Array,Object],default:''},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  variant:{type:String,default:'default',validator:value=>['default','outlined','elevated','filled'].includes(value)},
  bordered:{type:Boolean,default:true},
  shadow:{type:String,default:'xs',validator:value=>['none','xs','sm','md','lg'].includes(value)},
  hoverable:Boolean,
  interactive:Boolean,
  selected:Boolean,
  disabled:Boolean,
  loading:Boolean,
  loadingRows:{type:Number,default:3,validator:value=>Number.isInteger(value)&&value>=1&&value<=8},
  href:{type:String,default:''},
  target:{type:String,default:''},
  rel:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  ariaLabelledby:{type:String,default:''},
  ariaDescribedby:{type:String,default:''},
})
const emit=defineEmits(['click','activate'])
const attrs=useAttrs()
const slots=useSlots()
const {t}=useLocale()
const reducedMotion=useReducedMotion()
const root=ref(null)
const uid=useId()
const titleId=`ui-card-title-${uid}`
const descriptionId=`ui-card-subtitle-${uid}`

const hasTitle=computed(()=>Boolean(props.title||slots.title))
const hasSubtitle=computed(()=>Boolean(props.subtitle||slots.subtitle))
const hasHeader=computed(()=>hasTitle.value||hasSubtitle.value||Boolean(slots.header||slots.action||slots.actions))
const hasCover=computed(()=>Boolean(slots.cover))
const hasFooter=computed(()=>Boolean(slots.footer))
const actionable=computed(()=>Boolean(props.interactive||props.href))
const unavailable=computed(()=>Boolean(props.disabled||props.loading))
const resolvedTag=computed(()=>props.as||(props.href?'a':'div'))
const isNativeAction=computed(()=>['a','button'].includes(resolvedTag.value))
const resolvedRole=computed(()=>attrs.role||(actionable.value&&!isNativeAction.value?'button':undefined))
const resolvedTabindex=computed(()=>{
  if(attrs.tabindex!==undefined)return attrs.tabindex
  if(unavailable.value&&actionable.value)return -1
  if(actionable.value&&!isNativeAction.value)return 0
  return undefined
})
const resolvedRel=computed(()=>props.rel||(props.target==='_blank'?'noopener noreferrer':undefined))
const labelledby=computed(()=>{
  if(attrs['aria-labelledby']||props.ariaLabelledby)return attrs['aria-labelledby']||props.ariaLabelledby
  if(!props.ariaLabel&&!slots.header&&hasTitle.value)return titleId
  return undefined
})
const describedby=computed(()=>attrs['aria-describedby']||props.ariaDescribedby||(!slots.header&&hasSubtitle.value?descriptionId:undefined))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'class','style','role','tabindex','type','href','target','rel','aria-label','aria-labelledby','aria-describedby','aria-disabled','aria-busy','aria-pressed',
].includes(key))))

function isNestedControl(event){
  const target=event?.target
  if(!(target instanceof Element)||target===root.value)return false
  const control=target.closest('a,button,input,select,textarea,summary,[role="button"],[role="link"],[contenteditable="true"]')
  return Boolean(control&&control!==root.value)
}
function activationSource(event){return event?.type==='keydown'||event?.detail===0?'keyboard':'pointer'}
function activate(event,source=activationSource(event)){
  if(unavailable.value){event?.preventDefault();event?.stopPropagation();return false}
  if(isNestedControl(event))return false
  const meta={source,href:props.href||undefined,selected:props.selected}
  emit('activate',meta,event)
  return meta
}
function onClick(event){
  if(unavailable.value){event.preventDefault();event.stopPropagation();return false}
  emit('click',event)
  if(actionable.value)return activate(event)
  return true
}
function onKeydown(event){
  if(!actionable.value||isNativeAction.value||event.target!==event.currentTarget)return
  if(!['Enter',' '].includes(event.key))return
  event.preventDefault()
  activate(event,'keyboard')
}
function focus(options){if(unavailable.value)return false;root.value?.focus(options);return typeof document!=='undefined'&&document.activeElement===root.value}
function blur(){root.value?.blur();return Boolean(root.value)}
function scrollIntoView(options){
  const resolved=options||{block:'nearest',behavior:reducedMotion.value?'auto':'smooth'}
  root.value?.scrollIntoView(resolved)
  return Boolean(root.value)
}

defineExpose({root,focus,blur,scrollIntoView})
</script>

<template>
  <component
    :is="resolvedTag"
    ref="root"
    v-bind="rootAttrs"
    class="card ui-card"
    :class="[
      `size-${size}`,`variant-${variant}`,`shadow-${shadow}`,attrs.class,
      {bordered,hoverable,interactive:actionable,selected,disabled,loading,'has-cover':hasCover,'has-footer':hasFooter},
    ]"
    :style="attrs.style"
    :role="resolvedRole"
    :tabindex="resolvedTabindex"
    :type="resolvedTag==='button'?(attrs.type||'button'):undefined"
    :href="resolvedTag==='a'&&!unavailable?href:undefined"
    :target="resolvedTag==='a'&&!unavailable&&target?target:undefined"
    :rel="resolvedTag==='a'&&!unavailable?resolvedRel:undefined"
    :aria-label="attrs['aria-label']||ariaLabel||undefined"
    :aria-labelledby="labelledby"
    :aria-describedby="describedby"
    :aria-disabled="disabled&&actionable||undefined"
    :aria-busy="loading||undefined"
    :aria-pressed="resolvedRole==='button'&&interactive?selected:undefined"
    data-ui-card
    @click="onClick"
    @keydown="onKeydown"
  >
    <div v-if="hasCover" class="ui-card-cover"><slot name="cover" :disabled="unavailable"/></div>
    <div v-if="hasHeader" class="card-header">
      <slot name="header" :title="title" :subtitle="subtitle" :loading="loading" :disabled="unavailable">
        <div class="ui-card-heading">
          <component :is="titleTag" v-if="hasTitle" :id="titleId" class="card-title">
            <span v-if="mark" class="card-title-mark" aria-hidden="true"/>
            <slot name="title" :title="title">{{ title }}</slot>
          </component>
          <p v-if="hasSubtitle" :id="descriptionId" class="ui-card-subtitle"><slot name="subtitle" :subtitle="subtitle">{{ subtitle }}</slot></p>
        </div>
      </slot>
      <div v-if="$slots.action||$slots.actions" class="ui-card-actions">
        <slot name="action" :loading="loading" :disabled="unavailable"/>
        <slot name="actions" :loading="loading" :disabled="unavailable"/>
      </div>
    </div>
    <div v-if="loading" class="card-body ui-card-loading" aria-hidden="true">
      <slot name="loading" :rows="loadingRows">
        <span v-for="row in loadingRows" :key="row" class="ui-card-skeleton" :style="{'--ui-card-skeleton-width':`${Math.max(42,100-(row-1)*13)}%`}"/>
      </slot>
    </div>
    <div v-else class="card-body" :class="bodyClass"><slot :disabled="unavailable" :selected="selected"/></div>
    <div v-if="hasFooter&&!loading" class="ui-card-footer"><slot name="footer" :disabled="unavailable" :selected="selected"/></div>
    <span v-if="loading" class="sr-only">{{ t('common.loading') }}</span>
  </component>
</template>

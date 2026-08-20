<script setup>
import { computed, ref, useAttrs } from 'vue'
import { useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  as:{type:[String,Object,Function],default:'span'},
  color:{type:String,default:'blue'},
  type:{type:String,default:''},
  variant:{type:String,default:'soft',validator:value=>['soft','solid','outlined'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  dot:Boolean,
  round:Boolean,
  closable:Boolean,
  closeLabel:{type:String,default:''},
  disabled:Boolean,
  interactive:Boolean,
  checkable:Boolean,
  checked:Boolean,
  href:{type:String,default:''},
  target:{type:String,default:''},
  rel:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['click','activate','close','update:checked','change'])
const attrs=useAttrs()
const {t}=useLocale()
const root=ref(null)
const action=ref(null)
const close=ref(null)

const knownColors=new Set(['blue','green','orange','red','gray','purple'])
const resolvedColor=computed(()=>props.type||props.color||'blue')
const customColor=computed(()=>knownColors.has(resolvedColor.value)?'':resolvedColor.value)
const actionable=computed(()=>Boolean(props.interactive||props.checkable||props.href))
const actionTag=computed(()=>props.href?'a':'button')
const resolvedRel=computed(()=>props.rel||(props.target==='_blank'?'noopener noreferrer':undefined))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const rootStyle=computed(()=>[attrs.style,customColor.value?{'--ui-tag-color':customColor.value}:undefined])
const sourceOf=event=>event?.detail===0?'keyboard':'pointer'

function activationMeta(event,checked=props.checked){return{source:sourceOf(event),checked:Boolean(checked),href:props.href||undefined}}
function onPassiveClick(event){if(props.disabled){event.preventDefault();event.stopPropagation();return};emit('click',event)}
function onActivate(event){
  if(props.disabled){event.preventDefault();event.stopPropagation();return false}
  emit('click',event)
  if(props.checkable){
    const next=!props.checked
    const meta={...activationMeta(event,next),previous:props.checked}
    emit('update:checked',next)
    emit('change',next,meta,event)
    emit('activate',meta,event)
    return meta
  }
  const meta=activationMeta(event)
  emit('activate',meta,event)
  return meta
}
function onClose(event){
  if(props.disabled){event.preventDefault();event.stopPropagation();return false}
  const meta={source:sourceOf(event),color:resolvedColor.value,checked:props.checked}
  emit('close',meta,event)
  return meta
}
function focus(options){const target=action.value||root.value;target?.focus(options);return typeof document!=='undefined'&&document.activeElement===target}
function focusClose(options){if(props.disabled||!props.closable)return false;close.value?.focus(options);return typeof document!=='undefined'&&document.activeElement===close.value}

defineExpose({root,action,close,focus,focusClose})
</script>

<template>
  <component
    :is="as"
    ref="root"
    v-bind="rootAttrs"
    class="tag ui-tag"
    :class="[
      knownColors.has(resolvedColor)?`tag-${resolvedColor}`:'tag-custom',
      `variant-${variant}`,`size-${size}`,attrs.class,
      {round,closable,interactive:actionable,checkable,checked:checkable&&checked,disabled},
    ]"
    :style="rootStyle"
    :data-color="resolvedColor"
    :data-checked="checkable?String(checked):undefined"
    data-ui-tag
    @click="!actionable?onPassiveClick($event):undefined"
  >
    <component
      :is="actionTag"
      v-if="actionable"
      ref="action"
      class="ui-tag-main"
      :type="actionTag==='button'?'button':undefined"
      :disabled="actionTag==='button'?disabled:undefined"
      :href="actionTag==='a'&&!disabled?href:undefined"
      :target="actionTag==='a'&&!disabled&&target?target:undefined"
      :rel="actionTag==='a'&&!disabled?resolvedRel:undefined"
      :tabindex="actionTag==='a'&&disabled?-1:undefined"
      :aria-disabled="actionTag==='a'&&disabled||undefined"
      :aria-pressed="checkable?checked:undefined"
      :aria-label="ariaLabel||undefined"
      @click.stop="onActivate"
    >
      <slot name="prefix" :checked="checked" :disabled="disabled"/>
      <span v-if="dot" class="status-dot" aria-hidden="true"/>
      <slot :checked="checked" :disabled="disabled"/>
      <slot name="suffix" :checked="checked" :disabled="disabled"/>
    </component>
    <span v-else class="ui-tag-main">
      <slot name="prefix" :checked="checked" :disabled="disabled"/>
      <span v-if="dot" class="status-dot" aria-hidden="true"/>
      <slot :checked="checked" :disabled="disabled"/>
      <slot name="suffix" :checked="checked" :disabled="disabled"/>
    </span>
    <button
      v-if="closable"
      ref="close"
      type="button"
      class="ui-tag-close"
      :disabled="disabled"
      :aria-label="closeLabel||t('tag.close')"
      @click.stop="onClose"
    ><slot name="close-icon" :disabled="disabled">×</slot></button>
  </component>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useSlots, watch } from 'vue'
import { useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'
import AppIcon from './AppIcon.vue'

defineOptions({inheritAttrs:false})

const props=defineProps({
  content:{type:String,default:''},
  variant:{type:String,default:'text',validator:value=>['text','paragraph','title'].includes(value)},
  level:{type:Number,default:1,validator:value=>Number.isInteger(value)&&value>=1&&value<=6},
  as:{type:String,default:''},
  tone:{type:String,default:'default',validator:value=>['default','primary','secondary','success','warning','danger'].includes(value)},
  size:{type:String,default:'inherit',validator:value=>['inherit','sm','md','lg'].includes(value)},
  weight:{type:String,default:'inherit',validator:value=>['inherit','regular','medium','semibold','bold'].includes(value)},
  align:{type:String,default:'start',validator:value=>['start','center','end'].includes(value)},
  copyable:{type:[Boolean,Object],default:false},
  editable:{type:[Boolean,Object],default:false},
  ellipsis:{type:[Boolean,Object],default:false},
  expanded:{type:Boolean,default:undefined},
  editing:{type:Boolean,default:undefined},
  disabled:{type:Boolean,default:false},
  code:Boolean,
  keyboard:Boolean,
  mark:Boolean,
  delete:Boolean,
  underline:Boolean,
  strong:Boolean,
  italic:Boolean,
  copyDuration:{type:Number,default:1500},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:content','update:expanded','update:editing','copy','copy-error','edit-start','edit-end','edit-cancel','expand'])
const attrs=useAttrs(),slots=useSlots(),{t}=useLocale()
const rootRef=ref(null),contentRef=ref(null),editorRef=ref(null)
const internalExpanded=ref(false),internalEditing=ref(false),draft=ref(props.content)
const overflowing=ref(false),copied=ref(false)
let observer=null,copyTimer=0,previousContent=''

const allowedTags=new Set(['span','p','div','label','small','h1','h2','h3','h4','h5','h6'])
const rootTag=computed(()=>allowedTags.has(props.as)?props.as:props.variant==='title'?`h${props.level}`:props.variant==='paragraph'?'p':'span')
const copyConfig=computed(()=>props.copyable&&typeof props.copyable==='object'?props.copyable:{})
const editConfig=computed(()=>props.editable&&typeof props.editable==='object'?props.editable:{})
const ellipsisConfig=computed(()=>props.ellipsis&&typeof props.ellipsis==='object'?props.ellipsis:{})
const isExpanded=computed(()=>typeof props.expanded==='boolean'?props.expanded:internalExpanded.value)
const isEditing=computed(()=>typeof props.editing==='boolean'?props.editing:internalEditing.value)
const rows=computed(()=>Math.max(1,Math.floor(Number(ellipsisConfig.value.rows)||(props.variant==='text'?1:2))))
const expandable=computed(()=>Boolean(ellipsisConfig.value.expandable))
const editTrigger=computed(()=>editConfig.value.trigger||'icon')
const maxLength=computed(()=>Number.isFinite(editConfig.value.maxLength)?Math.max(0,Math.floor(editConfig.value.maxLength)):undefined)
const contentStyle=computed(()=>props.ellipsis&&!isExpanded.value?{'--ui-typography-lines':String(rows.value)}:{})
const showExpand=computed(()=>Boolean(props.ellipsis&&expandable.value&&(overflowing.value||isExpanded.value)))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style','aria-label'].includes(key))))
const statusText=computed(()=>copied.value?t('typography.copied'):'')

function displayText(){return copyConfig.value.text??(props.content!==''?props.content:contentRef.value?.textContent??'')}
function setEditing(value){
  if(typeof props.editing!=='boolean')internalEditing.value=value
  emit('update:editing',value)
}
function setExpanded(value){
  if(typeof props.expanded!=='boolean')internalExpanded.value=value
  emit('update:expanded',value)
}
function startEdit(source='api'){
  if(!props.editable||props.disabled||isEditing.value)return false
  previousContent=props.content||contentRef.value?.textContent||''
  draft.value=previousContent
  setEditing(true);emit('edit-start',{value:previousContent,source})
  nextTick(()=>{editorRef.value?.focus();editorRef.value?.select?.()})
  return true
}
function confirmEdit(source='api'){
  if(!isEditing.value)return props.content
  const value=maxLength.value===undefined?draft.value:draft.value.slice(0,maxLength.value)
  if(value!==props.content)emit('update:content',value)
  setEditing(false);emit('edit-end',{value,previous:previousContent,source})
  return value
}
function cancelEdit(source='api'){
  if(!isEditing.value)return false
  draft.value=previousContent;setEditing(false);emit('edit-cancel',{value:previousContent,source});return true
}
function onEditorKeydown(event){
  if(event.key==='Escape'){event.preventDefault();cancelEdit('keyboard');return}
  const submit=event.key==='Enter'&&(props.variant!=='paragraph'||event.ctrlKey||event.metaKey)
  if(submit){event.preventDefault();confirmEdit('keyboard')}
}
function onEditorBlur(){if(editConfig.value.submitOnBlur)confirmEdit('blur')}
function onContentDblClick(){if(['text','both'].includes(editTrigger.value))startEdit('text')}
function fallbackCopy(text){
  if(!isClient||typeof document.execCommand!=='function')return false
  const input=document.createElement('textarea')
  input.value=text;input.setAttribute('readonly','');input.style.cssText='position:fixed;inset:-9999px;opacity:0'
  document.body.appendChild(input);input.select()
  let result=false
  try{result=document.execCommand('copy')}finally{input.remove()}
  return result
}
async function copy(source='api'){
  if(!props.copyable||props.disabled)return false
  const text=String(displayText())
  try{
    if(isClient&&navigator.clipboard?.writeText)await navigator.clipboard.writeText(text)
    else if(!fallbackCopy(text))throw new Error('Clipboard is unavailable')
    copied.value=true;emit('copy',{text,source})
    if(copyTimer)clearTimeout(copyTimer)
    copyTimer=setTimeout(()=>{copied.value=false;copyTimer=0},Math.max(0,props.copyDuration))
    return true
  }catch(error){copied.value=false;emit('copy-error',{text,source,error});return false}
}
function toggleExpanded(source='api'){
  if(!showExpand.value||props.disabled)return isExpanded.value
  const value=!isExpanded.value;setExpanded(value);emit('expand',{expanded:value,source,rows:rows.value})
  nextTick(measureOverflow);return value
}
function measureOverflow(){
  const node=contentRef.value
  if(!node||!props.ellipsis){overflowing.value=false;return false}
  if(isExpanded.value)return overflowing.value
  if(rows.value===1){overflowing.value=node.scrollWidth>node.clientWidth+1;return overflowing.value}
  const clampedHeight=node.clientHeight
  if(node.scrollHeight>clampedHeight+1){overflowing.value=true;return true}
  // Chromium can report the clamped height as scrollHeight. Probe unclamped text only
  // when the direct measurement is inconclusive, then immediately remove the probe.
  if(!isClient||!clampedHeight||!node.clientWidth){overflowing.value=false;return false}
  const probe=node.cloneNode(true)
  probe.classList.remove('ellipsis','single-line')
  probe.setAttribute('aria-hidden','true')
  probe.style.cssText=`position:absolute;visibility:hidden;pointer-events:none;display:block;overflow:visible;width:${node.clientWidth}px;max-width:none;height:auto;min-height:0;-webkit-line-clamp:unset;line-clamp:unset;`
  document.body.appendChild(probe)
  const naturalHeight=probe.scrollHeight
  probe.remove()
  overflowing.value=naturalHeight>clampedHeight+1
  return overflowing.value
}
function focus(){(isEditing.value?editorRef.value:rootRef.value?.querySelector?.('button')||rootRef.value)?.focus?.()}

watch(()=>props.content,value=>{if(!isEditing.value)draft.value=value;nextTick(measureOverflow)})
watch(()=>[props.ellipsis,props.variant,props.level,props.expanded],()=>nextTick(measureOverflow),{deep:true})
watch(()=>props.editing,value=>{if(value){previousContent=props.content;draft.value=props.content;nextTick(()=>editorRef.value?.focus())}})
onMounted(()=>nextTick(()=>{
  measureOverflow()
  if(typeof ResizeObserver==='function'){observer=new ResizeObserver(measureOverflow);if(contentRef.value)observer.observe(contentRef.value)}
  document.fonts?.ready?.then(measureOverflow).catch(()=>{})
}))
onBeforeUnmount(()=>{observer?.disconnect();if(copyTimer)clearTimeout(copyTimer)})
defineExpose({copy,startEdit,confirmEdit,cancelEdit,toggleExpanded,measureOverflow,focus,overflowing})
</script>

<template>
  <component
    :is="rootTag"
    v-bind="rootAttrs"
    ref="rootRef"
    class="ui-typography"
    :class="[`variant-${variant}`,`level-${level}`,`tone-${tone}`,`size-${size}`,`weight-${weight}`,`align-${align}`,attrs.class,{disabled,code,keyboard,mark,deleted:props.delete,underline,strong,italic,editing:isEditing,expanded:isExpanded}]"
    :style="attrs.style"
    :aria-label="attrs['aria-label']||ariaLabel||undefined"
    :data-ui-typography="variant"
    :data-overflowing="overflowing?'true':'false'"
  >
    <span v-if="isEditing" class="ui-typography-editor">
      <textarea v-if="variant==='paragraph'" ref="editorRef" v-model="draft" class="ui-typography-editor-control is-textarea" :maxlength="maxLength" :aria-label="t('typography.editLabel')" @keydown="onEditorKeydown" @blur="onEditorBlur"/>
      <input v-else ref="editorRef" v-model="draft" class="ui-typography-editor-control" :maxlength="maxLength" :aria-label="t('typography.editLabel')" @keydown="onEditorKeydown" @blur="onEditorBlur"/>
      <span class="ui-typography-editor-actions">
        <button type="button" class="ui-typography-action is-confirm" :aria-label="t('typography.save')" @mousedown.prevent @click="confirmEdit('button')"><AppIcon name="check" :size="15"/></button>
        <button type="button" class="ui-typography-action" :aria-label="t('typography.cancel')" @mousedown.prevent @click="cancelEdit('button')"><AppIcon name="close" :size="15"/></button>
      </span>
    </span>
    <template v-else>
      <span v-if="slots.prefix" class="ui-typography-prefix"><slot name="prefix"/></span>
      <span ref="contentRef" class="ui-typography-content" :class="{ellipsis:ellipsis&&!isExpanded,'single-line':rows===1}" :style="contentStyle" :title="ellipsis&&overflowing&&!isExpanded?String(displayText()):undefined" @dblclick="onContentDblClick"><slot :content="content">{{ content }}</slot></span>
      <span v-if="slots.suffix" class="ui-typography-suffix"><slot name="suffix"/></span>
      <span v-if="copyable||editable||showExpand" class="ui-typography-actions" role="group" :aria-label="t('typography.actions')">
        <button v-if="copyable" type="button" class="ui-typography-action" :class="{copied}" :disabled="disabled" :aria-label="copied?t('typography.copied'):t('typography.copy')" @click="copy('button')"><slot name="copy-icon" :copied="copied"><AppIcon :name="copied?'check':'copy'" :size="15"/></slot></button>
        <button v-if="editable&&['icon','both'].includes(editTrigger)" type="button" class="ui-typography-action" :disabled="disabled" :aria-label="t('typography.edit')" @click="startEdit('button')"><slot name="edit-icon"><AppIcon name="edit" :size="15"/></slot></button>
        <button v-if="showExpand" type="button" class="ui-typography-action is-expand" :disabled="disabled" :aria-expanded="isExpanded?'true':'false'" :aria-label="isExpanded?t('typography.collapse'):t('typography.expand')" @click="toggleExpanded('button')"><slot name="expand-icon" :expanded="isExpanded"><AppIcon name="chevronDown" :size="15"/></slot><span>{{ isExpanded?t('typography.collapse'):t('typography.expand') }}</span></button>
      </span>
      <span class="sr-only" aria-live="polite" aria-atomic="true">{{ statusText }}</span>
    </template>
  </component>
</template>

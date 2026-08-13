<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDirection, useLocale } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'

const props=defineProps({
  items:{type:Array,default:()=>[]},
  modelValue:{type:[String,Number],default:undefined},
  container:{type:[String,Object,Function],default:null},
  offsetTop:{type:Number,default:0},
  bounds:{type:Number,default:8},
  affix:{type:Boolean,default:true},
  smooth:{type:Boolean,default:true},
  direction:{type:String,default:'vertical',validator:value=>['vertical','horizontal'].includes(value)},
  disabled:Boolean,
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','click','scroll-start','scroll-end'])
const root=ref(null)
const textDirection=useDirection()
const reducedMotion=useReducedMotion()
const {t}=useLocale()
let scrollTarget=null
let scrollTimer=0
let suppressScrollSpy=false

function flatten(items,level=0,result=[]){
  for(const item of items||[]){
    result.push({...item,key:item.key??item.href,level})
    if(item.children?.length)flatten(item.children,level+1,result)
  }
  return result
}
const links=computed(()=>flatten(props.items))
const firstEnabled=()=>links.value.find(item=>!item.disabled)?.key??''
const internalValue=ref(props.modelValue??firstEnabled())
const activeValue=computed(()=>props.modelValue===undefined?internalValue.value:props.modelValue)
const rootStyle=computed(()=>props.affix?{'--ui-anchor-offset':`${Math.max(0,props.offsetTop)}px`}:undefined)

function getWindow(){return typeof window==='undefined'?null:window}
function resolveContainer(){
  const win=getWindow()
  if(!win)return null
  let value=typeof props.container==='function'?props.container():props.container
  if(typeof value==='string')value=document.querySelector(value)
  return value||win
}
function resolveSection(item){
  if(typeof document==='undefined'||!item?.href)return null
  const hash=String(item.href).includes('#')?String(item.href).slice(String(item.href).lastIndexOf('#')+1):String(item.href)
  if(!hash)return null
  try{return document.getElementById(decodeURIComponent(hash))||document.querySelector(`#${CSS.escape(decodeURIComponent(hash))}`)}catch{return null}
}
function isWindowTarget(target){const win=getWindow();return target===win||target===document||target===document?.documentElement||target===document?.body}
function sectionTop(item,target){
  const section=resolveSection(item)
  if(!section)return null
  const rect=section.getBoundingClientRect()
  return isWindowTarget(target)?rect.top:rect.top-target.getBoundingClientRect().top
}
function setActive(item,source){
  if(!item||item.disabled||item.key===activeValue.value)return
  internalValue.value=item.key
  emit('update:modelValue',item.key)
  emit('change',item.key,item,{source})
}
function updateFromScroll(){
  if(suppressScrollSpy||props.disabled)return
  const target=scrollTarget||resolveContainer()
  if(!target)return
  const threshold=Math.max(0,props.offsetTop)+Math.max(0,props.bounds)
  const candidates=links.value.filter(item=>!item.disabled).map(item=>({item,top:sectionTop(item,target)})).filter(entry=>entry.top!==null)
  if(!candidates.length)return
  const passed=candidates.filter(entry=>entry.top<=threshold)
  setActive((passed.at(-1)||candidates[0]).item,'scroll')
}
function finishScroll(item){
  clearTimeout(scrollTimer)
  scrollTimer=setTimeout(()=>{
    suppressScrollSpy=false
    updateFromScroll()
    emit('scroll-end',item)
  },180)
}
function scrollToItem(item){
  const target=scrollTarget||resolveContainer()
  const section=resolveSection(item)
  if(!target||!section)return false
  const behavior=props.smooth&&!reducedMotion.value?'smooth':'auto'
  const sectionRect=section.getBoundingClientRect()
  const top=isWindowTarget(target)
    ? sectionRect.top+(getWindow()?.scrollY||0)-Math.max(0,props.offsetTop)
    : sectionRect.top-target.getBoundingClientRect().top+target.scrollTop-Math.max(0,props.offsetTop)
  suppressScrollSpy=true
  emit('scroll-start',item)
  if(typeof target.scrollTo==='function')target.scrollTo({top:Math.max(0,top),behavior})
  else target.scrollTop=Math.max(0,top)
  finishScroll(item)
  return true
}
function onClick(item,event){
  event.preventDefault()
  if(props.disabled||item.disabled)return
  emit('click',item,event)
  setActive(item,'pointer')
  scrollToItem(item)
}
function focusAt(index){
  const elements=[...(root.value?.querySelectorAll('.ui-anchor-link:not([aria-disabled="true"])')||[])]
  if(!elements.length)return
  elements[(index+elements.length)%elements.length]?.focus()
}
function onKeydown(event){
  const elements=[...(root.value?.querySelectorAll('.ui-anchor-link:not([aria-disabled="true"])')||[])]
  const index=elements.indexOf(event.currentTarget)
  const previous=props.direction==='horizontal'?(textDirection.value==='rtl'?'ArrowRight':'ArrowLeft'):'ArrowUp'
  const next=props.direction==='horizontal'?(textDirection.value==='rtl'?'ArrowLeft':'ArrowRight'):'ArrowDown'
  if(event.key===previous){event.preventDefault();focusAt(index-1)}
  else if(event.key===next){event.preventDefault();focusAt(index+1)}
  else if(event.key==='Home'){event.preventDefault();focusAt(0)}
  else if(event.key==='End'){event.preventDefault();focusAt(elements.length-1)}
}
function unbind(){
  scrollTarget?.removeEventListener?.('scroll',updateFromScroll)
  getWindow()?.removeEventListener('resize',updateFromScroll)
  scrollTarget=null
}
function bind(){
  unbind()
  scrollTarget=resolveContainer()
  scrollTarget?.addEventListener?.('scroll',updateFromScroll,{passive:true})
  getWindow()?.addEventListener('resize',updateFromScroll,{passive:true})
  nextTick(updateFromScroll)
}

watch(()=>props.modelValue,value=>{if(value!==undefined)internalValue.value=value})
watch(()=>[props.container,props.items,props.offsetTop],bind,{deep:true})
onMounted(bind)
onBeforeUnmount(()=>{unbind();clearTimeout(scrollTimer)})
defineExpose({scrollTo:(key)=>{const item=links.value.find(entry=>entry.key===key);if(!item)return false;setActive(item,'api');return scrollToItem(item)},update:updateFromScroll})
</script>

<template>
  <nav ref="root" class="ui-anchor" :class="[`direction-${props.direction}`,{affix,disabled}]" :style="rootStyle" :aria-label="ariaLabel||t('anchor.label')">
    <ol class="ui-anchor-list">
      <li v-for="item in links" :key="item.key" class="ui-anchor-item" :style="{'--ui-anchor-level':item.level}">
        <a class="ui-anchor-link" :class="{active:item.key===activeValue}" :href="item.href" :aria-current="item.key===activeValue?'location':undefined" :aria-disabled="disabled||item.disabled?'true':undefined" :tabindex="disabled||item.disabled?-1:0" @click="onClick(item,$event)" @keydown="onKeydown">
          <slot name="item" :item="item" :active="item.key===activeValue" :level="item.level">{{ item.title }}</slot>
        </a>
      </li>
    </ol>
  </nav>
</template>

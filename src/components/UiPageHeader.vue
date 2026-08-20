<script setup>
import { computed, ref, useAttrs, useId, useSlots } from 'vue'
import AppIcon from './AppIcon.vue'
import UiBreadcrumb from './UiBreadcrumb.vue'
import { useLocale } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  title:{type:String,default:''},
  description:{type:String,default:''},
  breadcrumbs:{type:Array,default:()=>[]},
  showBack:Boolean,
  backHref:{type:String,default:''},
  backLabel:{type:String,default:''},
  backDisabled:Boolean,
  titleTag:{type:String,default:'h1',validator:value=>['h1','h2','h3','h4','h5','h6'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  bordered:Boolean,
  sticky:Boolean,
  stickyOffset:{type:[Number,String],default:0},
  loading:Boolean,
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['back','breadcrumb-navigate'])
const attrs=useAttrs()
const slots=useSlots()
const {t}=useLocale()
const reducedMotion=useReducedMotion()
const uid=useId()
const root=ref(null)
const backControl=ref(null)
const titleId=`ui-page-header-title-${uid}`

const hasTitle=computed(()=>Boolean(props.title||slots.title))
const hasDescription=computed(()=>Boolean(props.description||slots.description))
const hasBreadcrumb=computed(()=>props.breadcrumbs.length>0||Boolean(slots.breadcrumb))
const hasBack=computed(()=>props.showBack||Boolean(props.backHref))
const hasMeta=computed(()=>Boolean(slots.meta))
const hasActions=computed(()=>Boolean(slots.actions))
const hasFooter=computed(()=>Boolean(slots.footer))
const resolvedBackLabel=computed(()=>props.backLabel||t('pageHeader.back'))
const resolvedLabel=computed(()=>props.ariaLabel||(hasTitle.value?undefined:t('pageHeader.label')))
const breadcrumbLabel=computed(()=>`${props.title||props.ariaLabel||t('pageHeader.label')}: ${t('breadcrumb.label')}`)
const stickyStyle=computed(()=>{
  const value=typeof props.stickyOffset==='number'?`${props.stickyOffset}px`:String(props.stickyOffset||0)
  return {'--ui-page-header-sticky-offset':value}
})
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style','aria-label','aria-labelledby'].includes(key))))

function sourceOf(event){return event?.detail===0?'keyboard':'pointer'}
function emitBack(event,source=sourceOf(event)){
  if(props.backDisabled){event?.preventDefault();return false}
  const meta={source,href:props.backHref||undefined}
  emit('back',meta,event)
  return meta
}
function navigate(item){
  const meta={item,index:props.breadcrumbs.indexOf(item)}
  emit('breadcrumb-navigate',meta)
  return meta
}
function focusBack(options){
  if(!hasBack.value||props.backDisabled)return false
  backControl.value?.focus(options)
  return document.activeElement===backControl.value
}
function scrollIntoView(options){
  const resolved=options||{block:'start',behavior:reducedMotion.value?'auto':'smooth'}
  root.value?.scrollIntoView(resolved)
  return Boolean(root.value)
}

defineExpose({root,backControl,focusBack,scrollIntoView})
</script>

<template>
  <header
    ref="root"
    v-bind="rootAttrs"
    class="ui-page-header"
    :class="[`size-${size}`,attrs.class,{bordered,sticky,loading,'has-back':hasBack}]"
    :style="[stickyStyle,attrs.style]"
    :aria-label="attrs['aria-label']||resolvedLabel"
    :aria-labelledby="attrs['aria-labelledby']||(!loading&&hasTitle?titleId:undefined)"
    :aria-busy="loading||undefined"
    data-ui-page-header
  >
    <template v-if="loading">
      <slot name="loading">
        <div class="ui-page-header-loading" aria-hidden="true">
          <span class="ui-page-header-skeleton breadcrumb"/>
          <span class="ui-page-header-skeleton title"/>
          <span class="ui-page-header-skeleton description"/>
        </div>
      </slot>
      <span class="sr-only">{{ t('common.loading') }}</span>
    </template>
    <template v-else>
      <div v-if="hasBreadcrumb" class="ui-page-header-breadcrumb">
        <slot name="breadcrumb" :items="breadcrumbs" :navigate="navigate">
          <UiBreadcrumb :items="breadcrumbs" :aria-label="breadcrumbLabel" @navigate="navigate"/>
        </slot>
      </div>
      <div class="ui-page-header-main">
        <a
          v-if="hasBack&&backHref"
          ref="backControl"
          class="ui-page-header-back"
          :class="{disabled:backDisabled}"
          :href="backDisabled?undefined:backHref"
          :aria-label="resolvedBackLabel"
          :aria-disabled="backDisabled||undefined"
          :tabindex="backDisabled?-1:undefined"
          @click="emitBack"
        ><slot name="back-icon"><AppIcon class="ui-page-header-back-icon" name="chevronRight" :size="17"/></slot></a>
        <button
          v-else-if="hasBack"
          ref="backControl"
          type="button"
          class="ui-page-header-back"
          :disabled="backDisabled"
          :aria-label="resolvedBackLabel"
          @click="emitBack"
        ><slot name="back-icon"><AppIcon class="ui-page-header-back-icon" name="chevronRight" :size="17"/></slot></button>
        <div class="ui-page-header-copy">
          <component :is="titleTag" v-if="hasTitle" :id="titleId" class="ui-page-header-title">
            <slot name="title" :title="title">{{ title }}</slot>
          </component>
          <div v-if="hasDescription" class="ui-page-header-description">
            <slot name="description" :description="description">{{ description }}</slot>
          </div>
          <div v-if="hasMeta" class="ui-page-header-meta"><slot name="meta"/></div>
        </div>
      </div>
      <div v-if="hasActions" class="ui-page-header-actions"><slot name="actions"/></div>
      <div v-if="hasFooter" class="ui-page-header-footer"><slot name="footer"/></div>
    </template>
  </header>
</template>

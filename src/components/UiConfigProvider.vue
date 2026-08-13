<script setup>
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, unref, watch } from 'vue'
import { lanUiConfigKey, normalizeLanUiConfig } from '../config.js'
import { defaultIconRegistry, iconRegistryKey } from '../icons.js'
import { resolveThemeAppearance, themeToStyle } from '../theme.js'
import { lanUiMotionKey, motionPreferenceToStyle, resolveMotionPreference } from '../motion.js'
import { lanUiTeleportScopeKey } from '../theme-scope.js'
const props=defineProps({locale:{type:[String,Object],default:''},fallbackLocale:{type:[String,Object,Array,Boolean],default:undefined},fallbackLocales:{type:Array,default:undefined},localeRegistry:{type:Object,default:undefined},iconRegistry:{type:Object,default:undefined},size:{type:String,default:''},density:{type:String,default:''},direction:{type:String,default:''},zIndex:{type:Number,default:0},appearance:{type:String,default:''},motion:{type:String,default:''},theme:{type:Object,default:()=>({})},tag:{type:String,default:'div'}})
const parent=inject(lanUiConfigKey,null)
const config=computed(()=>normalizeLanUiConfig(props,unref(parent)||undefined))
provide(lanUiConfigKey,config)
const parentIconRegistry=inject(iconRegistryKey,defaultIconRegistry)
provide(iconRegistryKey,props.iconRegistry||parentIconRegistry)
const systemDark=ref(false)
const systemReduced=ref(false)
let darkMedia=null,reducedMedia=null
let providerMounted=false
const syncSystemDark=event=>{systemDark.value=Boolean(event?.matches??darkMedia?.matches)}
const syncSystemReduced=event=>{systemReduced.value=Boolean(event?.matches??reducedMedia?.matches)}
const removeDarkMedia=()=>{darkMedia?.removeEventListener?.('change',syncSystemDark);if(!darkMedia?.removeEventListener)darkMedia?.removeListener?.(syncSystemDark);darkMedia=null}
const removeReducedMedia=()=>{reducedMedia?.removeEventListener?.('change',syncSystemReduced);if(!reducedMedia?.removeEventListener)reducedMedia?.removeListener?.(syncSystemReduced);reducedMedia=null}
const reconcileMedia=()=>{
  if(!providerMounted)return
  if(typeof window==='undefined'||typeof window.matchMedia!=='function')return
  if(config.value.appearance==='system'&&!darkMedia){darkMedia=window.matchMedia('(prefers-color-scheme: dark)');syncSystemDark(darkMedia);darkMedia.addEventListener?.('change',syncSystemDark);if(!darkMedia.addEventListener)darkMedia.addListener?.(syncSystemDark)}
  else if(config.value.appearance!=='system'&&darkMedia)removeDarkMedia()
  if(config.value.motion==='system'&&!reducedMedia){reducedMedia=window.matchMedia('(prefers-reduced-motion: reduce)');syncSystemReduced(reducedMedia);reducedMedia.addEventListener?.('change',syncSystemReduced);if(!reducedMedia.addEventListener)reducedMedia.addListener?.(syncSystemReduced)}
  else if(config.value.motion!=='system'&&reducedMedia)removeReducedMedia()
}
watch(()=>[config.value.appearance,config.value.motion],reconcileMedia)
onMounted(()=>{providerMounted=true;reconcileMedia()})
onBeforeUnmount(()=>{
  providerMounted=false;removeDarkMedia();removeReducedMedia()
})
const resolvedAppearance=computed(()=>resolveThemeAppearance(config.value.appearance,systemDark.value))
const resolvedMotion=computed(()=>resolveMotionPreference(config.value.motion,systemReduced.value))
const themeStyle=computed(()=>themeToStyle(config.value.theme,{allowUnknown:true,invalid:'ignore'}))
const motionStyle=computed(()=>motionPreferenceToStyle(resolvedMotion.value))
const motionScope=computed(()=>({preference:config.value.motion,resolvedPreference:resolvedMotion.value}))
provide(lanUiMotionKey,motionScope)
const teleportScope=computed(()=>({
  appearance:config.value.appearance,
  resolvedAppearance:resolvedAppearance.value,
  themeName:config.value.themeName,
  locale:config.value.locale.name,
  size:config.value.size,
  density:config.value.density,
  direction:config.value.direction,
  motion:config.value.motion,
  resolvedMotion:resolvedMotion.value,
  style:{'--ui-overlay-base':config.value.zIndex,colorScheme:resolvedAppearance.value,...themeStyle.value,...motionStyle.value},
}))
provide(lanUiTeleportScopeKey,teleportScope)
</script>
<template><component :is="tag" class="ui-config-provider" :dir="config.direction" :data-theme="resolvedAppearance" :data-ui-appearance="config.appearance" :data-ui-resolved-appearance="resolvedAppearance" :data-ui-theme="config.themeName" :data-ui-locale="config.locale.name" :data-ui-fallback-locale="config.fallbackLocale?.name||'none'" :data-ui-fallback-locales="config.fallbackLocales.map(item=>item.name).join(',')||'none'" :data-ui-size="config.size" :data-ui-density="config.density" :data-ui-direction="config.direction" :data-ui-motion-preference="config.motion" :data-ui-motion="resolvedMotion" :style="{'--ui-overlay-base':config.zIndex,colorScheme:resolvedAppearance,...themeStyle,...motionStyle}"><slot/></component></template>

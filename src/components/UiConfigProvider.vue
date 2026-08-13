<script setup>
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, unref } from 'vue'
import { lanUiConfigKey, normalizeLanUiConfig } from '../config.js'
import { defaultIconRegistry, iconRegistryKey } from '../icons.js'
import { resolveThemeAppearance, themeToStyle } from '../theme.js'
const props=defineProps({locale:{type:[String,Object],default:''},fallbackLocale:{type:[String,Object,Array,Boolean],default:undefined},fallbackLocales:{type:Array,default:undefined},localeRegistry:{type:Object,default:undefined},iconRegistry:{type:Object,default:undefined},size:{type:String,default:''},density:{type:String,default:''},direction:{type:String,default:''},zIndex:{type:Number,default:0},appearance:{type:String,default:''},theme:{type:Object,default:()=>({})},tag:{type:String,default:'div'}})
const parent=inject(lanUiConfigKey,null)
const config=computed(()=>normalizeLanUiConfig(props,unref(parent)||undefined))
provide(lanUiConfigKey,config)
const parentIconRegistry=inject(iconRegistryKey,defaultIconRegistry)
provide(iconRegistryKey,props.iconRegistry||parentIconRegistry)
const systemDark=ref(false)
let media=null
const syncSystem=event=>{systemDark.value=Boolean(event?.matches??media?.matches)}
onMounted(()=>{
  if(typeof window==='undefined'||typeof window.matchMedia!=='function')return
  media=window.matchMedia('(prefers-color-scheme: dark)')
  syncSystem(media)
  media.addEventListener?.('change',syncSystem)
  if(!media.addEventListener)media.addListener?.(syncSystem)
})
onBeforeUnmount(()=>{
  media?.removeEventListener?.('change',syncSystem)
  if(!media?.removeEventListener)media?.removeListener?.(syncSystem)
  media=null
})
const resolvedAppearance=computed(()=>resolveThemeAppearance(config.value.appearance,systemDark.value))
const themeStyle=computed(()=>themeToStyle(config.value.theme,{allowUnknown:true,invalid:'ignore'}))
</script>
<template><component :is="tag" class="ui-config-provider" :dir="config.direction" :data-theme="resolvedAppearance" :data-ui-appearance="config.appearance" :data-ui-resolved-appearance="resolvedAppearance" :data-ui-theme="config.themeName" :data-ui-locale="config.locale.name" :data-ui-fallback-locale="config.fallbackLocale?.name||'none'" :data-ui-fallback-locales="config.fallbackLocales.map(item=>item.name).join(',')||'none'" :data-ui-size="config.size" :data-ui-density="config.density" :data-ui-direction="config.direction" :style="{'--ui-overlay-base':config.zIndex,colorScheme:resolvedAppearance,...themeStyle}"><slot/></component></template>

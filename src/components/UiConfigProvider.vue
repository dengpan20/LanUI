<script setup>
import { computed, inject, provide, unref } from 'vue'
import { lanUiConfigKey, normalizeLanUiConfig } from '../config.js'
import { defaultIconRegistry, iconRegistryKey } from '../icons.js'
const props=defineProps({locale:{type:[String,Object],default:''},fallbackLocale:{type:[String,Object,Array,Boolean],default:undefined},fallbackLocales:{type:Array,default:undefined},localeRegistry:{type:Object,default:undefined},iconRegistry:{type:Object,default:undefined},size:{type:String,default:''},density:{type:String,default:''},direction:{type:String,default:''},zIndex:{type:Number,default:0},theme:{type:Object,default:()=>({})},tag:{type:String,default:'div'}})
const parent=inject(lanUiConfigKey,null)
const config=computed(()=>normalizeLanUiConfig(props,unref(parent)||undefined))
provide(lanUiConfigKey,config)
const parentIconRegistry=inject(iconRegistryKey,defaultIconRegistry)
provide(iconRegistryKey,props.iconRegistry||parentIconRegistry)
const themeStyle=computed(()=>Object.fromEntries(Object.entries(config.value.theme).map(([key,value])=>[key.startsWith('--')?key:`--${key.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`,value])))
</script>
<template><component :is="tag" class="ui-config-provider" :dir="config.direction" :data-ui-locale="config.locale.name" :data-ui-fallback-locale="config.fallbackLocale?.name||'none'" :data-ui-fallback-locales="config.fallbackLocales.map(item=>item.name).join(',')||'none'" :data-ui-size="config.size" :data-ui-density="config.density" :data-ui-direction="config.direction" :style="{'--ui-overlay-base':config.zIndex,...themeStyle}"><slot/></component></template>

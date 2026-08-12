<script setup>
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'
defineProps({items:{type:Array,default:()=>[]},separator:{type:String,default:'chevronRight'}})
defineEmits(['navigate'])
const label=item=>typeof item==='object'?item.label:item
const {t}=useLocale()
</script>
<template><nav class="ui-breadcrumb" :aria-label="t('breadcrumb.label')"><ol><li v-for="(item,index) in items" :key="`${label(item)}-${index}`"><a v-if="item.href&&index<items.length-1" :href="item.href" @click="$emit('navigate',item)">{{ label(item) }}</a><button v-else-if="item.onClick&&index<items.length-1" type="button" @click="$emit('navigate',item)">{{ label(item) }}</button><span v-else :aria-current="index===items.length-1?'page':undefined">{{ label(item) }}</span><AppIcon v-if="index<items.length-1" class="ui-directional-icon" :name="separator" :size="11" aria-hidden="true"/></li></ol></nav></template>

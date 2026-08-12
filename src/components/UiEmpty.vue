<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'
const props=defineProps({title:{type:String,default:''},description:{type:String,default:''},icon:{type:String,default:'search'},compact:Boolean})
const {t}=useLocale();const resolvedTitle=computed(()=>props.title||t('empty.title'));const resolvedDescription=computed(()=>props.description||t('empty.description'))
</script>
<template><div class="ui-empty" :class="{compact}" role="status"><span class="ui-empty-icon"><AppIcon :name="icon" :size="compact?22:30"/></span><strong>{{ resolvedTitle }}</strong><p>{{ resolvedDescription }}</p><div v-if="$slots.default" class="ui-empty-action"><slot/></div></div></template>

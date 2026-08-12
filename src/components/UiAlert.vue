<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'
const props=defineProps({type:{type:String,default:'info'},title:{type:String,default:''},description:{type:String,default:''},closable:Boolean,showIcon:{type:Boolean,default:true},banner:Boolean})
const emit=defineEmits(['close']);const visible=ref(true)
const {t}=useLocale()
const icon=()=>props.type==='success'?'check':props.type==='warning'?'alert':props.type==='error'?'close':'info'
function close(){visible.value=false;emit('close')}
</script>
<template><Transition name="notification"><section v-if="visible" class="ui-alert" :class="[`type-${type}`,{banner}]" :role="type==='error'?'alert':'status'"><span v-if="showIcon" class="ui-alert-icon"><AppIcon :name="icon()" :size="17"/></span><div class="ui-alert-copy"><strong v-if="title">{{ title }}</strong><p v-if="description">{{ description }}</p><slot/></div><button v-if="closable" type="button" class="icon-btn ui-alert-close" :aria-label="t('alert.close')" @click="close"><AppIcon name="close" :size="13"/></button></section></Transition></template>

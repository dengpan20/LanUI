<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFeedback } from '../feedback.js'
import { useDirection, useLocale } from '../config-runtime.js'
const props=defineProps({notification:{type:Object,default:null},actionText:{type:String,default:''},secondaryText:{type:String,default:''},feedback:{type:Object,default:null}})
defineEmits(['close','action'])
const injectedFeedback=useFeedback()
const activeFeedback=computed(()=>props.feedback??injectedFeedback)
const source=computed(()=>props.notification??activeFeedback.value.notificationState.current)
const primaryText=computed(()=>props.actionText||source.value?.actionText||'')
const {t}=useLocale();const secondary=computed(()=>source.value?.secondaryText||props.secondaryText||t('notification.later'))
const direction=useDirection()
function close(){if(props.notification===null)activeFeedback.value.notification.close()}
function action(){if(props.notification===null)activeFeedback.value.notification.action()}
</script>
<template><Teleport to="body"><Transition name="notification"><section v-if="source" class="notification-float" :class="source.type" :dir="direction" role="alert"><span class="notification-mark"><AppIcon :name="source.type==='error'?'alert':source.type==='success'?'check':'info'" :size="20"/></span><div class="notification-content"><strong>{{ source.title }}</strong><p>{{ source.message }}</p><div class="notification-actions"><button v-if="primaryText" class="btn btn-primary btn-sm" @click="action();$emit('action')">{{ primaryText }}</button><button class="btn btn-text btn-sm" @click="close();$emit('close')">{{ secondary }}</button></div></div><button class="icon-btn notification-close" :aria-label="t('notification.close')" @click="close();$emit('close')"><AppIcon name="close" :size="14"/></button></section></Transition></Teleport></template>

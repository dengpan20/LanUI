<script setup>
import AppIcon from '../components/AppIcon.vue'
import UiButton from '../components/UiButton.vue'
defineProps({ embedded:Boolean })
defineEmits(['home','back'])
</script>
<template><div :class="embedded?'page-container':'standalone-page'" :style="embedded?'min-height:calc(100vh - 94px);display:grid;place-items:center':''"><section class="card status-panel"><div class="status-code">404</div><h1>页面走丢了</h1><p>你访问的页面可能已被移动、删除，或者链接地址有误。</p><div class="status-actions"><UiButton variant="outline" icon="arrowDown" @click="$emit('back')">返回上一页</UiButton><UiButton icon="home" @click="$emit('home')">返回首页</UiButton></div></section></div></template>

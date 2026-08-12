<script setup>
import AppIcon from '../components/AppIcon.vue'
import UiButton from '../components/UiButton.vue'
defineEmits(['confirm','cancel'])
</script>
<template><div class="standalone-page"><section class="card status-panel"><div class="status-illustration"><AppIcon name="logout"/></div><h1>确认退出登录？</h1><p>退出后将返回登录页面。本地演示数据会保留，下次登录可继续查看。</p><div class="status-actions"><UiButton variant="outline" @click="$emit('cancel')">取消，返回系统</UiButton><UiButton variant="danger" @click="$emit('confirm')">确认退出</UiButton></div></section></div></template>


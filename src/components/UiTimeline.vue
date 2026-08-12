<script setup>
defineProps({items:{type:Array,default:()=>[]}})
</script>
<template><ol class="ui-timeline"><li v-for="(item,index) in items" :key="item.key||index" :class="`status-${item.status||'default'}`"><span class="ui-timeline-dot"/><div><strong>{{ item.title }}</strong><p v-if="item.description">{{ item.description }}</p><time v-if="item.time">{{ item.time }}</time></div></li></ol></template>

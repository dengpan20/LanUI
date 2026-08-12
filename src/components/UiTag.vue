<script setup>
defineProps({ color: { type: String, default: 'blue' }, dot: Boolean })
</script>
<template><span class="tag" :class="`tag-${color}`"><span v-if="dot" class="status-dot"/><slot /></span></template>


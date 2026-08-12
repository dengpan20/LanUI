<script setup>
import UiStatusPage from '../components/UiStatusPage.vue'

defineProps({ embedded: Boolean })
const emit = defineEmits(['home', 'retry'])
</script>

<template>
  <UiStatusPage
    status="500"
    :embedded="embedded"
    @home="emit('home')"
    @retry="emit('retry')"
  />
</template>

<script setup>
import UiStatusPage from '../components/UiStatusPage.vue'

defineProps({ embedded: Boolean })
const emit = defineEmits(['home', 'back'])
</script>

<template>
  <UiStatusPage
    status="403"
    :embedded="embedded"
    @home="emit('home')"
    @back="emit('back')"
  />
</template>

<script setup>
import { toRef } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize } from '../config.js'
const props=defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: '' },
  icon: String,
  loading: Boolean,
  disabled: Boolean,
  type: { type: String, default: 'button' }
})
const resolvedSize=useComponentSize(toRef(props,'size'))
</script>

<template>
  <button :type="type" class="btn" :class="[`btn-${variant}`, resolvedSize !== 'md' && `btn-${resolvedSize}`, loading && 'btn-loading']" :disabled="disabled || loading">
    <span v-if="loading" class="spinner" />
    <AppIcon v-else-if="icon" :name="icon" :size="15" />
    <slot />
  </button>
</template>

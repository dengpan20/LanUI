<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'plus' },
  label: { type: String, default: '' },
  variant: { type: String, default: 'default' },
  badge: { type: [String, Number], default: '' },
  active: Boolean,
  disabled: Boolean,
})
</script>

<template>
  <button type="button" class="ui-float-button" :class="[`is-${variant}`,{active}]" :aria-label="label || icon" :disabled="disabled">
    <AppIcon :name="icon" :size="18"/>
    <span v-if="label" class="ui-float-tooltip">{{ label }}</span>
    <span v-if="badge!==''" class="ui-float-badge">{{ badge }}</span>
  </button>
</template>

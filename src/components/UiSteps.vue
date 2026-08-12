<script setup>
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'

defineProps({
  items: { type: Array, default: () => [] },
  current: { type: Number, default: 0 },
  direction: { type: String, default: 'horizontal' },
  ariaLabel: { type: String, default: '' },
})
const {t}=useLocale()
</script>

<template>
  <ol class="ui-steps" :class="`direction-${direction}`" :aria-label="ariaLabel||t('steps.label')">
    <li
      v-for="(item, index) in items"
      :key="item.title || index"
      :class="{
        done: item.status === 'finish' || (!item.status && index < current),
        active: item.status === 'process' || (!item.status && index === current),
        error: item.status === 'error',
      }"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span class="ui-step-mark" aria-hidden="true">
        <AppIcon v-if="item.status === 'finish' || (!item.status && index < current)" name="check" :size="13" />
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="ui-step-copy">
        <strong>{{ item.title }}</strong>
        <small v-if="item.description">{{ item.description }}</small>
      </span>
    </li>
  </ol>
</template>

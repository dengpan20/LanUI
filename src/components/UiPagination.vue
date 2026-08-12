<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import UiSelect from './UiSelect.vue'
import { useLocale } from '../config.js'

const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
  showSizeChanger: { type: Boolean, default: true },
  compact: Boolean,
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:page', 'update:pageSize', 'change'])
const {t,formatNumber}=useLocale()
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const start = computed(() => props.total ? (props.page - 1) * props.pageSize + 1 : 0)
const end = computed(() => Math.min(props.total, props.page * props.pageSize))
const totalText = computed(() => t('pagination.total',{start:formatNumber(start.value),end:formatNumber(end.value),total:formatNumber(props.total)}))
const pageSizeChoices = computed(() => props.pageSizeOptions.map(value=>({value,label:formatNumber(value)})))
const pages = computed(() => {
  const total = pageCount.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const result = [1]
  const from = Math.max(2, props.page - 1)
  const to = Math.min(total - 1, props.page + 1)
  if (from > 2) result.push('left-gap')
  for (let i = from; i <= to; i += 1) result.push(i)
  if (to < total - 1) result.push('right-gap')
  result.push(total)
  return result
})

function go(next) {
  const value = Math.min(pageCount.value, Math.max(1, Number(next)))
  emit('update:page', value)
  emit('change', { page: value, pageSize: props.pageSize })
}
function resize(next) {
  const value = Number(next)
  emit('update:pageSize', value)
  emit('update:page', 1)
  emit('change', { page: 1, pageSize: value })
}
</script>

<template>
  <nav class="ui-pagination" :class="{compact}" :aria-label="ariaLabel||t('pagination.label')">
    <span class="ui-pagination-total">{{ totalText }}</span>
    <div class="ui-pagination-controls">
      <UiSelect v-if="showSizeChanger" class="ui-pagination-size" size="sm" :aria-label="t('pagination.size')" :model-value="pageSize" :options="pageSizeChoices" @update:model-value="resize"/>
      <button class="page-number page-direction" :disabled="page<=1" :aria-label="t('pagination.previous')" @click="go(page-1)"><AppIcon class="page-direction-icon previous" name="chevronRight" :size="13"/></button>
      <template v-for="item in pages" :key="item">
        <span v-if="typeof item==='string'" class="page-ellipsis" aria-hidden="true">•••</span>
        <button v-else class="page-number" :class="{active:page===item}" :aria-current="page===item?'page':undefined" @click="go(item)">{{ formatNumber(item,{useGrouping:false}) }}</button>
      </template>
      <button class="page-number page-direction" :disabled="page>=pageCount" :aria-label="t('pagination.next')" @click="go(page+1)"><AppIcon class="page-direction-icon next" name="chevronRight" :size="13"/></button>
    </div>
  </nav>
</template>

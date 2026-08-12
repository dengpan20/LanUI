<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import UiSelect from './UiSelect.vue'
import { useLocale } from '../config.js'

const props = defineProps({
  total: { type: Number, default: 0 },
  selectedCount: { type: Number, default: 0 },
  density: { type: String, default: 'default' },
  columns: { type: Array, default: () => [] },
  visibleColumns: { type: Array, default: () => [] },
  loading: Boolean,
})
const emit = defineEmits(['update:density','update:visibleColumns','refresh'])
const root = ref(null)
const columnsOpen = ref(false)
const {t,formatNumber}=useLocale()
const densityOptions = computed(()=>[
  { label: t('list.density.compact'), value: 'compact' },
  { label: t('list.density.default'), value: 'default' },
  { label: t('list.density.comfortable'), value: 'comfortable' },
])
const configurableColumns = computed(() => props.columns.filter(column => column.configurable !== false))

function toggleColumn(key) {
  const exists = props.visibleColumns.includes(key)
  if (exists && props.visibleColumns.length <= 1) return
  emit('update:visibleColumns', exists ? props.visibleColumns.filter(value => value !== key) : [...props.visibleColumns, key])
}
function closeOutside(event) { if (root.value && !root.value.contains(event.target)) columnsOpen.value = false }
onMounted(() => document.addEventListener('pointerdown', closeOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside))
</script>

<template>
  <div ref="root" class="ui-list-toolbar">
    <div class="ui-list-toolbar-primary"><slot name="primary"/><span v-if="selectedCount" class="selection-info">{{ t('list.selected',{count:formatNumber(selectedCount)}) }}</span></div>
    <div class="ui-list-toolbar-secondary">
      <slot/>
      <span class="ui-list-total">{{ t('list.total',{total:formatNumber(total)}) }}</span>
      <UiSelect class="ui-list-density" size="sm" :aria-label="t('list.density')" :model-value="density" :options="densityOptions" @update:model-value="emit('update:density',$event)"/>
      <div class="ui-column-control">
        <button type="button" class="icon-btn outline" :title="t('list.columns')" :aria-label="t('list.columns')" aria-haspopup="menu" :aria-expanded="columnsOpen" @click="columnsOpen=!columnsOpen"><AppIcon name="settings" :size="15"/></button>
        <Transition name="select-menu"><div v-if="columnsOpen" class="ui-column-menu" role="menu"><strong>{{ t('list.columns') }}</strong><label v-for="column in configurableColumns" :key="column.key" class="ui-column-option"><input type="checkbox" :checked="visibleColumns.includes(column.key)" :disabled="visibleColumns.includes(column.key)&&visibleColumns.length<=1" @change="toggleColumn(column.key)"/><span>{{ column.label }}</span></label></div></Transition>
      </div>
      <button type="button" class="icon-btn outline" :title="t('list.refresh')" :aria-label="t('list.refresh')" :disabled="loading" @click="emit('refresh')"><AppIcon name="refresh" :size="15" :class="{'spin-once':loading}"/></button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiPagination from './UiPagination.vue'
import { useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  items: { type: Array, default: () => [] },
  itemKey: { type: [String, Function], default: 'id' },
  textField: { type: [String, Function], default: 'label' },
  titleField: { type: [String, Function], default: 'title' },
  descriptionField: { type: [String, Function], default: 'description' },
  avatarField: { type: [String, Function], default: 'avatar' },
  disabledField: { type: [String, Function], default: 'disabled' },
  disabledKeys: { type: Array, default: () => [] },
  modelValue: { type: [String, Number, Array], default: undefined },
  selectionMode: { type: String, default: 'none' },
  activeIndex: { type: Number, default: undefined },
  defaultActiveIndex: { type: Number, default: 0 },
  deselectable: Boolean,
  loop: Boolean,
  size: { type: String, default: 'md' },
  itemLayout: { type: String, default: 'horizontal' },
  bordered: Boolean,
  split: { type: Boolean, default: true },
  hoverable: Boolean,
  striped: Boolean,
  grid: { type: [Number, Object], default: 0 },
  loading: Boolean,
  loadingCount: { type: Number, default: 4 },
  error: { type: [String, Boolean], default: '' },
  emptyText: { type: String, default: '' },
  loadingText: { type: String, default: '' },
  errorText: { type: String, default: '' },
  pagination: { type: [Boolean, Object], default: false },
  page: { type: Number, default: undefined },
  defaultPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: undefined },
  defaultPageSize: { type: Number, default: 10 },
  total: { type: Number, default: undefined },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
  showSizeChanger: { type: Boolean, default: true },
  server: Boolean,
  ariaLabel: { type: String, default: '' },
  tabindex: { type: Number, default: 0 },
})

const emit = defineEmits([
  'update:modelValue', 'change', 'update:activeIndex', 'active-change', 'item-click', 'retry',
  'update:page', 'update:pageSize', 'page-change', 'page-size-change',
])

const { t, tc } = useLocale()
const direction = useDirection()
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const root = ref(null)
const body = ref(null)
const containerWidth = ref(0)
const internalActive = ref(Number.isFinite(props.defaultActiveIndex) ? Math.floor(props.defaultActiveIndex) : 0)
const internalPage = ref(Math.max(1, Math.floor(props.defaultPage) || 1))
const internalPageSize = ref(Math.max(1, Math.floor(props.defaultPageSize) || 10))
const disabledSet = computed(() => new Set(props.disabledKeys))
const selectionMode = computed(() => ['single', 'multiple'].includes(props.selectionMode) ? props.selectionMode : 'none')
const selectedSet = computed(() => new Set(selectionMode.value === 'multiple'
  ? (Array.isArray(props.modelValue) ? props.modelValue : [])
  : props.modelValue === undefined || props.modelValue === null ? [] : [props.modelValue]))
const paginationOptions = computed(() => props.pagination && typeof props.pagination === 'object' ? props.pagination : {})
const paginationEnabled = computed(() => Boolean(props.pagination))
const resolvedPageSize = computed(() => Math.max(1, Math.floor(props.pageSize ?? paginationOptions.value.pageSize ?? internalPageSize.value) || 1))
const resolvedTotal = computed(() => Math.max(0, Number(props.total ?? paginationOptions.value.total ?? props.items.length) || 0))
const pageCount = computed(() => Math.max(1, Math.ceil(resolvedTotal.value / resolvedPageSize.value)))
const requestedPage = computed(() => Math.max(1, Math.floor(props.page ?? paginationOptions.value.page ?? internalPage.value) || 1))
const resolvedPage = computed(() => Math.min(pageCount.value, requestedPage.value))
const resolvedShowSizeChanger = computed(() => paginationOptions.value.showSizeChanger ?? props.showSizeChanger)
const resolvedCompactPagination = computed(() => Boolean(paginationOptions.value.compact))
const paginationPosition = computed(() => ['start', 'center', 'end'].includes(paginationOptions.value.position) ? paginationOptions.value.position : 'end')
const resolvedEmptyText = computed(() => props.emptyText || t('dataList.empty'))
const resolvedLoadingText = computed(() => props.loadingText || t('dataList.loading'))
const resolvedErrorText = computed(() => typeof props.error === 'string' && props.error ? props.error : props.errorText || t('dataList.error'))

function fieldValue(item, index, field, fallback = '') {
  const value = typeof field === 'function' ? field(item, index) : item && typeof item === 'object' ? item[field] : fallback
  return value === undefined || value === null ? fallback : value
}
function rawKey(item, index) {
  const value = fieldValue(item, index, props.itemKey, index)
  return typeof value === 'string' || typeof value === 'number' ? value : index
}
function itemText(item, index) {
  const title = fieldValue(item, index, props.titleField, '')
  const text = title || fieldValue(item, index, props.textField, typeof item === 'string' || typeof item === 'number' ? item : '')
  return text === undefined || text === null ? '' : String(text)
}
function itemTitle(item, index) { return fieldValue(item, index, props.titleField, '') || itemText(item, index) }
function itemDescription(item, index) { return fieldValue(item, index, props.descriptionField, '') }
function itemAvatar(item, index) { return fieldValue(item, index, props.avatarField, '') }

const allRecords = computed(() => props.items.map((item, index) => ({ item, sourceIndex: index, key: rawKey(item, index), domKey: `${typeof rawKey(item, index)}-${String(rawKey(item, index))}-${index}` })))
const pageOffset = computed(() => paginationEnabled.value && !props.server ? (resolvedPage.value - 1) * resolvedPageSize.value : 0)
const records = computed(() => {
  if (!paginationEnabled.value || props.server) return allRecords.value.map((record, index) => ({ ...record, index }))
  return allRecords.value.slice(pageOffset.value, pageOffset.value + resolvedPageSize.value).map((record, index) => ({ ...record, index }))
})
const resolvedActive = computed(() => Number.isFinite(props.activeIndex) ? Math.floor(props.activeIndex) : internalActive.value)

function isDisabled(record) {
  return disabledSet.value.has(record.key) || Boolean(fieldValue(record.item, record.sourceIndex, props.disabledField, false))
}
function isSelected(record) { return selectedSet.value.has(record.key) }
function itemId(record) { return `ui-list-${uid}-${record.index}` }
const activeDescendant = computed(() => selectionMode.value !== 'none' && records.value[resolvedActive.value] && !isDisabled(records.value[resolvedActive.value]) ? itemId(records.value[resolvedActive.value]) : undefined)

const normalizedGrid = computed(() => {
  if (!props.grid) return null
  if (typeof props.grid === 'number') return { columns: Math.max(1, Math.floor(props.grid)) }
  const value = props.grid || {}
  return {
    columns: Math.max(1, Math.floor(value.columns || value.xs || 1)),
    sm: value.sm ? Math.max(1, Math.floor(value.sm)) : undefined,
    md: value.md ? Math.max(1, Math.floor(value.md)) : undefined,
    lg: value.lg ? Math.max(1, Math.floor(value.lg)) : undefined,
    gap: value.gap,
  }
})
const listStyle = computed(() => {
  const grid = normalizedGrid.value
  if (!grid) return undefined
  const style = { '--ui-list-columns': grid.columns }
  if (grid.sm) style['--ui-list-columns-sm'] = grid.sm
  if (grid.md) style['--ui-list-columns-md'] = grid.md
  if (grid.lg) style['--ui-list-columns-lg'] = grid.lg
  if (grid.gap !== undefined) style['--ui-list-grid-gap'] = typeof grid.gap === 'number' ? `${grid.gap}px` : grid.gap
  return style
})
const columnStep = computed(() => {
  const grid = normalizedGrid.value
  if (!grid) return 1
  if (containerWidth.value >= 1024) return grid.lg || grid.md || grid.sm || grid.columns
  if (containerWidth.value >= 768) return grid.md || grid.sm || grid.columns
  if (containerWidth.value >= 480) return grid.sm || grid.columns
  return grid.columns
})

function findEnabled(start, step, allowLoop = props.loop) {
  const length = records.value.length
  if (!length) return -1
  let index = start
  for (let visited = 0; visited < length; visited += 1) {
    if (index < 0 || index >= length) {
      if (!allowLoop) return -1
      index = (index + length) % length
    }
    if (!isDisabled(records.value[index])) return index
    index += step
  }
  return -1
}
function setActiveIndex(index, source = 'api') {
  if (!records.value.length) return -1
  const requested = Math.max(0, Math.min(records.value.length - 1, Math.floor(Number(index) || 0)))
  const step = requested < resolvedActive.value ? -1 : 1
  let target = findEnabled(requested, step, false)
  if (target < 0) target = findEnabled(requested, -step, false)
  if (target < 0) return -1
  const previous = resolvedActive.value
  if (!Number.isFinite(props.activeIndex)) internalActive.value = target
  if (target !== previous || Number.isFinite(props.activeIndex)) {
    emit('update:activeIndex', target)
    emit('active-change', { index: target, sourceIndex: records.value[target].sourceIndex, key: records.value[target].key, item: records.value[target].item, source })
  }
  nextTick(() => { if (typeof document !== 'undefined') document.getElementById(itemId(records.value[target]))?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }) })
  return target
}
function selectionFor(record) {
  let value
  let selected
  if (selectionMode.value === 'multiple') {
    const values = new Set(selectedSet.value)
    selected = values.has(record.key) ? (values.delete(record.key), false) : (values.add(record.key), true)
    value = allRecords.value.filter(item => values.has(item.key)).map(item => item.key)
  } else {
    const same = selectedSet.value.has(record.key)
    selected = !(same && props.deselectable)
    value = selected ? record.key : undefined
  }
  return { value, selected }
}
function selectRecord(record, source = 'api') {
  if (selectionMode.value === 'none' || !record || isDisabled(record)) return false
  const { value, selected } = selectionFor(record)
  emit('update:modelValue', value)
  emit('change', value, { key: record.key, index: record.index, sourceIndex: record.sourceIndex, item: record.item, selected, source })
  return true
}
function selectKey(key, source = 'api') { return selectRecord(records.value.find(record => record.key === key), source) }
function clearSelection(source = 'api') {
  if (selectionMode.value === 'none') return false
  const value = selectionMode.value === 'multiple' ? [] : undefined
  emit('update:modelValue', value)
  emit('change', value, { selected: false, source })
  return true
}
function isInteractiveTarget(target) { return Boolean(target?.closest?.('button,a,input,select,textarea,[contenteditable="true"],[data-ui-list-action]')) }
function activateRecord(record, event) {
  if (isDisabled(record) || event.defaultPrevented || isInteractiveTarget(event.target)) return
  setActiveIndex(record.index, 'pointer')
  selectRecord(record, 'pointer')
  emit('item-click', record.item, record.sourceIndex, event)
}
function moveActive(step, source = 'keyboard') {
  const current = resolvedActive.value >= 0 ? resolvedActive.value : step > 0 ? -1 : records.value.length
  let target = findEnabled(current + step, step)
  if (target < 0 && props.loop) target = findEnabled(step > 0 ? 0 : records.value.length - 1, step, false)
  if (target >= 0) setActiveIndex(target, source)
}

let typeahead = ''
let typeaheadTimer = null
function typeaheadSearch(character) {
  clearTimeout(typeaheadTimer)
  typeahead += character.toLocaleLowerCase()
  typeaheadTimer = setTimeout(() => { typeahead = '' }, 500)
  for (let offset = 1; offset <= records.value.length; offset += 1) {
    const index = (Math.max(-1, resolvedActive.value) + offset) % records.value.length
    const record = records.value[index]
    if (!isDisabled(record) && itemText(record.item, record.sourceIndex).trim().toLocaleLowerCase().startsWith(typeahead)) {
      setActiveIndex(index, 'typeahead')
      break
    }
  }
}
function onKeydown(event) {
  if (selectionMode.value === 'none' || props.loading || props.error || !records.value.length) return
  const rtl = direction.value === 'rtl'
  if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(columnStep.value) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-columnStep.value) }
  else if (event.key === 'ArrowRight') { event.preventDefault(); moveActive(rtl ? -1 : 1) }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); moveActive(rtl ? 1 : -1) }
  else if (event.key === 'Home') { event.preventDefault(); const target = findEnabled(0, 1, false); if (target >= 0) setActiveIndex(target) }
  else if (event.key === 'End') { event.preventDefault(); const target = findEnabled(records.value.length - 1, -1, false); if (target >= 0) setActiveIndex(target) }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRecord(records.value[resolvedActive.value], 'keyboard') }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode.value === 'multiple') {
    event.preventDefault()
    const value = allRecords.value.filter(record => !isDisabled(record)).map(record => record.key)
    emit('update:modelValue', value)
    emit('change', value, { selected: true, source: 'keyboard' })
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeaheadSearch(event.key)
}
function onFocus() {
  if (selectionMode.value !== 'none' && (!records.value[resolvedActive.value] || isDisabled(records.value[resolvedActive.value]))) {
    const target = findEnabled(0, 1, false)
    if (target >= 0) setActiveIndex(target, 'focus')
  }
}

function updatePage(value, source = 'pagination') {
  const next = Math.min(pageCount.value, Math.max(1, Math.floor(Number(value) || 1)))
  if (props.page === undefined && paginationOptions.value.page === undefined) internalPage.value = next
  internalActive.value = 0
  emit('update:page', next)
  emit('page-change', { page: next, pageSize: resolvedPageSize.value, source })
}
function updatePageSize(value) {
  const next = Math.max(1, Math.floor(Number(value) || 1))
  if (props.pageSize === undefined && paginationOptions.value.pageSize === undefined) internalPageSize.value = next
  if (props.page === undefined && paginationOptions.value.page === undefined) internalPage.value = 1
  internalActive.value = 0
  emit('update:pageSize', next)
  emit('update:page', 1)
  emit('page-size-change', { page: 1, pageSize: next, source: 'pagination' })
  emit('page-change', { page: 1, pageSize: next, source: 'page-size' })
}
function focus() { root.value?.focus?.() }
function scrollToKey(key, options = {}) {
  const record = records.value.find(item => item.key === key)
  if (!record) return false
  if (typeof document !== 'undefined') document.getElementById(itemId(record))?.scrollIntoView?.({ block: options.block || 'nearest', inline: options.inline || 'nearest', behavior: options.behavior || 'auto' })
  return true
}

let resizeObserver = null
function measureContainer() { containerWidth.value = body.value?.clientWidth || body.value?.getBoundingClientRect?.().width || 0 }
watch(pageCount, count => { if (requestedPage.value > count) updatePage(count, 'items') })
watch(() => props.items, () => { if (resolvedActive.value >= records.value.length) internalActive.value = Math.max(0, records.value.length - 1) })
onMounted(() => {
  measureContainer()
  if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(measureContainer); if (body.value) resizeObserver.observe(body.value) }
})
onBeforeUnmount(() => { clearTimeout(typeaheadTimer); resizeObserver?.disconnect() })
defineExpose({ root, focus, setActiveIndex, selectKey, clearSelection, scrollToKey })
</script>

<template>
  <section v-bind="$attrs" class="ui-list" :class="[`size-${size}`,`layout-${itemLayout}`,{'is-bordered':bordered,'is-split':split,'is-hoverable':hoverable,'is-striped':striped,'is-selectable':selectionMode!=='none','has-grid':normalizedGrid}]" :aria-busy="loading?'true':undefined">
    <header v-if="$slots.header" class="ui-list-header"><slot name="header"/></header>
    <div ref="body" class="ui-list-body">
      <div v-if="loading" class="ui-list-state is-loading" role="status" aria-live="polite">
        <slot name="loading" :count="loadingCount">
          <span class="sr-only">{{ resolvedLoadingText }}</span>
          <ul class="ui-list-items ui-list-skeletons" aria-hidden="true">
            <li v-for="index in Math.max(1,loadingCount)" :key="index" class="ui-list-item"><span class="ui-list-skeleton-avatar"></span><span class="ui-list-skeleton-content"><span></span><span></span></span></li>
          </ul>
        </slot>
      </div>
      <div v-else-if="error" class="ui-list-state is-error" role="alert">
        <slot name="error" :error="error" :retry="()=>emit('retry')"><AppIcon name="alert" :size="24"/><strong>{{ t('dataList.errorTitle') }}</strong><span>{{ resolvedErrorText }}</span><button type="button" class="btn btn-outline btn-sm" @click="emit('retry')">{{ t('common.reload') }}</button></slot>
      </div>
      <div v-else-if="!records.length" class="ui-list-state is-empty">
        <slot name="empty"><AppIcon name="search" :size="24"/><span>{{ resolvedEmptyText }}</span></slot>
      </div>
      <ul v-else ref="root" class="ui-list-items" :style="listStyle" :role="selectionMode==='none'?'list':'listbox'" :tabindex="selectionMode==='none'?undefined:tabindex" :aria-label="ariaLabel||t('dataList.label')" :aria-multiselectable="selectionMode==='multiple'?'true':undefined" :aria-activedescendant="activeDescendant" @keydown="onKeydown" @focus="onFocus">
        <li v-for="record in records" :id="selectionMode==='none'?undefined:itemId(record)" :key="record.domKey" class="ui-list-item" :class="{'is-active':record.index===resolvedActive,'is-selected':isSelected(record),'is-disabled':isDisabled(record)}" :role="selectionMode==='none'?'listitem':'option'" :aria-selected="selectionMode==='none'?undefined:String(isSelected(record))" :aria-disabled="isDisabled(record)?'true':undefined" :aria-setsize="selectionMode==='none'?undefined:resolvedTotal" :aria-posinset="selectionMode==='none'?undefined:(server?(resolvedPage-1)*resolvedPageSize+record.index+1:record.sourceIndex+1)" @click="activateRecord(record,$event)">
          <span v-if="selectionMode!=='none'" class="ui-list-selection" aria-hidden="true"><AppIcon v-if="isSelected(record)" name="check" :size="14"/></span>
          <slot name="item" :item="record.item" :index="record.sourceIndex" :item-key="record.key" :active="record.index===resolvedActive" :selected="isSelected(record)" :disabled="isDisabled(record)">
            <slot :item="record.item" :index="record.sourceIndex" :item-key="record.key" :active="record.index===resolvedActive" :selected="isSelected(record)" :disabled="isDisabled(record)">
              <div v-if="itemAvatar(record.item,record.sourceIndex)||$slots.avatar" class="ui-list-avatar"><slot name="avatar" :item="record.item" :index="record.sourceIndex"><img :src="itemAvatar(record.item,record.sourceIndex)" alt=""/></slot></div>
              <div class="ui-list-content"><div class="ui-list-title"><slot name="title" :item="record.item" :index="record.sourceIndex">{{ itemTitle(record.item,record.sourceIndex) }}</slot></div><div v-if="itemDescription(record.item,record.sourceIndex)||$slots.description" class="ui-list-description"><slot name="description" :item="record.item" :index="record.sourceIndex">{{ itemDescription(record.item,record.sourceIndex) }}</slot></div></div>
              <div v-if="$slots.actions" class="ui-list-actions" data-ui-list-action><slot name="actions" :item="record.item" :index="record.sourceIndex"/></div>
              <div v-if="$slots.extra" class="ui-list-extra"><slot name="extra" :item="record.item" :index="record.sourceIndex"/></div>
            </slot>
          </slot>
        </li>
      </ul>
    </div>
    <div v-if="paginationEnabled&&!loading&&!error&&resolvedTotal" class="ui-list-pagination" :class="`position-${paginationPosition}`">
      <slot name="pagination" :page="resolvedPage" :page-size="resolvedPageSize" :total="resolvedTotal" :set-page="updatePage" :set-page-size="updatePageSize"><UiPagination :page="resolvedPage" :page-size="resolvedPageSize" :total="resolvedTotal" :page-size-options="pageSizeOptions" :show-size-changer="resolvedShowSizeChanger" :compact="resolvedCompactPagination" @update:page="updatePage" @update:page-size="updatePageSize"/></slot>
    </div>
    <footer v-if="$slots.footer" class="ui-list-footer"><slot name="footer"/></footer>
    <span v-if="selectionMode!=='none'" class="sr-only" aria-live="polite">{{ tc('dataList.selectedCount',selectedSet.size,{count:selectedSet.size}) }}</span>
  </section>
</template>

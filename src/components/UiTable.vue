<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import UiCheckbox from './UiCheckbox.vue'
import { useDirection, useLanUiConfig, useLocale } from '../config-runtime.js'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  selectedRows: { type: Array, default: () => [] },
  expandedRows: { type: Array, default: () => [] },
  selectable: Boolean,
  expandable: Boolean,
  loading: Boolean,
  error: { type: String, default: '' },
  sortKey: { type: String, default: '' },
  sortOrder: { type: String, default: '' },
  density: { type: String, default: '' },
  stickyHeader: Boolean,
  emptyTitle: { type: String, default: '' },
  emptyText: { type: String, default: '' },
  loadingRows: { type: Number, default: 5 },
  filters: { type: Object, default: () => ({}) },
  resizable: Boolean,
  maxHeight: { type: [String, Number], default: '' },
  virtual: Boolean,
  rowHeight: { type: Number, default: 44 },
  viewportHeight: { type: Number, default: 400 },
  overscan: { type: Number, default: 4 },
})
const emit = defineEmits(['update:selectedRows','update:expandedRows','update:sortKey','update:sortOrder','update:filters','sort-change','filter-change','column-resize','row-click','retry'])
const filterOpen=ref('');const widths=ref({});const scrollTop=ref(0);let resizeCleanup=null
const config=useLanUiConfig();const direction=useDirection();const {t}=useLocale();const resolvedDensity=computed(()=>props.density||config.value.density||'default');const resolvedEmptyTitle=computed(()=>props.emptyTitle||t('empty.title'));const resolvedEmptyText=computed(()=>props.emptyText||t('empty.description'))

const visibleColumns = computed(() => props.columns.filter(column => !column.hidden))
const columnCount = computed(() => visibleColumns.value.length + (props.selectable ? 1 : 0) + (props.expandable ? 1 : 0))
const rowIds = computed(() => props.rows.map(row => row[props.rowKey]))
const allSelected = computed(() => rowIds.value.length > 0 && rowIds.value.every(id => props.selectedRows.includes(id)))
const partlySelected = computed(() => !allSelected.value && rowIds.value.some(id => props.selectedRows.includes(id)))
const virtualRange=computed(()=>{if(!props.virtual)return{start:0,end:props.rows.length};const start=Math.max(0,Math.floor(scrollTop.value/props.rowHeight)-props.overscan);const count=Math.ceil(props.viewportHeight/props.rowHeight)+props.overscan*2;return{start,end:Math.min(props.rows.length,start+count)}})
const renderedRows=computed(()=>props.rows.slice(virtualRange.value.start,virtualRange.value.end).map((row,index)=>({row,rowIndex:virtualRange.value.start+index})))
const topSpace=computed(()=>props.virtual?virtualRange.value.start*props.rowHeight:0);const bottomSpace=computed(()=>props.virtual?(props.rows.length-virtualRange.value.end)*props.rowHeight:0)

function columnStyle(column) {
  return {
    width: widths.value[column.key] ? `${widths.value[column.key]}px` : column.width || undefined,
    minWidth: column.minWidth || undefined,
    maxWidth: column.maxWidth || undefined,
    textAlign: column.align || undefined,
    insetInlineStart: column.start ?? undefined,
    insetInlineEnd: column.end ?? undefined,
    left: column.left ?? undefined,
    right: column.right ?? undefined,
  }
}
function fixedClasses(column){return {'fixed-start':column.fixed==='start','fixed-end':column.fixed==='end','fixed-left':column.fixed==='left','fixed-right':column.fixed==='right'}}
function setFilter(column,value){const next={...props.filters};if(value===''||value===undefined)delete next[column.key];else next[column.key]=value;emit('update:filters',next);emit('filter-change',next);filterOpen.value=''}
function beginResize(event,column){event.preventDefault();event.stopPropagation();const startX=event.clientX;const startWidth=event.currentTarget.parentElement.getBoundingClientRect().width;const move=moveEvent=>{const delta=(moveEvent.clientX-startX)*(direction.value==='rtl'?-1:1);widths.value={...widths.value,[column.key]:Math.max(72,startWidth+delta)}};const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);emit('column-resize',{key:column.key,width:widths.value[column.key]});resizeCleanup=null};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);resizeCleanup=up}
onBeforeUnmount(()=>resizeCleanup?.())
function rowId(row) { return row[props.rowKey] }
function toggleAll() {
  const outside = props.selectedRows.filter(id => !rowIds.value.includes(id))
  emit('update:selectedRows', allSelected.value ? outside : [...new Set([...outside, ...rowIds.value])])
}
function toggleRow(row) {
  const id = rowId(row)
  emit('update:selectedRows', props.selectedRows.includes(id) ? props.selectedRows.filter(value => value !== id) : [...props.selectedRows, id])
}
function toggleExpanded(row) {
  const id = rowId(row)
  emit('update:expandedRows', props.expandedRows.includes(id) ? props.expandedRows.filter(value => value !== id) : [...props.expandedRows, id])
}
function sort(column) {
  if (!column.sortable) return
  const same = props.sortKey === column.key
  const nextOrder = same && props.sortOrder === 'asc' ? 'desc' : same && props.sortOrder === 'desc' ? '' : 'asc'
  const nextKey = nextOrder ? column.key : ''
  emit('update:sortKey', nextKey)
  emit('update:sortOrder', nextOrder)
  emit('sort-change', { key: nextKey, order: nextOrder })
}
</script>

<template>
  <div class="ui-table-wrap" :class="[`density-${resolvedDensity}`,{'has-sticky-header':stickyHeader,'is-virtual':virtual}]" :style="{maxHeight:maxHeight?(typeof maxHeight==='number'?`${maxHeight}px`:maxHeight):virtual?`${viewportHeight}px`:undefined}" @scroll="scrollTop=$event.currentTarget.scrollTop">
    <table class="ui-table">
      <caption class="sr-only"><slot name="caption">{{ t('table.caption') }}</slot></caption>
      <thead>
        <tr>
          <th v-if="expandable" class="ui-table-control-column" :aria-label="t('table.expandColumn')"/>
          <th v-if="selectable" class="ui-table-control-column ui-table-select-column">
            <UiCheckbox class="ui-table-checkbox" size="sm" :model-value="allSelected" :indeterminate="partlySelected" :aria-label="t('table.selectAll')" @click.stop @change="toggleAll"/>
          </th>
          <th v-for="column in visibleColumns" :key="column.key" :class="[{sortable:column.sortable,...fixedClasses(column)},column.headerClass]" :style="columnStyle(column)" :aria-sort="sortKey===column.key?(sortOrder==='asc'?'ascending':sortOrder==='desc'?'descending':'none'):undefined">
            <div class="ui-table-header-content"><button v-if="column.sortable" type="button" class="ui-table-sort" @click="sort(column)"><span>{{ column.label }}</span><span class="ui-table-sort-icon" :class="{active:sortKey===column.key}"><AppIcon :name="sortKey===column.key&&sortOrder==='desc'?'arrowDown':'arrowUp'" :size="12"/></span></button><span v-else>{{ column.label }}</span><span v-if="column.filterable" class="ui-table-filter-wrap"><button type="button" class="ui-table-filter" :class="{active:filters[column.key]!==undefined}" :aria-label="t('table.filter',{label:column.label})" :aria-expanded="filterOpen===column.key" @click.stop="filterOpen=filterOpen===column.key?'':column.key"><AppIcon name="filter" :size="12"/></button><span v-if="filterOpen===column.key" class="ui-table-filter-menu"><button type="button" :class="{active:filters[column.key]===undefined}" @click="setFilter(column,'')">{{ t('common.all') }}</button><button v-for="option in column.filterOptions||[]" :key="typeof option==='object'?option.value:option" type="button" :class="{active:filters[column.key]===(typeof option==='object'?option.value:option)}" @click="setFilter(column,typeof option==='object'?option.value:option)">{{ typeof option==='object'?option.label:option }}</button></span></span></div><span v-if="resizable&&column.resizable!==false" class="ui-table-resize" role="separator" aria-orientation="vertical" :aria-label="t('table.resize',{label:column.label})" @pointerdown="beginResize($event,column)"/>
          </th>
        </tr>
      </thead>
      <tbody v-if="loading" aria-busy="true">
        <tr v-for="index in loadingRows" :key="`loading-${index}`" class="ui-table-loading-row">
          <td v-if="expandable"><span class="skeleton ui-table-skeleton square"/></td>
          <td v-if="selectable"><span class="skeleton ui-table-skeleton check"/></td>
          <td v-for="column in visibleColumns" :key="column.key"><span class="skeleton ui-table-skeleton" :style="{width:`${48+(index*17+column.key.length*7)%42}%`}"/></td>
        </tr>
      </tbody>
      <tbody v-else-if="error" class="ui-table-state-body">
        <tr class="ui-table-state-row"><td class="ui-table-state-cell" :colspan="columnCount"><div class="ui-table-state is-error"><span class="empty-icon"><AppIcon name="alert" :size="24"/></span><strong>{{ t('table.errorTitle') }}</strong><p>{{ error }}</p><button type="button" class="btn btn-outline btn-sm" @click="emit('retry')"><AppIcon name="refresh" :size="13"/>{{ t('common.reload') }}</button></div></td></tr>
      </tbody>
      <tbody v-else-if="!rows.length" class="ui-table-state-body">
        <tr class="ui-table-state-row"><td class="ui-table-state-cell" :colspan="columnCount"><div class="ui-table-state"><span class="empty-icon"><AppIcon name="search" :size="24"/></span><strong>{{ resolvedEmptyTitle }}</strong><p>{{ resolvedEmptyText }}</p><slot name="empty-action"/></div></td></tr>
      </tbody>
      <tbody v-else>
        <tr v-if="topSpace" class="ui-table-virtual-space"><td :colspan="columnCount" :style="{height:`${topSpace}px`}"/></tr>
        <template v-for="entry in renderedRows" :key="rowId(entry.row)">
          <tr class="ui-table-row" :class="{selected:selectedRows.includes(rowId(entry.row)),expanded:expandedRows.includes(rowId(entry.row))}" @click="emit('row-click',entry.row)">
            <td v-if="expandable" class="ui-table-control-column"><button type="button" class="ui-table-expand" :class="{open:expandedRows.includes(rowId(entry.row))}" :aria-label="t(expandedRows.includes(rowId(entry.row))?'table.collapse':'table.expand',{id:rowId(entry.row)})" @click.stop="toggleExpanded(entry.row)"><AppIcon class="ui-directional-icon" name="chevronRight" :size="14"/></button></td>
            <td v-if="selectable" class="ui-table-control-column ui-table-select-column"><UiCheckbox class="ui-table-checkbox" size="sm" :model-value="selectedRows.includes(rowId(entry.row))" :aria-label="t('table.select',{id:rowId(entry.row)})" @click.stop @change="toggleRow(entry.row)"/></td>
            <td v-for="column in visibleColumns" :key="column.key" :class="[column.class,fixedClasses(column)]" :style="columnStyle(column)" :data-label="column.label"><slot :name="`cell-${column.key}`" :row="entry.row" :value="entry.row[column.key]" :column="column" :row-index="entry.rowIndex">{{ entry.row[column.key] }}</slot></td>
          </tr>
          <tr v-if="expandable && expandedRows.includes(rowId(entry.row))" class="ui-table-expanded-row"><td :colspan="columnCount"><slot name="expanded" :row="entry.row"><pre>{{ entry.row }}</pre></slot></td></tr>
        </template>
        <tr v-if="bottomSpace" class="ui-table-virtual-space"><td :colspan="columnCount" :style="{height:`${bottomSpace}px`}"/></tr>
      </tbody>
    </table>
  </div>
</template>

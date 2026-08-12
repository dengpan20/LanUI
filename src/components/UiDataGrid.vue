<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, useSlots, watch } from 'vue'
import UiInput from './UiInput.vue'
import UiListToolbar from './UiListToolbar.vue'
import UiPagination from './UiPagination.vue'
import UiTable from './UiTable.vue'
import { useLocale } from '../config.js'

const props=defineProps({
  columns:{type:Array,default:()=>[]},
  rows:{type:Array,default:()=>[]},
  rowKey:{type:String,default:'id'},
  mode:{type:String,default:'client',validator:value=>['client','server'].includes(value)},
  total:{type:Number,default:undefined},
  page:{type:Number,default:1},
  pageSize:{type:Number,default:10},
  pageSizeOptions:{type:Array,default:()=>[10,20,50]},
  query:{type:String,default:''},
  queryFields:{type:Array,default:()=>[]},
  filters:{type:Object,default:()=>({})},
  sortKey:{type:String,default:''},
  sortOrder:{type:String,default:''},
  selectedRows:{type:Array,default:()=>[]},
  expandedRows:{type:Array,default:()=>[]},
  density:{type:String,default:'default'},
  visibleColumns:{type:Array,default:()=>[]},
  selectable:Boolean,
  expandable:Boolean,
  loading:Boolean,
  error:{type:String,default:''},
  stickyHeader:Boolean,
  resizable:Boolean,
  maxHeight:{type:[String,Number],default:''},
  virtual:Boolean,
  rowHeight:{type:Number,default:44},
  viewportHeight:{type:Number,default:400},
  overscan:{type:Number,default:4},
  loadingRows:{type:Number,default:5},
  emptyTitle:{type:String,default:''},
  emptyText:{type:String,default:''},
  caption:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  showToolbar:{type:Boolean,default:true},
  showSearch:{type:Boolean,default:true},
  showPagination:{type:Boolean,default:true},
  showDensity:{type:Boolean,default:true},
  showColumns:{type:Boolean,default:true},
  showRefresh:{type:Boolean,default:true},
  showTotal:{type:Boolean,default:true},
  showSizeChanger:{type:Boolean,default:true},
  compactPagination:Boolean,
  searchPlaceholder:{type:String,default:''},
  searchDebounce:{type:Number,default:250},
  autoRequest:Boolean,
  searchMethod:{type:Function,default:undefined},
  filterMethod:{type:Function,default:undefined},
  sortMethod:{type:Function,default:undefined},
})
const emit=defineEmits([
  'update:page','update:pageSize','update:query','update:filters','update:sortKey','update:sortOrder',
  'update:selectedRows','update:expandedRows','update:density','update:visibleColumns',
  'state-change','request','search','refresh','retry','row-click','column-resize','reset',
])
const slots=useSlots()
const {t,locale}=useLocale()
let searchTimer=null

const normalizedPageSize=computed(()=>Math.max(1,Math.floor(Number(props.pageSize)||10)))
const effectiveVisibleColumns=computed(()=>{
  if(props.visibleColumns.length)return props.visibleColumns.filter(key=>props.columns.some(column=>column.key===key&&!column.hidden))
  return props.columns.filter(column=>!column.hidden).map(column=>column.key)
})
const gridColumns=computed(()=>props.columns.map(column=>({...column,hidden:column.hidden||!effectiveVisibleColumns.value.includes(column.key)})))
const queryKeys=computed(()=>props.queryFields.length?props.queryFields:props.columns.filter(column=>!column.hidden).map(column=>column.key))
const normalizedQuery=computed(()=>String(props.query||'').trim().toLocaleLowerCase(locale.value.name))

function readValue(row,key){return String(key).split('.').reduce((value,part)=>value==null?undefined:value[part],row)}
function containsQuery(row){
  if(!normalizedQuery.value)return true
  if(props.searchMethod){try{return Boolean(props.searchMethod(row,props.query))}catch{return false}}
  return queryKeys.value.some(key=>String(readValue(row,key)??'').toLocaleLowerCase(locale.value.name).includes(normalizedQuery.value))
}
function matchesFilter(row,key,expected){
  if(expected===undefined||expected===null||expected===''||(Array.isArray(expected)&&!expected.length))return true
  const column=props.columns.find(item=>item.key===key);const actual=readValue(row,key)
  if(typeof column?.filterMethod==='function'){try{return Boolean(column.filterMethod(actual,row,expected))}catch{return false}}
  if(Array.isArray(expected))return expected.includes(actual)
  return actual===expected
}
function matchesFilters(row){
  if(props.filterMethod){try{return Boolean(props.filterMethod(row,props.filters))}catch{return false}}
  return Object.entries(props.filters).every(([key,value])=>matchesFilter(row,key,value))
}
function compareValues(left,right){
  if(left===right)return 0;if(left==null)return 1;if(right==null)return-1
  if(typeof left==='number'&&typeof right==='number')return left-right
  return String(left).localeCompare(String(right),locale.value.name,{numeric:true,sensitivity:'base'})
}
const processedRows=computed(()=>{
  if(props.mode==='server')return props.rows
  let result=props.rows.filter(row=>containsQuery(row)&&matchesFilters(row))
  if(props.sortKey&&props.sortOrder){
    if(props.sortMethod){try{result=props.sortMethod([...result],{key:props.sortKey,order:props.sortOrder})||result}catch{/* preserve filtered order */}}
    else{
      const column=props.columns.find(item=>item.key===props.sortKey);const direction=props.sortOrder==='desc'?-1:1
      result=result.map((row,index)=>({row,index})).sort((left,right)=>{
        let value
        try{value=typeof column?.sorter==='function'?column.sorter(left.row,right.row):compareValues(readValue(left.row,props.sortKey),readValue(right.row,props.sortKey))}catch{value=0}
        return value?value*direction:left.index-right.index
      }).map(entry=>entry.row)
    }
  }
  return result
})
const resolvedTotal=computed(()=>props.mode==='server'?(Number.isFinite(props.total)?Math.max(0,props.total):props.rows.length):processedRows.value.length)
const pageCount=computed(()=>props.showPagination?Math.max(1,Math.ceil(resolvedTotal.value/normalizedPageSize.value)):1)
const safePage=computed(()=>Math.max(1,Math.min(pageCount.value,Math.floor(Number(props.page)||1))))
const displayedRows=computed(()=>{
  if(props.mode==='server'||!props.showPagination)return processedRows.value
  const start=(safePage.value-1)*normalizedPageSize.value
  return processedRows.value.slice(start,start+normalizedPageSize.value)
})
const resultAnnouncement=computed(()=>props.loading?t('dataGrid.requesting'):t('dataGrid.results',{count:resolvedTotal.value}))
const slottedColumns=computed(()=>props.columns.filter(column=>Boolean(slots[`cell-${column.key}`])))

function getState(overrides={}){return{
  page:safePage.value,pageSize:normalizedPageSize.value,query:props.query,filters:{...props.filters},sortKey:props.sortKey,
  sortOrder:props.sortOrder,density:props.density,visibleColumns:[...effectiveVisibleColumns.value],...overrides,
}}
function payload(reason,overrides={}){return{reason,mode:props.mode,state:getState(overrides)}}
function announce(reason,overrides={},request=props.mode==='server'){
  const detail=payload(reason,overrides);emit('state-change',detail);if(request)emit('request',detail);return detail
}
function resetPage(){if(props.page!==1)emit('update:page',1)}
function updateQuery(value){
  const query=String(value??'');emit('update:query',query);resetPage();emit('search',query)
  const overrides={query,page:1};const detail=announce('search',overrides,false)
  clearTimeout(searchTimer)
  if(props.mode==='server')searchTimer=setTimeout(()=>emit('request',detail),Math.max(0,Number(props.searchDebounce)||0))
}
function updateFilters(value){emit('update:filters',value);resetPage();announce('filter',{filters:{...value},page:1})}
function updateSort(value){emit('update:sortKey',value.key);emit('update:sortOrder',value.order);resetPage();announce('sort',{sortKey:value.key,sortOrder:value.order,page:1})}
function updatePagination(value){
  const sizeChanged=value.pageSize!==normalizedPageSize.value
  emit('update:pageSize',value.pageSize);emit('update:page',value.page)
  announce(sizeChanged?'page-size':'page',{page:value.page,pageSize:value.pageSize})
}
function updateDensity(value){emit('update:density',value);announce('density',{density:value},false)}
function updateVisibleColumns(value){emit('update:visibleColumns',value);announce('columns',{visibleColumns:[...value]},false)}
function refresh(){clearTimeout(searchTimer);const detail=payload('refresh');emit('refresh',detail);emit('request',detail)}
function retry(){const detail=payload('retry');emit('retry',detail);emit('request',detail)}
function reset(){
  clearTimeout(searchTimer);emit('update:query','');emit('update:filters',{});emit('update:sortKey','');emit('update:sortOrder','');emit('update:page',1)
  const detail=announce('reset',{query:'',filters:{},sortKey:'',sortOrder:'',page:1});emit('reset',detail)
}
function clearFilters(){emit('update:filters',{});resetPage();announce('filter',{filters:{},page:1})}

watch(pageCount,count=>{if(props.showPagination&&props.page>count){emit('update:page',count);nextTick(()=>announce('page',{page:count}))}})
onMounted(()=>{if(props.mode==='server'&&props.autoRequest)emit('request',payload('init'))})
onBeforeUnmount(()=>clearTimeout(searchTimer))
defineExpose({getState,refresh,retry,reset,clearFilters})
</script>

<template>
  <section class="ui-data-grid" :class="[`mode-${mode}`,{'is-loading':loading,'has-error':Boolean(error)}]" role="region" :aria-label="ariaLabel||t('dataGrid.label')" :aria-busy="loading?'true':undefined">
    <UiListToolbar v-if="showToolbar" :total="resolvedTotal" :selected-count="selectedRows.length" :density="density" :columns="columns" :visible-columns="effectiveVisibleColumns" :loading="loading" :show-density="showDensity" :show-columns="showColumns" :show-refresh="showRefresh" :show-total="showTotal" @update:density="updateDensity" @update:visible-columns="updateVisibleColumns" @refresh="refresh">
      <template #primary>
        <slot name="toolbar-primary" :state="getState()" :reset="reset">
          <UiInput v-if="showSearch" class="ui-data-grid-search" :model-value="query" icon="search" clearable :loading="loading&&mode==='server'" :placeholder="searchPlaceholder||t('dataGrid.searchPlaceholder')" :aria-label="t('dataGrid.searchLabel')" @update:model-value="updateQuery"/>
        </slot>
      </template>
      <slot name="toolbar-actions" :state="getState()" :refresh="refresh" :reset="reset"/>
    </UiListToolbar>
    <div v-if="$slots.filters" class="ui-data-grid-filters"><slot name="filters" :filters="filters" :clear="clearFilters" :state="getState()"/></div>
    <UiTable :columns="gridColumns" :rows="displayedRows" :row-key="rowKey" :selected-rows="selectedRows" :expanded-rows="expandedRows" :selectable="selectable" :expandable="expandable" :loading="loading" :error="error" :sort-key="sortKey" :sort-order="sortOrder" :density="density" :sticky-header="stickyHeader" :empty-title="emptyTitle" :empty-text="emptyText" :loading-rows="loadingRows" :filters="filters" :resizable="resizable" :max-height="maxHeight" :virtual="virtual" :row-height="rowHeight" :viewport-height="viewportHeight" :overscan="overscan" @update:selected-rows="emit('update:selectedRows',$event)" @update:expanded-rows="emit('update:expandedRows',$event)" @sort-change="updateSort" @filter-change="updateFilters" @column-resize="emit('column-resize',$event)" @row-click="emit('row-click',$event)" @retry="retry">
      <template #caption><slot name="caption">{{ caption||t('dataGrid.caption') }}</slot></template>
      <template v-for="column in slottedColumns" :key="column.key" #[`cell-${column.key}`]="scope"><slot :name="`cell-${column.key}`" v-bind="scope"/></template>
      <template v-if="$slots.expanded" #expanded="scope"><slot name="expanded" v-bind="scope"/></template>
      <template v-if="$slots['empty-action']" #empty-action><slot name="empty-action" :reset="reset"/></template>
    </UiTable>
    <footer v-if="showPagination" class="ui-data-grid-footer">
      <slot name="pagination" :page="safePage" :page-size="normalizedPageSize" :total="resolvedTotal" :change="updatePagination">
        <UiPagination :page="safePage" :page-size="normalizedPageSize" :total="resolvedTotal" :page-size-options="pageSizeOptions" :show-size-changer="showSizeChanger" :compact="compactPagination" :aria-label="`${ariaLabel||t('dataGrid.label')} · ${t('pagination.label')}`" @change="updatePagination"/>
      </slot>
    </footer>
    <slot name="footer" :state="getState()" :rows="displayedRows" :total="resolvedTotal"/>
    <span class="sr-only" aria-live="polite">{{ resultAnnouncement }}</span>
  </section>
</template>

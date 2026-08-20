<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiPageHeader from '../components/UiPageHeader.vue'
import UiAvatar from '../components/UiAvatar.vue'
import UiButton from '../components/UiButton.vue'
import UiInput from '../components/UiInput.vue'
import UiSelect from '../components/UiSelect.vue'
import UiTag from '../components/UiTag.vue'
import UiDateRangePicker from '../components/UiDateRangePicker.vue'
import UiPagination from '../components/UiPagination.vue'
import UiUpload from '../components/UiUpload.vue'
import UiTable from '../components/UiTable.vue'
import UiListToolbar from '../components/UiListToolbar.vue'

const emit = defineEmits(['notify','open-modal','open-drawer'])
const keyword = ref('')
const status = ref('全部状态')
const customerType = ref('全部类型')
const updatedRange = ref([])
const selected = ref([])
const expandedRows = ref([])
const page = ref(1)
const pageSize = ref(5)
const uploadOpen = ref(false)
const importFiles = ref([])
const loading = ref(false)
const tableError = ref('')
const density = ref('default')
const sortKey = ref('amount')
const sortOrder = ref('desc')
const importRequest=({file,signal,onProgress})=>new Promise((resolve,reject)=>{let percent=0;const timer=setInterval(()=>{percent+=25;onProgress(percent);if(percent>=100){clearInterval(timer);resolve({importId:`IMPORT-${Date.now()}`,name:file?.name})}},120);signal.addEventListener('abort',()=>{clearInterval(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})

const columns = [
  { key:'name', label:'客户信息', minWidth:'220px', sortable:true },
  { key:'type', label:'类型', minWidth:'100px' },
  { key:'owner', label:'负责人', minWidth:'110px' },
  { key:'phone', label:'联系方式', minWidth:'130px' },
  { key:'amount', label:'成交金额', minWidth:'120px', align:'right', sortable:true },
  { key:'status', label:'状态', minWidth:'100px' },
  { key:'date', label:'更新时间', minWidth:'110px', sortable:true },
  { key:'actions', label:'操作', width:'126px', minWidth:'126px', align:'right', fixed:'right', configurable:false },
]
const visibleColumns = ref(columns.map(column => column.key))
const renderedColumns = computed(() => columns.map(column => ({ ...column, hidden: !visibleColumns.value.includes(column.key) })))
const rows = ref([
  {id:'CUS-26081001',name:'上海星河科技有限公司',type:'企业客户',owner:'周琪',initial:'周',phone:'021-5632-8810',amount:286400,status:'合作中',date:'2026-08-10'},
  {id:'CUS-26080918',name:'杭州智绘网络有限公司',type:'渠道客户',owner:'陈晨',initial:'陈',phone:'0571-8256-3012',amount:168900,status:'待跟进',date:'2026-08-09'},
  {id:'CUS-26080726',name:'苏州启明智能制造',type:'企业客户',owner:'林一',initial:'林',phone:'0512-6988-1024',amount:492800,status:'合作中',date:'2026-08-07'},
  {id:'CUS-26080511',name:'宁波海川供应链',type:'战略客户',owner:'王可',initial:'王',phone:'0574-8720-3341',amount:735000,status:'已成交',date:'2026-08-05'},
  {id:'CUS-26080203',name:'南京云途信息技术',type:'企业客户',owner:'李然',initial:'李',phone:'025-8361-7208',amount:98000,status:'已暂停',date:'2026-08-02'},
  {id:'CUS-26073116',name:'合肥远见数字科技',type:'渠道客户',owner:'赵月',initial:'赵',phone:'0551-6288-6105',amount:320600,status:'待跟进',date:'2026-07-31'},
])

const filtered = computed(() => {
  const result = rows.value.filter(row =>
    (!keyword.value || `${row.name}${row.id}${row.owner}`.toLowerCase().includes(keyword.value.toLowerCase())) &&
    (status.value === '全部状态' || row.status === status.value) &&
    (customerType.value === '全部类型' || row.type === customerType.value) &&
    (!updatedRange.value[0] || row.date >= updatedRange.value[0]) &&
    (!updatedRange.value[1] || row.date <= updatedRange.value[1])
  )
  if (!sortKey.value || !sortOrder.value) return result
  return [...result].sort((left,right) => {
    const a = left[sortKey.value]
    const b = right[sortKey.value]
    const value = typeof a === 'number' ? a-b : String(a).localeCompare(String(b),'zh-CN')
    return value * (sortOrder.value === 'asc' ? 1 : -1)
  })
})
const pageRows = computed(() => filtered.value.slice((page.value-1)*pageSize.value,page.value*pageSize.value))
const tagColor = value => ({'合作中':'blue','已成交':'green','待跟进':'orange','已暂停':'gray'}[value] || 'gray')

function reset(){ keyword.value='';status.value='全部状态';customerType.value='全部类型';updatedRange.value=[];emit('notify','筛选条件已重置') }
function exportData(){ const csv=['客户编号,客户名称,类型,负责人,成交额,状态,更新时间',...filtered.value.map(row=>[row.id,row.name,row.type,row.owner,row.amount,row.status,row.date].join(','))].join('\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));link.download='客户数据.csv';link.click();URL.revokeObjectURL(link.href);emit('notify','客户数据已导出') }
function refresh(){ tableError.value='';loading.value=true;setTimeout(()=>{loading.value=false;emit('notify','列表数据已刷新')},720) }
watch([keyword,status,customerType,updatedRange,pageSize],()=>{page.value=1},{deep:true})
</script>

<template>
  <div class="page-container">
    <UiPageHeader title="客户数据" description="统一管理客户档案、跟进状态与成交数据" :breadcrumbs="[{label:'业务管理',href:'#/data'},{label:'客户数据'}]">
      <template #actions><UiButton variant="outline" icon="upload" @click="uploadOpen=!uploadOpen">批量导入</UiButton><UiButton icon="plus" @click="emit('open-modal','新建客户')">新建客户</UiButton></template>
    </UiPageHeader>

    <Transition name="select-menu"><div v-if="uploadOpen" class="card inline-upload-panel"><div class="inline-upload-heading"><div><strong>批量导入客户</strong><span>上传 CSV 或 Excel 文件，完成后可在此确认数据映射。</span></div><button class="icon-btn" aria-label="关闭上传面板" @click="uploadOpen=false"><AppIcon name="close" :size="14"/></button></div><UiUpload v-model="importFiles" accept=".csv,.xls,.xlsx" :max-size="20" :max-count="1" :request="importRequest" @success="emit('notify','Import asset uploaded; field mapping is ready')" @upload-error="emit('notify','Import upload failed; retry is available','error')" @error="emit('notify',$event,'error')"/></div></Transition>

    <div class="card filter-card"><div class="filter-row">
      <label class="field search-wide"><span class="field-label">客户搜索</span><UiInput v-model="keyword" icon="search" clearable placeholder="搜索客户名称、编号或负责人"/></label>
      <label class="field"><span class="field-label">客户状态</span><UiSelect v-model="status" :options="['全部状态','合作中','已成交','待跟进','已暂停']"/></label>
      <label class="field"><span class="field-label">客户类型</span><UiSelect v-model="customerType" :options="['全部类型','企业客户','渠道客户','战略客户']"/></label>
      <label class="field date-range-wide"><span class="field-label">更新时间范围</span><UiDateRangePicker v-model="updatedRange"/></label>
      <div class="filter-actions"><UiButton @click="emit('notify',`找到 ${filtered.length} 条结果`)">查询</UiButton><UiButton variant="outline" @click="reset">重置</UiButton></div>
    </div></div>

    <section class="card table-system-card">
      <UiListToolbar v-model:density="density" v-model:visible-columns="visibleColumns" :columns="columns" :total="filtered.length" :selected-count="selected.length" :loading="loading" @refresh="refresh">
        <template #primary><UiButton variant="outline" icon="download" @click="exportData">导出</UiButton><UiButton v-if="selected.length" variant="danger-outline" icon="trash" @click="emit('open-modal',`删除 ${selected.length} 个客户`)">批量删除</UiButton></template>
      </UiListToolbar>
      <UiTable v-model:selected-rows="selected" v-model:expanded-rows="expandedRows" v-model:sort-key="sortKey" v-model:sort-order="sortOrder" :columns="renderedColumns" :rows="pageRows" :loading="loading" :error="tableError" :density="density" selectable expandable sticky-header empty-title="没有找到匹配的客户" empty-text="尝试调整关键词或筛选条件" @retry="refresh">
        <template #cell-name="{row}"><div class="cell-title">{{ row.name }}</div><div class="cell-subtitle">{{ row.id }}</div></template>
        <template #cell-owner="{row}"><div class="cell-person"><UiAvatar :name="row.owner" size="sm"/>{{ row.owner }}</div></template>
        <template #cell-amount="{row}"><span class="cell-title">¥ {{ row.amount.toLocaleString() }}</span></template>
        <template #cell-status="{row}"><UiTag :color="tagColor(row.status)" dot>{{ row.status }}</UiTag></template>
        <template #cell-actions="{row}"><div class="table-actions" style="justify-content:flex-end"><button class="btn btn-text btn-sm" @click.stop="emit('open-drawer',row)">查看</button><button class="icon-btn" title="编辑" @click.stop="emit('notify',`正在编辑 ${row.name}`)"><AppIcon name="edit" :size="14"/></button><button class="icon-btn" title="更多"><AppIcon name="more" :size="14"/></button></div></template>
        <template #expanded="{row}"><div class="ui-table-expanded-content"><div><span>客户编号</span><strong>{{ row.id }}</strong></div><div><span>联系电话</span><strong>{{ row.phone }}</strong></div><div><span>最近更新</span><strong>{{ row.date }}</strong></div><div><span>累计成交</span><strong>¥ {{ row.amount.toLocaleString() }}</strong></div></div></template>
        <template #empty-action><button class="btn btn-outline btn-sm" @click="reset">清除筛选</button></template>
      </UiTable>
      <UiPagination v-model:page="page" v-model:page-size="pageSize" :total="filtered.length" :page-size-options="[5,10,20]"/>
    </section>
  </div>
</template>

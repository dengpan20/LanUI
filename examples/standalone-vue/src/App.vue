<script setup>
import { computed, ref } from 'vue'
import {
  UiAlert,
  UiAutoComplete,
  UiButton,
  UiCard,
  UiConfigProvider,
  UiDateRangePicker,
  UiDescriptions,
  UiInput,
  UiIcon,
  UiNumberInput,
  UiSelect,
  UiSegmented,
  UiSlider,
  UiSteps,
  UiTable,
  UiTag,
  UiTimePicker,
  UiToastHost,
  UiTree,
  toast,
} from 'lan-ui-design-system'

const projectName = ref('运营管理后台')
const template = ref('dashboard')
const created = ref(false)
const period = ref('week')
const locale = ref('en-US')
const direction = ref('ltr')
const deliveryRange = ref(['2026-08-01','2026-08-11'])
const reminderAt = ref(new Date('2026-08-12T01:30:00.000Z'))
const monthlyQuota = ref(12500)
const rollout = ref([25,75])
const officeCity = ref('hangzhou')
const selectedResource = ref('dashboard')
const checkedResources = ref(['dashboard'])
const resourceTree = [
  { label:'运营中心', value:'operations', children:[{label:'经营看板',value:'dashboard'},{label:'客户数据',value:'customers'}] },
  { label:'系统设置', value:'settings', children:[{label:'成员权限',value:'permissions'},{label:'审计日志',value:'audit'}] },
]
function createProject(){created.value=true;toast.success('独立项目配置已生成')}
const steps = [
  { title: '项目配置', description: '名称与模板' },
  { title: '组件装配', description: '加载组件库' },
  { title: '独立构建', description: '输出生产文件' },
]
const columns = [
  { key: 'module', label: '模块' },
  { key: 'component', label: '使用组件' },
  { key: 'status', label: '状态', width: 110 },
]
const rows = computed(() => [
  { id: 1, module: '身份入口', component: 'UiInput / UiButton', status: '已装配' },
  { id: 2, module: '项目进度', component: 'UiSteps', status: '已装配' },
  { id: 3, module: '数据列表', component: 'UiTable / UiTag', status: created.value ? '已生成' : '待生成' },
])
</script>

<template>
  <main class="standalone-shell">
    <header class="standalone-header">
      <div><UiIcon name="projectMark" :size="22" color="var(--brand-600)" aria-label="项目标识"/><span class="standalone-kicker">独立消费示例</span><h1>{{ projectName }}</h1></div>
      <UiTag color="blue">Vue 3 + Vite</UiTag>
    </header>

    <UiAlert
      :type="created ? 'success' : 'info'"
      :title="created ? '独立项目已完成初始化' : '组件包、样式和 Token 已从父项目加载'"
      description="该页面拥有独立 package.json、Vite 配置和应用入口。"
    />

    <UiCard title="创建项目" body-class="standalone-form">
      <label><span>项目名称</span><UiInput v-model="projectName" clearable /></label>
      <label><span>页面模板</span><UiSelect v-model="template" :options="[{label:'综合看板',value:'dashboard'},{label:'数据列表',value:'list'},{label:'配置中心',value:'settings'}]" /></label>
      <label><span>办公城市</span><UiAutoComplete v-model="officeCity" :options="[{label:'杭州',value:'hangzhou',keywords:['hz']},{label:'上海',value:'shanghai',keywords:['sh']},{label:'深圳',value:'shenzhen',keywords:['sz']}]" /></label>
      <label><span>Monthly quota</span><UiNumberInput v-model="monthlyQuota" :min="0" :max="100000" :step="500" :precision="0"><template #suffix>CNY</template></UiNumberInput></label>
      <label><span>Rollout range</span><UiSlider v-model="rollout" range :step="5" :min-distance="10" :aria-label="['Rollout start','Rollout end']" /></label>
      <UiButton :disabled="!projectName" @click="createProject">生成独立项目</UiButton>
    </UiCard>

    <UiCard title="交付进度"><UiSteps :items="steps" :current="created ? 3 : 2" /></UiCard>

    <UiCard title="组件装配结果">
      <UiTable :columns="columns" :rows="rows" row-key="id">
        <template #cell-status="{ value }"><UiTag :type="value === '待生成' ? 'orange' : 'green'">{{ value }}</UiTag></template>
      </UiTable>
    </UiCard>
    <UiCard title="通用能力验证">
      <UiSegmented v-model="period" :options="[{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'}]" />
      <UiDescriptions style="margin-top:16px" bordered :columns="3" :items="[{label:'当前周期',value:period},{label:'组件来源',value:'lan-ui-design-system'},{label:'构建方式',value:'独立 Vite 应用'}]" />
    </UiCard>
    <UiCard title="资源权限树">
      <UiTree v-model="selectedResource" v-model:checked-keys="checkedResources" :data="resourceTree" :default-expanded-keys="['operations','settings']" checkable show-line bordered aria-label="独立项目资源权限" />
      <UiDescriptions style="margin-top:16px" bordered :columns="2" :items="[{label:'当前资源',value:selectedResource},{label:'已授权',value:checkedResources.join(', ')}]" />
    </UiCard>
    <UiCard title="全局安装与局部配置">
      <UiSegmented v-model="locale" :options="[{label:'中文',value:'zh-CN'},{label:'English',value:'en-US'}]" />
      <UiSegmented v-model="direction" :options="[{label:'LTR',value:'ltr'},{label:'RTL',value:'rtl'}]" />
      <UiConfigProvider :locale="locale" :direction="direction" size="sm" density="compact">
        <div style="margin-top:16px;display:grid;gap:12px">
          <UiDateRangePicker v-model="deliveryRange" />
          <UiTimePicker v-model="reminderAt" value-type="date" time-zone="Asia/Shanghai" precision="second" :step="1" aria-label="Reminder time" />
          <UiButton>{{ locale==='en-US'?'Create delivery':'创建交付计划' }}</UiButton>
        </div>
      </UiConfigProvider>
    </UiCard>
    <UiToastHost />
  </main>
</template>

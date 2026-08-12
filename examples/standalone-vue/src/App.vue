<script setup>
import { computed, reactive, ref } from 'vue'
import {
  UiAlert,
  UiAutoComplete,
  UiButton,
  UiCalendar,
  UiCard,
  UiColorPicker,
  UiCommandPalette,
  UiConfigProvider,
  UiDateRangePicker,
  UiDataGrid,
  UiDescriptions,
  UiForm,
  UiFormItem,
  UiFormList,
  UiSchemaForm,
  UiInput,
  UiIcon,
  UiImage,
  UiNumberInput,
  UiRate,
  UiSelect,
  UiSegmented,
  UiSlider,
  UiStatistic,
  UiSteps,
  UiTable,
  UiTag,
  UiTimePicker,
  UiToastHost,
  UiTree,
  UiStatusPage,
  UiVirtualList,
  toast,
} from 'lan-ui-design-system'

const projectModel = reactive({ project: { name: '运营管理后台', template: 'dashboard' }, members: [{ name: 'Owner', email: 'owner@example.com' }] })
const projectRules = { project: { name: [{ required:true, message:'请输入项目名称' }, { min:2, message:'项目名称至少需要 2 个字符' }], template: { required:true } } }
const workspaceModel=reactive({account:{type:'business',name:'Lan UI Consumer',email:'owner@example.com'},taxId:'91330000LANUI2026',reviewers:[{name:'Release owner',email:'owner@example.com'}]})
const workspaceSchema=[{key:'account',title:'Schema-driven account',description:'Conditional and repeatable fields are mounted and validated from the consumer-owned schema.',columns:2,fields:[
  {name:'account.type',label:'Account type',type:'segmented',options:[{label:'Business',value:'business'},{label:'Personal',value:'personal'}],props:{block:true},span:2},
  {name:'account.name',label:'Workspace name',required:true,rules:[{required:true},{min:2}],props:{clearable:true}},
  {name:'account.email',label:'Owner email',required:true,rules:[{required:true},{type:'email'}],props:{clearable:true}},
  {name:'taxId',label:'Tax ID',visible:model=>model.account.type==='business',required:model=>model.account.type==='business',dependencies:['account.type'],rules:[{required:true}],span:2},
  {key:'reviewers',name:'reviewers',type:'list',label:'Release reviewers',min:1,max:3,columns:2,defaultValue:({index})=>({name:`Reviewer ${index+1}`,email:''}),itemLabel:(_model,{index,item})=>`${index+1}. ${item.name||'Reviewer'}`,fields:[{name:'name',label:'Name',required:true,rules:[{required:true}]},{name:'email',label:'Email',required:true,rules:[{required:true},{type:'email'}],props:(_model,{index})=>({placeholder:`reviewer-${index+1}@example.com`})}]},
]}]
const created = ref(false)
const period = ref('week')
const locale = ref('en-US')
const direction = ref('ltr')
const deliveryRange = ref(['2026-08-01','2026-08-11'])
const reminderAt = ref(new Date('2026-08-12T01:30:00.000Z'))
const monthlyQuota = ref(12500)
const brandColor = ref('#1677FFCC')
const rollout = ref([25,75])
const serviceRating = ref(4.5)
const releaseWindow = ref(['2026-08-10','2026-08-16'])
const gridQuery = ref('')
const gridPage = ref(1)
const gridPageSize = ref(5)
const gridSelected = ref([])
const gridColumns = [
  { key:'name', label:'Work item', sortable:true },
  { key:'team', label:'Team', sortable:true },
  { key:'status', label:'Status', filterable:true, filterOptions:['Ready','Review'] },
]
const gridRows = Array.from({length:24},(_,index)=>({id:index+1,name:`Release item ${index+1}`,team:['Design','Frontend','QA'][index%3],status:index%5===0?'Review':'Ready'}))
const virtualSelection = ref('consumer-2')
const virtualItems = Array.from({length:500},(_,index)=>({id:`consumer-${index}`,label:`Standalone record ${index+1}`,meta:index%4===0?'Measured detail row':'Ready'}))
const demoImage=(label,from,to)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="420" rx="28" fill="url(#g)"/><circle cx="505" cy="80" r="110" fill="white" opacity=".12"/><path d="M0 360 175 190l112 102 103-82 250 210H0Z" fill="white" opacity=".18"/><text x="38" y="66" fill="white" font-family="Arial" font-size="28" font-weight="700">${label}</text></svg>`)}`
const releaseImages=[demoImage('Design audit','#2563eb','#0f766e'),demoImage('Component review','#7c3aed','#db2777'),demoImage('Release ready','#0f766e','#ca8a04')]
const officeCity = ref('hangzhou')
const selectedResource = ref('dashboard')
const checkedResources = ref(['dashboard'])
const commandOpen = ref(false)
const commandQuery = ref('')
const lastCommand = ref('尚未执行')
const commands = [
  { key:'dashboard', label:'打开经营看板', description:'查看今日核心指标', group:'导航', icon:'home', keywords:['dashboard','首页'] },
  { key:'customers', label:'搜索客户资料', description:'按名称或编号定位客户', group:'导航', icon:'search', keywords:['customer','客户'] },
  { key:'create', label:'新建运营任务', description:'创建并分配新的业务任务', group:'操作', icon:'plus', shortcut:['N'] },
  { key:'audit', label:'查看审计日志', description:'需要管理员权限', group:'系统', icon:'file', disabled:true },
]
const resourceTree = [
  { label:'运营中心', value:'operations', children:[{label:'经营看板',value:'dashboard'},{label:'客户数据',value:'customers'}] },
  { label:'系统设置', value:'settings', children:[{label:'成员权限',value:'permissions'},{label:'审计日志',value:'audit'}] },
]
function createProject(){created.value=true;toast.success('独立项目配置已生成')}
function runCommand(command){lastCommand.value=command.label;toast.success(`已执行：${command.label}`)}
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
      <div><UiIcon name="projectMark" :size="22" color="var(--brand-600)" aria-label="项目标识"/><span class="standalone-kicker">独立消费示例</span><h1>{{ projectModel.project.name }}</h1></div>
      <UiTag color="blue">Vue 3 + Vite</UiTag>
    </header>

    <UiAlert
      :type="created ? 'success' : 'info'"
      :title="created ? '独立项目已完成初始化' : '组件包、样式和 Token 已从父项目加载'"
      description="该页面拥有独立 package.json、Vite 配置和应用入口。"
    />

    <UiCard title="业务指标">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px">
        <UiStatistic title="Monthly revenue" :value="2864000" prefix="¥" :precision="0" :trend="12.6"><template #extra>Compared with last month</template></UiStatistic>
        <UiStatistic title="Active customers" :value="12580" suffix=" users" :trend="-3.2" status="warning" />
        <UiStatistic title="Defect rate" :value="0.0037" :format-options="{style:'percent',minimumFractionDigits:2}" :trend="-18.4" positive-direction="down" status="success" />
      </div>
    </UiCard>

    <UiCard title="创建项目">
      <UiForm :model="projectModel" :rules="projectRules" show-error-summary class="standalone-form" @submit="createProject">
      <UiFormItem name="project.name" label="项目名称" required><UiInput v-model="projectModel.project.name" clearable /></UiFormItem>
      <UiFormItem name="project.template" label="页面模板" required><UiSelect v-model="projectModel.project.template" :options="[{label:'综合看板',value:'dashboard'},{label:'数据列表',value:'list'},{label:'配置中心',value:'settings'}]" /></UiFormItem>
      <label><span>办公城市</span><UiAutoComplete v-model="officeCity" :options="[{label:'杭州',value:'hangzhou',keywords:['hz']},{label:'上海',value:'shanghai',keywords:['sh']},{label:'深圳',value:'shenzhen',keywords:['sz']}]" /></label>
      <label><span>Monthly quota</span><UiNumberInput v-model="monthlyQuota" :min="0" :max="100000" :step="500" :precision="0"><template #suffix>CNY</template></UiNumberInput></label>
      <label><span>Rollout range</span><UiSlider v-model="rollout" range :step="5" :min-distance="10" :aria-label="['Rollout start','Rollout end']" /></label>
      <label><span>Service rating</span><UiRate v-model="serviceRating" :step="0.5" show-text :formatter="(value,max)=>`${value} / ${max}`" /></label>
      <label><span>Brand color</span><UiColorPicker v-model="brandColor" alpha show-contrast :presets="['#1677FF','#7C3AED','#10B981','#F59E0B']" /></label>
      <UiFormItem name="members" label="Project members" group :rules="[{ type:'array', min:1, message:'Keep at least one project member' }]">
        <UiFormList v-slot="{ fields, add, remove, move, canAdd, canRemove }" name="members" :min="1" :max="5" :default-value="()=>({name:'',email:''})" aria-label="Project members">
          <div v-for="(field,index) in fields" :key="field.key" style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;margin-bottom:10px">
            <UiFormItem :name="[...field.name,'name']" :label="`Member ${index+1}`" required :rules="[{required:true}]"><UiInput v-model="projectModel.members[index].name" /></UiFormItem>
            <UiFormItem :name="[...field.name,'email']" label="Email" required :rules="[{required:true},{type:'email'}]"><UiInput v-model="projectModel.members[index].email" /></UiFormItem>
            <span style="display:flex;gap:4px;padding-bottom:2px"><UiButton type="button" size="sm" variant="text" :disabled="index===0" @click="move(index,index-1)">Up</UiButton><UiButton type="button" size="sm" variant="text" :disabled="!canRemove" @click="remove(index)">Remove</UiButton></span>
          </div>
          <UiButton type="button" size="sm" variant="secondary" :disabled="!canAdd" @click="add()">Add member</UiButton>
        </UiFormList>
      </UiFormItem>
      <UiButton type="submit">生成独立项目</UiButton>
      </UiForm>
    </UiCard>

    <UiCard title="Schema-driven workspace settings and reviewers">
      <UiSchemaForm :model="workspaceModel" :schema="workspaceSchema" show-error-summary @submit="toast.success('Schema form submitted')">
        <template #actions="{validating,errors}"><span style="color:var(--text-secondary);font-size:12px">{{ errors.length }} validation errors</span><UiButton type="submit" :loading="validating">Save workspace</UiButton></template>
      </UiSchemaForm>
    </UiCard>

    <UiCard title="交付进度"><UiSteps :items="steps" :current="created ? 3 : 2" /></UiCard>

    <UiCard title="Release calendar">
      <UiCalendar v-model="releaseWindow" selection-mode="range" view-date="2026-08-01" today="2026-08-12" show-week-numbers :disabled-date="date=>[0,6].includes(date.getUTCDay())" />
    </UiCard>

    <UiCard title="Release gallery">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
        <UiImage v-for="(source,index) in releaseImages" :key="source" :src="source" :alt="`Release asset ${index+1}`" preview :preview-list="releaseImages" :preview-index="index" style="width:100%;aspect-ratio:4/3"><template #caption>Standalone package preview</template></UiImage>
      </div>
    </UiCard>

    <UiCard title="全局命令面板">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UiCommandPalette v-model="commandOpen" v-model:query="commandQuery" :commands="commands" @select="runCommand">
          <template #trigger="{open}"><UiButton icon="search" @click="open">搜索命令（Ctrl K）</UiButton></template>
        </UiCommandPalette>
        <UiTag color="blue">{{ lastCommand }}</UiTag>
      </div>
    </UiCard>

    <UiCard title="组件装配结果">
      <UiTable :columns="columns" :rows="rows" row-key="id">
        <template #cell-status="{ value }"><UiTag :type="value === '待生成' ? 'orange' : 'green'">{{ value }}</UiTag></template>
      </UiTable>
    </UiCard>
    <UiCard title="Managed data grid">
      <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:page-size="gridPageSize" v-model:selected-rows="gridSelected" :columns="gridColumns" :rows="gridRows" :page-size-options="[5,10,20]" selectable :query-fields="['name','team','status']" aria-label="Standalone release grid">
        <template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':'orange'">{{ value }}</UiTag></template>
      </UiDataGrid>
    </UiCard>
    <UiCard title="Virtualized collection">
      <UiVirtualList v-model="virtualSelection" :items="virtualItems" :item-size="item=>item.meta.startsWith('Measured')?58:44" :estimated-item-size="48" height="220" selection-mode="single" measure bordered striped aria-label="Standalone records">
        <template #item="{item,index,selected}"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%"><span>{{ index+1 }} · {{ item.label }}<small style="display:block;color:var(--text-secondary)">{{ item.meta }}</small></span><UiTag :color="selected?'blue':'gray'">{{ selected?'Selected':'Ready' }}</UiTag></div></template>
      </UiVirtualList>
    </UiCard>
    <UiCard title="Reusable status page">
      <UiStatusPage status="404" embedded @home="toast.info('Home action')" @back="toast.info('Back action')"><template #extra>Rendered from the published component subpath.</template></UiStatusPage>
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

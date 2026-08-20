<script setup>
import { computed, reactive, ref } from 'vue'
import {
  UiAlert,
  UiAffix,
  UiAnchor,
  UiAutoComplete,
  UiBarcode,
  UiButton,
  UiCalendar,
  UiCard,
  UiCarousel,
  UiColorPicker,
  UiCommandPalette,
  UiConfigProvider,
  UiCronEditor,
  UiKeyValueEditor,
  UiDateRangePicker,
  UiDateTimePicker,
  UiDateTimeRangePicker,
  UiDescriptions,
  UiForm,
  UiFormItem,
  UiFormList,
  UiSchemaForm,
  UiInput,
  UiInputTag,
  UiIcon,
  UiImage,
  UiList,
  UiMentions,
  UiNumberInput,
  UiOtpInput,
  UiPageHeader,
  UiQueryBuilder,
  UiQRCode,
  UiRate,
  UiSelect,
  UiSegmented,
  UiSlider,
  UiSplitter,
  UiStatistic,
  UiSteps,
  UiTable,
  UiTag,
  UiTimeRangePicker,
  UiToastHost,
  UiTour,
  UiTypography,
  UiTree,
  UiUpload,
  UiWatermark,
  toast,
} from 'lan-ui-design-system'

const projectModel = reactive({ project: { name: '运营管理后台', template: 'dashboard' }, members: [{ name: 'Owner', email: 'owner@example.com' }] })
const projectRules = { project: { name: [{ required:true, message:'请输入项目名称' }, { min:2, message:'项目名称至少需要 2 个字符' }], template: { required:true } } }
const standaloneQueryFields=[{key:'name',label:'Component',type:'text',defaultOperator:'contains'},{key:'team',label:'Team',type:'select',options:['Forms','Data','Navigation']},{key:'coverage',label:'Coverage',type:'number',min:0,max:100},{key:'status',label:'Status',type:'select',options:['Stable','Review']}]
const standaloneQuery=ref({combinator:'and',rules:[{field:'status',operator:'equals',value:'Stable'},{field:'coverage',operator:'greaterOrEqual',value:80}]})
const workspaceModel=reactive({account:{type:'business',name:'Lan UI Consumer',email:'owner@example.com'},taxId:'91330000LANUI2026',schedule:{window:['09:00','18:00'],publishAt:'2026-08-20T10:00'},capabilities:['design-system','consumer'],filters:{combinator:'and',rules:[{field:'status',operator:'equals',value:'Stable'}]},reviewers:[{name:'Release owner',email:'owner@example.com'}]})
const workspaceSchema=[{key:'account',title:'Schema-driven account',description:'Conditional and repeatable fields are mounted and validated from the consumer-owned schema.',columns:2,fields:[
  {name:'account.type',label:'Account type',type:'segmented',options:[{label:'Business',value:'business'},{label:'Personal',value:'personal'}],props:{block:true},span:2},
  {name:'account.name',label:'Workspace name',required:true,rules:[{required:true},{min:2}],props:{clearable:true}},
  {name:'account.email',label:'Owner email',required:true,rules:[{required:true},{type:'email'}],props:{clearable:true}},
  {name:'schedule.publishAt',label:'Publish at',type:'datetime',props:{step:60}},
  {name:'schedule.window',label:'Service window',type:'time-range',props:{step:900},span:2},
  {name:'taxId',label:'Tax ID',visible:model=>model.account.type==='business',required:model=>model.account.type==='business',dependencies:['account.type'],rules:[{required:true}],span:2},
  {name:'capabilities',label:'Capabilities',type:'input-tag',span:2,props:{editable:true,clearable:true,maxTags:6}},
  {name:'filters',label:'Release filters',type:'query-builder',span:2,props:{fields:standaloneQueryFields,compact:true,showNot:true,maxDepth:2}},
  {key:'reviewers',name:'reviewers',type:'list',label:'Release reviewers',min:1,max:3,columns:2,defaultValue:({index})=>({name:`Reviewer ${index+1}`,email:''}),itemLabel:(_model,{index,item})=>`${index+1}. ${item.name||'Reviewer'}`,fields:[{name:'name',label:'Name',required:true,rules:[{required:true}]},{name:'email',label:'Email',required:true,rules:[{required:true},{type:'email'}],props:(_model,{index})=>({placeholder:`reviewer-${index+1}@example.com`})}]},
]}]
const created = ref(false)
const locale = ref('en-US')
const direction = ref('ltr')
const appearance = ref('system')
const motion = ref('system')
const standaloneTourOpen=ref(false)
const standaloneTourCurrent=ref(0)
const standaloneAffixTarget=ref(null)
const standaloneAffixed=ref(false)
const standaloneSplitterSizes=ref([24,48,28])
const standaloneCardSelected=ref(false)
const standaloneSplitterPanels=[{key:'navigation',label:'Navigation',defaultSize:'24%',min:'14%',max:'38%',collapsible:true},{key:'workspace',label:'Workspace',min:'26%'},{key:'inspector',label:'Inspector',defaultSize:'28%',min:'16%',max:'42%',collapsible:true}]
const standaloneReleaseNote=ref('Standalone consumers can use UiTypography for release notes, copyable configuration values and keyboard-confirmed inline editing without adding separate behavior wrappers.')
const standaloneListSelection=ref(['contract'])
const standaloneListPage=ref(1)
const standaloneOtp=ref('204')
const standaloneMentions=ref('Please ask @de')
const standaloneCapabilities=ref(['Vue 3','Typed API','SSR'])
const standaloneCarouselIndex=ref(0)
const standaloneQrStatus=ref('expired')
const standaloneQrRevision=ref(1)
const standaloneQrValue=computed(()=>`https://consumer.example/releases/1.55.0?revision=${standaloneQrRevision.value}`)
function refreshStandaloneQr(){standaloneQrRevision.value+=1;standaloneQrStatus.value='active';toast.success('Release QR refreshed')}
const standaloneBarcodeStatus=ref('expired')
const standaloneBarcodeRevision=ref(1)
const standaloneBarcodeValue=computed(()=>`LAN-UI-153-R${standaloneBarcodeRevision.value}`)
function refreshStandaloneBarcode(){standaloneBarcodeRevision.value+=1;standaloneBarcodeStatus.value='active';toast.success('Asset barcode refreshed')}
const standaloneCron=ref('0 9 * * 1-5')
const standaloneHeaders=ref([{id:'accept',key:'Accept',value:'application/json',enabled:true},{id:'trace',key:'X-Trace-Id',value:'consumer-42',enabled:true}])
const standalonePublishAt=ref('2026-08-20T10:00')
const standaloneReleaseWindow=ref(['2026-08-20T10:00','2026-08-20T18:00'])
const standaloneCarouselItems=[
  {key:'contract',title:'Package contract',description:'Runtime, type and style subpaths stay aligned.',start:'#1d4ed8',end:'#0891b2'},
  {key:'interaction',title:'Interaction quality',description:'Keyboard, swipe and pause reasons use one state model.',start:'#6d28d9',end:'#db2777'},
  {key:'release',title:'Release evidence',description:'Cross-browser, package and rollback gates are reproducible.',start:'#047857',end:'#ca8a04'},
]
const standaloneMentionOptions=[
  {label:'Design owner',value:'design',description:'Design system review',trigger:'@'},
  {label:'Frontend owner',value:'frontend',description:'Consumer integration',trigger:'@'},
  {label:'Release',value:'release',description:'Package and workflow evidence',trigger:'#'},
]
const standaloneListItems=[{id:'contract',title:'Package contract',description:'Root exports, component subpaths and typed slots',owner:'API',status:'Ready'},{id:'accessibility',title:'Accessibility review',description:'Keyboard, listbox position and selection semantics',owner:'QA',status:'Review'},{id:'consumer',title:'Consumer build',description:'Standalone Vite application and isolated package install',owner:'Release',status:'Ready'},{id:'rollback',title:'Rollback evidence',description:'Baseline archive, patch and runnable restore command',owner:'Ops',status:'Ready'}]
const standaloneTourSteps=[
  {target:'#standalone-overview',title:'Review business metrics',description:'Start with the operational signals that need attention.',placement:'bottom-start'},
  {target:'#standalone-schema',title:'Configure the workspace',description:'The schema keeps fields, validation and repeatable reviewers synchronized.',placement:'top'},
  {target:'#standalone-upload',title:'Attach release evidence',description:'Upload the manifest, package and verification records before publishing.',placement:'top-end'},
]
const standaloneTheme={'brand-600':'#7C3AED','brand-text':'#A78BFA'}
const deliveryRange = ref(['2026-08-01','2026-08-11'])
const serviceWindow = ref(['09:00','18:00'])
const standaloneAnchor = ref('#standalone-overview')
const standaloneAnchorItems = [
  { title: 'Overview', href: '#standalone-overview' },
  { title: 'Schema form', href: '#standalone-schema' },
  { title: 'Upload queue', href: '#standalone-upload' },
]
const monthlyQuota = ref(12500)
const brandColor = ref('#1677FFCC')
const rollout = ref([25,75])
const serviceRating = ref(4.5)
const releaseWindow = ref(['2026-08-10','2026-08-16'])
const releaseFiles=ref([{id:'release-manifest',name:'release-manifest.json',size:2048,status:'success',percent:100}])
function releaseUploadRequest({file,signal,onProgress}){return new Promise((resolve,reject)=>{let percent=0;const timer=setInterval(()=>{percent+=25;onProgress(percent);if(percent>=100){clearInterval(timer);resolve({path:`/releases/${file?.name}`})}},100);signal.addEventListener('abort',()=>{clearInterval(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})}
const demoImage=(label,from,to)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" rx="28" fill="${from}"/><path d="M0 360 175 190l112 102 103-82 250 210H0Z" fill="${to}" opacity=".55"/><text x="38" y="66" fill="white" font-size="28">${label}</text></svg>`)}`
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
    <UiPageHeader :title="projectModel.project.name" description="Independent package consumer with shared page-level semantics and actions." :breadcrumbs="[{label:'Consumer',href:'#consumer'},{label:'Workspace'}]" bordered>
      <template #meta><UiIcon name="projectMark" :size="18" color="var(--brand-600)" aria-label="项目标识"/><span class="standalone-kicker">独立消费示例</span><UiTag color="blue">Vue 3 + Vite</UiTag></template>
      <template #actions><UiButton id="standalone-tour-trigger" size="sm" variant="outline" @click="standaloneTourCurrent=0;standaloneTourOpen=true">Product tour</UiButton></template>
    </UiPageHeader>

    <UiAlert
      :type="created ? 'success' : 'info'"
      :title="created ? '独立项目初始化完成' : '组件、样式和 Token 已加载'"
      description="独立 package.json、Vite 配置和应用入口。"
    />

    <UiCard data-card-state-contract title="Consumer release workspace" subtitle="Interactive UiCard contract from the packed dependency" variant="elevated" shadow="sm" hoverable interactive :selected="standaloneCardSelected" @activate="standaloneCardSelected=!standaloneCardSelected">
      <p style="margin:0;color:var(--text-secondary)">Pointer, Enter and Space share one typed activation event; focus, selection and disabled states stay visible.</p>
      <template #footer><UiTag :color="standaloneCardSelected?'blue':'gray'">{{ standaloneCardSelected?'Selected':'Select card' }}</UiTag></template>
    </UiCard>

    <UiCard title="On-page navigation" subtitle="Anchor navigation inside a composable card" variant="outlined" shadow="none">
      <UiAnchor
        v-model="standaloneAnchor"
        :items="standaloneAnchorItems"
        direction="horizontal"
        :affix="false"
        :offset-top="16"
        aria-label="Standalone example sections"
      />
    </UiCard>
    <UiCard title="Protected release evidence">
      <UiWatermark :content="['Lan UI','CONSUMER']" :gap="[76,64]" :font="{fontSize:14,color:'rgba(124,58,237,.16)',fontWeight:650}" aria-label="Consumer release watermark">
        <div style="min-height:150px;padding:22px;display:grid;align-content:start;gap:7px;border:1px solid var(--border-color);border-radius:10px;background:var(--bg-subtle)"><strong>Standalone package verification</strong><span style="color:var(--text-secondary);font-size:12px">Root and subpath imports · CSS · types · SSR · rollback</span></div>
      </UiWatermark>
    </UiCard>
    <UiCard title="Container-aware sticky actions">
      <div ref="standaloneAffixTarget" class="standalone-affix-target" tabindex="0" aria-label="Scroll the release approval example">
        <div class="standalone-affix-intro">Scroll this container to pin the approval bar.</div>
        <UiAffix :target="standaloneAffixTarget" :offset="10" @change="standaloneAffixed=$event">
          <div class="standalone-affix-bar"><strong>Release approval</strong><UiTag :color="standaloneAffixed?'green':'gray'">{{ standaloneAffixed?'Pinned':'In flow' }}</UiTag><UiButton size="sm">Approve</UiButton></div>
        </UiAffix>
        <div class="standalone-affix-records"><span v-for="index in 6" :key="index">Verification record {{ index }}</span></div>
      </div>
    </UiCard>

    <UiCard title="Responsive resizable workspace">
      <UiSplitter v-model="standaloneSplitterSizes" :panels="standaloneSplitterPanels" lazy aria-label="Standalone resizable workspace" style="height:260px">
        <template #panel="{panel,size}"><div style="height:100%;padding:16px;display:grid;align-content:start;gap:8px;background:var(--bg-subtle)"><strong>{{ panel.label }}</strong><span style="color:var(--text-secondary);font-size:12px">{{ size.toFixed(1) }}% · Arrow keys / Home / End / Enter</span></div></template>
      </UiSplitter>
    </UiCard>


    <UiCard title="Semantic responsive list">
      <UiList v-model="standaloneListSelection" v-model:page="standaloneListPage" :items="standaloneListItems" item-key="id" selection-mode="multiple" bordered hoverable :grid="{columns:1,md:2,gap:12}" :pagination="{position:'end',compact:true}" :default-page-size="2" :page-size-options="[2,4]" aria-label="Standalone release records">
        <template #header><strong>Release readiness</strong><UiTag color="blue">{{ standaloneListSelection.length }} selected</UiTag></template>
        <template #extra="{item}"><UiTag :color="item.status==='Ready'?'green':'orange'">{{ item.status }}</UiTag></template>
        <template #footer>Arrow keys move; Space selects; pagination preserves source positions.</template>
      </UiList>
    </UiCard>

    <UiCard title="One-time verification code">
      <UiFormItem label="Release approval code" help="Paste, mobile autofill and keyboard movement are handled by the package component.">
        <UiOtpInput v-model="standaloneOtp" :length="6" separator="–" :separator-every="3" name="release-code" @complete="toast.success(`Code ${$event} completed`)" />
      </UiFormItem>
      <div style="margin-top:10px;color:var(--text-secondary);font-size:12px">Consumer model: {{ standaloneOtp || 'empty' }}</div>
    </UiCard>

    <UiCard title="Contextual mentions">
      <UiFormItem label="Release handoff" help="Type @ for reviewers or # for a release topic; the suggestion panel follows the caret.">
        <UiMentions v-model="standaloneMentions" :options="standaloneMentionOptions" :triggers="['@','#']" show-count maxlength="160" :auto-size="{minRows:3,maxRows:6}" @select="toast.success(`Inserted ${$event.label}`)" />
      </UiFormItem>
      <div style="margin-top:10px;color:var(--text-secondary);font-size:12px">Consumer model: {{ standaloneMentions }}</div>
    </UiCard>

    <UiCard title="Bulk capability tags">
      <UiFormItem label="Release capabilities" help="Enter, comma, semicolon and multiline paste share one typed validation contract.">
        <UiInputTag v-model="standaloneCapabilities" editable clearable :max-tags="8" :max-length="24" name="capabilities" @invalid="toast.error($event.message)" />
      </UiFormItem>
      <div style="margin-top:10px;color:var(--text-secondary);font-size:12px">Consumer model: {{ standaloneCapabilities.join(' · ') }}</div>
    </UiCard>

    <UiCard title="Composable release filters">
      <UiQueryBuilder v-model="standaloneQuery" :fields="standaloneQueryFields" show-not :max-depth="3" name="release-filters" aria-label="Standalone release filters" />
      <div style="margin-top:10px;color:var(--text-secondary);font-size:12px">Serializable model: {{ standaloneQuery.combinator.toUpperCase() }} · {{ standaloneQuery.rules.length }} entries</div>
    </UiCard>

    <UiCard title="Accessible release carousel">
      <UiCarousel v-model="standaloneCarouselIndex" :items="standaloneCarouselItems" height="240" indicators="lines" aria-label="Standalone release highlights">
        <template #item="{item,index}"><div class="carousel-demo-slide" :style="{'--carousel-start':item.start,'--carousel-end':item.end}"><small>Release assurance · {{ index+1 }}/{{ standaloneCarouselItems.length }}</small><strong>{{ item.title }}</strong><p>{{ item.description }}</p></div></template>
      </UiCarousel>
      <div style="margin-top:10px;color:var(--text-secondary);font-size:12px">Arrow keys, Home / End, controls and swipe update index {{ standaloneCarouselIndex+1 }}.</div>
    </UiCard>

    <UiCard title="Release QR code">
      <div style="display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:24px">
        <UiQRCode :value="standaloneQrValue" :status="standaloneQrStatus" level="H" color="#7C3AED" :size="176" downloadable download-name="consumer-release.svg" label="Consumer release QR code" caption="Release 1.55.0" @refresh="refreshStandaloneQr" @download="toast.success('Release QR downloaded')"/>
        <div style="display:grid;gap:12px;color:var(--text-secondary);font-size:13px;line-height:1.65"><strong style="color:var(--text-primary)">Typed package component</strong><span>Real SVG encoding, ECC H, expiry refresh, download and SSR are consumed directly from the package root.</span><div style="display:flex;gap:8px;flex-wrap:wrap"><UiButton size="sm" variant="outline" @click="standaloneQrStatus='expired'">Expire</UiButton><UiButton size="sm" variant="outline" @click="standaloneQrStatus='scanned'">Mark scanned</UiButton><UiButton size="sm" variant="text" @click="standaloneQrStatus='active'">Reset</UiButton></div><code>{{ standaloneQrStatus }} · revision {{ standaloneQrRevision }}</code></div>
      </div>
    </UiCard>

    <UiCard title="Asset barcode">
      <div style="display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);align-items:start;gap:24px">
        <UiBarcode :value="standaloneBarcodeValue" :status="standaloneBarcodeStatus" format="CODE128" color="#0F766E" :width="2" :height="78" downloadable download-name="consumer-asset.svg" label="Consumer asset barcode" caption="Release asset · CODE128" @refresh="refreshStandaloneBarcode" @download="toast.success('Asset barcode downloaded')"/>
        <div style="display:grid;gap:12px;color:var(--text-secondary);font-size:13px;line-height:1.65"><strong style="color:var(--text-primary)">Scanner-ready package component</strong><span>CODE128, EAN, UPC, ITF, MSI, Codabar and Pharmacode share one SSR-safe binary encoding, lifecycle and SVG export contract.</span><div style="display:flex;gap:8px;flex-wrap:wrap"><UiButton size="sm" variant="outline" @click="standaloneBarcodeStatus='expired'">Expire</UiButton><UiButton size="sm" variant="outline" @click="standaloneBarcodeStatus='scanned'">Mark scanned</UiButton><UiButton size="sm" variant="text" @click="standaloneBarcodeStatus='active'">Reset</UiButton></div><code>{{ standaloneBarcodeStatus }} · revision {{ standaloneBarcodeRevision }}</code></div>
      </div>
    </UiCard>

    <UiCard title="Automated release schedule">
      <div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);align-items:start;gap:24px">
        <UiFormItem label="Unix Cron" help="Presets, custom expressions and future UTC runs share a controlled string model"><UiCronEditor v-model="standaloneCron" from="2026-08-20T08:00:00Z" time-zone="UTC" name="release-schedule"/></UiFormItem>
        <div style="display:grid;gap:10px;color:var(--text-secondary);font-size:13px;line-height:1.65"><strong style="color:var(--text-primary)">Scheduler-ready form control</strong><code>{{ standaloneCron }}</code><span>Wildcard, list, range and step validation is packaged with accessible errors, SSR output and typed instance methods.</span></div>
      </div>
    </UiCard>

    <UiCard title="Request configuration">
      <div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);align-items:start;gap:24px">
        <UiFormItem label="Request headers" help="Controlled rows with unique-key validation and serializable names"><UiKeyValueEditor v-model="standaloneHeaders" name="headers" :max-rows="6" key-pattern="^[A-Za-z][A-Za-z0-9-]*$"/></UiFormItem>
        <div style="display:grid;gap:10px;color:var(--text-secondary);font-size:13px;line-height:1.65"><strong style="color:var(--text-primary)">Reusable configuration editor</strong><code>{{ standaloneHeaders.filter(item=>item.enabled).length }} enabled rows</code><span>Add, remove, reorder, toggle, validate and import dotenv-style values without consumer-side list orchestration.</span></div>
      </div>
    </UiCard>

    <UiCard title="Semantic release text">
      <UiTypography variant="title" :level="4" content="Release handoff" tone="primary" />
      <UiTypography v-model:content="standaloneReleaseNote" variant="paragraph" :ellipsis="{rows:2,expandable:true}" :editable="{trigger:'both',submitOnBlur:true}" copyable @copy="toast.success('Release note copied')" @edit-end="toast.success('Release note saved')" />
      <div style="display:flex;gap:8px;flex-wrap:wrap"><UiTypography content="RELEASE_TOKEN_2026" code copyable @copy="toast.success('Token copied')"/><UiTypography content="Ctrl + Enter" keyboard/></div>
    </UiCard>

    <UiCard id="standalone-overview" title="业务指标">
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

    <UiCard id="standalone-schema" title="Schema-driven workspace settings and reviewers">
      <UiSchemaForm :model="workspaceModel" :schema="workspaceSchema" show-error-summary @submit="toast.success('Schema form submitted')">
        <template #actions="{validating,errors}"><span style="color:var(--text-secondary);font-size:12px">{{ errors.length }} validation errors</span><UiButton type="submit" :loading="validating">Save workspace</UiButton></template>
      </UiSchemaForm>
    </UiCard>

    <UiCard id="standalone-upload" title="Release asset queue">
      <UiUpload v-model="releaseFiles" multiple accept=".json,.zip,.pdf" :max-count="4" :concurrency="2" :request="releaseUploadRequest" @success="payload=>toast.success(`${payload.file.name} uploaded`)" @upload-error="payload=>toast.error(String(payload.file.error||'Upload failed'))" />
    </UiCard>

    <UiCard title="交付进度"><UiSteps :items="steps" :current="created ? 3 : 2" /></UiCard>

    <UiCard title="Release calendar">
      <UiCalendar v-model="releaseWindow" selection-mode="range" view-date="2026-08-01" today="2026-08-12" show-week-numbers :disabled-date="date=>[0,6].includes(date.getUTCDay())" />
    </UiCard>

    <UiCard title="Release gallery">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
        <UiImage v-for="(source,index) in releaseImages" :key="source" :src="source" :alt="`Release asset ${index+1}`" preview :preview-list="releaseImages" :preview-index="index" style="width:100%;aspect-ratio:4/3"><template #caption>Package preview</template></UiImage>
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
    <UiCard title="资源权限树">
      <UiTree v-model="selectedResource" v-model:checked-keys="checkedResources" :data="resourceTree" :default-expanded-keys="['operations','settings']" checkable show-line bordered aria-label="独立项目资源权限" />
      <UiDescriptions style="margin-top:16px" bordered :columns="2" :items="[{label:'当前资源',value:selectedResource},{label:'已授权',value:checkedResources.join(', ')}]" />
    </UiCard>
    <UiCard title="全局安装与局部配置">
      <UiSegmented v-model="locale" :options="[{label:'中文',value:'zh-CN'},{label:'English',value:'en-US'}]" />
      <UiSegmented v-model="direction" :options="[{label:'LTR',value:'ltr'},{label:'RTL',value:'rtl'}]" />
      <UiSegmented v-model="appearance" :options="[{label:'Light',value:'light'},{label:'Dark',value:'dark'},{label:'System',value:'system'}]" />
      <UiSegmented v-model="motion" :options="[{label:'Full motion',value:'full'},{label:'Reduced',value:'reduced'},{label:'System motion',value:'system'}]" />
      <UiConfigProvider :locale="locale" :direction="direction" :appearance="appearance" :motion="motion" :theme="appearance==='dark'?standaloneTheme:{'brand-600':'#2563EB'}" size="sm" density="compact">
        <div style="margin-top:16px;display:grid;gap:12px">
          <UiDateRangePicker v-model="deliveryRange" />
          <UiDateTimePicker v-model="standalonePublishAt" :step="900" aria-label="Standalone publish time" />
          <UiDateTimeRangePicker v-model="standaloneReleaseWindow" :step="900" aria-label="Standalone release window" />
          <UiTimeRangePicker v-model="serviceWindow" :step="900" min="08:00" max="22:00" />
          <UiButton>{{ locale==='en-US'?'Create delivery':'创建交付计划' }}</UiButton>
          <UiColorPicker v-model="brandColor" alpha show-contrast :presets="['#1677FF','#7C3AED','#10B981']" aria-label="Scoped tenant color" />
          <UiTag color="purple">{{ appearance }} / {{ motion }}</UiTag>
        </div>
      </UiConfigProvider>
    </UiCard>
    <UiTour v-model="standaloneTourOpen" v-model:current="standaloneTourCurrent" :steps="standaloneTourSteps" aria-label="Standalone application tour" />
    <UiToastHost />
  </main>
</template>

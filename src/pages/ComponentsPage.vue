<script setup>
import { computed, reactive, ref } from 'vue'
import { useReducedMotion } from '../motion.js'
import AppIcon from '../components/AppIcon.vue'
import UiIcon from '../components/UiIcon.vue'
import UiImage from '../components/UiImage.vue'
import UiButton from '../components/UiButton.vue'
import UiCalendar from '../components/UiCalendar.vue'
import UiCard from '../components/UiCard.vue'
import UiCarousel from '../components/UiCarousel.vue'
import UiBarcode from '../components/UiBarcode.vue'
import UiQRCode from '../components/UiQRCode.vue'
import UiInput from '../components/UiInput.vue'
import UiInputTag from '../components/UiInputTag.vue'
import UiKeyValueEditor from '../components/UiKeyValueEditor.vue'
import UiQueryBuilder from '../components/UiQueryBuilder.vue'
import UiNumberInput from '../components/UiNumberInput.vue'
import UiOtpInput from '../components/UiOtpInput.vue'
import UiMentions from '../components/UiMentions.vue'
import UiSlider from '../components/UiSlider.vue'
import UiRate from '../components/UiRate.vue'
import UiSelect from '../components/UiSelect.vue'
import UiAutoComplete from '../components/UiAutoComplete.vue'
import UiTag from '../components/UiTag.vue'
import UiTextarea from '../components/UiTextarea.vue'
import UiDatePicker from '../components/UiDatePicker.vue'
import UiDateTimePicker from '../components/UiDateTimePicker.vue'
import UiDateTimeRangePicker from '../components/UiDateTimeRangePicker.vue'
import UiTimePicker from '../components/UiTimePicker.vue'
import UiTimeRangePicker from '../components/UiTimeRangePicker.vue'
import UiPagination from '../components/UiPagination.vue'
import UiUpload from '../components/UiUpload.vue'
import UiFloatButton from '../components/UiFloatButton.vue'
import UiTable from '../components/UiTable.vue'
import UiListToolbar from '../components/UiListToolbar.vue'
import UiFormItem from '../components/UiFormItem.vue'
import UiFormList from '../components/UiFormList.vue'
import UiSchemaForm from '../components/UiSchemaForm.vue'
import UiCheckbox from '../components/UiCheckbox.vue'
import UiRadio from '../components/UiRadio.vue'
import UiSwitch from '../components/UiSwitch.vue'
import UiTooltip from '../components/UiTooltip.vue'
import UiPopover from '../components/UiPopover.vue'
import UiPopconfirm from '../components/UiPopconfirm.vue'
import UiLayout from '../components/UiLayout.vue'
import UiList from '../components/UiList.vue'
import UiGrid from '../components/UiGrid.vue'
import UiCol from '../components/UiCol.vue'
import UiSpace from '../components/UiSpace.vue'
import UiDivider from '../components/UiDivider.vue'
import UiTabs from '../components/UiTabs.vue'
import UiPageHeader from '../components/UiPageHeader.vue'
import UiBreadcrumb from '../components/UiBreadcrumb.vue'
import UiAvatar from '../components/UiAvatar.vue'
import UiBadge from '../components/UiBadge.vue'
import UiSkeleton from '../components/UiSkeleton.vue'
import UiEmpty from '../components/UiEmpty.vue'
import UiAlert from '../components/UiAlert.vue'
import UiAffix from '../components/UiAffix.vue'
import UiAnchor from '../components/UiAnchor.vue'
import UiDropdown from '../components/UiDropdown.vue'
import UiProgress from '../components/UiProgress.vue'
import UiSteps from '../components/UiSteps.vue'
import UiTimeline from '../components/UiTimeline.vue'
import UiForm from '../components/UiForm.vue'
import UiMultiSelect from '../components/UiMultiSelect.vue'
import UiTree from '../components/UiTree.vue'
import UiTreeSelect from '../components/UiTreeSelect.vue'
import UiCascader from '../components/UiCascader.vue'
import UiTransfer from '../components/UiTransfer.vue'
import UiCollapse from '../components/UiCollapse.vue'
import UiCronEditor from '../components/UiCronEditor.vue'
import UiColorPicker from '../components/UiColorPicker.vue'
import UiCommandPalette from '../components/UiCommandPalette.vue'
import UiConfigProvider from '../components/UiConfigProvider.vue'
import UiDateRangePicker from '../components/UiDateRangePicker.vue'
import UiDataGrid from '../components/UiDataGrid.vue'
import UiDescriptions from '../components/UiDescriptions.vue'
import UiMenu from '../components/UiMenu.vue'
import UiResult from '../components/UiResult.vue'
import UiStatusPage from '../components/UiStatusPage.vue'
import UiVirtualList from '../components/UiVirtualList.vue'
import UiSegmented from '../components/UiSegmented.vue'
import UiSpin from '../components/UiSpin.vue'
import UiSplitter from '../components/UiSplitter.vue'
import UiStatistic from '../components/UiStatistic.vue'
import UiTour from '../components/UiTour.vue'
import UiTypography from '../components/UiTypography.vue'
import UiWatermark from '../components/UiWatermark.vue'
import { createLocaleRegistry, createLocaleTools } from '../config.js'
import { formatDateValue } from '../date.js'
import { getContrastRatio } from '../color.js'
import { createIconRegistry } from '../icons.js'
import { notification, toast } from '../feedback.js'
import { darkTheme, defineTheme } from '../theme.js'
const emit=defineEmits(['notify','open-modal','open-drawer','open-notification'])
const reducedMotion=useReducedMotion()
const toc=[['tokens','Design Tokens'],['typography','字体与间距'],['layout','布局规范'],['buttons','Button 按钮'],['forms','表单控件'],['data','数据展示'],['maturity','通用补充'],['configuration','全局配置'],['floating','悬浮按钮'],['feedback','反馈与浮层'],['states','交互状态']]
const anchorItems=toc.map(([key,title])=>({key,href:`#${key}`,title}))
const current=ref('tokens');const switchOn=ref(true);const demoTab=ref('概览');const loading=ref(false);const invalid=ref(false)
const cardSelected=ref(false)
const tagChecked=ref(false);const tagVisible=ref(true);const tagState=ref('等待标签交互')
const timelineSelection=ref('review');const timelineState=ref('等待时间轴交互')
const configPortalOpen=ref(false)
const statusPageDemo=ref('403')
const tourOpen=ref(false);const tourCurrent=ref(0)
const affixContainerRef=ref(null);const affixPosition=ref('top');const affixActive=ref(false)
const splitterRef=ref(null);const splitterDirection=ref('horizontal');const splitterSizes=ref([24,48,28]);const splitterPanels=[{key:'navigation',label:'Navigation',defaultSize:'24%',min:'14%',max:'38%',collapsible:true},{key:'workspace',label:'Workspace',min:'26%'},{key:'inspector',label:'Inspector',defaultSize:'28%',min:'16%',max:'42%',collapsible:true}]
const typographyContent=ref('Lan UI 的文本组件把标题、正文、复制、行数省略与就地编辑收敛为同一份可访问的语义契约，适合项目说明、配置值、发布记录与帮助内容。')
const typographyStatus=ref('Ready')
const tourSteps=[
  {target:'#component-tour-search',title:'搜索组件',description:'可以从组件名称或交互关键词开始定位。',placement:'bottom-start'},
  {target:'#component-tour-preview',title:'预览真实状态',description:'用例覆盖默认、键盘、加载、空状态与错误状态。',placement:'bottom'},
  {target:'#component-tour-api',title:'检查组件契约',description:'继续查看自动生成的 Props、Events 与 Slots 文档。',placement:'bottom-end'},
]
const customerName=ref('');const customerType=ref('');const searchableType=ref('');const passwordDemo=ref('LanUI2026');const notes=ref('');const toastPlacement=ref('top-center')
const tooltipDemoOpen=ref(false);const tooltipState=ref('等待 Tooltip 交互');const popoverState=ref('等待 Popover 交互')
const cityDemo=ref('');const strictCityDemo=ref('shanghai');const remoteProjectDemo=ref('')
const cityOptions=[
  {label:'北京',value:'beijing',description:'华北区域',keywords:['北京','Beijing','BJ']},
  {label:'上海',value:'shanghai',description:'华东区域',keywords:['上海','Shanghai','SH']},
  {label:'杭州',value:'hangzhou',description:'华东区域',keywords:['杭州','Hangzhou','HZ']},
  {label:'深圳',value:'shenzhen',description:'华南区域',keywords:['深圳','Shenzhen','SZ']},
]
async function fetchProjectSuggestions(query,{signal}){
  await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,360);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})
  return ['Design System','Admin Portal','Analytics Center','AI Workspace'].filter(item=>item.toLowerCase().includes(query.toLowerCase())).map((label,index)=>({label,value:`remote-${index}-${label.toLowerCase().replaceAll(' ','-')}`,description:'异步结果'}))
}
const quantityDemo=ref(12.5);const budgetDemo=ref(286400);const percentDemo=ref(68);const otpDemo=ref('204');const mentionsDemo=ref('请 @design 复核 #release 交付内容。');const inputTagDemo=ref(['Vue 3','Design System','Accessibility']);const inputTagCollapsed=ref(['Vue','TypeScript','Vite','Vitest','Playwright'])
const mentionsOptions=[{label:'设计负责人',value:'design',description:'Design system owner',trigger:'@',keywords:['designer']},{label:'前端负责人',value:'frontend',description:'Component implementation',trigger:'@'},{label:'质量负责人',value:'qa',description:'Accessibility and regression',trigger:'@'},{label:'Release',value:'release',description:'发布与制品验证',trigger:'#'},{label:'Accessibility',value:'a11y',description:'WCAG 2.2 检查',trigger:'#'}]
const queryBuilderRef=ref(null)
const queryFields=[{key:'name',label:'组件名称',type:'text',defaultOperator:'contains'},{key:'team',label:'负责团队',type:'select',options:['Forms','Data','Navigation','Foundation']},{key:'coverage',label:'覆盖场景',type:'number',min:0,max:100},{key:'status',label:'成熟度',type:'select',options:[{label:'稳定',value:'stable'},{label:'复核中',value:'review'}]},{key:'updated',label:'更新时间',type:'date'}]
const queryDemo=ref({combinator:'and',rules:[{field:'status',operator:'equals',value:'stable'},{field:'coverage',operator:'between',value:80,value2:100},{combinator:'or',rules:[{field:'team',operator:'in',value:['Forms','Data']},{field:'name',operator:'contains',value:'Input'}]}]})
const cronDemo=ref('0 9 * * 1-5')
const keyValueEditorRef=ref(null)
const keyValueDemo=ref([{id:'accept',key:'Accept',value:'application/json',enabled:true},{id:'trace',key:'X-Trace-Id',value:'release-42',enabled:true},{id:'debug',key:'X-Debug',value:'false',enabled:false}])
const queryRows=[{name:'InputTag',team:'Forms',coverage:96,status:'stable',updated:'2026-08-15'},{name:'DataGrid',team:'Data',coverage:94,status:'stable',updated:'2026-08-12'},{name:'Tree',team:'Navigation',coverage:88,status:'stable',updated:'2026-08-09'},{name:'LegacyTable',team:'Data',coverage:62,status:'review',updated:'2026-07-30'}]
const queryMatchCount=computed(()=>{void queryDemo.value;return queryBuilderRef.value?queryRows.filter(row=>queryBuilderRef.value.matches(row)).length:0})
const sliderDemo=ref(40);const sliderRangeDemo=ref([20,80]);const verticalSliderDemo=ref(65)
const serviceRateDemo=ref(3.5);const customRateDemo=ref(4)
const brandColorDemo=ref('#1677FFCC');const accentColorDemo=ref('hsl(155, 75%, 38%)');const colorContrast=computed(()=>getContrastRatio(brandColorDemo.value,'#FFFFFF')?.toFixed(2)||'—')
const uploadDemoAttempts=new Map()
function uploadDemoRequest({file,signal,onProgress}){
  const name=file?.name||'asset';const attempt=(uploadDemoAttempts.get(name)||0)+1;uploadDemoAttempts.set(name,attempt)
  return new Promise((resolve,reject)=>{let percent=0;const timer=setInterval(()=>{percent+=20;onProgress(percent);if(percent<100)return;clearInterval(timer);if(name.toLowerCase().includes('error')&&attempt===1)reject(new Error('Upload failed once; retry is available'));else resolve({url:`/uploads/${encodeURIComponent(name)}`,attempt})},160);signal.addEventListener('abort',()=>{clearInterval(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})
}
const formatCurrency=value=>`\u00a5${Number(value).toLocaleString('zh-CN',{minimumFractionDigits:0,maximumFractionDigits:0})}`
const parseCurrency=text=>String(text).replace(/[\u00a5,\s]/g,'')
const demoDate=ref('2026-08-11');const calendarDemo=ref('2026-08-12');const calendarRangeDemo=ref(['2026-08-10','2026-08-16']);const demoTime=ref('09:30');const demoTimeRange=ref(['09:00','17:30']);const demoDateTime=ref('2026-08-11T14:30');const demoDateTimeRange=ref(['2026-08-11T09:00','2026-08-11T18:00']);const zonedInstant=ref(new Date('2026-08-11T06:30:00.000Z'));const demoTimeZone=ref('Asia/Shanghai');const demoFiles=ref([{id:'release-guide',name:'lan-ui-upload-guide.pdf',size:186368,status:'success',percent:100,response:{url:'/uploads/lan-ui-upload-guide.pdf'}}])
const zonedPreview=computed(()=>formatDateValue(zonedInstant.value,{mode:'datetime',timeZone:'UTC',precision:'second'}))
const demoPage=ref(3);const demoPageSize=ref(10);const floatDemoOpen=ref(false)
const checkboxDemo=ref(['邮件通知']);const radioDemo=ref('标准版');const popoverDemoOpen=ref(false);const dropdownDemoOpen=ref(false);const dropdownActiveIndex=ref(-1);const dropdownState=ref('等待 Dropdown 交互')
const dropdownShowcaseItems=[
  {type:'heading',label:'工作区操作'},
  {key:'edit',label:'编辑资料',icon:'edit',description:'更新客户基础信息'},
  {key:'copy',label:'复制链接',icon:'copy',shortcut:'⌘ C'},
  {key:'pin',label:'固定到顶部',role:'menuitemcheckbox',checked:true},
  {key:'archive',label:'归档项目',disabled:true,description:'当前项目仍有未完成任务'},
  {divider:true},
  {key:'disable',label:'停用账号',icon:'alert',danger:true},
]
const formRef=ref(null);const validatedForm=reactive({customer:{name:'',email:'',password:'LanUI-2026',confirm:'LanUI-2026'},contacts:[{name:'李明',email:'li@example.com'}]});const validationRules={customer:{name:[{required:true,message:'请输入客户名称'},{min:2,message:'客户名称至少 2 个字符'}],email:[{required:true,message:'请输入企业邮箱'},{type:'email',message:'请输入有效的企业邮箱'}]}}
const schemaFormRef=ref(null)
const schemaFormModel=reactive({account:{type:'business',name:'Lan UI 工作区',email:'owner@example.com'},region:'east',taxId:'',schedule:{dailyWindow:['09:00','18:00'],publishAt:'2026-08-20T10:00'},capabilities:['design-system','admin'],filters:{combinator:'and',rules:[{field:'status',operator:'equals',value:'stable'}]},contacts:[{role:'owner',name:'李明',email:'li@example.com'},{role:'reviewer',name:'王敏',email:'wang@example.com'}]})
const schemaFormDefinition=[{
  key:'workspace',title:'工作区配置',description:'字段、布局、条件显隐与校验均由 Schema 声明。',columns:2,fields:[
    {name:'account.type',label:'账户类型',type:'segmented',options:[{label:'企业',value:'business'},{label:'个人',value:'personal'}],props:{block:true},span:2},
    {name:'account.name',label:'工作区名称',required:true,rules:[{required:true,message:'请输入工作区名称'},{min:2,message:'至少输入 2 个字符'}],props:{clearable:true,placeholder:'请输入工作区名称'}},
    {name:'account.email',label:'管理员邮箱',required:true,rules:[{required:true,message:'请输入管理员邮箱'},{type:'email',message:'请输入有效邮箱'}],props:{clearable:true,placeholder:'owner@example.com'}},
    {name:'region',label:'业务区域',type:'select',options:[{label:'华东区域',value:'east'},{label:'华南区域',value:'south'},{label:'海外区域',value:'global'}],props:{clearable:true,searchable:true}},
    {name:'schedule.publishAt',label:'发布时间',type:'datetime',props:{step:60}},
    {name:'schedule.dailyWindow',label:'每日服务时段',type:'time-range',props:{step:900},span:2},
    {name:'capabilities',label:'能力标签',type:'input-tag',span:2,help:'Schema 内置 input-tag 字段，支持回车、分隔符和整段粘贴。',props:{editable:true,clearable:true,maxTags:6}},
    {name:'filters',label:'发布筛选策略',type:'query-builder',span:2,help:'Schema 内置 query-builder 字段，直接输出可序列化的递归条件树。',props:{fields:queryFields,compact:true,showNot:true,maxDepth:2}},
    {name:'taxId',label:'企业税号',visible:model=>model.account.type==='business',required:model=>model.account.type==='business',dependencies:['account.type'],rules:[{required:true,message:'企业账户需填写税号'}],props:{placeholder:'请输入统一社会信用代码'}},
    {key:'contacts',name:'contacts',type:'list',label:'管理员与审核人',help:'Schema 原生编排可重复字段组，包含稳定键、相对依赖、校验和增删排序。',min:1,max:4,columns:3,defaultValue:({index})=>({role:index?'reviewer':'owner',name:'',email:''}),itemLabel:(_model,{index,item})=>`${index+1}. ${item.name||'新联系人'}`,removable:(_model,{item})=>item.role!=='owner',fields:[
      {name:'role',label:'角色',type:'select',options:[{label:'所有者',value:'owner'},{label:'审核人',value:'reviewer'}],dependencies:['name']},
      {name:'name',label:'姓名',required:true,rules:[{required:true,message:'请输入联系人姓名'}],props:{clearable:true,placeholder:'请输入姓名'}},
      {name:'email',label:'邮箱',required:true,rules:[{required:true,message:'请输入联系人邮箱'},{type:'email',message:'请输入有效邮箱'}],props:(_model,{index})=>({clearable:true,placeholder:`contact-${index+1}@example.com`})},
    ]},
  ],
}]
const schemaFormChange=ref('等待编辑')
const multiDemo=ref(['华东区域']);const treeDemo=ref('hangzhou');const cascaderDemo=ref(['zhejiang','hangzhou']);const transferDemo=ref(['api'])
const resourceTreeFilter=ref('');const resourceTreeSelection=ref('design');const resourceTreeChecked=ref(['design'])
const resourceTreeData=[
  {label:'产品工作区',value:'workspace',icon:'layers',children:[
    {label:'设计系统',value:'design',icon:'palette'},
    {label:'研发项目',value:'engineering',icon:'file',children:[{label:'Web 管理后台',value:'admin'},{label:'移动端应用',value:'mobile'}]},
    {label:'归档资料',value:'archive',icon:'folder',disabled:true},
  ]},
  {label:'数据中心',value:'data-center',icon:'table',isLeaf:false},
]
async function loadResourceTree(node,{signal}){
  await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,420);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})
  return node.value==='data-center'?[{label:'经营看板',value:'dashboard',isLeaf:true},{label:'客户分析',value:'customer-analysis',isLeaf:true}]:[]
}
const menuDemo=ref('overview');const collapseDemo=ref(['guideline']);const collapseAccordion=ref('guideline');const collapseState=ref('等待 Collapse 交互');const segmentedDemo=ref('week');const spinDemo=ref(false)
const commandPaletteOpen=ref(false);const commandPaletteQuery=ref('');const commandPaletteSelection=ref('尚未执行')
const commandPaletteCommands=[
  {key:'dashboard',label:'打开数据看板',description:'查看核心经营指标',group:'导航',icon:'home',keywords:['首页','dashboard'],shortcut:['G','D']},
  {key:'components',label:'进入组件中心',description:'浏览组件 API 与交互用例',group:'导航',icon:'layers',keywords:['design system','component']},
  {key:'theme',label:'切换深色主题',description:'更改当前界面的明暗主题',group:'外观',icon:'palette',keywords:['dark','theme'],shortcut:['T']},
  {key:'create',label:'新建业务项目',description:'创建新的后台项目空间',group:'操作',icon:'plus',keywords:['new','project']},
  {key:'archive',label:'归档当前项目',description:'此操作需要项目管理员权限',group:'操作',icon:'folder',disabled:true},
]
function runPaletteCommand(command){commandPaletteSelection.value=command.label;emit('notify',`已执行：${command.label}`)}
const iconDemoNames=['home','search','calendar','clock','bell','upload','download','filter','checkCircle','alert','info','settings']
const iconDemoRegistry=createIconRegistry({tenantMark:'<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="m7 9 5 3 5-3M12 12v6"/>'})
const configLocale=ref('en-US');const configSize=ref('sm');const configDensity=ref('compact');const configAppearance=ref('system');const configMotion=ref('system');const rangeDemo=ref(['2026-08-01','2026-08-11']);const rangeError=ref('')
const tenantTheme=defineTheme({name:'tenant-violet',appearance:'dark',tokens:{'brand-600':'#7c3aed','brand-text':'#c4b5fd'}})
const tenantLightTheme=defineTheme({name:'tenant-light',appearance:'light',tokens:{'brand-600':'#2563eb'}})
const configTheme=computed(()=>configAppearance.value==='dark'?tenantTheme:configAppearance.value==='light'?tenantLightTheme:{name:'tenant-system',appearance:'light',tokens:{'brand-600':'#2563eb'}})
const themePresetSummary=computed(()=>configAppearance.value==='dark'?`${darkTheme.name} + tenant-violet`:`${configAppearance.value} + scoped tokens`)
const intlLocale=ref('en-US');const intlCount=ref(1200)
const intlMessages={
  'zh-CN':{one:'{count} 项',other:'{count} 项'},
  'en-US':{one:'{count} item',other:'{count} items'},
  'ar-EG':{zero:'لا عناصر',one:'عنصر واحد',two:'عنصران',few:'{count} عناصر',many:'{count} عنصرًا',other:'{count} عنصر'},
}
const intlTools=computed(()=>createLocaleTools({name:intlLocale.value,messages:{'demo.items':intlMessages[intlLocale.value]}},'en-US'))
const intlSamples=computed(()=>[
  ['Number',intlTools.value.formatNumber(1234567.89,{maximumFractionDigits:2})],
  ['Currency',intlTools.value.formatNumber(286400,{style:'currency',currency:'CNY',maximumFractionDigits:0})],
  ['Date',intlTools.value.formatDate('2026-08-12T00:00:00Z',{dateStyle:'medium',timeZone:'UTC'})],
  ['Relative',intlTools.value.formatRelativeTime(-1,'day',{numeric:'auto'})],
  ['List',intlTools.value.formatList(['Design','Code','QA'])],
  ['Plural',intlTools.value.tc('demo.items',intlCount.value)],
])
const localeRegistryDemo=createLocaleRegistry()
const registryLocale=ref('en-US');const registryLoading=ref(false);const registryStatus=ref('内置 2 个语言包')
const registryTools=computed(()=>createLocaleTools(registryLocale.value,['fr-FR','en-US'],localeRegistryDemo))
const registryPreview=computed(()=>`${registryTools.value.t('demo.greeting')} · ${registryTools.value.t('empty.title')}`)
async function loadFrenchLocale(){
  registryLoading.value=true;registryStatus.value='正在异步加载 fr-FR…'
  await localeRegistryDemo.load('fr-FR',async()=>{
    await new Promise(resolve=>setTimeout(resolve,360))
    return {default:{name:'fr-FR',messages:{'demo.greeting':'Bonjour, Lan UI'}}}
  },{aliases:'fr'})
  registryLocale.value='fr';registryLoading.value=false
  registryStatus.value=`已注册 ${localeRegistryDemo.list().length} 个语言包 · 并发请求自动去重`
}
const menuItems=[{key:'overview',label:'项目总览',icon:'home'},{key:'resources',label:'资源管理',icon:'layers',children:[{key:'components',label:'组件清单',badge:89},{key:'tokens',label:'设计 Token'}]},{key:'disabled',label:'已停用入口',icon:'file',disabled:true}]
const collapseItems=[{key:'guideline',label:'使用规范',content:'优先复用现有组件和语义 Token，业务层只负责组合，不复制基础交互。',extra:'必读'},{key:'accessibility',label:'无障碍要求',content:'所有面板均使用标题按钮与关联 Region；Arrow、Home、End 可在标题间移动焦点。',extra:'WCAG'},{key:'release',label:'发布流程',content:'变更需要经过单测、契约、构建和业务页面回归。',extra:'异步检查'},{key:'locked',label:'已锁定规范',content:'停用项目不会进入键盘导航。',disabled:true}]
async function validateCollapseToggle(item,open){if(item.key==='release'&&open){collapseState.value='正在校验发布面板…';await new Promise(resolve=>setTimeout(resolve,420))}return true}
const descriptionItems=[{key:'name',label:'本轮能力',value:'Collapse P67 · Dropdown P66 · Popover P65 · Tooltip P64 · Breadcrumb P63 · Steps P62 · Timeline P61 · Tag P60 · Card P59 · PageHeader P58'},{key:'version',label:'版本',value:'1.63.0'},{key:'status',label:'状态',value:'稳定'},{key:'owner',label:'负责团队',value:'设计系统组'},{key:'updated',label:'更新日期',value:'2026-08-22'},{key:'coverage',label:'覆盖范围',value:'89 个公开组件 · Collapse 受控/非受控、手风琴、键盘、懒渲染、销毁、异步守卫、动效降级、插槽、ARIA、RTL、SSR、类型、视觉、无障碍、跨浏览器及隔离 tarball 消费回归'}]
const demoImage=(label,from,to)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="420" rx="28" fill="url(#g)"/><circle cx="500" cy="90" r="96" fill="white" opacity=".12"/><path d="M0 345 170 190l110 92 92-76 268 214H0Z" fill="white" opacity=".18"/><text x="38" y="64" fill="white" font-family="Arial,sans-serif" font-size="26" font-weight="700">${label}</text><text x="38" y="96" fill="white" opacity=".78" font-family="Arial,sans-serif" font-size="15">Lan UI · release gallery</text></svg>`)}`
const imageGallery=[demoImage('Design audit','#2563eb','#0f766e'),demoImage('Component review','#7c3aed','#db2777'),demoImage('Release ready','#0f766e','#ca8a04')]
const carouselRef=ref(null);const carouselIndex=ref(0);const carouselEffect=ref('slide');const carouselAutoplay=ref(false);const carouselStatus=ref('等待交互')
const qrStatus=ref('expired');const qrRevision=ref(1);const qrValue=computed(()=>`https://lan-ui.example/release/1.63.0?revision=${qrRevision.value}`)
function refreshQrCode(){qrRevision.value+=1;qrStatus.value='active';toast.success('二维码已刷新')}
const barcodeStatus=ref('expired');const barcodeRevision=ref(1);const barcodeValue=computed(()=>`LAN-UI-163-R${barcodeRevision.value}`)
function refreshBarcode(){barcodeRevision.value+=1;barcodeStatus.value='active';toast.success('条形码已刷新')}
const carouselItems=[
  {key:'contract',eyebrow:'Component contract',title:'统一运行时与类型接口',description:'Props、Events、Slots、SSR 与组件子路径保持一致。',start:'#1d4ed8',end:'#0891b2'},
  {key:'interaction',eyebrow:'Interaction quality',title:'键盘、触控与自动播放',description:'逻辑方向键、滑动手势、悬停与焦点暂停遵循同一状态机。',start:'#6d28d9',end:'#db2777'},
  {key:'release',eyebrow:'Release confidence',title:'真实浏览器回归后交付',description:'视觉、Axe、三浏览器交互、独立安装和回滚均作为发布门禁。',start:'#047857',end:'#ca8a04'},
]
const gridQuery=ref('');const gridPage=ref(1);const gridPageSize=ref(10);const gridFilters=ref({});const gridSortKey=ref('name');const gridSortOrder=ref('asc');const gridSelected=ref([]);const gridExpanded=ref([]);const gridDensity=ref('default');const gridVisibleColumns=ref(['name','team','status','score'])
const gridColumns=[{key:'name',label:'Component',sortable:true,minWidth:'180px'},{key:'team',label:'Owner',sortable:true,minWidth:'130px'},{key:'status',label:'Status',filterable:true,filterOptions:['Stable','Review'],minWidth:'110px'},{key:'score',label:'Coverage',sortable:true,width:'110px',align:'right'}]
const gridRows=Array.from({length:88},(_,index)=>({id:`GRID-${String(index+1).padStart(3,'0')}`,name:['Button','DataGrid','Calendar','Tree','Upload','VirtualList','CronEditor','KeyValueEditor'][index%8]+` ${index+1}`,team:['Forms','Data','Navigation'][index%3],status:index%5===0?'Review':'Stable',score:72+(index*7)%29,updated:`2026-08-${String(1+index%12).padStart(2,'0')}`}))
const virtualSelection=ref('virtual-3')
const virtualItems=Array.from({length:1000},(_,index)=>({id:`virtual-${index}`,name:`Component audit #${String(index+1).padStart(4,'0')}`,owner:['Design','Frontend','QA'][index%3],status:index%7===0?'Review':'Ready',detail:index%5===0?'Variable-height note: token and keyboard contracts included.':''}))
const virtualItemSize=item=>item.detail?68:52
const listSelection=ref(['list-api']);const listPage=ref(1)
const listItems=[
  {id:'list-api',name:'组件 API 审计',description:'核对 Props、Events、Slots 与公开子路径',owner:'Frontend',status:'Ready'},
  {id:'list-visual',name:'响应式视觉回归',description:'检查网格分栏、暗色与 RTL 布局',owner:'Design',status:'Ready'},
  {id:'list-a11y',name:'无障碍语义',description:'ARIA 位置、选择状态与 WCAG 2.2 检查',owner:'QA',status:'Review'},
  {id:'list-release',name:'发布产物验证',description:'检查 tarball 安装、SSR 和独立项目构建',owner:'Release',status:'Ready'},
  {id:'list-legacy',name:'历史组件迁移',description:'该任务已归档，仅保留查看',owner:'Platform',status:'Archived',disabled:true},
  {id:'list-docs',name:'使用文档同步',description:'更新迁移说明和组件用例',owner:'Docs',status:'Ready'},
]
const advancedOptions=['华东区域','华南区域','华北区域','西南区域','海外区域'];const treeOptions=[{label:'浙江省',value:'zhejiang',children:[{label:'杭州市',value:'hangzhou'},{label:'宁波市',value:'ningbo'}]},{label:'江苏省',value:'jiangsu',children:[{label:'南京市',value:'nanjing'},{label:'苏州市',value:'suzhou'}]}];const cascaderOptions=[{label:'浙江省',value:'zhejiang',children:[{label:'杭州市',value:'hangzhou',children:[{label:'西湖区',value:'xihu'},{label:'滨江区',value:'binjiang'}]},{label:'宁波市',value:'ningbo'}]},{label:'江苏省',value:'jiangsu',children:[{label:'南京市',value:'nanjing'}]}];const transferOptions=[{label:'组件 API',value:'api'},{label:'交互规范',value:'interaction'},{label:'无障碍规范',value:'a11y'},{label:'视觉 Token',value:'token'},{label:'业务模板',value:'template'}]
const stepsCurrent=ref(1);const stepsState=ref('当前步骤：组件实现')
const breadcrumbExpanded=ref(false);const breadcrumbState=ref('当前路径：组件 / 导航 / Breadcrumb')
const breadcrumbItems=[{key:'home',label:'首页',href:'#tokens',icon:'home'},{key:'design',label:'设计系统',href:'#foundations'},{key:'components',label:'组件',href:'#data'},{key:'navigation',label:'导航组件',href:'#maturity'},{key:'breadcrumb',label:'Breadcrumb',href:'#maturity'},{key:'contract',label:'成熟契约'}]
const stepItems=[{key:'foundation',title:'基础规范',subtitle:'已完成',description:'Token 与布局'},{key:'components',title:'组件实现',subtitle:'进行中',description:'状态与交互'},{key:'review',title:'业务验收',subtitle:'待处理',description:'页面回归',disabled:true},{key:'release',title:'发布交付',subtitle:'待处理',description:'制品与回滚'}]
const timelineItems=[
  {key:'audit',title:'完成组件审计',description:'运行时、类型与旧用法保持兼容',time:'09:30',datetime:'2026-08-20T09:30:00+08:00',status:'success',icon:'check'},
  {key:'review',title:'同步业务页面',description:'组件中心与独立项目共享同一契约',time:'11:20',datetime:'2026-08-20T11:20:00+08:00',status:'warning'},
  {key:'visual',title:'执行视觉回归',description:'覆盖暗色、RTL 与响应式布局',time:'14:00',datetime:'2026-08-20T14:00:00+08:00',status:'info',current:true},
  {key:'release',title:'发布版本',description:'等待三浏览器与消费包门禁',time:'16:30',datetime:'2026-08-20T16:30:00+08:00',disabled:true},
]
const tableDensity=ref('default');const tableVisibleColumns=ref(['component','version','status','coverage','actions']);const tableSelected=ref([]);const tableExpanded=ref([]);const tableSortKey=ref('component');const tableSortOrder=ref('asc');const tableFilters=ref({});const tableLoading=ref(false);const tableError=ref('');const tableEmpty=ref(false)
const tableColumns=[{key:'component',label:'组件',minWidth:'160px',sortable:true},{key:'version',label:'版本',minWidth:'90px'},{key:'status',label:'状态',minWidth:'110px',filterable:true,filterOptions:['稳定','测试中']},{key:'coverage',label:'覆盖场景',minWidth:'110px',sortable:true},{key:'actions',label:'操作',width:'90px',align:'right',configurable:false,resizable:false}]
const tableRows=[{id:'CMP-001',component:'Button',version:'1.2.0',status:'稳定',coverage:18,owner:'交互组件组',updated:'2026-08-11'},{id:'CMP-002',component:'Table',version:'1.0.0',status:'稳定',coverage:12,owner:'数据组件组',updated:'2026-08-11'},{id:'CMP-003',component:'DatePicker',version:'1.0.0',status:'测试中',coverage:8,owner:'表单组件组',updated:'2026-08-10'},{id:'CMP-004',component:'Upload',version:'1.28.0',status:'稳定',coverage:16,owner:'表单组件组',updated:'2026-08-13'}]
const renderedTableColumns=computed(()=>tableColumns.map(column=>({...column,hidden:!tableVisibleColumns.value.includes(column.key)})))
const renderedTableRows=computed(()=>{if(tableEmpty.value)return [];let rows=tableRows.filter(row=>Object.entries(tableFilters.value).every(([key,value])=>!value||row[key]===value));if(!tableSortKey.value||!tableSortOrder.value)return rows;return [...rows].sort((a,b)=>{const left=a[tableSortKey.value],right=b[tableSortKey.value];const value=typeof left==='number'?left-right:String(left).localeCompare(String(right));return value*(tableSortOrder.value==='asc'?1:-1)})})
function scrollTo(id){current.value=id;document.getElementById(id)?.scrollIntoView({behavior:reducedMotion.value?'auto':'smooth',block:'start'})}
function loadingDemo(){loading.value=true;setTimeout(()=>{loading.value=false;emit('notify','异步操作已完成')},1200)}
function asyncConfirm(){return new Promise(resolve=>setTimeout(resolve,450))}
function tableLoadingDemo(){tableError.value='';tableEmpty.value=false;tableLoading.value=true;setTimeout(()=>{tableLoading.value=false;emit('notify','列表数据加载完成')},900)}
const fontPresets=[
  {value:'inter-noto',name:'Inter + Noto Sans SC',label:'首选',license:'SIL OFL 1.1',stack:'Inter, "Noto Sans SC", sans-serif',description:'数字与拉丁字符紧凑清晰，中文覆盖完整，最适合数据密集型后台。'},
  {value:'noto',name:'Noto Sans SC',label:'通用',license:'SIL OFL 1.1',stack:'"Noto Sans SC", sans-serif',description:'中英文气质统一、字形中性，适合跨平台产品和国际化界面。'},
  {value:'source-han',name:'Source Han Sans CN',label:'本地优先',license:'SIL OFL 1.1',stack:'"Source Han Sans CN", "Noto Sans SC", sans-serif',description:'思源黑体简体中文版，信息密度和中文辨识度优秀；未安装时回退到 Noto。'},
  {value:'system',name:'系统字体栈',label:'零下载',license:'随操作系统',stack:'Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',description:'加载最快，适合内网系统；不同操作系统之间的中文视觉会略有差异。'},
  {value:'wenkai',name:'LXGW WenKai',label:'风格化',license:'SIL OFL 1.1',stack:'"LXGW WenKai", "Noto Sans SC", serif',description:'温润的人文风格，适合欢迎页、帮助内容和品牌展示，不作为密集表格默认字体。'},
]
const selectedFont=ref(localStorage.getItem('lan-font')||'inter-noto')
function applyFont(value){selectedFont.value=value;document.documentElement.dataset.font=value;localStorage.setItem('lan-font',value);const preset=fontPresets.find(item=>item.value===value);emit('notify',`已切换至 ${preset?.name||value}`)}
const colors=[['Brand 600','#2563EB'],['Brand 500','#3B82F6'],['Brand 50','#EFF6FF'],['Success','#10B981'],['Warning','#F59E0B'],['Danger','#EF4444'],['Page','#F4F7FB'],['Surface','#FFFFFF'],['Text','#172033'],['Secondary','#526078']]
</script>

<template>
  <div class="page-container">
    <UiPageHeader title="组件用例中心" description="可交互的组件 Variant、State 与使用规范 · Vue 3 实现" :breadcrumbs="[{label:'Design System',href:'#/components'},{label:'组件用例'}]"><template #actions><a class="btn btn-outline" href="/component-preview.html" target="_blank" rel="noreferrer"><AppIcon name="external" :size="15"/>打开一页预览</a><UiButton icon="download" @click="emit('notify','Token JSON 已准备')">导出 Token</UiButton></template></UiPageHeader>
    <div class="docs-layout"><div class="card docs-toc"><UiAnchor v-model="current" :items="anchorItems" :offset-top="120" :affix="false" aria-label="组件目录"/></div>
      <main class="docs-content">
        <section id="tokens" class="card doc-section"><header class="doc-section-header"><h2>Design Tokens</h2><p>语义 Token 是设计与代码的共同语言，避免页面中出现无语义的魔法数字。</p></header><div class="demo-block"><div class="token-grid"><div v-for="c in colors" :key="c[0]" class="color-token"><div class="color-swatch" :style="{'--swatch':c[1]}"/><div class="token-copy"><strong>{{ c[0] }}</strong><code>{{ c[1] }}</code></div></div></div><div class="preview-note"><strong>使用原则：</strong> 组件优先引用 `--brand-600`、`--text-secondary` 等语义变量；只有色阶展示才直接引用基础色阶。</div></div></section>

        <section id="typography" class="card doc-section">
          <header class="doc-section-header"><h2>字体与间距</h2><p>基础字号适合企业后台；中文默认升级为开源字体组合，并支持全局切换与持久化。</p></header>
          <div class="demo-block">
            <div class="typography-audit"><div><strong>14 / 22px</strong><span>正文与控件默认值，兼顾密度和可读性</span></div><div><strong>22 / 30px</strong><span>页面标题，保持清晰信息层级</span></div><div><strong>12 / 18px</strong><span>辅助信息下限，避免关键内容使用 9–10px</span></div></div>
            <h3 class="preview-subtitle">开源字体方案 · 点击即可应用到整个后台</h3>
            <div class="font-preset-grid">
              <button v-for="font in fontPresets" :key="font.value" type="button" class="font-preset-card" :class="{active:selectedFont===font.value}" :aria-pressed="selectedFont===font.value" @click="applyFont(font.value)">
                <span class="font-preset-head"><strong>{{ font.name }}</strong><span class="font-preset-badge">{{ font.label }}</span></span>
                <span class="font-preset-sample" :style="{fontFamily:font.stack}">经营数据总览 Aa 012345</span>
                <span class="font-preset-copy" :style="{fontFamily:font.stack}">清晰、稳定、高效的企业级界面文字。</span>
                <span class="font-preset-meta"><code>{{ font.license }}</code><span>{{ font.description }}</span></span>
              </button>
            </div>
            <div class="preview-note"><strong>推荐：</strong>后台默认使用 <code>Inter + Noto Sans SC</code>；思源黑体适合本地部署；霞鹜文楷用于低密度内容区。正式项目建议自托管 WOFF2 并保留系统字体回退。</div>
            <h3 class="preview-subtitle">字号层级</h3>
            <div class="type-sample"><span class="type-name">Display</span><strong style="font-size:36px;line-height:1.3">经营数据总览</strong><span class="type-meta">36 / 47 · 700</span></div><div class="type-sample"><span class="type-name">Page title</span><strong style="font-size:22px">客户数据</strong><span class="type-meta">22 / 30 · 700</span></div><div class="type-sample"><span class="type-name">Card title</span><strong style="font-size:16px">销售趋势</strong><span class="type-meta">16 / 24 · 650</span></div><div class="type-sample"><span class="type-name">Body</span><span>用于大部分正文、表单和数据展示内容。</span><span class="type-meta">14 / 22 · 400</span></div><div class="type-sample"><span class="type-name">Caption</span><span class="subtle" style="font-size:12px">用于时间、备注、帮助信息。</span><span class="type-meta">12 / 18 · 400</span></div>
            <h3 class="preview-subtitle">UiTypography · Semantic text actions</h3>
             <div class="typography-component-grid">
               <div class="typography-component-card"><UiTypography variant="title" :level="4" content="发布证据" tone="primary"/><UiTypography content="标题、正文和辅助信息使用统一语义契约。" tone="secondary" size="sm"/><div class="typography-token-row"><UiTypography content="API_TOKEN_7F4A" code copyable @copy="typographyStatus='已复制 API_TOKEN_7F4A'"/><UiTypography content="Ctrl + K" keyboard/></div></div>
               <div class="typography-component-card"><UiTypography v-model:content="typographyContent" variant="paragraph" :ellipsis="{rows:2,expandable:true}" :editable="{trigger:'both',maxLength:180,submitOnBlur:true}" copyable @copy="typographyStatus='已复制发布说明'" @edit-end="typographyStatus=`已保存 ${$event.value.length} 个字符`" @expand="typographyStatus=$event.expanded?'已展开全文':'已收起全文'"/><output class="typography-demo-output" aria-live="polite">{{ typographyStatus }}</output></div>
               <div class="typography-component-card"><UiTypography content="强调文本" strong/><UiTypography content="辅助说明" tone="secondary"/><UiTypography content="校验通过" tone="success"/><UiTypography content="需要复核" tone="warning"/><UiTypography content="验证失败" tone="danger"/><UiTypography content="禁用操作" disabled copyable editable/></div>
             </div>
             <pre class="code-block typography-code"><code>&lt;UiTypography v-model:content="description"
  variant="paragraph" :ellipsis="{ rows:2, expandable:true }"
  :editable="{ trigger:'both' }" copyable /&gt;</code></pre>
             <h3 class="preview-subtitle">Spacing scale</h3><div class="spacing-row"><div v-for="n in [4,8,12,16,20,24,32,40,48]" :key="n" class="space-token"><span class="space-bar" :style="{'--s':`${n}px`}"/><code>{{ n }}</code></div></div>
          </div>
        </section>

        <section id="layout" class="card doc-section">
          <header class="doc-section-header"><h2>布局规范</h2><p>采用 12 栏响应式栅格、统一内容宽度和页面骨架，保证列表、表单与看板在不同屏幕下保持稳定节奏。</p></header>
          <div class="demo-block layout-showcase">
            <div class="layout-demo-section"><div class="form-demo-title"><strong>Page Header · 统一页面标题</strong><span>Breadcrumb / Back / Meta / Actions / Footer / Sticky</span></div><UiPageHeader data-page-header-state-contract style="margin:0;padding:18px" title="客户详情" description="统一呈现导航上下文、对象状态与页面级操作" :breadcrumbs="[{label:'客户管理',href:'#/data'},{label:'上海星河科技'}]" show-back bordered @back="emit('notify','返回客户列表')"><template #meta><UiTag color="green" dot>合作中</UiTag><span>更新于 10:24</span></template><template #actions><UiButton variant="outline">导出</UiButton><UiButton icon="edit">编辑客户</UiButton></template><template #footer><UiTabs model-value="概览" :panels="false" :items="['概览','跟进记录','关联订单']"/></template></UiPageHeader><div class="preview-note"><strong>组合原则：</strong>标题保持单一 H1；返回、面包屑、元信息、操作和页签各自占据固定语义区域，移动端自动折行且不隐藏功能。</div></div>
            <div class="layout-demo-section"><div class="form-demo-title"><strong>页面骨架</strong><span>Application shell</span></div><div class="layout-shell-demo"><aside><span class="layout-brand-dot"/><i/><i/><i/></aside><div><header><span/><span/></header><main><div class="layout-demo-heading"/><div class="layout-demo-cards"><i/><i/><i/></div><div class="layout-demo-table"/></main></div></div><div class="layout-rule-grid"><span><strong>240 / 64px</strong>侧栏展开 / 收起</span><span><strong>56px</strong>顶部导航高度</span><span><strong>24px</strong>桌面内容边距</span><span><strong>1440px</strong>建议内容最大宽度</span></div></div>
            <div class="layout-demo-section"><div class="form-demo-title"><strong>12 栏栅格</strong><span>UiLayout / UiGrid / UiCol / UiSpace</span></div><UiLayout :gap="12"><UiGrid :columns="12" :gap="8"><UiCol :span="12"><div class="layout-grid-cell">12</div></UiCol><UiCol :span="8"><div class="layout-grid-cell">8</div></UiCol><UiCol :span="4"><div class="layout-grid-cell">4</div></UiCol><UiCol v-for="(span,index) in [6,6,4,4,4]" :key="index" :span="span"><div class="layout-grid-cell">{{ span }}</div></UiCol></UiGrid><UiDivider label="响应式容器"/><UiSpace :size="8"><UiTag color="blue">桌面 24px</UiTag><UiTag color="gray">平板 20px</UiTag><UiTag color="green">移动端 14px</UiTag></UiSpace></UiLayout><div class="preview-note"><strong>响应规则：</strong> ≥1200px 使用完整侧栏和多栏布局；720–1199px 收起侧栏；&lt;720px 切换为单栏并保留 14px 页面边距。</div></div>
          </div>
        </section>

        <section id="buttons" class="card doc-section">
          <header class="doc-section-header"><h2>Button 按钮</h2><p>用独立展示单元呈现变体、尺寸与状态，避免按钮宽度和状态含义混淆。</p></header>
          <div class="demo-block button-showcase">
            <div class="button-demo-group">
              <div class="button-demo-heading"><strong>按钮变体</strong><span>Variant</span></div>
              <div class="button-demo-stage button-variant-grid">
                <div class="button-demo-item"><UiButton @click="emit('notify','主要操作执行成功')">主要按钮</UiButton><small>Primary</small></div>
                <div class="button-demo-item"><UiButton variant="secondary">次要按钮</UiButton><small>Secondary</small></div>
                <div class="button-demo-item"><UiButton variant="outline">描边按钮</UiButton><small>Outline</small></div>
                <div class="button-demo-item"><UiButton variant="text">文字按钮</UiButton><small>Text</small></div>
                <div class="button-demo-item"><UiButton variant="danger">危险操作</UiButton><small>Danger</small></div>
              </div>
            </div>
            <div class="button-demo-group">
              <div class="button-demo-heading"><strong>按钮尺寸</strong><span>Size / Height</span></div>
              <div class="button-demo-stage button-size-grid">
                <div class="button-demo-item"><UiButton size="sm">小型按钮</UiButton><small>Small · 28px</small></div>
                <div class="button-demo-item"><UiButton>中型按钮</UiButton><small>Medium · 34px</small></div>
                <div class="button-demo-item"><UiButton size="lg">大型按钮</UiButton><small>Large · 40px</small></div>
              </div>
            </div>
            <div class="button-demo-group">
              <div class="button-demo-heading"><strong>交互状态</strong><span>State</span></div>
              <div class="button-demo-stage button-state-grid">
                <div class="button-demo-item"><UiButton>默认</UiButton><small>Default</small></div>
                <div class="button-demo-item"><UiButton class="force-hover">悬停</UiButton><small>Hover</small></div>
                <div class="button-demo-item"><UiButton class="force-pressed">按下</UiButton><small>Pressed</small></div>
                <div class="button-demo-item"><UiButton class="force-focus">焦点</UiButton><small>Focus</small></div>
                <div class="button-demo-item"><UiButton :loading="true">加载中</UiButton><small>Loading</small></div>
                <div class="button-demo-item"><UiButton disabled>已禁用</UiButton><small>Disabled</small></div>
              </div>
            </div>
            <div class="button-demo-group interactive-button-demo">
              <div class="button-demo-heading"><strong>真实交互</strong><span>点击体验反馈</span></div>
              <div class="button-demo-stage">
                <UiButton icon="plus" @click="emit('notify','新建操作已触发')">带图标按钮</UiButton>
                <UiButton variant="secondary" :loading="loading" @click="loadingDemo">{{ loading ? '处理中' : '模拟异步操作' }}</UiButton>
                <button class="icon-btn outline" title="更多操作" aria-label="更多操作"><AppIcon name="more"/></button>
              </div>
            </div>
            <pre class="code-block button-code"><code>&lt;UiButton variant="primary" size="md" icon="plus" :loading="saving"&gt;
  新建客户
&lt;/UiButton&gt;</code></pre>
          </div>
        </section>

        <section id="forms" class="card doc-section">
          <header class="doc-section-header"><h2>表单控件</h2><p>统一基础控件、托管校验、动态数组与 Schema 编排的尺寸、焦点、条件显隐、错误、只读和键盘行为，并同步到所有业务页面。</p></header>
          <div class="demo-block form-showcase">
            <div class="form-demo-section"><div class="form-demo-title"><strong>基础输入</strong><span>Input</span></div><div class="form-demo-content form-row">
              <label class="field"><span class="field-label required">客户名称</span><UiInput v-model="customerName" icon="user" clearable placeholder="请输入客户名称"/><span class="field-help">支持前缀图标与一键清除</span></label>
              <label class="field"><span class="field-label">登录密码</span><UiInput v-model="passwordDemo" type="password" icon="lock" password-toggle/><span class="field-help">密码显示/隐藏切换</span></label>
              <label class="field"><span class="field-label">错误状态</span><UiInput model-value="invalid@email" icon="alert" invalid/><span class="field-error"><AppIcon name="alert" :size="12"/>请输入有效的企业邮箱</span></label>
              <label class="field"><span class="field-label">只读 / 禁用</span><div class="form-inline-pair"><UiInput model-value="系统生成编号" aria-label="只读系统编号" readonly/><UiInput model-value="不可编辑" aria-label="禁用输入框" disabled/></div></label>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>下拉选择</strong><span>Select</span></div><div class="form-demo-content form-row">
              <label class="field"><span class="field-label">基础选择</span><UiSelect v-model="customerType" :options="['企业客户','渠道客户','战略客户']" clearable placeholder="请选择客户类型"/><span class="field-help">箭头旋转、清除和上下方向自适应</span></label>
              <label class="field"><span class="field-label">可搜索选择</span><UiSelect v-model="searchableType" :options="['华东区域','华南区域','华北区域','西南区域','海外区域']" searchable clearable placeholder="搜索或选择区域"/><span class="field-help">支持键盘 ↑ ↓、Enter、Esc</span></label>
              <label class="field"><span class="field-label">尺寸</span><div class="form-size-stack"><UiSelect size="sm" aria-label="小型选择器" :options="['小型选择器']" placeholder="Small · 28px"/><UiSelect aria-label="中型选择器" :options="['中型选择器']" placeholder="Medium · 34px"/><UiSelect size="lg" aria-label="大型选择器" :options="['大型选择器']" placeholder="Large · 40px"/></div></label>
              <label class="field"><span class="field-label">错误 / 禁用</span><div class="form-inline-pair"><UiSelect invalid aria-label="错误状态选择器" :options="['选项']" placeholder="请选择必填项"/><UiSelect disabled aria-label="禁用选择器" :options="['选项']" placeholder="禁用状态"/></div></label>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>自动完成</strong><span>AutoComplete · combobox</span></div><div class="form-demo-content form-row">
              <UiFormItem label="城市搜索" help="输入中文、拼音或缩写；支持 Arrow、Enter、Esc 与 IME 输入法"><UiAutoComplete v-model="cityDemo" :options="cityOptions" clearable placeholder="例如：杭州 / Hangzhou / HZ"/></UiFormItem>
              <UiFormItem label="仅允许选择" help="allow-custom=false 时，自由文本不会写入模型"><UiAutoComplete v-model="strictCityDemo" :options="cityOptions" :allow-custom="false" placeholder="请选择支持的城市"/></UiFormItem>
              <UiFormItem label="异步项目检索" help="内置防抖、AbortSignal、竞态保护与查询缓存"><UiAutoComplete v-model="remoteProjectDemo" :fetch-suggestions="fetchProjectSuggestions" :debounce="220" :min-chars="1" placeholder="输入项目名称"/></UiFormItem>
              <UiFormItem label="状态" group><div class="form-inline-pair"><UiAutoComplete model-value="无权限修改" readonly aria-label="只读自动完成"/><UiAutoComplete model-value="" invalid :options="cityOptions" aria-label="错误自动完成" placeholder="必填城市"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>Numeric input</strong><span>UiNumberInput / spinbutton</span></div><div class="form-demo-content form-row">
              <UiFormItem label="Quantity" help="Arrow keys step by 0.25; Page keys step by 2.5"><UiNumberInput v-model="quantityDemo" :min="0" :max="100" :step="0.25" :precision="2"><template #suffix>items</template></UiNumberInput></UiFormItem>
              <UiFormItem label="Budget" help="Custom formatter and parser keep the model numeric"><UiNumberInput v-model="budgetDemo" :min="0" :step="1000" :formatter="formatCurrency" :parser="parseCurrency"/></UiFormItem>
              <UiFormItem label="Completion"><UiNumberInput v-model="percentDemo" :min="0" :max="100" controls-position="right"><template #suffix>%</template></UiNumberInput></UiFormItem>
              <div class="field"><span class="field-label">States</span><div class="form-inline-pair"><UiNumberInput :model-value="8" readonly aria-label="Readonly numeric input"/><UiNumberInput :model-value="120" :max="100" invalid aria-label="Invalid numeric input"/></div></div>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>一次性验证码</strong><span>UiOtpInput · autofill / paste / keyboard</span></div><div class="form-demo-content form-row otp-demo-grid">
              <UiFormItem label="六位验证码" help="支持短信自动填充、整段粘贴、全角数字归一化与自动移焦"><UiOtpInput v-model="otpDemo" :length="6" separator="–" :separator-every="3" @complete="emit('notify',`验证码 ${$event} 输入完成`)"/></UiFormItem>
              <UiFormItem label="敏感验证码" help="mask 只隐藏视觉内容，表单值仍保持完整字符串"><UiOtpInput model-value="4826" :length="4" mask name="secure-code"/></UiFormItem>
              <UiFormItem label="字母数字邀请码" help="alphanumeric + uppercase 可过滤并统一邀请码格式"><UiOtpInput model-value="A7B" :length="5" mode="alphanumeric" uppercase/></UiFormItem>
              <UiFormItem label="状态" group><div class="otp-state-stack"><UiOtpInput model-value="12" :length="4" size="sm" readonly aria-label="只读验证码"/><UiOtpInput model-value="98" :length="4" invalid aria-label="错误验证码"/><UiOtpInput :length="4" disabled aria-label="禁用验证码"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section" data-mentions-state-contract="default hover active focus disabled loading empty error"><div class="form-demo-title"><strong>成员与主题提及</strong><span>UiMentions · caret / async / multi-trigger</span></div><div class="form-demo-content form-row mentions-demo-grid">
              <UiFormItem label="协作评论" help="输入 @ 提及成员，输入 # 关联主题；建议浮层跟随当前光标位置"><UiMentions v-model="mentionsDemo" :options="mentionsOptions" :triggers="['@','#']" show-count maxlength="160" :auto-size="{minRows:3,maxRows:6}" @select="emit('notify',`已插入 ${$event.trigger||''}${$event.value}`)"/></UiFormItem>
              <UiFormItem label="自定义输出" help="formatMention 可生成产品需要的标记格式"><UiMentions model-value="Review @ad" :options="mentionsOptions" :format-mention="(option,meta)=>`[${meta.trigger}${option.value}] `" :rows="3"/></UiFormItem>
              <UiFormItem label="错误状态" error="至少提及一位复核人"><UiMentions model-value="请补充复核人" :options="mentionsOptions" invalid :rows="3"/></UiFormItem>
              <UiFormItem label="只读与禁用" group><div class="mentions-state-stack"><UiMentions model-value="由 @design 维护" :options="mentionsOptions" readonly :rows="2" aria-label="只读提及"/><UiMentions model-value="已锁定评论" disabled :rows="2" aria-label="禁用提及"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section" data-input-tag-state-contract="default focus selected editing busy invalid readonly disabled"><div class="form-demo-title"><strong>标签批量输入</strong><span>UiInputTag · tokenize / paste / edit / async guard</span></div><div class="form-demo-content form-row input-tag-demo-grid">
              <UiFormItem label="项目能力" help="回车或中英文逗号、分号提交；粘贴多行文本会按原顺序批量生成标签"><UiInputTag v-model="inputTagDemo" editable clearable :max-tags="8" :max-length="24" name="capabilities" @invalid="emit('notify',$event.message,'error')"/></UiFormItem>
              <UiFormItem label="折叠展示" help="失焦时只展示前两个标签，聚焦后展开全部内容"><UiInputTag v-model="inputTagCollapsed" collapse-tags :max-visible-tags="2" clearable/></UiFormItem>
              <UiFormItem label="异步添加守卫" help="beforeAdd 与 validate 支持同步或异步业务校验"><UiInputTag :model-value="['release']" :validate="value=>!value.toLowerCase().includes('blocked')||'该标签已被策略拦截'" :before-add="async value=>{await new Promise(resolve=>setTimeout(resolve,240));return value}" clearable/></UiFormItem>
              <UiFormItem label="状态" group><div class="input-tag-state-stack"><UiInputTag :model-value="['readonly','stable']" readonly collapse-tags aria-label="只读标签输入"/><UiInputTag :model-value="['invalid']" invalid aria-label="错误标签输入"/><UiInputTag :model-value="['locked']" disabled aria-label="禁用标签输入"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section" data-query-builder-state-contract="empty rule nested range not validation readonly disabled"><div class="form-demo-title"><strong>组合筛选条件</strong><span>UiQueryBuilder · recursive / typed / serializable / evaluable</span></div><div class="form-demo-content query-builder-demo-grid">
              <UiQueryBuilder ref="queryBuilderRef" v-model="queryDemo" :fields="queryFields" show-not :max-depth="3" :max-rules="8" name="releaseFilters" aria-label="组件发布筛选条件" @invalid="emit('notify',`${$event.errors.length} 个筛选条件需要完善`,'error')"/>
              <aside class="query-builder-demo-result"><div><span>当前匹配</span><strong>{{ queryMatchCount }} / {{ queryRows.length }}</strong></div><div><span>条件树</span><code>{{ queryDemo.combinator.toUpperCase() }} · {{ queryDemo.rules.length }} 项</code></div><p>字段类型自动映射文本、数值、日期、单选、多选及布尔编辑器；嵌套组支持 AND / OR / NOT、复制、排序、键盘快捷键和客户端匹配。</p><div class="button-row"><UiButton size="sm" variant="outline" @click="queryBuilderRef.validate()">校验条件</UiButton><UiButton size="sm" variant="text" @click="queryBuilderRef.addRule()">追加条件</UiButton></div></aside>
            </div></div>
            <div class="form-demo-section" data-cron-editor-state-contract="preset custom valid invalid readonly disabled local utc preview form ssr"><div class="form-demo-title"><strong>定时表达式</strong><span>UiCronEditor · Unix Cron / preview / form</span></div><div class="form-demo-content cron-editor-demo-grid">
              <UiFormItem label="自动发布计划" help="使用五字段 Unix Cron；支持通配、列表、区间、步长及常用计划预设"><UiCronEditor v-model="cronDemo" from="2026-08-20T08:00:00Z" time-zone="UTC" name="releaseSchedule" @invalid="emit('notify','Cron 表达式需要修正','error')"/></UiFormItem>
              <aside class="cron-editor-demo-note"><strong>CronEditor P56</strong><code>{{ cronDemo }}</code><p>组件直接输出可提交的 Cron 字符串，同时提供字段级校验、未来执行时间和实例方法；业务层不再重复实现解析、错误提示与预览。</p><div class="cron-editor-state-stack"><UiCronEditor model-value="0 2 * * *" :preview-count="2" readonly aria-label="只读备份计划"/><UiCronEditor model-value="61 9 * * *" :preview-count="2" invalid aria-label="错误定时计划"/></div></aside>
            </div></div>
            <div class="form-demo-section" data-key-value-editor-state-contract="add remove move toggle duplicate pattern import limits readonly disabled responsive form ssr"><div class="form-demo-title"><strong>键值配置</strong><span>UiKeyValueEditor · headers / environment / metadata</span></div><div class="form-demo-content key-value-editor-demo-grid">
              <UiFormItem label="请求头配置" help="支持启停、排序、重复键与键名格式校验；所有输入均生成可提交的字段名"><UiKeyValueEditor ref="keyValueEditorRef" v-model="keyValueDemo" name="headers" :max-rows="8" key-pattern="^[A-Za-z][A-Za-z0-9-]*$"/></UiFormItem>
              <aside class="key-value-editor-demo-note"><strong>KeyValueEditor P57</strong><p>统一环境变量、HTTP Headers、标签和元数据编辑交互，避免业务页面分别实现数组状态、重复校验、导入解析和键盘焦点恢复。</p><div class="button-row"><UiButton size="sm" variant="outline" @click="keyValueEditorRef.add({key:'X-Region',value:'apac',enabled:true})">追加</UiButton><UiButton size="sm" variant="outline" @click="keyValueEditorRef.importText('CACHE=enabled\nTIMEOUT=30',{mode:'append'})">导入</UiButton><UiButton size="sm" variant="text" @click="keyValueEditorRef.validate()">校验</UiButton></div><div class="key-value-editor-state-stack"><UiKeyValueEditor :model-value="[{key:'REGION',value:'apac',enabled:true}]" readonly aria-label="只读环境变量"/><UiKeyValueEditor :model-value="[{key:'TOKEN',value:'a'},{key:'token',value:'b'}]" aria-label="重复键错误"/></div></aside>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>Slider / Range</strong><span>Pointer + keyboard + ARIA</span></div><div class="form-demo-content form-row">
              <UiFormItem label="完成度" help="方向键微调，Page 键大步进，Home / End 跳到边界"><UiSlider v-model="sliderDemo" :step="5" :marks="{0:'0',50:'50',100:'100'}" :formatter="value=>`${value}%`"/></UiFormItem>
              <UiFormItem label="预算区间" help="双滑块保持最小 10 个单位间距"><UiSlider v-model="sliderRangeDemo" range :step="5" :min-distance="10" :marks="[{value:25,label:'25'},{value:75,label:'75'}]"/></UiFormItem>
              <UiFormItem label="垂直方向" group help="支持 vertical、reverse、RTL 与只读状态"><div class="slider-vertical-demo"><UiSlider v-model="verticalSliderDemo" vertical tooltip="always" aria-label="垂直滑块"/></div></UiFormItem>
              <UiFormItem label="状态" group><div class="slider-state-stack"><UiSlider :model-value="35" readonly aria-label="只读滑块"/><UiSlider :model-value="65" invalid aria-label="错误滑块"/><UiSlider :model-value="50" disabled aria-label="禁用滑块"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>评分</strong><span>UiRate · fractional rating</span></div><div class="form-demo-content form-row">
              <UiFormItem label="服务体验" help="支持 0.5 分步进；方向键、Page、Home / End 与 Delete 均可操作"><UiRate v-model="serviceRateDemo" :step="0.5" show-text :texts="['很差','较差','一般','满意','非常满意']"/></UiFormItem>
              <UiFormItem label="品牌定制" help="颜色、尺寸、最大值与文本格式均可配置"><UiRate v-model="customRateDemo" size="lg" color="#7C3AED" show-text :formatter="(value,max)=>`${value} / ${max}`"/></UiFormItem>
              <UiFormItem label="只读与禁用" group><div class="rate-state-stack"><UiRate :model-value="4" readonly show-text aria-label="只读评分"/><UiRate :model-value="2" disabled aria-label="禁用评分"/></div></UiFormItem>
              <UiFormItem label="错误状态" error="请完成服务评分"><UiRate :model-value="0" invalid/></UiFormItem>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>Color Picker</strong><span>HEX / RGB / HSL · Alpha · WCAG</span></div><div class="form-demo-content form-row">
              <UiFormItem label="品牌颜色" help="二维色板、色相与透明度均支持指针和键盘操作"><UiColorPicker v-model="brandColorDemo" alpha show-contrast :presets="['#1677FF','#7C3AED','#10B981','#F59E0B','#EF4444']"/></UiFormItem>
              <UiFormItem label="HSL 输出" help="输入任意支持的格式，模型始终按 HSL 规范化"><UiColorPicker v-model="accentColorDemo" format="hsl" :presets="[{label:'成功色',value:'#10B981'},{label:'警告色',value:'#F59E0B'}]"/></UiFormItem>
              <div class="field"><span class="field-label">实时可读性</span><div class="color-contrast-demo" :style="{background:brandColorDemo}"><strong>Lan UI</strong><span>与白色对比度 {{ colorContrast }}:1</span></div></div>
              <UiFormItem label="状态" group><div class="form-inline-pair"><UiColorPicker model-value="#64748B" readonly aria-label="只读颜色"/><UiColorPicker model-value="#EF4444" disabled aria-label="禁用颜色"/></div></UiFormItem>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>日期与时间</strong><span>DatePicker</span></div><div class="form-demo-content form-row">
              <label class="field"><span class="field-label">业务日期</span><UiDatePicker v-model="demoDate"/><span class="field-help">支持清除、键盘输入和系统日历</span></label>
              <label class="field"><span class="field-label">提醒时间</span><UiTimePicker v-model="demoTime" :step="60"/><span class="field-help">独立 TimePicker，支持分钟、秒和毫秒精度</span></label>
              <label class="field"><span class="field-label">服务时段</span><UiTimeRangePicker v-model="demoTimeRange" :step="900"/><span class="field-help">独立 TimeRangePicker，自动约束开始与结束时间</span></label>
              <label class="field"><span class="field-label">日期时间</span><UiDateTimePicker v-model="demoDateTime"/><span class="field-help">独立 DateTimePicker，避免业务层记忆 mode</span></label>
              <label class="field"><span class="field-label">发布窗口</span><UiDateTimeRangePicker v-model="demoDateTimeRange" :step="900"/><span class="field-help">独立 DateTimeRangePicker，自动约束两个完整时刻</span></label>
              <label class="field"><span class="field-label">时区感知时刻</span><div class="form-inline-pair"><UiSelect v-model="demoTimeZone" :options="['Asia/Shanghai','UTC','America/New_York']"/><UiDateTimePicker v-model="zonedInstant" value-type="date" :time-zone="demoTimeZone" precision="second" :step="1"/></div><span class="field-help">同一 Instant · UTC {{ zonedPreview }}</span></label>
              <label class="field"><span class="field-label">错误 / 禁用</span><div class="form-inline-pair"><UiDatePicker invalid aria-label="错误状态日期" placeholder="请选择必填日期"/><UiDatePicker model-value="2026-08-11" aria-label="禁用日期" disabled/></div></label>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>Calendar 日历</strong><span>single / range · keyboard · year panel</span></div><div class="form-demo-content calendar-showcase-grid">
              <div><span class="demo-label">单选 · 周数 · 年份面板</span><UiCalendar v-model="calendarDemo" view-date="2026-08-01" today="2026-08-12" show-week-numbers/><p class="field-help">方向键、Home / End、PageUp / PageDown、Enter 与 Delete 均可操作</p></div>
              <div><span class="demo-label">日期范围 · 禁用周末</span><UiCalendar v-model="calendarRangeDemo" selection-mode="range" view-date="2026-08-01" today="2026-08-12" :disabled-date="date=>[0,6].includes(date.getUTCDay())"/><p class="field-help">范围悬停预览、首尾语义、最小/最大日期和自定义禁用规则</p></div>
            </div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>长文本</strong><span>Textarea</span></div><div class="form-demo-content"><label class="field"><span class="field-label">客户备注</span><UiTextarea v-model="notes" :maxlength="120" show-count placeholder="填写跟进记录，最多 120 个字符"/></label></div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>生产级上传队列</strong><span>UiUpload · async queue / progress / cancel / retry</span></div><div class="form-demo-content"><UiUpload v-model="demoFiles" accept=".pdf,.doc,.docx,.png,.jpg" multiple :max-size="10" :max-count="5" :concurrency="2" :request="uploadDemoRequest" :before-upload="async file=>file" :before-remove="async()=>true" @success="emit('notify',`${$event.file.name} 上传完成`)" @upload-error="emit('notify',`${$event.file.name}：${$event.file.error}`,'error')" @error="emit('notify',$event,'error')"/><div class="field-help upload-help">支持受控队列、并发调度、真实进度、取消、失败重试、异步前置校验与移除守卫；选择文件名包含 error 的文件可体验失败隔离。</div></div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>选择控件</strong><span>Checkbox / Radio / Switch</span></div><div class="form-demo-content"><div class="selection-component-grid"><UiFormItem label="复选框组" group help="支持 Boolean、Array 与半选状态"><div class="demo-row"><UiCheckbox v-model="checkboxDemo" value="邮件通知">邮件通知</UiCheckbox><UiCheckbox v-model="checkboxDemo" value="短信通知">短信通知</UiCheckbox><UiCheckbox :model-value="false" indeterminate>部分选择</UiCheckbox><UiCheckbox :model-value="false" disabled>禁用</UiCheckbox></div></UiFormItem><UiFormItem label="单选组" group><div class="demo-row"><UiRadio v-model="radioDemo" value="标准版" name="plan">标准版</UiRadio><UiRadio v-model="radioDemo" value="高级版" name="plan">高级版</UiRadio><UiRadio v-model="radioDemo" value="企业版" name="plan" disabled>企业版</UiRadio></div></UiFormItem><UiFormItem label="开关" group><div class="demo-row"><UiSwitch v-model="switchOn" aria-label="通知开关"/><span class="muted">{{ switchOn?'通知已开启':'通知已关闭' }}</span><UiSwitch :model-value="true" loading aria-label="加载中的通知开关"/><UiSwitch :model-value="false" disabled aria-label="禁用通知开关"/></div></UiFormItem></div></div></div>
            <div class="form-demo-section">
              <div class="form-demo-title"><strong>表单校验与动态字段</strong><span>nested paths / dependencies / conditional rules / FormList</span></div>
              <div class="form-demo-content">
                <UiForm ref="formRef" :model="validatedForm" :rules="validationRules" show-error-summary focus-on-error @submit="emit('notify','表单校验通过并已提交')" @invalid="emit('notify','请修正表单错误','error')">
                  <template #default="{dirty,validating,errors}">
                    <div class="form-row">
                      <UiFormItem name="customer.name" label="客户名称" required show-success><UiInput v-model="validatedForm.customer.name" clearable placeholder="至少输入 2 个字符"/></UiFormItem>
                      <UiFormItem name="customer.email" label="企业邮箱" required show-success><UiInput v-model="validatedForm.customer.email" clearable placeholder="name@company.com"/></UiFormItem>
                      <UiFormItem name="customer.password" label="登录密码" required :rules="[{required:true,message:'请输入登录密码'},{min:8,message:'密码至少 8 个字符'}]"><UiInput v-model="validatedForm.customer.password" type="password"/></UiFormItem>
                      <UiFormItem name="customer.confirm" label="确认密码" required :dependencies="['customer.password']" :rules="[{required:true,message:'请再次输入密码'},{validator:value=>value===validatedForm.customer.password||'两次输入的密码不一致'}]"><UiInput v-model="validatedForm.customer.confirm" type="password"/></UiFormItem>
                    </div>
                    <UiFormItem name="contacts" label="联系人" group :rules="[{type:'array',min:1,message:'至少保留一位联系人'}]" class="form-list-demo">
                      <UiFormList v-slot="{fields,add,remove,move,canAdd,canRemove}" name="contacts" :min="1" :max="4" :default-value="()=>({name:'',email:''})" aria-label="联系人列表">
                        <div v-for="(field,index) in fields" :key="field.key" class="form-list-row">
                          <div class="form-list-row-head"><strong>联系人 {{ index+1 }}</strong><div class="form-list-actions"><UiButton type="button" size="sm" variant="text" :disabled="index===0" @click="move(index,index-1)">上移</UiButton><UiButton type="button" size="sm" variant="text" :disabled="!canRemove" @click="remove(index)">移除</UiButton></div></div>
                          <div class="form-row"><UiFormItem :name="[...field.name,'name']" label="姓名" required :rules="[{required:true,message:'请输入联系人姓名'}]"><UiInput v-model="validatedForm.contacts[index].name"/></UiFormItem><UiFormItem :name="[...field.name,'email']" label="邮箱" required :rules="[{required:true,message:'请输入联系人邮箱'},{type:'email',message:'请输入有效邮箱'}]"><UiInput v-model="validatedForm.contacts[index].email"/></UiFormItem></div>
                        </div>
                        <UiButton type="button" variant="secondary" size="sm" :disabled="!canAdd" @click="add()">＋ 添加联系人</UiButton>
                      </UiFormList>
                    </UiFormItem>
                    <div class="ui-form-actions"><span class="field-help">{{ dirty?'表单已有修改':'尚未修改' }} · {{ errors.length }} 个错误 · {{ validatedForm.contacts.length }}/4 位联系人</span><UiButton type="button" variant="text" @click="formRef.setFieldError('customer.email','该邮箱已被其他账户使用')">模拟服务端错误</UiButton><UiButton type="button" variant="text" @click="formRef.resetFields('customer.email')">重置邮箱</UiButton><UiButton type="reset" variant="secondary">全部重置</UiButton><UiButton type="submit" :loading="validating">提交校验</UiButton></div>
                  </template>
                </UiForm>
              </div>
            </div>
            <div class="form-demo-section">
              <div class="form-demo-title"><strong>Schema 驱动表单</strong><span>UiSchemaForm · conditional / repeatable list / nested path</span></div>
              <div class="form-demo-content">
                <UiSchemaForm
                  ref="schemaFormRef"
                  :model="schemaFormModel"
                  :schema="schemaFormDefinition"
                  show-error-summary
                  error-summary-title="请检查工作区配置"
                  @field-change="schemaFormChange=`${$event.name} 已更新`"
                  @submit="emit('notify','Schema 表单校验通过并已提交')"
                  @invalid="emit('notify','请完善 Schema 表单中的必填项','error')"
                >
                  <template #actions="{validating,errors,dirty}">
                    <span class="field-help">{{ schemaFormChange }} · {{ dirty?'已修改':'未修改' }} · {{ errors.length }} 个错误</span>
                    <UiButton type="button" variant="text" @click="schemaFormRef.resetFields()">恢复初始值</UiButton>
                    <UiButton type="submit" :loading="validating">保存配置</UiButton>
                  </template>
                </UiSchemaForm>
                <div class="preview-note"><strong>编排规则：</strong>企业账户显示并校验税号；联系人数组由 <code>type: 'list'</code> 原生驱动，所有者不可移除，新增、排序和子字段变更均提供结构化事件；解析器异常通过 <code>schema-error</code> 独立上报。</div>
              </div>
            </div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>高级选择</strong><span>MultiSelect / TreeSelect / Cascader</span></div><div class="form-demo-content advanced-control-grid"><UiFormItem label="多选与搜索"><UiMultiSelect v-model="multiDemo" :options="advancedOptions" searchable/></UiFormItem><UiFormItem label="树选择"><UiTreeSelect v-model="treeDemo" :options="treeOptions"/></UiFormItem><UiFormItem label="级联选择"><UiCascader v-model="cascaderDemo" :options="cascaderOptions"/></UiFormItem></div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>穿梭框</strong><span>Transfer</span></div><div class="form-demo-content"><UiTransfer v-model="transferDemo" :options="transferOptions" searchable/></div></div>
            <div class="form-demo-section"><div class="form-demo-title"><strong>标签页</strong><span>Tabs · Arrow / Home / End</span></div><div class="form-demo-content"><UiTabs v-model="demoTab" :items="['概览','详细信息','操作记录']"><div style="color:var(--text-secondary);font-size:12px">当前内容：{{ demoTab }}，支持方向键切换。</div></UiTabs></div></div>
          </div>
        </section>

        <section id="data" class="card doc-section">
          <header class="doc-section-header"><h2>列表与数据展示</h2><p>UiCard、UiTable、UiListToolbar 与 UiPagination 组成完整数据展示系统，覆盖容器层级、列配置、排序、选择、展开和异步状态。</p></header>
          <div class="demo-block">
            <div class="card-showcase-grid" data-card-state-contract="sizes variants cover header subtitle actions body footer hover interactive selected disabled loading link keyboard rtl reduced-motion ssr">
              <UiCard title="客户成功计划" subtitle="企业版 · 更新于 10:24" variant="elevated" shadow="sm" hoverable interactive :selected="cardSelected" @activate="cardSelected=!cardSelected;emit('notify',cardSelected?'已选择客户计划':'已取消选择客户计划')">
                <template #cover><img :src="imageGallery[0]" alt="客户成功计划封面"></template>
                <p class="card-showcase-copy">整合页面容器、状态反馈与负责人信息，整卡支持指针和键盘激活。</p>
                <template #footer><UiTag :color="cardSelected?'blue':'gray'">{{ cardSelected?'已选择':'Enter / Space 选择' }}</UiTag></template>
              </UiCard>
              <UiCard title="发布证据" subtitle="Outlined · 独立操作区" variant="outlined" shadow="none">
                <template #actions><UiButton size="sm" variant="text" @click="emit('notify','证据已刷新')">刷新</UiButton></template>
                <UiDescriptions :items="[{label:'单元测试',value:'504'},{label:'无障碍',value:'0 violations'},{label:'浏览器',value:'3 engines'}]" :columns="1"/>
                <template #footer><UiButton size="sm" variant="outline" @click="emit('notify','已打开验证记录')">查看记录</UiButton></template>
              </UiCard>
              <UiCard title="同步组件数据" subtitle="Loading · aria-busy" variant="filled" loading :loading-rows="4"/>
              <UiCard title="已归档方案" subtitle="Disabled · 不可聚焦或激活" interactive disabled><p class="card-showcase-copy">禁用状态保留内容语义，同时阻止跳转、点击和键盘激活。</p></UiCard>
            </div>
            <div class="statistic-showcase-grid">
              <div class="statistic-demo-card"><UiStatistic title="本月营收" :value="2864000" :precision="0" prefix="¥" :trend="12.6"><template #extra>较上月 · 实时更新</template></UiStatistic></div>
              <div class="statistic-demo-card"><UiStatistic title="活跃客户" :value="12580" :trend="-3.2" suffix=" 人" status="warning"><template #extra>过去 30 天去重客户</template></UiStatistic></div>
              <div class="statistic-demo-card"><UiStatistic title="缺陷率" :value="0.0037" :format-options="{style:'percent',minimumFractionDigits:2,maximumFractionDigits:2}" :trend="-18.4" positive-direction="down" status="success"><template #extra>下降视为正向趋势</template></UiStatistic></div>
              <div class="statistic-demo-card"><UiStatistic title="待同步数据" :value="0" loading live="polite"><template #extra>加载时保持数值布局稳定</template></UiStatistic></div>
            </div>
            <div class="image-showcase-grid">
              <div><span class="demo-label">UiImage · 懒加载画廊与全屏预览</span><div class="image-gallery-demo"><UiImage v-for="(source,index) in imageGallery" :key="source" :src="source" :alt="`发布画廊 ${index+1}`" preview :preview-list="imageGallery" :preview-index="index"><template #caption>发布画廊 · 支持方向键、缩放、旋转与拖拽</template></UiImage></div></div>
              <div><span class="demo-label">Fit / Disabled / Fallback</span><div class="image-state-demo"><UiImage :src="imageGallery[0]" alt="Contain 模式" fit="contain"/><UiImage :src="imageGallery[1]" alt="停用预览" preview disabled/></div><p class="feedback-hint">加载失败时可使用 fallback 或 error 插槽；预览支持焦点闭环、Esc、滚轮缩放、双击与 RTL。</p></div>
            </div>
            <div class="qr-code-showcase" data-qr-code-state-contract="active loading expired scanned invalid refresh download svg ecc icon ssr">
              <div class="qr-code-showcase-primary">
                <span class="demo-label">UiQRCode · 真实编码与导出</span>
                <UiQRCode :value="qrValue" :status="qrStatus" level="H" color="#155EEF" :size="184" downloadable download-name="lan-ui-release.svg" label="Lan UI 1.63.0 发布二维码" caption="扫码打开 1.63.0 发布记录" @refresh="refreshQrCode" @download="toast.success('SVG 二维码已下载')"/>
                <div class="button-row"><UiButton size="sm" variant="outline" @click="qrStatus='loading'">加载中</UiButton><UiButton size="sm" variant="outline" @click="qrStatus='expired'">已过期</UiButton><UiButton size="sm" variant="outline" @click="qrStatus='scanned'">已扫描</UiButton><UiButton size="sm" variant="text" @click="qrStatus='active'">恢复</UiButton></div>
                <code>{{ qrStatus }} · revision {{ qrRevision }} · ECC H</code>
              </div>
              <aside class="qr-code-showcase-states">
                <strong>完整生命周期状态</strong><p>矩阵由内容真实编码生成，支持四档纠错、品牌色、中心图标、边距钳制、响应式尺寸、过期刷新和可访问 SVG 导出。</p>
                <div class="qr-code-state-row"><UiQRCode value="lan-ui:loading" status="loading" :size="112" :bordered="false" label="加载中的二维码"/><UiQRCode value="lan-ui:scanned" status="scanned" :size="112" :bordered="false" label="已扫描二维码"/><UiQRCode value="lan-ui:expired" status="expired" :size="112" :bordered="false" label="已过期二维码"/></div>
                <small>中心图标场景建议使用 Q / H 纠错级别并保持足够留白；导出的 SVG 与屏幕矩阵保持一致。</small>
              </aside>
            </div>
            <div class="barcode-showcase" data-barcode-state-contract="code128 code39 ean upc itf msi codabar pharmacode auto active loading expired scanned invalid refresh download svg ssr">
              <div class="barcode-showcase-primary">
                <span class="demo-label">UiBarcode · 真实编码与导出</span>
                <UiBarcode :value="barcodeValue" :status="barcodeStatus" format="CODE128" color="#155EEF" :width="2" :height="82" downloadable download-name="lan-ui-asset.svg" label="Lan UI 1.63.0 资产条形码" caption="资产标签 · CODE128" @refresh="refreshBarcode" @download="toast.success('SVG 条形码已下载')"/>
                <div class="button-row"><UiButton size="sm" variant="outline" @click="barcodeStatus='loading'">加载中</UiButton><UiButton size="sm" variant="outline" @click="barcodeStatus='expired'">已过期</UiButton><UiButton size="sm" variant="outline" @click="barcodeStatus='scanned'">已扫描</UiButton><UiButton size="sm" variant="text" @click="barcodeStatus='active'">恢复</UiButton></div>
                <code>{{ barcodeStatus }} · revision {{ barcodeRevision }} · CODE128</code>
              </div>
              <aside class="barcode-showcase-states">
                <strong>多制式与完整生命周期</strong><p>真实二进制条纹支持资产、库存、物流与票据场景；显示文本、模块宽度、高度、留白、品牌色、下载及状态插槽均可独立配置。</p>
                <div class="barcode-state-row"><UiBarcode value="5901234123457" format="EAN13" status="loading" :width="1" :height="54" :bordered="false" label="加载中的 EAN13 条形码"/><UiBarcode value="10012345000017" format="ITF14" status="scanned" :width="1" :height="54" :bordered="false" label="已扫描 ITF14 条形码"/><UiBarcode value="LANUI151" format="CODE39" status="expired" :width="1" :height="54" :bordered="false" label="已过期 CODE39 条形码"/><UiBarcode value="not-digits" format="EAN13" :width="1" :height="54" :bordered="false" label="无效 EAN13 条形码"/></div>
                <small>EAN / UPC 等数字制式会执行格式与校验位验证；导出 SVG 与屏幕条纹使用同一编码结果，并可在 SSR 阶段直接生成。</small>
              </aside>
            </div>
            <div class="carousel-showcase" data-carousel-state-contract="slide fade horizontal vertical loop finite autoplay hover focus visibility reduced-motion keyboard rtl swipe lazy empty">
              <UiCarousel ref="carouselRef" v-model="carouselIndex" :items="carouselItems" :effect="carouselEffect" :autoplay="carouselAutoplay" :interval="5000" indicators="lines" aria-label="组件成熟度发布轮播" @change="carouselStatus=`${$event.source} · ${$event.previousIndex+1} → ${$event.index+1}`">
                <template #item="{item,index}"><div class="carousel-demo-slide" :style="{'--carousel-start':item.start,'--carousel-end':item.end}"><small>{{ item.eyebrow }} · {{ index+1 }}/{{ carouselItems.length }}</small><strong>{{ item.title }}</strong><p>{{ item.description }}</p></div></template>
              </UiCarousel>
              <aside class="carousel-showcase-panel"><strong>UiCarousel · 可访问内容轮播</strong><p>支持 Slide / Fade、水平 / 垂直、有限 / 循环、懒渲染、指示器、自定义插槽和结构化 change 事件。自动播放会在悬停、焦点、页面隐藏或 Reduced Motion 时停止。</p><UiSegmented v-model="carouselEffect" :options="[{label:'Slide',value:'slide'},{label:'Fade',value:'fade'}]"/><UiSwitch v-model="carouselAutoplay" label="自动播放"/><div class="button-row"><UiButton size="sm" variant="outline" @click="carouselRef.previous('demo')">上一项</UiButton><UiButton size="sm" variant="outline" @click="carouselRef.next('demo')">下一项</UiButton></div><code>{{ carouselIndex+1 }} / {{ carouselItems.length }} · {{ carouselStatus }}</code></aside>
            </div>
            <div class="data-grid-showcase">
              <div class="virtual-list-showcase-header"><div><span class="demo-label">UiDataGrid · client orchestration</span><strong>Search, filter, sort, selection, expansion, columns and pagination</strong></div><UiTag color="blue">Selected: {{ gridSelected.length }}</UiTag></div>
              <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:page-size="gridPageSize" v-model:filters="gridFilters" v-model:sort-key="gridSortKey" v-model:sort-order="gridSortOrder" v-model:selected-rows="gridSelected" v-model:expanded-rows="gridExpanded" v-model:density="gridDensity" v-model:visible-columns="gridVisibleColumns" :columns="gridColumns" :rows="gridRows" :page-size-options="[10,20,50]" :query-fields="['name','team','status']" selectable expandable sticky-header resizable max-height="420px" aria-label="Component release data grid">
                <template #toolbar-primary><UiButton size="sm" variant="outline" icon="download">Export</UiButton></template>
                <template #cell-name="{row}"><div class="cell-title">{{ row.name }}</div><div class="cell-subtitle">{{ row.id }}</div></template>
                <template #cell-status="{value}"><UiTag :color="value==='Stable'?'green':'orange'">{{ value }}</UiTag></template>
                <template #cell-score="{value}"><strong>{{ value }}%</strong></template>
                <template #expanded="{row}"><div class="ui-table-expanded-content"><div><span>Owner</span><strong>{{ row.team }}</strong></div><div><span>Updated</span><strong>{{ row.updated }}</strong></div><div><span>Coverage</span><strong>{{ row.score }}%</strong></div></div></template>
              </UiDataGrid>
              <p class="feedback-hint">One controlled state contract replaces manual Table / Toolbar / Pagination wiring. Switch mode to server and handle request for remote datasets.</p>
            </div>
            <div class="data-list-showcase">
              <UiList v-model="listSelection" v-model:page="listPage" :items="listItems" item-key="id" title-field="name" description-field="description" selection-mode="multiple" bordered hoverable :grid="{columns:1,md:2,gap:12}" :pagination="{position:'end',compact:true}" :default-page-size="4" :page-size-options="[4,8]" aria-label="组件成熟度检查列表">
                <template #header><span>UiList · 响应式多选列表</span><UiTag color="blue">已选 {{ listSelection.length }} 项</UiTag></template>
                <template #avatar="{item}"><UiAvatar :name="item.owner" :color="item.status==='Review'?'orange':item.status==='Archived'?'gray':'blue'"/></template>
                <template #actions="{item}"><UiButton size="sm" variant="text" :disabled="item.disabled" @click="emit('notify',`查看 ${item.name}`)">查看</UiButton></template>
                <template #extra="{item}"><UiTag :color="item.status==='Ready'?'green':item.status==='Review'?'orange':'gray'">{{ item.status }}</UiTag></template>
                <template #footer>有限业务记录使用语义列表；超大数据集使用 UiVirtualList。</template>
              </UiList>
            </div>
            <div class="virtual-list-showcase">
              <div class="virtual-list-showcase-header"><div><span class="demo-label">UiVirtualList · 1,000 records</span><strong>Fixed/variable height, overscan and keyboard selection</strong></div><UiTag color="blue">Selected: {{ virtualSelection }}</UiTag></div>
              <UiVirtualList v-model="virtualSelection" :items="virtualItems" :item-size="virtualItemSize" :estimated-item-size="56" height="280" :overscan="3" selection-mode="single" measure bordered striped aria-label="Virtualized component audit">
                <template #item="{item,index,selected}"><div class="virtual-list-demo-row"><span class="virtual-list-demo-index">{{ index+1 }}</span><div><strong>{{ item.name }}</strong><small>{{ item.owner }} · {{ item.status }}<template v-if="item.detail"><br>{{ item.detail }}</template></small></div><UiTag :color="selected?'blue':item.status==='Ready'?'green':'orange'">{{ selected?'Selected':item.status }}</UiTag></div></template>
              </UiVirtualList>
              <p class="feedback-hint">Arrow / Home / End / Page keys move the active option; Enter or Space selects it. ResizeObserver keeps measured rows and the scroll anchor stable.</p>
            </div>
            <div class="steps-showcase timeline-showcase" data-steps-state-contract="connectors default navigation inline horizontal vertical label-placement controlled uncontrolled linear disabled loading empty keyboard rtl responsive ssr">
              <div class="timeline-showcase-panel steps-showcase-panel"><div class="form-demo-title"><strong>UiSteps · 可导航发布流程</strong><span>Controlled / Keyboard / Disabled</span></div><UiSteps v-model="stepsCurrent" :items="stepItems" type="navigation" loop aria-label="发布流程步骤" @change="(value,meta)=>stepsState=`当前步骤：${stepItems[value]?.title} · ${meta.source}`"/><output class="timeline-showcase-output" aria-live="polite">{{ stepsState }}</output></div>
              <div class="timeline-showcase-panel steps-showcase-panel"><div class="form-demo-title"><strong>纵向与标签布局</strong><span>Vertical / Error / Sizes</span></div><UiSteps :items="stepItems.slice(0,3).map((item,index)=>index===1?{...item,status:'error'}:item)" :current="1" direction="vertical" size="sm" aria-label="验证流程步骤"/><UiSteps :items="stepItems.slice(0,3)" :current="1" label-placement="vertical" size="lg" aria-label="居中流程步骤"/></div>
            </div>
            <div class="breadcrumb-showcase timeline-showcase" data-breadcrumb-state-contract="semantic links buttons current disabled icons collapse controlled uncontrolled wrap nowrap truncate sizes separator loading empty slots focus rtl ssr">
              <div class="timeline-showcase-panel"><div class="form-demo-title"><strong>UiBreadcrumb · 长路径折叠</strong><span>Controlled expansion / Field adapters</span></div><UiBreadcrumb v-model:expanded="breadcrumbExpanded" :items="breadcrumbItems" :max-items="4" :items-after-collapse="2" truncate aria-label="组件文档位置" @navigate="(item,meta,event)=>{event?.preventDefault();breadcrumbState=`已导航：${item.label} · ${meta.source}`}"/><output class="timeline-showcase-output" aria-live="polite">{{ breadcrumbState }}</output></div>
              <div class="timeline-showcase-panel"><div class="form-demo-title"><strong>尺寸、分隔与状态</strong><span>Text separator / Disabled / Loading</span></div><UiBreadcrumb :items="[{key:'workspace',label:'工作区',href:'#maturity'},{key:'locked',label:'受限目录',disabled:true},{key:'detail',label:'发布详情'}]" separator="/" separator-mode="text" size="lg" :wrap="false"/><UiBreadcrumb loading :loading-count="4" size="sm" aria-label="导航路径加载示例"/></div>
            </div>
            <div class="timeline-showcase" data-timeline-state-contract="vertical horizontal placement time status custom-color selection link disabled pending loading empty keyboard rtl ssr">
              <div class="timeline-showcase-panel"><div class="form-demo-title"><strong>UiTimeline · 可选择发布历程</strong><span>Opposite time / Pending / Keyboard</span></div><UiTimeline v-model="timelineSelection" :items="timelineItems" selectable interactive loop time-position="opposite" pending="等待发布" aria-label="发布历程" @change="(value,meta)=>timelineState=`已选择 ${value} · ${meta.source}`"/><output class="timeline-showcase-output" aria-live="polite">{{ timelineState }}</output></div>
              <div class="timeline-showcase-panel"><div class="form-demo-title"><strong>横向与交替布局</strong><span>Horizontal / Alternate / Dashed</span></div><UiTimeline :items="timelineItems.slice(0,3)" orientation="horizontal" placement="alternate" line="dashed" dot-variant="solid" size="sm" aria-label="横向发布历程"/></div>
            </div>
            <div class="tag-showcase" data-tag-state-contract="colors custom variants sizes dot round checkable closable link disabled keyboard rtl ssr">
              <div class="tag-showcase-group"><span class="demo-label">颜色与外观</span><div class="demo-row"><UiTag color="blue" dot>进行中</UiTag><UiTag color="green" variant="solid">已完成</UiTag><UiTag color="orange" variant="outlined">待处理</UiTag><UiTag color="purple" round>审核中</UiTag><UiTag color="#0f766e">自定义色</UiTag></div></div>
              <div class="tag-showcase-group"><span class="demo-label">尺寸与状态</span><div class="demo-row"><UiTag size="sm">Small</UiTag><UiTag size="md">Medium</UiTag><UiTag size="lg">Large</UiTag><UiTag checkable :checked="tagChecked" @update:checked="tagChecked=$event" @change="(checked,meta)=>tagState=`选择：${checked?'是':'否'} · ${meta.source}`">{{ tagChecked?'已选择':'可选择' }}</UiTag><UiTag checkable disabled>禁用</UiTag></div></div>
              <div class="tag-showcase-group"><span class="demo-label">关闭与链接</span><div class="demo-row"><UiTag v-if="tagVisible" color="red" closable @close="meta=>{tagVisible=false;tagState=`关闭 · ${meta.source}`}">可移除</UiTag><UiButton v-else size="sm" variant="text" @click="tagVisible=true;tagState='标签已恢复'">恢复标签</UiButton><UiTag href="#states" target="_self" color="blue" variant="outlined" aria-label="查看标签交互状态">查看状态矩阵</UiTag><output class="tag-showcase-output" aria-live="polite">{{ tagState }}</output></div></div>
            </div>
            <div class="demo-row"><span class="demo-label">Avatar / Badge</span><UiAvatar name="Deng Pan"/><UiAvatar name="林" color="green"/><UiAvatar name="陈" color="orange"/><UiAvatar name="王" color="purple"/><UiBadge :value="8"><UiAvatar name="组件组" square/></UiBadge><UiBadge dot status="success"><UiAvatar name="在线" color="gray"/></UiBadge></div>
            <div class="completion-showcase-grid"><div><span class="demo-label">Alert</span><UiAlert type="warning" title="配置尚未发布" description="完成检查后再发布到生产环境。" closable/></div><div><span class="demo-label">Progress</span><UiProgress :value="72"/><UiProgress :value="100" status="success" size="sm"/></div><div><span class="demo-label">Steps</span><UiSteps :items="stepItems.slice(0,3)" :current="2" type="inline"/></div><div><span class="demo-label">Timeline</span><UiTimeline :items="timelineItems"/></div><div><span class="demo-label">Skeleton</span><UiSkeleton avatar :rows="3"/></div><div><span class="demo-label">Empty</span><UiEmpty compact title="暂无审批任务" description="新的任务会显示在这里"><UiButton size="sm" variant="outline">刷新</UiButton></UiEmpty></div><div><span class="demo-label">Dropdown</span><UiDropdown :items="dropdownShowcaseItems" @select="emit('notify',`已选择：${$event.label}`)"><template #trigger><UiButton variant="outline" icon="more">更多操作</UiButton></template></UiDropdown></div></div>
            <div class="table-state-controls"><span class="demo-label">Table states</span><UiButton size="sm" variant="outline" @click="tableLoadingDemo">Loading</UiButton><UiButton size="sm" variant="outline" @click="tableError='接口请求超时，请检查网络后重试';tableLoading=false;tableEmpty=false">Error</UiButton><UiButton size="sm" variant="outline" @click="tableEmpty=true;tableError='';tableLoading=false">Empty</UiButton><UiButton size="sm" variant="text" @click="tableEmpty=false;tableError='';tableLoading=false">恢复默认</UiButton></div>
            <div class="table-system-demo">
              <UiListToolbar v-model:density="tableDensity" v-model:visible-columns="tableVisibleColumns" :columns="tableColumns" :total="88" :selected-count="tableSelected.length" :loading="tableLoading" @refresh="tableLoadingDemo"><template #primary><UiButton size="sm" variant="outline" icon="download">导出</UiButton><UiButton v-if="tableSelected.length" size="sm" variant="danger-outline" icon="trash">批量删除</UiButton></template></UiListToolbar>
              <UiTable v-model:selected-rows="tableSelected" v-model:expanded-rows="tableExpanded" v-model:sort-key="tableSortKey" v-model:sort-order="tableSortOrder" v-model:filters="tableFilters" :columns="renderedTableColumns" :rows="renderedTableRows" :density="tableDensity" :loading="tableLoading" :error="tableError" selectable expandable resizable sticky-header max-height="420px" @retry="tableLoadingDemo">
                <template #cell-component="{row}"><div class="cell-title">{{ row.component }}</div><div class="cell-subtitle">{{ row.id }}</div></template>
                <template #cell-status="{row}"><UiTag :color="row.status==='稳定'?'green':'blue'">{{ row.status }}</UiTag></template>
                <template #cell-actions="{row}"><button class="btn btn-text btn-sm" @click.stop="emit('notify',`查看 ${row.component}`)">查看</button></template>
                <template #expanded="{row}"><div class="ui-table-expanded-content"><div><span>维护团队</span><strong>{{ row.owner }}</strong></div><div><span>最新版本</span><strong>{{ row.version }}</strong></div><div><span>更新时间</span><strong>{{ row.updated }}</strong></div><div><span>场景覆盖</span><strong>{{ row.coverage }} 个</strong></div></div></template>
                <template #empty-action><button class="btn btn-outline btn-sm" @click="tableEmpty=false">恢复数据</button></template>
              </UiTable>
              <UiPagination v-model:page="demoPage" v-model:page-size="demoPageSize" :total="88" :page-size-options="[10,20,50]"/>
            </div>
            <div class="preview-note"><strong>组合原则：</strong> Toolbar 管理批量操作、密度和显示列；Table 管理结构与行状态；Pagination 只管理翻页信息。服务端模式由页面监听排序和分页事件后请求数据。</div>
          </div>
        </section>

        <section id="maturity" class="card doc-section">
          <header class="doc-section-header"><h2>通用能力补充</h2><p>补齐项目级组件库常用的导航、折叠、详情、结果、加载与紧凑选择能力，并提供可直接调用的反馈服务。</p></header>
          <div class="demo-block">
            <div class="completion-showcase-grid">
              <div class="command-palette-showcase" style="grid-column:1/-1">
                <div>
                  <span class="demo-label">Command Palette · 全局快捷命令与模糊检索</span>
                  <p>支持 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> 全局唤起、分组排序、异步检索、禁用项、焦点陷阱和打开前焦点恢复。</p>
                  <div class="button-row">
                    <UiCommandPalette v-model="commandPaletteOpen" v-model:query="commandPaletteQuery" :commands="commandPaletteCommands" @select="runPaletteCommand">
                      <template #trigger="{open}"><UiButton icon="search" @click="open">打开命令面板 <kbd>Ctrl K</kbd></UiButton></template>
                    </UiCommandPalette>
                    <UiTag color="blue">{{ commandPaletteSelection }}</UiTag>
                  </div>
                </div>
                <pre class="code-block"><code>&lt;UiCommandPalette v-model="open"
  v-model:query="query" :commands="commands"
  @select="runCommand" /&gt;</code></pre>
              </div>
              <div class="icon-showcase-card" style="grid-column:1/-1">
                <span class="demo-label">UiIcon · 公共图标、无障碍语义与隔离注册表</span>
                <div class="icon-gallery"><span v-for="name in iconDemoNames" :key="name"><UiIcon :name="name" :size="20"/><code>{{ name }}</code></span></div>
                <UiConfigProvider :icon-registry="iconDemoRegistry" direction="rtl"><div class="icon-custom-row"><UiIcon name="tenantMark" :size="28" color="var(--brand-600)" aria-label="租户品牌图标"/><UiIcon name="chevronRight" directional :size="22"/><span>自定义图标仅在当前 Provider 生效；方向图标在 RTL 下自动镜像。</span></div></UiConfigProvider>
                <pre class="code-block"><code>&lt;UiIcon name="tenantMark" :size="20" aria-label="品牌图标" /&gt;</code></pre>
              </div>
              <div class="watermark-showcase-card" style="grid-column:1/-1">
                <span class="demo-label">UiWatermark · 文本 / 图片水印与防篡改恢复</span>
                <UiWatermark :content="['Lan UI','内部审阅']" :gap="[72,64]" :font="{fontSize:14,color:'rgba(37,99,235,.16)',fontWeight:650}" aria-label="内部审阅文档水印">
                <div class="watermark-demo-document"><div><strong>组件发布检查单</strong><span>Release 1.45.0 · 视觉、键盘、类型、SSR 与产物验证</span></div><UiTag color="green">Ready</UiTag></div>
                </UiWatermark>
                <div class="preview-note"><strong>运行时契约：</strong>图片加载失败自动回退文字；高 DPI Canvas 保持清晰；MutationObserver 在图层被删除或修改后恢复，且不阻断下层点击。</div>
              </div>
              <div class="affix-showcase-card" style="grid-column:1/-1">
                <div class="form-demo-title"><strong>UiAffix · 滚动吸附操作区</strong><span>Window / 容器 · Top / Bottom · Boundary</span></div>
                <div class="affix-showcase-toolbar"><UiSegmented v-model="affixPosition" :options="[{label:'顶部吸附',value:'top'},{label:'底部吸附',value:'bottom'}]"/><UiTag :color="affixActive?'green':'gray'">{{ affixActive?'已吸附':'自然位置' }}</UiTag></div>
                <div ref="affixContainerRef" class="affix-demo-scroll" tabindex="0" aria-label="滚动查看吸附效果">
                  <div class="affix-demo-spacer"><span>向下滚动此容器</span></div>
                  <UiAffix :target="affixContainerRef" :position="affixPosition" :offset="12" @change="affixActive=$event">
                    <div class="affix-demo-actions"><strong>发布审批操作</strong><span>宽度随占位区同步，并限制在滚动容器边界内。</span><UiButton size="sm">提交审批</UiButton></div>
                  </UiAffix>
                  <div class="affix-demo-content"><p v-for="index in 5" :key="index">审计记录 {{ index }} · Props、Events、SSR 与浏览器回归均已登记。</p></div>
                </div>
                <div class="preview-note"><strong>定位契约：</strong>监听窗口或指定滚动容器，ResizeObserver 同步宽高；目标解析失败会回退到 Window 并发出 error，打印时恢复普通文档流。</div>
              </div>
              <div class="splitter-showcase-card" style="grid-column:1/-1">
                <div class="form-demo-title"><strong>UiSplitter · 可调整分栏布局</strong><span>水平 / 垂直 · 多面板 · 约束 · 折叠 · 键盘 · RTL · Lazy</span></div>
                <div class="splitter-showcase-toolbar">
                  <UiSegmented v-model="splitterDirection" :options="[{label:'水平',value:'horizontal'},{label:'垂直',value:'vertical'}]"/>
                  <div class="button-row"><UiTag color="blue">{{ splitterSizes.map(item=>`${Math.round(item)}%`).join(' / ') }}</UiTag><UiButton size="sm" variant="outline" @click="splitterRef?.toggleCollapse(2)">折叠 / 展开检查器</UiButton><UiButton size="sm" variant="text" @click="splitterRef?.reset()">重置</UiButton></div>
                </div>
                <UiSplitter ref="splitterRef" v-model="splitterSizes" class="splitter-demo" :panels="splitterPanels" :direction="splitterDirection" lazy aria-label="后台工作区可调整分栏">
                  <template #panel="{panel,size,collapsed}"><div class="splitter-demo-panel" :class="{accent:panel.key==='workspace'}"><strong>{{ panel.label }}</strong><span v-if="!collapsed">当前占比 {{ size.toFixed(1) }}%。拖动分隔条，或聚焦后使用方向键、Home / End；双击或按 Enter 可折叠。</span><code>{{ panel.key }}</code></div></template>
                </UiSplitter>
                <div class="preview-note"><strong>布局契约：</strong>仅调整相邻面板，像素和百分比尺寸统一为响应式占比；遵守 min / max、不可调整及折叠约束。Lazy 模式只移动预览线并在释放时提交，RTL 自动反转水平键位。</div>
              </div>
              <div class="tree-showcase-card" style="grid-column:1/-1">
                <div class="form-demo-title"><strong>Tree · 企业资源导航</strong><span>选择 / 复选级联 / 筛选 / 懒加载 / RTL / 虚拟化</span></div>
                <div class="tree-showcase-grid">
                  <div><UiInput v-model="resourceTreeFilter" icon="search" clearable placeholder="筛选资源节点"/><UiTree v-model="resourceTreeSelection" v-model:checked-keys="resourceTreeChecked" :data="resourceTreeData" :filter="resourceTreeFilter" :load-data="loadResourceTree" :default-expanded-keys="['workspace','engineering']" checkable show-line bordered aria-label="资源权限树"><template #suffix="{node}"><UiTag v-if="node.value==='design'" color="blue">当前</UiTag></template></UiTree></div>
                  <div class="tree-showcase-copy"><strong>当前交互状态</strong><dl><div><dt>选中节点</dt><dd><code>{{ resourceTreeSelection || '—' }}</code></dd></div><div><dt>勾选节点</dt><dd><code>{{ resourceTreeChecked.join(', ') || '—' }}</code></dd></div></dl><p>方向键移动；左右键展开或收起；Space 勾选；Enter 选择；输入字符可跳转。展开“数据中心”可体验 AbortSignal 懒加载与失败重试契约。</p><pre class="code-block"><code>&lt;UiTree v-model="selected"
  v-model:checked-keys="checked"
  :data="resources" :load-data="loadChildren"
  checkable show-line virtual /&gt;</code></pre></div>
                </div>
              </div>
              <div><span class="demo-label">Menu · 键盘方向键导航</span><UiMenu v-model="menuDemo" :items="menuItems" :default-open-keys="['resources']" aria-label="示例功能菜单" @select="toast.info(`已进入：${$event.label}`)"/></div>
              <div class="collapse-showcase" style="grid-column:1/-1" data-collapse-state-contract="controlled uncontrolled multiple accordion non-collapsible field-adapters disabled async-guard lazy destroy motion reduced-motion sizes bordered ghost slots keyboard focus loading empty rtl ssr api">
                <div class="collapse-showcase-card"><div class="form-demo-title"><strong>UiCollapse · 多项展开</strong><span>Controlled / Async guard / Lazy</span></div><UiCollapse v-model="collapseDemo" :items="collapseItems" lazy loop :before-toggle="validateCollapseToggle" aria-label="组件规范章节" @change="(_value,meta)=>collapseState=`${meta.open?'展开':'收起'}：${meta.item.label} · ${meta.source}`" @toggle-blocked="meta=>collapseState=`已阻止：${meta.item.label}`"><template #item-release="{content}"><div class="collapse-release-panel"><UiTag color="green">Guard passed</UiTag><p>{{ content }}</p></div></template></UiCollapse><output class="timeline-showcase-output" aria-live="polite">{{ collapseState }}</output></div>
                <div class="collapse-showcase-card"><div class="form-demo-title"><strong>手风琴与外观</strong><span>Uncontrolled / Non-collapsible / Icon end</span></div><UiCollapse v-model="collapseAccordion" :items="collapseItems.slice(0,3)" accordion :collapsible="false" ghost size="sm" expand-icon-position="end" aria-label="发布检查手风琴"><template #header="{label,open}"><span>{{ label }}</span><UiTag :color="open?'blue':'gray'" size="sm">{{ open?'Open':'Closed' }}</UiTag></template></UiCollapse></div>
                <div class="collapse-showcase-card"><div class="form-demo-title"><strong>加载与空状态</strong><span>Loading / Empty / Reduced motion</span></div><UiCollapse loading :loading-count="3" aria-label="正在加载规范章节"/><UiCollapse :items="[]" empty-text="暂无可展示的规范章节" ghost :animated="false" aria-label="空规范章节"/></div>
              </div>
              <div style="grid-column:1/-1"><span class="demo-label">Descriptions · 响应式详情</span><UiDescriptions title="组件档案" :items="descriptionItems" bordered/></div>
              <div><span class="demo-label">Segmented · 单选切换</span><UiSegmented v-model="segmentedDemo" :options="[{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'},{label:'季度',value:'quarter',disabled:true}]" block/><p class="feedback-hint">当前周期：{{ segmentedDemo }}</p></div>
              <div><span class="demo-label">Spin · 延迟显示与 aria-busy</span><UiSpin :spinning="spinDemo" text="正在刷新组件数据"><div style="min-height:72px;padding:12px;border:1px dashed var(--border-default);border-radius:7px">组件数据区域<br><span class="subtle">加载层不会改变内容尺寸</span></div></UiSpin><UiButton size="sm" variant="outline" style="margin-top:9px" @click="spinDemo=true;setTimeout(()=>spinDemo=false,1200)">模拟加载</UiButton></div>
              <div style="grid-column:1/-1"><span class="demo-label">Result · 结果状态</span><UiResult status="success" title="规范检查通过" description="组件契约、键盘交互和构建产物均已通过本轮校验。"><template #extra><UiButton size="sm" @click="toast.success('报告已导出')">导出报告</UiButton><UiButton size="sm" variant="outline" @click="notification.warning({title:'复核提醒',message:'建议在发布前执行一次业务页面视觉回归。'})">查看提醒</UiButton></template></UiResult></div>
              <div class="status-page-showcase" style="grid-column:1/-1">
                <div class="status-page-showcase-toolbar"><span class="demo-label">Status Page · 通用异常页</span><UiSegmented v-model="statusPageDemo" :options="['403','404','500']"/></div>
                <UiStatusPage :status="statusPageDemo" embedded @home="toast.info('返回首页')" @back="toast.info('返回上一页')" @retry="toast.success('页面已重新加载')"/>
              </div>
            </div>
            <div class="preview-note"><strong>服务式反馈：</strong><code>toast.success('保存成功')</code> 和 <code>notification.error(options)</code> 可在任意业务逻辑中调用；Host 在应用根节点只挂载一次。</div>
          </div>
        </section>

        <section id="configuration" class="card doc-section">
          <header class="doc-section-header"><h2>全局配置、本地化、主题与动效</h2><p>应用可通过 createLanUi 全局安装，也可使用 UiConfigProvider 在局部覆盖语言、尺寸、密度、层级、light / dark / system 外观、full / reduced / system 动效偏好和主题 Token。</p></header>
          <div class="demo-block">
            <div class="config-demo-toolbar"><UiSegmented v-model="configLocale" :options="[{label:'中文',value:'zh-CN'},{label:'English',value:'en-US'}]"/><UiSegmented v-model="configSize" :options="['sm','md','lg']"/><UiSegmented v-model="configDensity" :options="[{label:'紧凑',value:'compact'},{label:'默认',value:'default'},{label:'宽松',value:'comfortable'}]"/><UiSegmented v-model="configAppearance" :options="[{label:'浅色',value:'light'},{label:'深色',value:'dark'},{label:'跟随系统',value:'system'}]"/><UiSegmented v-model="configMotion" :options="[{label:'完整动效',value:'full'},{label:'减少动效',value:'reduced'},{label:'跟随系统',value:'system'}]"/></div>
            <UiConfigProvider :locale="configLocale" :size="configSize" :density="configDensity" :appearance="configAppearance" :motion="configMotion" :theme="configTheme">
              <div class="config-demo-surface">
                <div class="config-demo-row"><UiButton>Primary action</UiButton><UiButton variant="outline">Secondary</UiButton><UiSelect :options="[{label:'Design review',value:'review'},{label:'Ready to ship',value:'ready'}]" clearable searchable/><UiPopover v-model="configPortalOpen" title="Tenant scoped overlay"><template #trigger><UiButton variant="secondary">打开作用域浮层</UiButton></template><div class="preview-note"><strong>Teleport 作用域桥接：</strong>面板移动到 body 后继续继承当前 Provider 的外观、Token、语言、尺寸、密度、方向与动效偏好。</div></UiPopover></div>
                <UiFormItem :label="configLocale==='en-US'?'Delivery window':'交付周期'" :error="rangeError" composite><UiDateRangePicker v-model="rangeDemo" @invalid="rangeError=$event.message" @change="$event.valid&&(rangeError='')"/></UiFormItem>
                <UiPagination :page="2" :page-size="10" :total="88"/>
                <div class="preview-note"><strong>作用域边界：</strong>{{ themePresetSummary }}；当前动效为 <code>{{ configMotion }}</code>。Provider 输出请求与解析后的主题和动效属性，并同步到 Teleport 悬浮层。</div>
              </div>
            </UiConfigProvider>
            <div class="intl-runtime-demo">
              <div class="form-demo-title"><strong>Intl 本地化运行时</strong><span>逐键回退 · 复数 · 数字 / 日期 / 相对时间 / 列表</span></div>
              <div class="config-demo-toolbar"><UiSegmented v-model="intlLocale" :options="[{label:'简体中文',value:'zh-CN'},{label:'English',value:'en-US'},{label:'العربية',value:'ar-EG'}]"/><UiSelect v-model="intlCount" :options="[{label:'1',value:1},{label:'2',value:2},{label:'1,200',value:1200}]"/></div>
              <div class="intl-sample-grid"><div v-for="sample in intlSamples" :key="sample[0]" class="intl-sample"><span>{{ sample[0] }}</span><strong :dir="intlLocale==='ar-EG'?'rtl':'ltr'">{{ sample[1] }}</strong></div></div>
              <div class="preview-note"><strong>运行时契约：</strong>未知语言会保留自身 Locale 用于 Intl 格式化，并按配置的多级链逐键回退文案；设置 <code>fallbackLocale=false</code> 后缺失文案直接返回键名。</div>
            </div>
            <div class="locale-registry-demo">
              <div><strong>按需语言包注册表</strong><p>{{ registryStatus }}</p><code>{{ registryPreview }}</code></div>
              <div class="button-row"><UiTag :color="registryLocale==='en-US'?'gray':'green'">{{ registryLocale }}</UiTag><UiButton variant="outline" :loading="registryLoading" @click="loadFrenchLocale">{{ localeRegistryDemo.has('fr')?'重新使用 fr-FR':'按需加载 fr-FR' }}</UiButton></div>
            </div>
            <pre class="code-block" style="margin-top:14px"><code>import LanUi, { UiConfigProvider, createLanUi, createThemeController, createMotionController, defineTheme, enUS } from 'lan-ui-design-system'
app.use(LanUi)
&lt;UiConfigProvider :locale="enUS" appearance="system" motion="system" :theme="tenantTheme"&gt;...&lt;/UiConfigProvider&gt;

const tenantTheme = defineTheme({ name:'tenant', appearance:'dark', tokens:{ 'brand-600':'#7c3aed' } })
const appearance = createThemeController({ appearance:'system', storageKey:'app-theme' })
appearance.mount(document.documentElement)
const motion = createMotionController({ preference:'system', storageKey:'app-motion' })
motion.mount(document.documentElement)

const lanUi = createLanUi({ fallbackLocale: ['fr-FR', 'en-US'] })
await lanUi.loadLocale('fr-FR', () =&gt; import('./locales/fr-FR'), { activate: true })
const { tc, formatNumber, formatDate } = createLocaleTools(locale, ['fr-FR', enUS])

// 独立组件入口 · 支持 Tree-shaking 与独立 Props 类型
import UiButton from 'lan-ui-design-system/components/UiButton'</code></pre>
          </div>
        </section>

        <section id="floating" class="card doc-section">
          <header class="doc-section-header"><h2>悬浮按钮</h2><p>用于全局高频动作、帮助入口和返回顶部；固定在安全边距内，不遮挡表格操作或移动端底部导航。</p></header>
          <div class="demo-block float-button-showcase">
            <div class="float-demo-stage">
              <div class="float-demo-copy"><strong>单个悬浮按钮</strong><p>主操作使用品牌色，辅助入口使用中性表面；悬停或键盘聚焦时显示文字说明。</p></div>
              <div class="float-demo-actions"><UiFloatButton icon="plus" label="新建任务" variant="primary" @click="emit('notify','悬浮主操作已触发')"/><UiFloatButton icon="bell" label="查看通知" badge="3" @click="emit('open-notification','info')"/><UiFloatButton icon="arrowUp" label="返回顶部" @click="scrollTo('tokens')"/></div>
            </div>
            <div class="float-demo-stage">
              <div class="float-demo-copy"><strong>可展开按钮组</strong><p>一次只展示一个主入口，点击后沿纵向展开相关动作，再次点击或按 Esc 收起。</p></div>
              <div class="float-demo-group" :class="{open:floatDemoOpen}"><UiFloatButton v-if="floatDemoOpen" icon="upload" label="上传文件"/><UiFloatButton v-if="floatDemoOpen" icon="info" label="帮助中心"/><UiFloatButton icon="plus" label="展开快捷操作" variant="primary" :active="floatDemoOpen" @click="floatDemoOpen=!floatDemoOpen"/></div>
            </div>
          </div>
        </section>

        <section id="feedback" class="card doc-section">
          <header class="doc-section-header"><h2>反馈与浮层</h2><p>Toast 默认顶部居中；Notification 用于需要阅读或处理的错误；Modal 与 Drawer 分别承担阻断和上下文任务。多应用与 SSR 可启用实例隔离。</p></header>
          <div class="demo-block feedback-showcase">
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>Toast 位置</strong><span>轻量反馈 · 自动消失</span></div>
              <div class="feedback-demo-content"><UiTabs v-model="toastPlacement" :panels="false" size="sm" :items="[{label:'顶部居中',value:'top-center'},{label:'右上角',value:'top-right'},{label:'右下角',value:'bottom-right'}]"/><UiButton variant="outline" @click="emit('notify','数据保存成功','success',toastPlacement)">显示 Toast</UiButton></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>消息类型</strong><span>Message</span></div>
              <div class="feedback-demo-content"><UiButton variant="outline" @click="emit('notify','数据保存成功','success',toastPlacement)">成功</UiButton><UiButton variant="outline" @click="emit('notify','这是一条普通信息','info',toastPlacement)">信息</UiButton><UiButton variant="outline" @click="emit('notify','请检查必填项','warning',toastPlacement)">警告</UiButton><UiButton variant="danger-outline" @click="emit('notify','操作失败，请稍后重试','error',toastPlacement)">错误</UiButton></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>错误通知</strong><span>Notification · 需主动关闭</span></div>
              <div class="feedback-demo-content"><UiButton variant="danger-outline" icon="alert" @click="emit('open-notification','error')">显示错误通知</UiButton><UiButton variant="outline" icon="info" @click="emit('open-notification','info')">显示系统通知</UiButton><span class="feedback-hint">适合接口失败、权限异常、批量任务结果等需要保留上下文的信息。</span></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>任务浮层</strong><span>Overlay</span></div>
              <div class="feedback-demo-content"><UiButton @click="emit('open-modal','Modal 交互示例')">屏幕居中 Modal</UiButton><UiButton variant="secondary" @click="emit('open-drawer',{name:'上海星河科技有限公司',id:'CUS-26081001',owner:'周琪',status:'合作中',amount:286400})">右侧 Drawer</UiButton></div>
            </div>
            <div class="feedback-demo-row" data-tooltip-showcase>
              <div class="feedback-demo-heading"><strong>Tooltip 提示</strong><span>Hover · Focus · Click · Controlled</span></div>
              <div class="feedback-demo-content">
                <UiTooltip content="Hover 与键盘 Focus 共享打开原因" placement="top-start" :show-delay="120" :hide-delay="80" @open-change="(open,meta)=>tooltipState=`${open?'打开':'关闭'} · ${meta.source}`"><template #default="{describedby,open}"><button class="icon-btn outline" :aria-describedby="describedby" :aria-pressed="open" aria-label="Tooltip 焦点示例"><AppIcon name="info"/></button></template></UiTooltip>
                <UiTooltip v-model:open="tooltipDemoOpen" trigger="click" placement="bottom-start" wrap :max-width="220" content="点击触发支持外部点击和 Escape 关闭；长文案可以在最大宽度内自然换行。"><UiButton variant="outline">点击切换</UiButton></UiTooltip>
                <UiTooltip content="禁用状态不会创建浮层" disabled><UiButton variant="outline" disabled>禁用提示</UiButton></UiTooltip>
                <span class="feedback-hint" aria-live="polite">{{ tooltipState }}；受控状态：{{ tooltipDemoOpen?'已打开':'已关闭' }}</span>
              </div>
            </div>
            <div class="feedback-demo-row" data-popover-showcase>
              <div class="feedback-demo-heading"><strong>Popover 与确认</strong><span>Click · Hover / Focus · Manual · Focus trap</span></div>
              <div class="feedback-demo-content">
                <UiPopover v-model="popoverDemoOpen" title="客户快捷信息" placement="bottom-start" :width="280" auto-focus trap-focus @open-change="(open,meta)=>popoverState=`${open?'打开':'关闭'} · ${meta.source}`">
                  <template #trigger><UiButton variant="outline">交互式 Popover</UiButton></template>
                  <p style="margin:0">支持受控状态、外部点击、Escape、自动聚焦和可选焦点循环。</p>
                  <template #footer="{close}"><UiButton size="sm" variant="text" data-popover-keep-open>保留打开</UiButton><UiButton size="sm" @click="close('content')">完成</UiButton></template>
                </UiPopover>
                <UiPopover trigger="hover focus" title="发布提示" placement="top-start" :show-delay="120" :hide-delay="100" :width="240"><template #trigger><UiButton variant="text">Hover / Focus</UiButton></template>触发器与面板共享打开原因，可安全移动到面板内容。</UiPopover>
                <UiPopover disabled title="禁用浮层"><template #trigger><UiButton variant="outline" disabled>禁用</UiButton></template>不会创建面板。</UiPopover>
                <UiPopconfirm title="确认删除这条记录？" message="删除后数据将进入回收站。" :before-confirm="asyncConfirm" danger @confirm="emit('notify','记录已移入回收站')" @error="emit('notify','删除操作失败','error')"><UiButton variant="danger-outline">删除记录</UiButton></UiPopconfirm>
                <span class="feedback-hint" aria-live="polite">{{ popoverState }}；受控状态：{{ popoverDemoOpen?'已打开':'已关闭' }}</span>
              </div>
            </div>
            <div class="feedback-demo-row" data-dropdown-showcase>
              <div class="feedback-demo-heading"><strong>Dropdown 菜单</strong><span>Click · Hover / Focus · Context menu · Typeahead</span></div>
              <div class="feedback-demo-content">
                <UiDropdown v-model="dropdownDemoOpen" v-model:active-index="dropdownActiveIndex" :items="dropdownShowcaseItems" placement="bottom-end" @open-change="(open,meta)=>dropdownState=`${open?'打开':'关闭'} · ${meta.source}`" @active-change="meta=>dropdownState=`聚焦 ${meta.item?.label||meta.index} · ${meta.source}`" @select="(item,meta)=>{dropdownState=`选择 ${item.label} · ${meta.source}`;emit('notify',`已选择：${item.label}`)}"><template #trigger><UiButton variant="outline" icon="more">受控菜单</UiButton></template></UiDropdown>
                <UiDropdown trigger="hover focus" :items="dropdownShowcaseItems.slice(0,4)" placement="top-start" :show-delay="120" :hide-delay="100" :close-on-select="false"><template #trigger><UiButton variant="text">Hover / Focus</UiButton></template></UiDropdown>
                <UiDropdown trigger="contextmenu" :items="dropdownShowcaseItems" placement="bottom-start"><template #trigger><UiButton variant="secondary">右键打开</UiButton></template></UiDropdown>
                <UiDropdown disabled :items="dropdownShowcaseItems"><template #trigger><UiButton variant="outline" disabled>禁用菜单</UiButton></template></UiDropdown>
                <span class="feedback-hint" aria-live="polite">{{ dropdownState }}；受控索引：{{ dropdownActiveIndex }}</span>
              </div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>产品引导</strong><span>UiTour · Guided onboarding</span></div>
              <div class="feedback-demo-content"><div class="tour-demo-targets"><UiButton id="component-tour-search" variant="outline" icon="search">搜索</UiButton><UiButton id="component-tour-preview" variant="outline" icon="view">预览</UiButton><UiButton id="component-tour-api" variant="outline" icon="file">API</UiButton></div><UiButton @click="tourCurrent=0;tourOpen=true">开始引导</UiButton><span class="feedback-hint">目标高亮、视口碰撞处理、RTL 键位、焦点返回、可选遮罩和目标缺失诊断。</span><UiTour v-model="tourOpen" v-model:current="tourCurrent" :steps="tourSteps" aria-label="组件中心使用引导"/></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>加载反馈</strong><span>Skeleton</span></div>
              <div class="feedback-demo-content"><div style="width:260px"><UiSkeleton :rows="3"/></div></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>应用级隔离</strong><span>Multi-app · SSR</span></div>
              <div class="feedback-demo-content"><code>createLanUi({ isolated: true })</code><span class="feedback-hint">Host 自动绑定当前应用，卸载时清理消息状态与全部计时器；SSR 渲染后调用 plugin.dispose()。</span></div>
            </div>
          </div>
        </section>

        <section id="states" class="card doc-section">
          <header class="doc-section-header"><h2>交互状态矩阵</h2><p>每个组件在交付前都需覆盖以下状态和键盘行为。</p></header>
          <div class="demo-block" style="overflow:auto">
            <table class="state-matrix"><thead><tr><th>组件</th><th>Default</th><th>Hover</th><th>Pressed</th><th>Focus</th><th>Disabled</th><th>Loading / Error</th></tr></thead><tbody>
              <tr><td>Button</td><td>基础视觉</td><td>加深 + 上移</td><td>复位</td><td>3px Ring</td><td>48% 透明</td><td>Spinner</td></tr>
              <tr><td>Input</td><td>轻边框</td><td>品牌浅边框</td><td>—</td><td>品牌边框 + Ring</td><td>弱背景</td><td>红边框 + 文案</td></tr>
              <tr><td>AutoComplete</td><td>自由输入</td><td>候选高亮</td><td>选择并提交</td><td>Combobox + Active descendant</td><td>只读 / 禁用</td><td>异步加载 / 空 / 错误</td></tr>
              <tr><td>InputTag</td><td>标签录入</td><td>标签与清除按钮强调</td><td>分隔符提交 / 编辑 / 移除</td><td>方向键选择 + Ring</td><td>只读 / 禁用</td><td>异步校验 / 重复 / 上限</td></tr>
              <tr><td>Tag</td><td>Soft / Solid / Outlined</td><td>交互边框强调</td><td>选择 / 关闭 / 链接</td><td>原生 Button / Link + Ring</td><td>移除导航与 Tab 顺序</td><td>受控选择 / 自定义颜色</td></tr>
              <tr><td>Breadcrumb</td><td>语义路径 / 自动当前页</td><td>链接背景强调</td><td>链接 / 按钮 / 展开折叠</td><td>原生 Tab 顺序 + Ring</td><td>禁用项保留上下文</td><td>Loading / Empty / 长路径</td></tr>
              <tr><td>Timeline</td><td>纵向 / 横向 / 交替</td><td>事件内容强调</td><td>选择 / 链接 / 程序化激活</td><td>方向键 / Home / End</td><td>跳过禁用事件</td><td>Pending / Loading / Empty</td></tr>
              <tr><td>Tooltip</td><td>自动定位 + Arrow</td><td>延时打开 / 重入取消</td><td>Click / Manual / 受控</td><td>Focus + Describedby + Esc</td><td>不创建浮层</td><td>空内容抑制 / 碰撞翻转</td></tr>
              <tr><td>Popover</td><td>受控 / 非受控 + Arrow</td><td>Hover / Focus 延时与面板驻留</td><td>Click / Manual / 内容关闭</td><td>ARIA Dialog + 可选 Focus trap</td><td>触发器禁用语义</td><td>Loading / 碰撞翻转 / 作用域 Portal</td></tr>
              <tr><td>Dropdown</td><td>受控 / 非受控 + Portal</td><td>Hover / Focus 延时与面板驻留</td><td>Click / Context menu / Select</td><td>Arrow / Home / End / Typeahead / Tab</td><td>跳过禁用项并保留语义</td><td>Loading / Empty / 碰撞翻转</td></tr>
              <tr><td>QueryBuilder</td><td>递归条件树</td><td>规则边框强调</td><td>添加 / 复制 / 排序 / 删除</td><td>组合框 + 键盘快捷键</td><td>只读 / 禁用</td><td>缺失值 / 范围 / 自定义校验</td></tr>
              <tr><td>NumberInput</td><td>数值草稿</td><td>控制键高亮</td><td>步进并限界</td><td>Spinbutton + Ring</td><td>控制键锁定</td><td>解析错误 + 恢复</td></tr>
              <tr><td>OtpInput</td><td>分段验证码</td><td>单格边框强调</td><td>自动移焦 / 整段粘贴</td><td>方向键 + Home / End</td><td>只读 / 禁用</td><td>非法字符 / 错误 Ring</td></tr>
              <tr><td>Slider / Range</td><td>单值 / 区间</td><td>Tooltip + 高亮</td><td>拖拽 / 点击 Mark</td><td>ARIA slider + Ring</td><td>禁止交互</td><td>只读 / 错误</td></tr>
              <tr><td>Rate</td><td>integer / fractional</td><td>live preview</td><td>select / clear</td><td>ARIA slider + Ring</td><td>readonly / disabled</td><td>form error</td></tr>
              <tr><td>Calendar</td><td>single / multiple / range</td><td>range preview</td><td>select / clear / today</td><td>ARIA grid + roving tabindex</td><td>readonly / disabled date</td><td>min / max / empty</td></tr>
              <tr><td>TimeRange</td><td>字符串 / Date / 时间戳</td><td>双输入聚焦</td><td>选择 / 清除</td><td>Group + Label / Description</td><td>禁用 / 只读表单</td><td>顺序 / Min / Max / Empty</td></tr>
              <tr><td>DateTime / Range</td><td>字符串 / Date / 时间戳</td><td>单输入 / 双输入聚焦</td><td>选择 / 清除</td><td>Label / Group + Description</td><td>禁用 / 错误</td><td>时区 / DST / 顺序 / Min / Max</td></tr>
              <tr><td>Image</td><td>lazy / eager</td><td>preview affordance</td><td>zoom / rotate / pan</td><td>Dialog focus trap</td><td>Preview disabled</td><td>fallback / retry</td></tr>
              <tr><td>Carousel</td><td>slide / fade</td><td>暂停自动播放</td><td>箭头 / 指示器 / 滑动</td><td>逻辑方向键 + Ring</td><td>有限端点锁定</td><td>Visibility / Reduced Motion / Empty</td></tr>
              <tr><td>QRCode</td><td>真实 SVG 矩阵</td><td>下载动作强调</td><td>刷新 / 下载</td><td>命名图片 + Live 状态</td><td>—</td><td>Loading / Expired / Scanned / Invalid</td></tr>
              <tr><td>Barcode</td><td>真实线性条纹</td><td>下载动作强调</td><td>刷新 / 下载</td><td>命名图片 + Live 状态</td><td>—</td><td>Loading / Expired / Scanned / Invalid</td></tr>
              <tr><td>CronEditor</td><td>预设 / 自定义表达式</td><td>有效状态强调</td><td>选择预设 / 编辑 / 预览</td><td>表单命名 + Alert</td><td>只读 / 禁用</td><td>字段错误 / 无未来执行时间</td></tr>
              <tr><td>KeyValueEditor</td><td>启用 / 停用行</td><td>有效状态强调</td><td>增删 / 排序 / 导入</td><td>分行 ARIA + 错误关联</td><td>只读 / 禁用</td><td>空键 / 重复键 / 格式错误</td></tr>
              <tr><td>Watermark</td><td>Text / Image</td><td>内容可交互</td><td>不拦截指针</td><td>命名图片可选</td><td>关闭观察</td><td>图片回退 / DOM 自修复</td></tr>
              <tr><td>Affix</td><td>页面流内</td><td>保留子操作</td><td>固定至边缘</td><td>内容焦点可见</td><td>立即回归文档流</td><td>目标回退 / 边界停止</td></tr>
              <tr><td>Splitter</td><td>响应式占比分栏</td><td>分隔条高亮</td><td>相邻面板调整 / 折叠</td><td>ARIA Separator + Ring</td><td>锁定分隔条</td><td>约束钳制 / Lazy 预览</td></tr>
              <tr><td>Tree</td><td>Hierarchy</td><td>Active node</td><td>Select / Check</td><td>Active descendant + Ring</td><td>Node / Tree disabled</td><td>Lazy / Retry / Empty</td></tr>
              <tr><td>Navigation</td><td>次级文字</td><td>弱白背景</td><td>加深</td><td>可见 Ring</td><td>不可点击</td><td>展开/收起</td></tr>
              <tr><td>Table row</td><td>白色表面</td><td>品牌浅背景</td><td>—</td><td>选择框焦点</td><td>—</td><td>Skeleton / Empty</td></tr>
              <tr><td>Typography</td><td>语义文本</td><td>动作强调</td><td>复制 / 编辑 / 展开</td><td>命名操作 + 状态</td><td>动作保持可见</td><td>复制错误 / 溢出回退</td></tr>
              <tr><td>List</td><td>语义记录</td><td>行高亮</td><td>选择 / 操作</td><td>Listbox + Active descendant</td><td>跳过停用项</td><td>Skeleton / Error / Empty</td></tr>
            </tbody></table>
            <div class="preview-note"><strong>键盘：</strong> Tab 遍历控件；Enter/Space 激活；AutoComplete、数值框和滑块支持方向键；标签输入支持回车、分隔符、整段粘贴、方向键选择及 Backspace 移除；验证码支持方向键、Home / End、Backspace、Delete 与整段粘贴；轮播支持逻辑方向键、Home / End，聚焦即暂停；图片预览支持方向键、加减号、R、0 与 Esc；Modal 打开后焦点进入弹层，关闭后返回触发元素。</div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

\n

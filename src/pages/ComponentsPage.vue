<script setup>
import { computed, reactive, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiIcon from '../components/UiIcon.vue'
import UiImage from '../components/UiImage.vue'
import UiButton from '../components/UiButton.vue'
import UiCalendar from '../components/UiCalendar.vue'
import UiCard from '../components/UiCard.vue'
import UiInput from '../components/UiInput.vue'
import UiNumberInput from '../components/UiNumberInput.vue'
import UiSlider from '../components/UiSlider.vue'
import UiRate from '../components/UiRate.vue'
import UiSelect from '../components/UiSelect.vue'
import UiAutoComplete from '../components/UiAutoComplete.vue'
import UiTag from '../components/UiTag.vue'
import UiTextarea from '../components/UiTextarea.vue'
import UiDatePicker from '../components/UiDatePicker.vue'
import UiTimePicker from '../components/UiTimePicker.vue'
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
import UiGrid from '../components/UiGrid.vue'
import UiCol from '../components/UiCol.vue'
import UiSpace from '../components/UiSpace.vue'
import UiDivider from '../components/UiDivider.vue'
import UiTabs from '../components/UiTabs.vue'
import UiBreadcrumb from '../components/UiBreadcrumb.vue'
import UiAvatar from '../components/UiAvatar.vue'
import UiBadge from '../components/UiBadge.vue'
import UiSkeleton from '../components/UiSkeleton.vue'
import UiEmpty from '../components/UiEmpty.vue'
import UiAlert from '../components/UiAlert.vue'
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
import UiStatistic from '../components/UiStatistic.vue'
import { createLocaleRegistry, createLocaleTools } from '../config.js'
import { formatDateValue } from '../date.js'
import { getContrastRatio } from '../color.js'
import { createIconRegistry } from '../icons.js'
import { notification, toast } from '../feedback.js'
import { darkTheme, defineTheme } from '../theme.js'
const emit=defineEmits(['notify','open-modal','open-drawer','open-notification'])
const toc=[['tokens','Design Tokens'],['typography','字体与间距'],['layout','布局规范'],['buttons','Button 按钮'],['forms','表单控件'],['data','数据展示'],['maturity','通用补充'],['configuration','全局配置'],['floating','悬浮按钮'],['feedback','反馈与浮层'],['states','交互状态']]
const current=ref('tokens');const switchOn=ref(true);const demoTab=ref('概览');const loading=ref(false);const invalid=ref(false)
const configPortalOpen=ref(false)
const statusPageDemo=ref('403')
const customerName=ref('');const customerType=ref('');const searchableType=ref('');const passwordDemo=ref('LanUI2026');const notes=ref('');const toastPlacement=ref('top-center')
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
const quantityDemo=ref(12.5);const budgetDemo=ref(286400);const percentDemo=ref(68)
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
const demoDate=ref('2026-08-11');const calendarDemo=ref('2026-08-12');const calendarRangeDemo=ref(['2026-08-10','2026-08-16']);const demoTime=ref('09:30');const demoDateTime=ref('2026-08-11T14:30');const zonedInstant=ref(new Date('2026-08-11T06:30:00.000Z'));const demoTimeZone=ref('Asia/Shanghai');const demoFiles=ref([{id:'release-guide',name:'lan-ui-upload-guide.pdf',size:186368,status:'success',percent:100,response:{url:'/uploads/lan-ui-upload-guide.pdf'}}])
const zonedPreview=computed(()=>formatDateValue(zonedInstant.value,{mode:'datetime',timeZone:'UTC',precision:'second'}))
const demoPage=ref(3);const demoPageSize=ref(10);const floatDemoOpen=ref(false)
const checkboxDemo=ref(['邮件通知']);const radioDemo=ref('标准版');const popoverDemoOpen=ref(false);const dropdownDemoOpen=ref(false)
const formRef=ref(null);const validatedForm=reactive({customer:{name:'',email:'',password:'LanUI-2026',confirm:'LanUI-2026'},contacts:[{name:'李明',email:'li@example.com'}]});const validationRules={customer:{name:[{required:true,message:'请输入客户名称'},{min:2,message:'客户名称至少 2 个字符'}],email:[{required:true,message:'请输入企业邮箱'},{type:'email',message:'请输入有效的企业邮箱'}]}}
const schemaFormRef=ref(null)
const schemaFormModel=reactive({account:{type:'business',name:'Lan UI 工作区',email:'owner@example.com'},region:'east',taxId:'',contacts:[{role:'owner',name:'李明',email:'li@example.com'},{role:'reviewer',name:'王敏',email:'wang@example.com'}]})
const schemaFormDefinition=[{
  key:'workspace',title:'工作区配置',description:'字段、布局、条件显隐与校验均由 Schema 声明。',columns:2,fields:[
    {name:'account.type',label:'账户类型',type:'segmented',options:[{label:'企业',value:'business'},{label:'个人',value:'personal'}],props:{block:true},span:2},
    {name:'account.name',label:'工作区名称',required:true,rules:[{required:true,message:'请输入工作区名称'},{min:2,message:'至少输入 2 个字符'}],props:{clearable:true,placeholder:'请输入工作区名称'}},
    {name:'account.email',label:'管理员邮箱',required:true,rules:[{required:true,message:'请输入管理员邮箱'},{type:'email',message:'请输入有效邮箱'}],props:{clearable:true,placeholder:'owner@example.com'}},
    {name:'region',label:'业务区域',type:'select',options:[{label:'华东区域',value:'east'},{label:'华南区域',value:'south'},{label:'海外区域',value:'global'}],props:{clearable:true,searchable:true}},
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
const menuDemo=ref('overview');const collapseDemo=ref(['guideline']);const segmentedDemo=ref('week');const spinDemo=ref(false)
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
const configLocale=ref('en-US');const configSize=ref('sm');const configDensity=ref('compact');const configAppearance=ref('system');const rangeDemo=ref(['2026-08-01','2026-08-11']);const rangeError=ref('')
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
const menuItems=[{key:'overview',label:'项目总览',icon:'home'},{key:'resources',label:'资源管理',icon:'layers',children:[{key:'components',label:'组件清单',badge:50},{key:'tokens',label:'设计 Token'}]},{key:'disabled',label:'已停用入口',icon:'file',disabled:true}]
const collapseItems=[{key:'guideline',label:'使用规范',content:'优先复用现有组件和语义 Token，业务层只负责组合，不复制基础交互。',extra:'必读'},{key:'accessibility',label:'无障碍要求',content:'所有交互均支持键盘操作、可见焦点和清晰的辅助技术名称。'},{key:'release',label:'发布流程',content:'变更需要经过单测、契约、构建和业务页面回归。'}]
const descriptionItems=[{key:'name',label:'当前成熟度',value:'Theme Portal P35'},{key:'version',label:'当前版本',value:'1.31.0'},{key:'status',label:'状态',value:'稳定'},{key:'owner',label:'维护团队',value:'基础组件组'},{key:'updated',label:'最近更新',value:'2026-08-13'},{key:'coverage',label:'用例覆盖',value:'69 组件、12 个 Teleport 主题桥接、系统偏好、受控队列、双语配置、子路径、SSR、RTL、ARIA、三浏览器与性能预算'}]
const demoImage=(label,from,to)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="420" rx="28" fill="url(#g)"/><circle cx="500" cy="90" r="96" fill="white" opacity=".12"/><path d="M0 345 170 190l110 92 92-76 268 214H0Z" fill="white" opacity=".18"/><text x="38" y="64" fill="white" font-family="Arial,sans-serif" font-size="26" font-weight="700">${label}</text><text x="38" y="96" fill="white" opacity=".78" font-family="Arial,sans-serif" font-size="15">Lan UI · release gallery</text></svg>`)}`
const imageGallery=[demoImage('Design audit','#2563eb','#0f766e'),demoImage('Component review','#7c3aed','#db2777'),demoImage('Release ready','#0f766e','#ca8a04')]
const gridQuery=ref('');const gridPage=ref(1);const gridPageSize=ref(10);const gridFilters=ref({});const gridSortKey=ref('name');const gridSortOrder=ref('asc');const gridSelected=ref([]);const gridExpanded=ref([]);const gridDensity=ref('default');const gridVisibleColumns=ref(['name','team','status','score'])
const gridColumns=[{key:'name',label:'Component',sortable:true,minWidth:'180px'},{key:'team',label:'Owner',sortable:true,minWidth:'130px'},{key:'status',label:'Status',filterable:true,filterOptions:['Stable','Review'],minWidth:'110px'},{key:'score',label:'Coverage',sortable:true,width:'110px',align:'right'}]
const gridRows=Array.from({length:86},(_,index)=>({id:`GRID-${String(index+1).padStart(3,'0')}`,name:['Button','DataGrid','Calendar','Tree','Upload','VirtualList'][index%6]+` ${index+1}`,team:['Forms','Data','Navigation'][index%3],status:index%5===0?'Review':'Stable',score:72+(index*7)%29,updated:`2026-08-${String(1+index%12).padStart(2,'0')}`}))
const virtualSelection=ref('virtual-3')
const virtualItems=Array.from({length:1000},(_,index)=>({id:`virtual-${index}`,name:`Component audit #${String(index+1).padStart(4,'0')}`,owner:['Design','Frontend','QA'][index%3],status:index%7===0?'Review':'Ready',detail:index%5===0?'Variable-height note: token and keyboard contracts included.':''}))
const virtualItemSize=item=>item.detail?68:52
const advancedOptions=['华东区域','华南区域','华北区域','西南区域','海外区域'];const treeOptions=[{label:'浙江省',value:'zhejiang',children:[{label:'杭州市',value:'hangzhou'},{label:'宁波市',value:'ningbo'}]},{label:'江苏省',value:'jiangsu',children:[{label:'南京市',value:'nanjing'},{label:'苏州市',value:'suzhou'}]}];const cascaderOptions=[{label:'浙江省',value:'zhejiang',children:[{label:'杭州市',value:'hangzhou',children:[{label:'西湖区',value:'xihu'},{label:'滨江区',value:'binjiang'}]},{label:'宁波市',value:'ningbo'}]},{label:'江苏省',value:'jiangsu',children:[{label:'南京市',value:'nanjing'}]}];const transferOptions=[{label:'组件 API',value:'api'},{label:'交互规范',value:'interaction'},{label:'无障碍规范',value:'a11y'},{label:'视觉 Token',value:'token'},{label:'业务模板',value:'template'}]
const stepItems=[{title:'基础规范',description:'Token 与布局'},{title:'组件实现',description:'状态与交互'},{title:'业务验收',description:'页面回归'}];const timelineItems=[{title:'完成组件审计',time:'09:30',status:'success'},{title:'同步业务页面',time:'11:20',status:'success'},{title:'执行视觉回归',time:'14:00'}]
const tableDensity=ref('default');const tableVisibleColumns=ref(['component','version','status','coverage','actions']);const tableSelected=ref([]);const tableExpanded=ref([]);const tableSortKey=ref('component');const tableSortOrder=ref('asc');const tableFilters=ref({});const tableLoading=ref(false);const tableError=ref('');const tableEmpty=ref(false)
const tableColumns=[{key:'component',label:'组件',minWidth:'160px',sortable:true},{key:'version',label:'版本',minWidth:'90px'},{key:'status',label:'状态',minWidth:'110px',filterable:true,filterOptions:['稳定','测试中']},{key:'coverage',label:'覆盖场景',minWidth:'110px',sortable:true},{key:'actions',label:'操作',width:'90px',align:'right',configurable:false,resizable:false}]
const tableRows=[{id:'CMP-001',component:'Button',version:'1.2.0',status:'稳定',coverage:18,owner:'交互组件组',updated:'2026-08-11'},{id:'CMP-002',component:'Table',version:'1.0.0',status:'稳定',coverage:12,owner:'数据组件组',updated:'2026-08-11'},{id:'CMP-003',component:'DatePicker',version:'1.0.0',status:'测试中',coverage:8,owner:'表单组件组',updated:'2026-08-10'},{id:'CMP-004',component:'Upload',version:'1.28.0',status:'稳定',coverage:16,owner:'表单组件组',updated:'2026-08-13'}]
const renderedTableColumns=computed(()=>tableColumns.map(column=>({...column,hidden:!tableVisibleColumns.value.includes(column.key)})))
const renderedTableRows=computed(()=>{if(tableEmpty.value)return [];let rows=tableRows.filter(row=>Object.entries(tableFilters.value).every(([key,value])=>!value||row[key]===value));if(!tableSortKey.value||!tableSortOrder.value)return rows;return [...rows].sort((a,b)=>{const left=a[tableSortKey.value],right=b[tableSortKey.value];const value=typeof left==='number'?left-right:String(left).localeCompare(String(right));return value*(tableSortOrder.value==='asc'?1:-1)})})
function scrollTo(id){current.value=id;document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
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
    <div class="page-heading"><div><UiBreadcrumb :items="[{label:'Design System',href:'#/components'},{label:'组件用例'}]"/><h1>组件用例中心</h1><p>可交互的组件 Variant、State 与使用规范 · Vue 3 实现</p></div><div class="page-actions"><a class="btn btn-outline" href="/component-preview.html" target="_blank"><AppIcon name="external" :size="15"/>打开一页预览</a><UiButton icon="download" @click="emit('notify','Token JSON 已准备')">导出 Token</UiButton></div></div>
    <div class="docs-layout"><nav class="card docs-toc" aria-label="组件目录"><button v-for="item in toc" :key="item[0]" class="toc-link" :class="{active:current===item[0]}" @click="scrollTo(item[0])">{{ item[1] }}</button></nav>
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
            <h3 class="preview-subtitle">Spacing scale</h3><div class="spacing-row"><div v-for="n in [4,8,12,16,20,24,32,40,48]" :key="n" class="space-token"><span class="space-bar" :style="{'--s':`${n}px`}"/><code>{{ n }}</code></div></div>
          </div>
        </section>

        <section id="layout" class="card doc-section">
          <header class="doc-section-header"><h2>布局规范</h2><p>采用 12 栏响应式栅格、统一内容宽度和页面骨架，保证列表、表单与看板在不同屏幕下保持稳定节奏。</p></header>
          <div class="demo-block layout-showcase">
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
              <label class="field"><span class="field-label">日期时间</span><UiDatePicker v-model="demoDateTime" mode="datetime"/><span class="field-help">合并日期与具体时刻</span></label>
              <label class="field"><span class="field-label">时区感知时刻</span><div class="form-inline-pair"><UiSelect v-model="demoTimeZone" :options="['Asia/Shanghai','UTC','America/New_York']"/><UiDatePicker v-model="zonedInstant" mode="datetime" value-type="date" :time-zone="demoTimeZone" precision="second" :step="1"/></div><span class="field-help">同一 Instant · UTC {{ zonedPreview }}</span></label>
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
          <header class="doc-section-header"><h2>列表与数据展示</h2><p>UiTable、UiListToolbar 与 UiPagination 组成完整列表系统，覆盖列配置、密度、排序、选择、展开和异步状态。</p></header>
          <div class="demo-block">
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
            <div class="data-grid-showcase">
              <div class="virtual-list-showcase-header"><div><span class="demo-label">UiDataGrid ? client orchestration</span><strong>Search, filter, sort, selection, expansion, columns and pagination</strong></div><UiTag color="blue">Selected: {{ gridSelected.length }}</UiTag></div>
              <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:page-size="gridPageSize" v-model:filters="gridFilters" v-model:sort-key="gridSortKey" v-model:sort-order="gridSortOrder" v-model:selected-rows="gridSelected" v-model:expanded-rows="gridExpanded" v-model:density="gridDensity" v-model:visible-columns="gridVisibleColumns" :columns="gridColumns" :rows="gridRows" :page-size-options="[10,20,50]" :query-fields="['name','team','status']" selectable expandable sticky-header resizable max-height="420px" aria-label="Component release data grid">
                <template #toolbar-primary><UiButton size="sm" variant="outline" icon="download">Export</UiButton></template>
                <template #cell-name="{row}"><div class="cell-title">{{ row.name }}</div><div class="cell-subtitle">{{ row.id }}</div></template>
                <template #cell-status="{value}"><UiTag :color="value==='Stable'?'green':'orange'">{{ value }}</UiTag></template>
                <template #cell-score="{value}"><strong>{{ value }}%</strong></template>
                <template #expanded="{row}"><div class="ui-table-expanded-content"><div><span>Owner</span><strong>{{ row.team }}</strong></div><div><span>Updated</span><strong>{{ row.updated }}</strong></div><div><span>Coverage</span><strong>{{ row.score }}%</strong></div></div></template>
              </UiDataGrid>
              <p class="feedback-hint">One controlled state contract replaces manual Table / Toolbar / Pagination wiring. Switch mode to server and handle request for remote datasets.</p>
            </div>
            <div class="virtual-list-showcase">
              <div class="virtual-list-showcase-header"><div><span class="demo-label">UiVirtualList · 1,000 records</span><strong>Fixed/variable height, overscan and keyboard selection</strong></div><UiTag color="blue">Selected: {{ virtualSelection }}</UiTag></div>
              <UiVirtualList v-model="virtualSelection" :items="virtualItems" :item-size="virtualItemSize" :estimated-item-size="56" height="280" :overscan="3" selection-mode="single" measure bordered striped aria-label="Virtualized component audit">
                <template #item="{item,index,selected}"><div class="virtual-list-demo-row"><span class="virtual-list-demo-index">{{ index+1 }}</span><div><strong>{{ item.name }}</strong><small>{{ item.owner }} · {{ item.status }}<template v-if="item.detail"><br>{{ item.detail }}</template></small></div><UiTag :color="selected?'blue':item.status==='Ready'?'green':'orange'">{{ selected?'Selected':item.status }}</UiTag></div></template>
              </UiVirtualList>
              <p class="feedback-hint">Arrow / Home / End / Page keys move the active option; Enter or Space selects it. ResizeObserver keeps measured rows and the scroll anchor stable.</p>
            </div>
            <div class="demo-row"><span class="demo-label">Tags</span><UiTag color="blue" dot>进行中</UiTag><UiTag color="green" dot>已完成</UiTag><UiTag color="orange" dot>待处理</UiTag><UiTag color="red" dot>失败</UiTag><UiTag color="gray">已停用</UiTag></div>
            <div class="demo-row"><span class="demo-label">Avatar / Badge</span><UiAvatar name="Deng Pan"/><UiAvatar name="林" color="green"/><UiAvatar name="陈" color="orange"/><UiAvatar name="王" color="purple"/><UiBadge :value="8"><UiAvatar name="组件组" square/></UiBadge><UiBadge dot status="success"><UiAvatar name="在线" color="gray"/></UiBadge></div>
            <div class="completion-showcase-grid"><div><span class="demo-label">Alert</span><UiAlert type="warning" title="配置尚未发布" description="完成检查后再发布到生产环境。" closable/></div><div><span class="demo-label">Progress</span><UiProgress :value="72"/><UiProgress :value="100" status="success" size="sm"/></div><div><span class="demo-label">Steps</span><UiSteps :items="stepItems" :current="2"/></div><div><span class="demo-label">Timeline</span><UiTimeline :items="timelineItems"/></div><div><span class="demo-label">Skeleton</span><UiSkeleton avatar :rows="3"/></div><div><span class="demo-label">Empty</span><UiEmpty compact title="暂无审批任务" description="新的任务会显示在这里"><UiButton size="sm" variant="outline">刷新</UiButton></UiEmpty></div><div><span class="demo-label">Dropdown</span><UiDropdown v-model="dropdownDemoOpen" :items="[{label:'编辑资料',icon:'edit'},{label:'复制链接',icon:'copy'},{divider:true},{label:'停用账号',icon:'alert'}]" @select="emit('notify',`已选择：${$event.label}`)"><template #trigger><UiButton variant="outline" icon="more">更多操作</UiButton></template></UiDropdown></div></div>
            <div class="table-state-controls"><span class="demo-label">Table states</span><UiButton size="sm" variant="outline" @click="tableLoadingDemo">Loading</UiButton><UiButton size="sm" variant="outline" @click="tableError='接口请求超时，请检查网络后重试';tableLoading=false;tableEmpty=false">Error</UiButton><UiButton size="sm" variant="outline" @click="tableEmpty=true;tableError='';tableLoading=false">Empty</UiButton><UiButton size="sm" variant="text" @click="tableEmpty=false;tableError='';tableLoading=false">恢复默认</UiButton></div>
            <div class="table-system-demo">
              <UiListToolbar v-model:density="tableDensity" v-model:visible-columns="tableVisibleColumns" :columns="tableColumns" :total="86" :selected-count="tableSelected.length" :loading="tableLoading" @refresh="tableLoadingDemo"><template #primary><UiButton size="sm" variant="outline" icon="download">导出</UiButton><UiButton v-if="tableSelected.length" size="sm" variant="danger-outline" icon="trash">批量删除</UiButton></template></UiListToolbar>
              <UiTable v-model:selected-rows="tableSelected" v-model:expanded-rows="tableExpanded" v-model:sort-key="tableSortKey" v-model:sort-order="tableSortOrder" v-model:filters="tableFilters" :columns="renderedTableColumns" :rows="renderedTableRows" :density="tableDensity" :loading="tableLoading" :error="tableError" selectable expandable resizable sticky-header max-height="420px" @retry="tableLoadingDemo">
                <template #cell-component="{row}"><div class="cell-title">{{ row.component }}</div><div class="cell-subtitle">{{ row.id }}</div></template>
                <template #cell-status="{row}"><UiTag :color="row.status==='稳定'?'green':'blue'">{{ row.status }}</UiTag></template>
                <template #cell-actions="{row}"><button class="btn btn-text btn-sm" @click.stop="emit('notify',`查看 ${row.component}`)">查看</button></template>
                <template #expanded="{row}"><div class="ui-table-expanded-content"><div><span>维护团队</span><strong>{{ row.owner }}</strong></div><div><span>最新版本</span><strong>{{ row.version }}</strong></div><div><span>更新时间</span><strong>{{ row.updated }}</strong></div><div><span>场景覆盖</span><strong>{{ row.coverage }} 个</strong></div></div></template>
                <template #empty-action><button class="btn btn-outline btn-sm" @click="tableEmpty=false">恢复数据</button></template>
              </UiTable>
              <UiPagination v-model:page="demoPage" v-model:page-size="demoPageSize" :total="86" :page-size-options="[10,20,50]"/>
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
              <div><span class="demo-label">Collapse · 支持多项与手风琴</span><UiCollapse v-model="collapseDemo" :items="collapseItems"/></div>
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
          <header class="doc-section-header"><h2>全局配置、本地化与主题</h2><p>应用可通过 createLanUi 全局安装，也可使用 UiConfigProvider 在局部覆盖语言、尺寸、密度、层级、light / dark / system 外观和经过规范化的主题 Token。</p></header>
          <div class="demo-block">
            <div class="config-demo-toolbar"><UiSegmented v-model="configLocale" :options="[{label:'中文',value:'zh-CN'},{label:'English',value:'en-US'}]"/><UiSegmented v-model="configSize" :options="['sm','md','lg']"/><UiSegmented v-model="configDensity" :options="[{label:'紧凑',value:'compact'},{label:'默认',value:'default'},{label:'宽松',value:'comfortable'}]"/><UiSegmented v-model="configAppearance" :options="[{label:'浅色',value:'light'},{label:'深色',value:'dark'},{label:'跟随系统',value:'system'}]"/></div>
            <UiConfigProvider :locale="configLocale" :size="configSize" :density="configDensity" :appearance="configAppearance" :theme="configTheme">
              <div class="config-demo-surface">
                <div class="config-demo-row"><UiButton>Primary action</UiButton><UiButton variant="outline">Secondary</UiButton><UiSelect :options="[{label:'Design review',value:'review'},{label:'Ready to ship',value:'ready'}]" clearable searchable/><UiPopover v-model="configPortalOpen" title="Tenant scoped overlay"><template #trigger><UiButton variant="secondary">打开主题浮层</UiButton></template><div class="preview-note"><strong>Teleport 主题桥接：</strong>面板移动到 body 后继续继承当前 Provider 的外观、Token、语言、尺寸、密度和方向。</div></UiPopover></div>
                <UiFormItem :label="configLocale==='en-US'?'Delivery window':'交付周期'" :error="rangeError" composite><UiDateRangePicker v-model="rangeDemo" @invalid="rangeError=$event.message" @change="$event.valid&&(rangeError='')"/></UiFormItem>
                <UiPagination :page="2" :page-size="10" :total="86"/>
                <div class="preview-note"><strong>主题边界：</strong>{{ themePresetSummary }}；Provider 输出请求与解析后的外观属性，Token 影响当前子树以及从该子树 Teleport 到 body 的悬浮层。</div>
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
            <pre class="code-block" style="margin-top:14px"><code>import LanUi, { UiConfigProvider, createLanUi, createThemeController, defineTheme, enUS } from 'lan-ui-design-system'
app.use(LanUi)
&lt;UiConfigProvider :locale="enUS" appearance="system" :theme="tenantTheme"&gt;...&lt;/UiConfigProvider&gt;

const tenantTheme = defineTheme({ name:'tenant', appearance:'dark', tokens:{ 'brand-600':'#7c3aed' } })
const appearance = createThemeController({ appearance:'system', storageKey:'app-theme' })
appearance.mount(document.documentElement)

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
              <div class="feedback-demo-content"><UiButton @click="emit('open-modal','Modal 交互示例')">屏幕居中 Modal</UiButton><UiButton variant="secondary" @click="emit('open-drawer',{name:'上海星河科技有限公司',id:'CUS-26081001',owner:'周琪',status:'合作中',amount:286400})">右侧 Drawer</UiButton><UiTooltip content="Tooltip 支持 Hover 与键盘 Focus"><template #default="{describedby}"><button class="icon-btn outline" :aria-describedby="describedby" aria-label="Tooltip 示例"><AppIcon name="info"/></button></template></UiTooltip></div>
            </div>
            <div class="feedback-demo-row">
              <div class="feedback-demo-heading"><strong>Popover 与确认</strong><span>上下文内容 · 二次确认</span></div>
              <div class="feedback-demo-content"><UiPopover v-model="popoverDemoOpen" :width="260"><template #trigger><UiButton variant="outline">打开 Popover</UiButton></template><div><strong style="display:block;font-size:12px">客户快捷信息</strong><p style="margin:5px 0 10px;font-size:10px;color:var(--text-tertiary)">Popover 适合展示轻量信息或少量操作。</p><UiButton size="sm" @click="popoverDemoOpen=false">知道了</UiButton></div></UiPopover><UiPopconfirm title="确认删除这条记录？" message="删除后数据将进入回收站。" :before-confirm="asyncConfirm" danger @confirm="emit('notify','记录已移入回收站')" @error="emit('notify','删除操作失败','error')"><UiButton variant="danger-outline">删除记录</UiButton></UiPopconfirm></div>
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

        <section id="states" class="card doc-section"><header class="doc-section-header"><h2>交互状态矩阵</h2><p>每个组件在交付前都需覆盖以下状态和键盘行为。</p></header><div class="demo-block" style="overflow:auto"><table class="state-matrix"><thead><tr><th>组件</th><th>Default</th><th>Hover</th><th>Pressed</th><th>Focus</th><th>Disabled</th><th>Loading / Error</th></tr></thead><tbody><tr><td>Button</td><td>基础视觉</td><td>加深 + 上移</td><td>复位</td><td>3px Ring</td><td>48% 透明</td><td>Spinner</td></tr><tr><td>Input</td><td>轻边框</td><td>品牌浅边框</td><td>—</td><td>品牌边框 + Ring</td><td>弱背景</td><td>红边框 + 文案</td></tr><tr><td>AutoComplete</td><td>自由输入</td><td>候选高亮</td><td>选择并提交</td><td>Combobox + Active descendant</td><td>只读 / 禁用</td><td>异步加载 / 空 / 错误</td></tr><tr><td>NumberInput</td><td>数值草稿</td><td>控制键高亮</td><td>步进并限界</td><td>Spinbutton + Ring</td><td>控制键锁定</td><td>解析错误 + 恢复</td></tr><tr><td>Slider / Range</td><td>单值 / 区间</td><td>Tooltip + 高亮</td><td>拖拽 / 点击 Mark</td><td>ARIA slider + Ring</td><td>禁止交互</td><td>只读 / 错误</td></tr><tr><td>Rate</td><td>integer / fractional</td><td>live preview</td><td>select / clear</td><td>ARIA slider + Ring</td><td>readonly / disabled</td><td>form error</td></tr><tr><td>Calendar</td><td>single / multiple / range</td><td>range preview</td><td>select / clear / today</td><td>ARIA grid + roving tabindex</td><td>readonly / disabled date</td><td>min / max / empty</td></tr><tr><td>Image</td><td>lazy / eager</td><td>preview affordance</td><td>zoom / rotate / pan</td><td>Dialog focus trap</td><td>Preview disabled</td><td>fallback / retry</td></tr><tr><td>Tree</td><td>Hierarchy</td><td>Active node</td><td>Select / Check</td><td>Active descendant + Ring</td><td>Node / Tree disabled</td><td>Lazy / Retry / Empty</td></tr><tr><td>Navigation</td><td>次级文字</td><td>弱白背景</td><td>加深</td><td>可见 Ring</td><td>不可点击</td><td>展开/收起</td></tr><tr><td>Table row</td><td>白色表面</td><td>品牌浅背景</td><td>—</td><td>选择框焦点</td><td>—</td><td>Skeleton / Empty</td></tr></tbody></table><div class="preview-note"><strong>键盘：</strong> Tab 遍历控件；Enter/Space 激活；AutoComplete、数值框和滑块支持方向键；图片预览支持方向键、加减号、R、0 与 Esc；Modal 打开后焦点进入弹层，关闭后返回触发元素。</div></div></section>
      </main>
    </div>
  </div>
</template>

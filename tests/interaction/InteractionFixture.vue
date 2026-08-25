<script setup>
import { reactive, ref } from 'vue'
import {
  UiAffix, UiAnchor, UiAutoComplete, UiBreadcrumb, UiButton, UiCalendar, UiCarousel, UiCascader, UiConfigProvider, UiDatePicker, UiDateRangePicker, UiDrawer, UiForm, UiFormItem, UiFormList, UiSchemaForm, UiInput, UiInputTag, UiMenu,
  UiCard, UiCheckbox, UiCheckboxGroup, UiCollapse, UiDropdown, UiImage, UiList, UiMentions, UiModal, UiMultiSelect, UiNumberInput, UiOtpInput, UiPagination, UiPopconfirm, UiPopover, UiQueryBuilder, UiRadio, UiRadioGroup, UiRate, UiSelect, UiSlider, UiSteps, UiSwitch, UiTable, UiTabs, UiTag, UiTimeline, UiTooltip, UiTransfer, UiUpload,
  UiTree, UiTreeSelect, UiStatistic,
  UiColorPicker,
  UiCommandPalette,
  UiBarcode, UiCronEditor, UiDataGrid, UiDateTimePicker, UiDateTimeRangePicker, UiFloatButton, UiFloatButtonGroup, UiKeyValueEditor, UiPageHeader, UiQRCode, UiSplitter, UiStatusPage, UiTextarea, UiTimeRangePicker, UiTour, UiTypography, UiVirtualList, UiWatermark,
} from '../../src/index.js'
import ApiReferencePage from '../../src/pages/ApiReferencePage.vue'

defineProps({ direction: { type: String, default: 'ltr' }, state: { type: String, default: 'base' } })

const region = ref('')
const productionSelectRef=ref(null)
const productionSelectValue=ref('')
const productionRemoteSelect=ref('')
const productionSelectOutput=ref('ready')
const productionSelectOptions=[{label:'East cluster',value:'east',description:'Shanghai and Hangzhou',keywords:['hangzhou']},{label:'South cluster',value:'south',disabled:true},{label:'Global cluster',value:'global',description:'Cross-time-zone delivery',keywords:['overseas']}]
async function fetchProductionSelect(query,{signal}){await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,80);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})});return [{label:'Stable lane',value:'stable',description:'Verified release'},{label:'Next lane',value:'next',description:'Preview release'}].filter(option=>!query||option.label.toLowerCase().includes(query.toLowerCase()))}
const productionMultiSelectRef=ref(null)
const productionMultiSelectValue=ref(['east'])
const productionRemoteMultiSelect=ref([])
const productionMultiSelectOutput=ref('ready')
const productionMultiSelectOptions=[{label:'East cluster',value:'east',description:'Shanghai and Hangzhou',keywords:['hangzhou']},{label:'South cluster',value:'south',disabled:true},{label:'North cluster',value:'north',description:'Beijing and Tianjin'},{label:'Global cluster',value:'global',description:'Cross-time-zone delivery',keywords:['overseas']}]
const productionTreeSelectRef=ref(null)
const productionTreeSelectValue=ref(['frontend'])
const productionTreeSelectOutput=ref('ready')
const productionTreeSelectOptions=[
  {label:'Product engineering',value:'product',description:'Delivery organization',children:[
    {label:'Frontend platform',value:'frontend',description:'Design system and shell',keywords:['browser']},
    {label:'Backend platform',value:'backend',description:'Services and data'},
  ]},
  {label:'Experience',value:'experience',children:[{label:'Product design',value:'design'},{label:'Research archive',value:'research',disabled:true}]},
]
const productionLazyTreeOptions=[{label:'Remote organization',value:'remote'}]
async function loadProductionTree(node,{signal}){
  await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,70);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})})
  return node.value==='remote'?[{label:'Remote child',value:'remote-child',isLeaf:true}]:[]
}
const productionCascaderRef=ref(null)
const productionCascaderValue=ref([['product','platform','frontend']])
const productionCascaderOutput=ref('ready')
const productionCascaderOptions=[
  {label:'Product engineering',value:'product',description:'Delivery organization',children:[{label:'Platform',value:'platform',children:[{label:'Frontend application',value:'frontend',isLeaf:true},{label:'Backend services',value:'backend',isLeaf:true}]}]},
  {label:'Experience',value:'experience',children:[{label:'Product design',value:'design',isLeaf:true},{label:'Research archive',value:'research',disabled:true,isLeaf:true}]},
]
const productionLazyCascaderOptions=[{label:'Remote regions',value:'remote-regions',isLeaf:false}]
async function loadProductionCascader(node,{signal}){await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,70);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))},{once:true})});return node.value==='remote-regions'?[{label:'Remote site',value:'remote-site',isLeaf:true}]:[]}
const productionTransferRef=ref(null)
const productionReadonlyTransferRef=ref(null)
const productionTransferValue=ref(['token'])
const productionTransferSelected=ref([])
const productionTransferSearch=ref(['',''])
const productionTransferOutput=ref('ready')
const productionTransferOptions=[
  {label:'API access',value:'api',description:'Service integration'},
  {label:'Design tokens',value:'token',description:'Theme variables'},
  {label:'Audit log',value:'audit',description:'Read-only evidence'},
  {label:'Billing admin',value:'billing',description:'Locked permission',disabled:true},
  ...Array.from({length:80},(_,index)=>({label:`Tenant ${String(index+1).padStart(2,'0')}`,value:`tenant-${index+1}`,description:'Virtualized permission'})),
]
const anchorValue=ref('fixture-anchor-overview')
const anchorItems=[{key:'fixture-anchor-overview',href:'#fixture-anchor-overview',title:'Overview'},{key:'fixture-anchor-disabled',href:'#fixture-anchor-disabled',title:'Disabled',disabled:true},{key:'fixture-anchor-api',href:'#fixture-anchor-api',title:'API contract'},{key:'fixture-anchor-release',href:'#fixture-anchor-release',title:'Release'}]
const officeCity = ref('')
const tab = ref('overview')
const modalOpen = ref(false)
const drawerOpen = ref(false)
const confirmResult = ref('idle')
const page = ref(1)
const pageSize = ref(10)
const productionPaginationRef=ref(null)
const productionPaginationPage=ref(50)
const productionPaginationSize=ref(20)
const productionPaginationOutput=ref('ready:50:20')
async function guardProductionPagination(meta){await new Promise(resolve=>setTimeout(resolve,45));return meta.page!==13}
const productionTableRef=ref(null)
const productionTableSelected=ref(['table-1'])
const productionTableExpanded=ref([])
const productionTableCurrent=ref('table-1')
const productionTableWidths=ref({name:208})
const productionTableSortKey=ref('')
const productionTableSortOrder=ref('')
const productionTableFilters=ref({})
const productionTableOutput=ref('ready:table-1')
const productionTableColumns=[{key:'name',label:'Evidence',sortable:true,resizable:true},{key:'owner.name',dataKey:'owner.name',label:'Owner',resizable:true},{key:'status',label:'Status',filterable:true,filterOptions:[{label:'Ready',value:'Ready'},{label:'Review',value:'Review'},{label:'Blocked',value:'Blocked',disabled:true}]},{key:'coverage',label:'Coverage',formatter:value=>`${value}%`,resizable:true}]
const productionTableRows=[{id:'table-1',name:'Component API',owner:{name:'Lin'},status:'Ready',coverage:100,detail:'60 props · 29 events · 13 slots'},{id:'table-2',name:'Keyboard evidence',owner:{name:'Chen'},status:'Review',coverage:96,detail:'Roving focus and filters'},{id:'table-3',name:'Guarded release',owner:{name:'Wang'},status:'Ready',coverage:100,detail:'Async selection is rejected'},{id:'table-4',name:'Locked archive',owner:{name:'Zhao'},status:'Blocked',coverage:82,detail:'Row policy disables selection'}]
async function guardProductionTableSelect(meta){await new Promise(resolve=>setTimeout(resolve,45));return meta.key!=='table-3'}
const enabled = ref(false)
const selectionChannels=ref(['email'])
const selectionPlan=ref('team')
const selectionPolicy=ref('enabled')
const selectionOutput=ref('ready:email:team:enabled')
const selectionChannelOptions=[{label:'Email',value:'email'},{label:'SMS',value:'sms'},{label:'Inbox',value:'inbox'},{label:'Locked',value:'locked',disabled:true}]
const selectionPlanOptions=[{label:'Starter',value:'starter'},{label:'Team',value:'team'},{label:'Enterprise',value:'enterprise',disabled:true}]
async function guardSelectionPolicy(value){selectionOutput.value=`guard:checking:${value}`;await new Promise(resolve=>setTimeout(resolve,90));return true}
const quantity = ref(12.5)
const volume = ref(40)
const priceRange = ref([20,80])
const serviceRating = ref(3.5)
const statisticValue = ref(1000)
const statisticTrend = ref(5)
const statisticLoading = ref(false)
const calendarRange = ref(['2026-08-10','2026-08-16'])
const productionDatePickerRef=ref(null)
const productionDatePickerValue=ref('2026-08-24')
const productionDatePickerOpen=ref(false)
const productionDatePickerView=ref('2026-08-01')
const productionDatePickerOutput=ref('ready:2026-08-24')
const productionDatePickerPresets=[{key:'release',label:'Release day',value:'2026-08-24'},{key:'guarded',label:'Guarded day',value:'2026-08-13'}]
async function guardProductionDatePicker(meta){productionDatePickerOutput.value=`guard:${meta.source}:${meta.value}`;await new Promise(resolve=>setTimeout(resolve,45));return meta.value!=='2026-08-13'}
const productionDateRangeRef=ref(null)
const productionDateRangeValue=ref(['2026-08-10','2026-08-16'])
const productionDateRangeOpen=ref(false)
const productionDateRangeView=ref('2026-08-01')
const productionDateRangeOutput=ref('ready:2026-08-10:2026-08-16')
const imagePreviewOpen = ref(false)
const imagePreviewIndex = ref(0)
const imageFixture=(label,color)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" rx="24" fill="${color}"/><text x="28" y="58" fill="white" font-family="Arial" font-size="26" font-weight="700">${label}</text></svg>`)}`
const imageSources=[imageFixture('Architecture','#2563eb'),imageFixture('Components','#7c3aed'),imageFixture('Release','#0f766e')]
const files = ref([])
const uploadError = ref('')
const queueFiles=ref([])
const queueOutput=ref('idle')
const queueAttempts=new Map()
function queueRequest({file,signal,onProgress}){
  const name=file?.name||'asset';const attempt=(queueAttempts.get(name)||0)+1;queueAttempts.set(name,attempt)
  return new Promise((resolve,reject)=>{onProgress(20);const progress=setTimeout(()=>onProgress(65),40);const finish=setTimeout(()=>{if(name.includes('retry')&&attempt===1)reject(new Error('Fixture upload failed'));else resolve({name,attempt})},name.includes('slow')?800:100);signal.addEventListener('abort',()=>{clearTimeout(progress);clearTimeout(finish);reject(new DOMException('Aborted','AbortError'))},{once:true})})
}
const selectedRows = ref([])
const expandedRows = ref([])
const sortKey = ref('')
const sortOrder = ref('')
const menuValue = ref('')
const treeValue = ref('')
const treeChecked = ref([])
const treeLoadCount = ref(0)
const commandResult = ref('idle')
const commandOpen = ref(false)
const commandQuery = ref('')
const tourOpen=ref(false)
const tourCurrent=ref(0)
const tourOutput=ref('idle')
const tourSteps=[
  {target:'#tour-target-create',title:'Create a release',description:'Start from a versioned draft.',placement:'bottom-start'},
  {target:'#tour-target-preview',title:'Preview the release',description:'Review the final component states.',placement:'bottom'},
  {target:'#tour-target-publish',title:'Publish with evidence',description:'Attach verification and rollback records.',placement:'bottom-end'},
]
const watermarkRotate=ref(-22)
const watermarkOutput=ref('protected')
function removeWatermarkLayer(){document.querySelector('#interaction-watermark [data-ui-watermark-layer]')?.remove()}
const affixTarget=ref(null)
const affixDisabled=ref(false)
const affixOutput=ref('natural')
const splitterRef=ref(null)
const splitterSizes=ref([24,48,28])
const splitterOutput=ref('ready:24/48/28')
const splitterPanels=[{key:'navigation',label:'Navigation',defaultSize:'24%',min:'14%',max:'38%',collapsible:true},{key:'workspace',label:'Workspace',min:'26%'},{key:'inspector',label:'Inspector',defaultSize:'28%',min:'16%',max:'42%',collapsible:true}]
const typographyValue=ref('Lan UI uses one accessible text primitive for operational notes, release evidence, copied identifiers and keyboard-confirmed inline edits. It keeps multi-line truncation, expansion and action semantics consistent across every consumer workspace.')
const typographyOutput=ref('ready')
const listSelection=ref(['interaction-list-0'])
const listPage=ref(1)
const listOutput=ref('ready')
const interactionListItems=Array.from({length:7},(_,index)=>({id:`interaction-list-${index}`,title:`Release record ${index+1}`,description:`Evidence lane ${index%3+1}`,disabled:index===2}))
const otpValue=ref('')
const otpOutput=ref('ready')
const mentionsValue=ref('Review ')
const mentionsOutput=ref('ready')
const inputTagValue=ref([])
const inputTagOutput=ref('ready')
const pageHeaderOutput=ref('ready')
const breadcrumbRef=ref(null)
const breadcrumbExpanded=ref(false)
const breadcrumbOutput=ref('ready:collapsed')
const breadcrumbItems=[
  {key:'home',label:'Home',href:'#breadcrumb-home',icon:'home'},
  {key:'workspace',label:'Workspace',href:'#breadcrumb-workspace'},
  {key:'design',label:'Design system',onClick:()=>{}},
  {key:'blocked',label:'Restricted',href:'#breadcrumb-blocked',disabled:true},
  {key:'components',label:'Components',href:'#breadcrumb-components'},
  {key:'breadcrumb',label:'Breadcrumb'},
]
function navigateBreadcrumb(_item,meta,event){event?.preventDefault();breadcrumbOutput.value=`navigate:${meta.source}:${meta.key}`}
function changeBreadcrumbExpansion(_expanded,meta){breadcrumbOutput.value=`expand:${meta.expanded}:${meta.source}:${meta.hiddenCount}`}
const cardSelected=ref(false)
const cardOutput=ref('ready')
function activateCard(meta){cardSelected.value=!cardSelected.value;cardOutput.value=`activate:${meta.source}:${cardSelected.value}`}
const buttonRef=ref(null)
const buttonPressed=ref(false)
const buttonOutput=ref('ready:0')
let buttonActionRuns=0
async function runButtonAction(){buttonActionRuns+=1;await new Promise(resolve=>setTimeout(resolve,720));return{revision:'P68',runs:buttonActionRuns}}
const floatGroupRef=ref(null)
const floatOutput=ref('ready:closed')
const floatBackTopVisible=ref(true)
async function guardFloatOpen(open){await new Promise(resolve=>setTimeout(resolve,20));return open!==false}
const inputRef=ref(null)
const inputValue=ref('release draft')
const inputPassword=ref('LanUI-2026')
const inputPasswordVisible=ref(false)
const inputOutput=ref('ready:release draft')
function changeInput(value,meta){inputOutput.value=`change:${meta.source}:${String(value)}`}
const textareaRef=ref(null)
const textareaValue=ref('release draft')
const textareaParserValue=ref('release notes')
const textareaOutput=ref('ready:release draft')
function changeTextarea(value,meta){textareaOutput.value=`change:${meta.source}:${String(value)}`}
const tagChecked=ref(false)
const tagVisible=ref(true)
const tagOutput=ref('ready')
function changeTag(checked,meta){tagChecked.value=checked;tagOutput.value=`change:${meta.source}:${checked}`}
function closeTag(meta){tagVisible.value=false;tagOutput.value=`close:${meta.source}`}
const stepsCurrent=ref(1)
const stepsOutput=ref('ready:1')
const stepsItems=[
  {key:'foundation',title:'Foundation',description:'Tokens verified'},
  {key:'components',title:'Components',description:'Contracts in review'},
  {key:'approval',title:'Approval',description:'Disabled stage',disabled:true},
  {key:'release',title:'Release',description:'Publish artifacts'},
]
function changeSteps(value,meta){stepsOutput.value=`change:${meta.source}:${value}`}
const timelineSelection=ref('audit')
const timelineOutput=ref('ready:audit')
const tooltipOpen=ref(false)
const tooltipOutput=ref('ready')
const popoverOpen=ref(false)
const popoverOutput=ref('ready')
const dropdownOpen=ref(false)
const dropdownActive=ref(-1)
const dropdownOutput=ref('ready')
const dropdownItems=[{type:'heading',label:'Release actions'},{key:'inspect',label:'Inspect package',description:'Review package exports'},{key:'archive',label:'Archive release',disabled:true},{divider:true},{key:'copy',label:'Copy release link',shortcut:'⌘ C'},{key:'pin',label:'Pin evidence',role:'menuitemcheckbox',checked:true},{key:'rollback',label:'Run rollback',danger:true}]
const collapseRef=ref(null)
const collapseOpen=ref(['contract'])
const collapseOutput=ref('ready:contract')
const collapseItems=[{key:'contract',label:'Public contract',content:'Root and subpath APIs are aligned.',extra:'Required'},{key:'locked',label:'Restricted section',content:'Unavailable',disabled:true},{key:'evidence',label:'Verification evidence',content:'Browser and package evidence passed.'},{key:'rollback',label:'Rollback lifecycle',content:'Restores the preserved baseline.'}]
async function guardCollapse(item,open){if(item.key==='evidence'&&open){collapseOutput.value='pending:evidence';await new Promise(resolve=>setTimeout(resolve,120))}return true}
const timelineItems=[
  {key:'audit',title:'Audit complete',description:'Tokens and API verified',time:'09:10',datetime:'2026-08-20T09:10:00+08:00',status:'success'},
  {key:'review',title:'Component review',description:'Keyboard and ARIA validation',time:'11:30',datetime:'2026-08-20T11:30:00+08:00',status:'primary'},
  {key:'approval',title:'Approval unavailable',description:'Disabled workflow stage',time:'13:00',status:'warning',disabled:true},
  {key:'release',title:'Release notes',description:'Open the consumer evidence',time:'16:20',status:'info',href:'#interaction-timeline-target',target:'_blank'},
]
function changeTimeline(value,meta){timelineOutput.value=`change:${meta.source}:${String(value)}`}
function changeTooltip(open,meta){tooltipOutput.value=`${open?'open':'close'}:${meta.source}`}
function changePopover(open,meta){popoverOutput.value=`${open?'open':'close'}:${meta.source}`}
function changeDropdown(open,meta){dropdownOutput.value=`${open?'open':'close'}:${meta.source}`}
const queryBuilderRef=ref(null)
const queryOutput=ref('ready')
const queryFields=[
  {key:'title',label:'Work item',type:'text'},
  {key:'status',label:'Status',type:'select',options:[{label:'Ready',value:'ready'},{label:'Review',value:'review'}]},
  {key:'priority',label:'Priority',type:'number',min:1,max:5},
]
const queryValue=ref({id:'interaction-query-root',combinator:'and',not:false,rules:[
  {id:'interaction-query-title',field:'title',operator:'contains',value:'release'},
  {id:'interaction-query-priority',field:'priority',operator:'greaterOrEqual',value:3},
]})
const carouselIndex=ref(0)
const carouselOutput=ref('ready:0')
const timeRangeValue=ref(['09:00','17:30'])
const timeRangeOutput=ref('ready:09:00-17:30')
const timeRangeChangeOutput=ref('')
const dateTimeValue=ref('2026-08-15T09:30')
const dateTimeRangeValue=ref(['2026-08-15T09:30','2026-08-15T17:30'])
const dateTimeOutput=ref('ready:2026-08-15T09:30')
const dateTimeRangeChangeOutput=ref('')
const qrCodeStatus=ref('expired')
const qrCodeRevision=ref(1)
const qrCodeOutput=ref('ready:expired:1')
function refreshQrCode(){qrCodeRevision.value+=1;qrCodeStatus.value='active';qrCodeOutput.value=`refresh:${qrCodeRevision.value}`}
const barcodeStatus=ref('expired')
const barcodeRevision=ref(1)
const barcodeOutput=ref('ready:expired:1')
function refreshBarcode(){barcodeRevision.value+=1;barcodeStatus.value='active';barcodeOutput.value=`refresh:${barcodeRevision.value}`}
const cronEditorRef=ref(null)
const cronValue=ref('0 9 * * 1-5')
const cronOutput=ref('ready:valid')
const keyValueEditorRef=ref(null)
const keyValueRows=ref([{id:'auth',key:'Authorization',value:'Bearer TOKEN',enabled:true},{id:'region',key:'X-Region',value:'east',enabled:true}])
const keyValueOutput=ref('ready:true:Authorization|X-Region')
function updateKeyValueOutput(value,meta){keyValueOutput.value=`${meta.source}:${meta.validation.valid}:${value.map(item=>item.key).join('|')}`}
const carouselItems=[
  {key:'overview',title:'Release overview',description:'Versioned component contract'},
  {key:'quality',title:'Quality gates',description:'Keyboard, Axe and visual verification'},
  {key:'delivery',title:'Consumer delivery',description:'Typed subpaths and isolated styles'},
]
function evaluateQuery(){queryOutput.value=`match:${queryBuilderRef.value?.matches?.({title:'Release train',status:'ready',priority:4})}`}
const mentionsOptions=[
  {label:'Alice',value:'alice',description:'Design owner',trigger:'@'},
  {label:'Alina',value:'alina',description:'Frontend owner',trigger:'@'},
  {label:'Release',value:'release',description:'Publishing evidence',trigger:'#'},
  {label:'Accessibility',value:'a11y',description:'WCAG verification',trigger:'#'},
]
const brandColor = ref('#1677FFCC')
const commandItems = [
  {key:'dashboard',label:'Open dashboard',description:'Review metrics',group:'Navigate',keywords:['home']},
  {key:'settings',label:'Open settings',description:'Manage workspace',group:'Navigate',keywords:['preferences']},
  {key:'disabled',label:'Disabled command',group:'Actions',disabled:true},
]
const formModel = reactive({ name: '' })
const formResult = ref('idle')
const managedForm = ref(null)
const managedFormModel = reactive({ profile: { email: '' } })
const managedFormResult = ref('idle')
const setManagedServerError = () => { managedForm.value?.setFieldError('profile.email', 'Email already belongs to another account'); managedFormResult.value = 'server-error' }
const resetManagedEmail = () => {
  managedForm.value?.resetFields('profile.email')
  managedFormResult.value = 'reset'
}
const dynamicForm=ref(null)
const dynamicFormModel=reactive({password:'secret123',confirm:'secret123',contacts:[{email:'first@example.com'}]})
const dynamicFormResult=ref('contacts=1')
const updateDynamicFormResult=()=>{dynamicFormResult.value=`contacts=${dynamicFormModel.contacts.length}`}
const schemaFormModel=reactive({account:{type:'business',name:'Lan UI workspace',email:'owner@example.com'},taxId:''})
const schemaFormResult=ref('idle')
const schemaFormChange=ref('none')
const schemaFormDefinition=[{key:'workspace',title:'Workspace settings',columns:2,fields:[
  {name:'account.type',label:'Account type',type:'select',options:[{label:'Business',value:'business'},{label:'Personal',value:'personal'}],span:2},
  {name:'account.name',label:'Workspace name',required:true,rules:[{required:true}]},
  {name:'account.email',label:'Owner email',required:true,rules:[{required:true},{type:'email'}]},
  {name:'taxId',label:'Tax ID',visible:model=>model.account.type==='business',required:true,dependencies:['account.type'],rules:[{required:true,message:'Tax ID is required'}],span:2},
]}]
const schemaListModel=reactive({reviewers:[{role:'Owner',name:'Lin',email:'owner@example.com'}]})
const schemaListResult=ref('idle:1:Lin')
const updateSchemaListResult=payload=>{schemaListResult.value=`${payload.change.type}:${payload.change.values.length}:${payload.change.values[0]?.name||'empty'}`}
const schemaListDefinition=[{key:'reviewers',title:'Release reviewers',fields:[
  {key:'reviewers',name:'reviewers',type:'list',label:'Reviewers',min:1,max:3,columns:3,addText:'Add reviewer',removeText:'Remove reviewer',moveUpText:'Move reviewer up',moveDownText:'Move reviewer down',itemLabel:(_model,{index})=>`Reviewer ${index+1}`,defaultValue:({index})=>({role:'Reviewer',name:`Reviewer ${index+1}`,email:''}),fields:[
    {name:'role',label:'Role',type:'select',options:[{label:'Owner',value:'Owner'},{label:'Reviewer',value:'Reviewer'}]},
    {name:'name',label:'Name',required:true,rules:[{required:true}]},
    {name:'email',label:'Email',required:true,rules:[{required:true},{type:'email'}]},
  ]},
]}]
const gridQuery=ref('')
const gridPage=ref(1)
const gridPageSize=ref(5)
const gridFilters=ref({})
const gridSortKey=ref('')
const gridSortOrder=ref('')
const gridSelected=ref([])
const gridExpanded=ref([])
const gridDensity=ref('default')
const gridVisibleColumns=ref(['name','team','status'])
const gridColumns=[{key:'name',label:'Name',sortable:true},{key:'team',label:'Team',sortable:true},{key:'status',label:'Status',filterable:true,filterOptions:['Ready','Review']}]
const gridRows=Array.from({length:18},(_,index)=>({id:`grid-${index+1}`,name:`Grid ${String(index+1).padStart(2,'0')}`,team:['Design','Frontend','QA'][index%3],status:index%5===0?'Review':'Ready'}))
const virtualSelection = ref('virtual-0')
const virtualActive = ref(0)
const statusAction = ref('idle')
const scopedAppearance=ref('light')
const scopedTheme={'brand-600':'#7C3AED'}
const scopedPortalOpen=ref(false)
const scopedMotion=ref('system')
const scopedMotionPortalOpen=ref(false)
const virtualItems = Array.from({ length: 120 }, (_, index) => ({
  id: `virtual-${index}`,
  label: `Record ${String(index + 1).padStart(3, '0')}`,
  description: index % 3 === 0 ? 'Measured enterprise row' : 'Standard enterprise row',
}))

const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
]
const tableRows = [
  { id: 1, name: 'Foundation', status: 'Ready' },
  { id: 2, name: 'Components', status: 'Review' },
]
const menuItems = [
  { key: 'workspace', label: 'Workspace', children: [{ key: 'overview', label: 'Overview' }, { key: 'settings', label: 'Settings' }] },
  { key: 'reports', label: 'Reports' },
]
const treeItems = [
  { label:'Workspace', value:'workspace', children:[{label:'Overview',value:'overview'},{label:'Settings',value:'settings',children:[{label:'Security',value:'security'}]}] },
  { label:'Remote', value:'remote', isLeaf:false },
]
async function loadTreeData(node){treeLoadCount.value+=1;await new Promise(resolve=>setTimeout(resolve,40));return node.value==='remote'?[{label:'Remote child',value:'remote-child',isLeaf:true}]:[]}
function refreshStatistic(){statisticLoading.value=true;setTimeout(()=>{statisticValue.value=1250;statisticTrend.value=-2.5;statisticLoading.value=false},160)}
</script>

<template>
  <UiConfigProvider id="interaction-fixture" class="interaction-fixture" tag="main" locale="en-US" :direction="direction">
    <ApiReferencePage v-if="state==='api-docs'" />
    <template v-else>
    <h1>Lan UI interaction regression fixture</h1>
    <div class="interaction-grid">
      <section class="interaction-case">
        <h2>Select keyboard contract</h2>
        <div class="interaction-stack">
          <UiSelect v-model="region" aria-label="Region" placeholder="Choose region" :options="[
            { label: 'East', value: 'east' },
            { label: 'West disabled', value: 'west', disabled: true },
            { label: 'North', value: 'north' },
          ]" />
          <output class="interaction-output" data-testid="select-output">{{ region || 'empty' }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>AutoComplete keyboard contract</h2>
        <div class="interaction-stack">
          <UiAutoComplete v-model="officeCity" aria-label="Office city" placeholder="Search city" :options="[
            { label: 'Beijing', value: 'beijing', keywords: ['bei', 'bj'] },
            { label: 'Berlin disabled', value: 'berlin', disabled: true },
            { label: 'Boston', value: 'boston', keywords: ['bos'] },
          ]" />
          <output class="interaction-output" data-testid="autocomplete-output">{{ officeCity || 'empty' }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Number input keyboard contract</h2>
        <div class="interaction-stack">
          <UiNumberInput v-model="quantity" aria-label="Quantity" :min="0" :max="100" :step="0.25" :precision="2" />
          <output class="interaction-output" data-testid="number-output">{{ quantity.toFixed(2) }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Slider keyboard contract</h2>
        <div class="interaction-stack">
          <UiSlider v-model="volume" aria-label="Volume" :min="0" :max="100" :step="5" />
          <UiSlider v-model="priceRange" :aria-label="['Price start','Price end']" range :min-distance="20" :step="5" />
          <output class="interaction-output" data-testid="slider-output">{{ volume }} / {{ priceRange.join('-') }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Rate keyboard contract</h2>
        <div class="interaction-stack">
          <UiRate v-model="serviceRating" aria-label="Service rating" :step="0.5" show-text :formatter="(value,max)=>`${value} of ${max}`" />
          <output class="interaction-output" data-testid="rate-output">{{ serviceRating.toFixed(1) }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Statistic live-value contract</h2>
        <div class="interaction-stack">
          <UiStatistic title="Revenue" :value="statisticValue" prefix="$" :trend="statisticTrend" :loading="statisticLoading" live="polite" />
          <UiButton id="refresh-statistic" variant="outline" @click="refreshStatistic">Refresh statistic</UiButton>
          <output class="interaction-output" data-testid="statistic-output">{{ statisticValue }} / {{ statisticTrend }} / {{ statisticLoading?'loading':'ready' }}</output>
        </div>
      </section>

      <section class="interaction-case interaction-wide">
        <h2>Calendar range keyboard contract</h2>
        <div class="interaction-stack">
          <UiCalendar v-model="calendarRange" selection-mode="range" view-date="2026-08-01" today="2026-08-12" show-week-numbers aria-label="Release calendar" />
          <output class="interaction-output" data-testid="calendar-output">{{ calendarRange.join(' to ') || 'empty' }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Image preview keyboard contract</h2>
        <div class="interaction-stack">
          <UiImage v-model:preview-open="imagePreviewOpen" v-model:preview-index="imagePreviewIndex" :src="imageSources[0]" alt="Interaction gallery" preview :preview-list="imageSources" width="240" height="150" />
          <output class="interaction-output" data-testid="image-output">{{ imagePreviewOpen?'open':'closed' }} / {{ imagePreviewIndex }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Tabs directional keyboard contract</h2>
        <UiTabs v-model="tab" :panels="false" :items="[
          { label: 'Overview', value: 'overview' },
          { label: 'Usage', value: 'usage' },
          { label: 'Disabled', value: 'disabled', disabled: true },
          { label: 'API', value: 'api' },
        ]" />
        <output class="interaction-output" data-testid="tabs-output">{{ tab }}</output>
      </section>

      <section class="interaction-case">
        <h2>Overlay focus and stack contract</h2>
        <UiButton id="open-modal" @click="modalOpen=true">Open modal</UiButton>
        <output class="interaction-output" data-testid="overlay-output">modal={{ modalOpen }} drawer={{ drawerOpen }}</output>
        <UiModal v-model="modalOpen" title="Review changes" destroy-on-close>
          <UiInput aria-label="Change summary" model-value="Ready for review" />
          <UiButton id="open-drawer" variant="secondary" @click="drawerOpen=true">Open drawer</UiButton>
          <template #footer><UiButton variant="secondary" @click="modalOpen=false">Cancel</UiButton><UiButton @click="modalOpen=false">Confirm</UiButton></template>
        </UiModal>
        <UiDrawer v-model="drawerOpen" title="Change details" placement="end">
          <UiInput aria-label="Detail name" model-value="Keyboard behavior" />
          <template #footer><UiButton @click="drawerOpen=false">Save detail</UiButton></template>
        </UiDrawer>
      </section>

      <section class="interaction-case">
        <h2>Popconfirm restore contract</h2>
        <UiPopconfirm title="Delete record?" message="This fixture record will be removed." @confirm="confirmResult='confirmed'" @cancel="confirmResult='cancelled'">
          <UiButton id="delete-record" variant="danger">Delete record</UiButton>
        </UiPopconfirm>
        <output class="interaction-output" data-testid="confirm-output">{{ confirmResult }}</output>
      </section>

      <section class="interaction-case interaction-pagination-case">
        <h2>Pagination and switch contract</h2>
        <div class="interaction-stack">
          <UiPagination v-model:page="page" v-model:page-size="pageSize" :total="95" :page-size-options="[10,20,50]" />
          <UiSwitch v-model="enabled" aria-label="Enable notifications" />
          <output class="interaction-output" data-testid="pagination-output">{{ page }} / {{ pageSize }}</output>
          <output class="interaction-output" data-testid="switch-output">{{ enabled ? 'enabled' : 'disabled' }}</output>
        </div>
      </section>

      <section class="interaction-case">
        <h2>Upload validation contract</h2>
        <UiUpload v-model="files" accept=".txt" :max-size="1" :max-count="2" @error="uploadError=$event" />
        <output class="interaction-output" data-testid="upload-output">files={{ files.length }} error={{ uploadError || 'none' }}</output>
      </section>

      <section class="interaction-case interaction-upload-queue">
        <h2>Upload queue lifecycle contract</h2>
        <UiUpload v-model="queueFiles" multiple accept=".txt" :max-count="4" :concurrency="1" :request="queueRequest" aria-label="Fixture upload queue" @start="queueOutput=`start:${$event.file.name}`" @success="queueOutput=`success:${$event.file.name}`" @upload-error="queueOutput=`error:${$event.file.name}`" @retry="queueOutput=`retry:${$event.file.name}`" @abort="queueOutput=`abort:${$event.file.name}`" />
        <output class="interaction-output" data-testid="upload-queue-output">{{ queueOutput }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-table-case">
        <h2>Table state contract</h2>
        <UiTable
          v-model:selected-rows="selectedRows"
          v-model:expanded-rows="expandedRows"
          v-model:sort-key="sortKey"
          v-model:sort-order="sortOrder"
          :columns="tableColumns"
          :rows="tableRows"
          selectable
          expandable
        >
          <template #expanded="{ row }"><p>Expanded {{ row.name }}</p></template>
        </UiTable>
        <output class="interaction-output" data-testid="table-output">sort={{ sortKey }}:{{ sortOrder || 'none' }} selected={{ selectedRows.join(',') || 'none' }} expanded={{ expandedRows.join(',') || 'none' }}</output>
      </section>

      <section class="interaction-case">
        <h2>Form validation and focus contract</h2>
        <UiForm :model="formModel" @submit="formResult='submitted'" @invalid="formResult='invalid'">
          <UiFormItem label="Name" name="name" required :rules="[{ required: true, message: 'Name is required' }]">
            <UiInput v-model="formModel.name" />
          </UiFormItem>
          <UiButton type="submit">Submit form</UiButton>
        </UiForm>
        <output class="interaction-output" data-testid="form-output">{{ formResult }}</output>
      </section>

      <section class="interaction-case">
        <h2>Managed nested form contract</h2>
        <UiForm ref="managedForm" :model="managedFormModel" show-error-summary @submit="managedFormResult='submitted'" @invalid="managedFormResult='invalid'">
          <UiFormItem label="Account email" name="profile.email" required :rules="[{ required:true }, { type:'email' }]" show-success>
            <UiInput v-model="managedFormModel.profile.email" />
          </UiFormItem>
          <div class="interaction-row"><UiButton type="button" variant="secondary" @click="setManagedServerError">Set server error</UiButton><UiButton type="button" variant="text" @click="resetManagedEmail">Reset managed email</UiButton><UiButton type="submit">Submit managed form</UiButton></div>
        </UiForm>
        <output class="interaction-output" data-testid="managed-form-output">{{ managedFormResult }}</output>
      </section>

      <section class="interaction-case interaction-wide">
        <h2>Dynamic form list and dependency contract</h2>
        <UiForm ref="dynamicForm" :model="dynamicFormModel">
          <div class="interaction-row">
            <UiFormItem label="Password" name="password" required><UiInput v-model="dynamicFormModel.password" type="password" /></UiFormItem>
            <UiFormItem label="Confirm password" name="confirm" required :dependencies="['password']" :rules="[{validator:value=>value===dynamicFormModel.password||'Passwords differ'}]"><UiInput v-model="dynamicFormModel.confirm" type="password" /></UiFormItem>
          </div>
          <UiFormItem label="Contacts" name="contacts" group :rules="[{type:'array',min:1}]">
            <UiFormList v-slot="{fields,add,remove,move,canAdd,canRemove}" name="contacts" :min="1" :max="3" :default-value="()=>({email:''})" aria-label="Contacts" @change="updateDynamicFormResult">
              <div v-for="(field,index) in fields" :key="field.key" class="interaction-row interaction-list-row">
                <UiFormItem :name="[...field.name,'email']" :label="`Contact email ${index+1}`" required :rules="[{required:true},{type:'email'}]"><UiInput v-model="dynamicFormModel.contacts[index].email" /></UiFormItem>
                <UiButton type="button" variant="text" :disabled="index===0" @click="move(index,index-1)">Move contact {{ index+1 }} up</UiButton>
                <UiButton type="button" variant="text" :disabled="!canRemove" @click="remove(index)">Remove contact {{ index+1 }}</UiButton>
              </div>
              <UiButton type="button" variant="secondary" :disabled="!canAdd" @click="add()">Add contact</UiButton>
            </UiFormList>
          </UiFormItem>
          <UiButton type="button" @click="dynamicForm.validateField('confirm')">Validate dependency fields</UiButton>
        </UiForm>
        <output class="interaction-output" data-testid="dynamic-form-output">{{ dynamicFormResult }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-schema-form">
        <h2>Schema form conditional orchestration contract</h2>
        <UiSchemaForm :model="schemaFormModel" :schema="schemaFormDefinition" show-error-summary @field-change="schemaFormChange=$event.name" @submit="schemaFormResult='submitted'" @invalid="schemaFormResult='invalid'">
          <template #actions="{validating}"><UiButton type="submit" :loading="validating">Submit schema form</UiButton></template>
        </UiSchemaForm>
        <output class="interaction-output" data-testid="schema-form-output">{{ schemaFormResult }} / {{ schemaFormChange }} / {{ schemaFormModel.account.type }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-schema-list">
        <h2>Schema form repeatable list contract</h2>
        <UiSchemaForm :model="schemaListModel" :schema="schemaListDefinition" @list-change="updateSchemaListResult" />
        <output class="interaction-output" data-testid="schema-list-output">{{ schemaListResult }}</output>
      </section>

      <section class="interaction-case">
        <h2>Menu directional keyboard contract</h2>
        <UiMenu v-model="menuValue" aria-label="Fixture navigation" :items="menuItems" />
        <output class="interaction-output" data-testid="menu-output">{{ menuValue || 'empty' }}</output>
      </section>

      <section class="interaction-case">
        <h2>Tree enterprise keyboard contract</h2>
        <UiTree v-model="treeValue" v-model:checked-keys="treeChecked" :data="treeItems" :load-data="loadTreeData" :default-expanded-keys="['workspace']" checkable show-line bordered aria-label="Fixture resources" />
        <output class="interaction-output" data-testid="tree-output">selected={{ treeValue || 'empty' }} checked={{ treeChecked.join(',') || 'none' }} loads={{ treeLoadCount }}</output>
      </section>

      <section class="interaction-case">
        <h2>Color picker keyboard contract</h2>
        <UiColorPicker v-model="brandColor" alpha aria-label="Brand color" :presets="['#1677FF','#10B981']" />
        <output class="interaction-output" data-testid="color-output">{{ brandColor }}</output>
      </section>

      <section class="interaction-case">
        <h2>Command palette keyboard contract</h2>
        <UiCommandPalette v-model="commandOpen" v-model:query="commandQuery" :commands="commandItems" @select="commandResult=$event.key">
          <template #trigger="{open}"><UiButton id="open-command-palette" @click="open">Open command palette</UiButton></template>
        </UiCommandPalette>
        <output class="interaction-output" data-testid="command-output">{{ commandResult }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-data-grid">
        <h2>Data grid orchestration contract</h2>
        <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:page-size="gridPageSize" v-model:filters="gridFilters" v-model:sort-key="gridSortKey" v-model:sort-order="gridSortOrder" v-model:selected-rows="gridSelected" v-model:expanded-rows="gridExpanded" v-model:density="gridDensity" v-model:visible-columns="gridVisibleColumns" :columns="gridColumns" :rows="gridRows" :page-size-options="[5,10]" :query-fields="['name','team','status']" selectable expandable aria-label="Fixture data grid" />
        <output class="interaction-output" data-testid="data-grid-output">q={{ gridQuery || 'empty' }} page={{ gridPage }} size={{ gridPageSize }} sort={{ gridSortKey || 'none' }}:{{ gridSortOrder || 'none' }} selected={{ gridSelected.join(',') || 'none' }} visible={{ gridVisibleColumns.join(',') }}</output>
      </section>

      <section class="interaction-case interaction-wide">
        <h2>Virtual list windowing and keyboard contract</h2>
        <div class="interaction-stack interaction-virtual-list">
          <UiVirtualList
            v-model="virtualSelection"
            v-model:active-index="virtualActive"
            :items="virtualItems"
            :item-size="48"
            :height="216"
            :overscan="2"
            selection-mode="single"
            aria-label="Fixture virtual records"
            bordered
          >
            <template #item="{ item, index, selected }">
              <div class="interaction-virtual-row">
                <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
                <span>{{ selected ? 'Selected' : `#${index + 1}` }}</span>
              </div>
            </template>
          </UiVirtualList>
          <output class="interaction-output" data-testid="virtual-list-output">{{ virtualSelection }} / {{ virtualActive }}</output>
        </div>
      </section>

      <section class="interaction-case interaction-wide interaction-status-page">
        <h2>Status page action contract</h2>
        <UiStatusPage status="403" embedded @back="statusAction='back'" @home="statusAction='home'" />
        <output class="interaction-output" data-testid="status-output">{{ statusAction }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-tour">
        <h2>Product tour focus and direction contract</h2>
        <div class="interaction-row"><UiButton id="tour-target-create">Create release</UiButton><UiButton id="tour-target-preview" variant="secondary">Preview release</UiButton><UiButton id="tour-target-publish" variant="outline">Publish release</UiButton><UiButton id="open-product-tour" @click="tourCurrent=0;tourOutput='opening';tourOpen=true">Open product tour</UiButton></div>
        <UiTour v-model="tourOpen" v-model:current="tourCurrent" :steps="tourSteps" aria-label="Release product tour" @open="tourOutput=`open:${$event.current}`" @change="(current,_previous,meta)=>tourOutput=`change:${current}:${meta.source}`" @close="tourOutput=`close:${$event.source}:${$event.current}`" />
        <output class="interaction-output" data-testid="tour-output">{{ tourOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-watermark">
        <h2>Watermark rendering and mutation recovery</h2>
        <div class="interaction-row"><UiButton id="rotate-watermark" variant="secondary" @click="watermarkRotate=watermarkRotate===-22?-35:-22;watermarkOutput=`rotation:${watermarkRotate}`">Rotate watermark</UiButton><UiButton id="remove-watermark" variant="outline" @click="removeWatermarkLayer">Remove watermark layer</UiButton></div>
        <UiWatermark id="interaction-watermark" :content="['Lan UI','PROTECTED']" :rotate="watermarkRotate" :gap="[72,64]" aria-label="Protected release record watermark" @remove="watermarkOutput=`restored:${$event.reason}`">
          <div class="interaction-watermark-document"><strong>Protected release record</strong><UiButton id="watermark-content-action" size="sm" @click="watermarkOutput='action'">Open record</UiButton></div>
        </UiWatermark>
        <output class="interaction-output" data-testid="watermark-output">{{ watermarkOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-affix">
        <h2>Affix container geometry and lifecycle</h2>
        <div class="interaction-row"><UiButton id="disable-affix" variant="secondary" @click="affixDisabled=!affixDisabled">{{ affixDisabled?'Enable affix':'Disable affix' }}</UiButton><output class="interaction-output" data-testid="affix-output">{{ affixOutput }}</output></div>
        <div id="interaction-affix-target" ref="affixTarget" class="interaction-affix-target" tabindex="0" aria-label="Affix interaction scroll container">
          <div class="interaction-affix-intro">Scroll to activate the approval bar</div>
          <UiAffix id="interaction-affix" :target="affixTarget" :offset="10" :disabled="affixDisabled" @change="(value,meta)=>affixOutput=`affixed:${value}:top:${meta.top}`" @scroll="meta=>affixOutput=`scroll:${meta.affixed}:${meta.scrollTop}`">
            <div class="interaction-affix-bar"><strong>Release approval</strong><span>Container boundary</span><UiButton id="affix-content-action" size="sm" @click="affixOutput='action'">Approve</UiButton></div>
          </UiAffix>
          <div class="interaction-affix-records"><span v-for="index in 7" :key="index">Verification record {{ index }}</span></div>
        </div>
      </section>
      <section class="interaction-case interaction-wide interaction-splitter-case">
        <h2>Splitter pointer, keyboard, RTL and collapse contract</h2>
        <div class="interaction-row"><UiButton id="splitter-collapse" variant="secondary" @click="splitterRef?.toggleCollapse(2)">Toggle inspector</UiButton><UiButton id="splitter-reset" variant="outline" @click="splitterRef?.reset()">Reset splitter</UiButton><output class="interaction-output" data-testid="splitter-output">{{ splitterOutput }}</output></div>
        <UiSplitter id="interaction-splitter" ref="splitterRef" v-model="splitterSizes" :panels="splitterPanels" lazy aria-label="Interaction workspace splitter" @resize-start="splitterOutput=`start:${$event.source}:${Math.round($event.sizes[0])}`" @resize="splitterOutput=`resize:${$event.source}:${Math.round($event.sizes[0])}`" @resize-end="splitterOutput=`end:${$event.source}:${Math.round($event.sizes[0])}`" @collapse="splitterOutput=`collapse:${$event.collapsed}:${$event.source}`">
          <template #panel="{panel,size,collapsed}"><div class="interaction-splitter-panel"><strong>{{ panel.label }}</strong><span v-if="!collapsed">{{ size.toFixed(1) }}%</span></div></template>
        </UiSplitter>
      </section>
      <section class="interaction-case interaction-wide interaction-list-case">
        <h2>List selection, action isolation and pagination contract</h2>
        <UiList id="interaction-list" v-model="listSelection" v-model:page="listPage" :items="interactionListItems" selection-mode="multiple" bordered hoverable :grid="{columns:2}" :pagination="{compact:true}" :default-page-size="3" :page-size-options="[3,6]" aria-label="Interaction release list" @change="listOutput=`select:${$event.join('|')}`" @active-change="listOutput=`active:${$event.index}:${$event.source}`" @page-change="listOutput=`page:${$event.page}:${$event.pageSize}`">
          <template #actions="{item}"><UiButton :id="`list-action-${item.id}`" size="sm" variant="text" @click="listOutput=`action:${item.id}`">Open</UiButton></template>
        </UiList>
        <output class="interaction-output" data-testid="list-output">{{ listOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-otp-case">
        <h2>One-time code input, paste and directional keyboard contract</h2>
        <UiOtpInput id="interaction-otp" v-model="otpValue" :length="6" mode="numeric" separator="–" :separator-every="3" aria-label="Interaction verification code" @input="(value,meta)=>otpOutput=`input:${value}:${meta.source}:${meta.index}`" @complete="(value,meta)=>otpOutput=`complete:${value}:${meta.source}:${meta.index}`" @invalid="meta=>otpOutput=`invalid:${meta.input}:${meta.index}`" />
        <output class="interaction-output" data-testid="otp-output">{{ otpOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-mentions-case">
        <h2>Caret mentions, multiple triggers and keyboard selection contract</h2>
        <UiMentions id="interaction-mentions" v-model="mentionsValue" :options="mentionsOptions" :triggers="['@','#']" :debounce="0" aria-label="Interaction release comment" @search="(query,meta)=>mentionsOutput=`search:${meta.trigger}:${query}`" @select="(option,meta)=>mentionsOutput=`select:${meta.trigger}:${option.value}:${meta.source}`" />
        <output class="interaction-output" data-testid="mentions-output">{{ mentionsOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-input-tag-case">
        <h2>Bulk tag input, paste, validation and keyboard removal contract</h2>
        <UiInputTag id="interaction-input-tag" v-model="inputTagValue" editable clearable :max-tags="5" :max-length="16" aria-label="Interaction capability tags" @change="(values,meta)=>inputTagOutput=`change:${meta.source}:${values.join('|')}`" @invalid="meta=>inputTagOutput=`invalid:${meta.reason}:${meta.value}`" />
        <output class="interaction-output" data-testid="input-tag-output">{{ inputTagOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-query-builder-case">
        <h2>Recursive query, typed values and keyboard editing contract</h2>
        <div class="interaction-row"><UiButton id="evaluate-query" variant="secondary" @click="evaluateQuery">Evaluate sample</UiButton><output class="interaction-output" data-testid="query-builder-output">{{ queryOutput }}</output></div>
        <UiQueryBuilder ref="queryBuilderRef" v-model="queryValue" :fields="queryFields" show-not name="interactionQuery" aria-label="Interaction release query" @change="meta=>queryOutput=`change:${meta.source}`" @action="meta=>queryOutput=`${meta.type}:${meta.kind}:${meta.index??meta.from??''}:${meta.to??''}`"/>
      </section>
      <section class="interaction-case interaction-wide interaction-carousel-case">
        <h2>Carousel keyboard, swipe and playback contract</h2>
        <UiCarousel id="interaction-carousel" v-model="carouselIndex" :items="carouselItems" :height="220" autoplay :interval="10000" arrows="always" indicators="numbers" aria-label="Interaction release highlights" @change="meta=>carouselOutput=`change:${meta.source}:${meta.index}:${meta.direction}`" @drag-end="meta=>carouselOutput=`drag:${meta.changed}:${meta.index}`">
          <template #item="{item,index}"><div class="interaction-carousel-slide" :data-index="index"><strong>{{ item.title }}</strong><span>{{ item.description }}</span></div></template>
        </UiCarousel>
        <output class="interaction-output" data-testid="carousel-output">{{ carouselOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-time-range-case">
        <h2>Time range value, constraint and validation contract</h2>
        <UiTimeRangePicker v-model="timeRangeValue" :constrain="false" :step="900" min="08:00" max="22:00" aria-label="Interaction service window" @change="payload=>{timeRangeChangeOutput=`change:${payload.valid}:${payload.value[0]||'empty'}:${payload.value[1]||'empty'}`;if(payload.valid)timeRangeOutput=timeRangeChangeOutput}" @invalid="payload=>timeRangeOutput=`invalid:${payload.code}`" @focus="payload=>timeRangeOutput=`focus:${payload.index}`" @clear="timeRangeOutput='clear'" />
        <output class="interaction-output" data-testid="time-range-output">{{ timeRangeOutput }}</output><output class="sr-only" data-testid="time-range-change-output">{{ timeRangeChangeOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-date-time-case">
        <h2>Date-time value, range ordering and focus contract</h2>
        <div class="interaction-date-time-grid">
          <UiDateTimePicker v-model="dateTimeValue" :step="900" min="2026-08-15T08:00" max="2026-08-31T20:00" aria-label="Interaction release starts" @change="value=>dateTimeOutput=`single:${value}`" @focus="dateTimeOutput='single-focus'" />
          <UiDateTimeRangePicker v-model="dateTimeRangeValue" :constrain="false" :step="900" min="2026-08-15T08:00" max="2026-08-31T20:00" start-placeholder="Window starts" end-placeholder="Window ends" aria-label="Interaction release window" @change="payload=>{dateTimeRangeChangeOutput=`range:${payload.valid}:${payload.value[0]||'empty'}:${payload.value[1]||'empty'}`;if(payload.valid)dateTimeOutput=dateTimeRangeChangeOutput}" @invalid="payload=>dateTimeOutput=`invalid:${payload.code}`" @focus="payload=>dateTimeOutput=`range-focus:${payload.index}`" @clear="dateTimeOutput='range-clear'" />
        </div>
        <output class="interaction-output" data-testid="date-time-output">{{ dateTimeOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-qr-code-case">
        <h2>QR code lifecycle, refresh and SVG matrix contract</h2>
        <div class="interaction-row"><UiButton id="qr-expire" variant="outline" @click="qrCodeStatus='expired';qrCodeOutput='status:expired'">Expire</UiButton><UiButton id="qr-mark-scanned" variant="outline" @click="qrCodeStatus='scanned';qrCodeOutput='status:scanned'">Mark scanned</UiButton><UiButton id="qr-reset" variant="text" @click="qrCodeStatus='active';qrCodeOutput='status:active'">Reset</UiButton><output class="interaction-output" data-testid="qr-code-output">{{ qrCodeOutput }}</output></div>
        <UiQRCode :value="`https://interaction.example/release?revision=${qrCodeRevision}`" :status="qrCodeStatus" level="H" :size="164" label="Interaction release QR code" caption="Release lifecycle" @refresh="refreshQrCode" @download="qrCodeOutput='download'"/>
      </section>
      <section class="interaction-case interaction-wide interaction-barcode-case">
        <h2>Barcode lifecycle, refresh and SVG encoding contract</h2>
        <div class="interaction-row"><UiButton id="barcode-expire" variant="outline" @click="barcodeStatus='expired';barcodeOutput='status:expired'">Expire</UiButton><UiButton id="barcode-mark-scanned" variant="outline" @click="barcodeStatus='scanned';barcodeOutput='status:scanned'">Mark scanned</UiButton><UiButton id="barcode-reset" variant="text" @click="barcodeStatus='active';barcodeOutput='status:active'">Reset</UiButton><output class="interaction-output" data-testid="barcode-output">{{ barcodeOutput }}</output></div>
        <UiBarcode :value="`LAN-UI-153-R${barcodeRevision}`" :status="barcodeStatus" format="CODE128" :width="2" :height="72" label="Interaction asset barcode" caption="Asset lifecycle" @refresh="refreshBarcode" @download="barcodeOutput='download'"/>
      </section>
      <section class="interaction-case interaction-wide interaction-cron-editor-case">
        <h2>Cron preset, validation and future-run contract</h2>
        <UiCronEditor ref="cronEditorRef" v-model="cronValue" from="2026-08-20T08:00:00Z" time-zone="UTC" aria-label="Interaction release schedule" @change="(value,meta)=>cronOutput=`${meta.source}:${meta.valid}:${value}`" @invalid="error=>cronOutput=`invalid:${error.code}`"/>
        <div class="interaction-row"><UiButton id="cron-api-daily" size="sm" variant="outline" @click="cronEditorRef.setExpression('0 10 * * *','fixture-api')">Set daily by API</UiButton><output class="interaction-output" data-testid="cron-output">{{ cronOutput }}</output></div>
      </section>
      <section class="interaction-case interaction-wide interaction-key-value-case">
        <h2>Key-value edit, import, reorder and validation contract</h2>
        <UiKeyValueEditor ref="keyValueEditorRef" v-model="keyValueRows" :min-rows="1" :max-rows="5" key-pattern="^[A-Za-z][A-Za-z0-9-]*$" require-value aria-label="Interaction request headers" @change="updateKeyValueOutput" @invalid="validation=>keyValueOutput=`invalid:${validation.errors[0]?.code}`"/>
        <div class="interaction-row"><UiButton id="key-value-import" size="sm" variant="outline" @click="keyValueEditorRef.importText('REGION=east\nRETRIES=3\nTRACE=enabled')">Import dotenv</UiButton><UiButton id="key-value-api-move" size="sm" variant="outline" @click="keyValueEditorRef.move(0,1,'fixture-api')">Move first by API</UiButton><output class="interaction-output" data-testid="key-value-output">{{ keyValueOutput }}</output></div>
      </section>
      <section class="interaction-case interaction-wide interaction-page-header-case">
        <h2>Page header back, breadcrumb and composition contract</h2>
        <UiPageHeader title="Interaction release" description="Validate pointer, keyboard and breadcrumb metadata." :breadcrumbs="[{label:'Workspace',href:'#page-header-workspace'},{label:'Components',href:'#page-header-components'},{label:'PageHeader'}]" show-back bordered @back="meta=>pageHeaderOutput=`back:${meta.source}`" @breadcrumb-navigate="meta=>pageHeaderOutput=`breadcrumb:${meta.index}:${meta.item.label}`">
          <template #meta><span>Stable contract</span></template>
          <template #actions><UiButton id="page-header-action" size="sm" @click="pageHeaderOutput='action:publish'">Publish</UiButton></template>
          <template #footer><nav aria-label="Page header sections"><a href="#page-header-overview">Overview</a></nav></template>
        </UiPageHeader>
        <output class="interaction-output" data-testid="page-header-output">{{ pageHeaderOutput }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-date-picker-production-case" data-date-picker-state-contract="controlled default open view calendar constraints disabled-date presets guard keyboard rtl portal ssr slots api native-fallback">
        <h2>DatePicker production calendar, presets, guard and API contract</h2>
        <div class="interaction-stack">
          <UiDatePicker id="interaction-production-date-picker" ref="productionDatePickerRef" v-model="productionDatePickerValue" v-model:open="productionDatePickerOpen" v-model:view-date="productionDatePickerView" :presets="productionDatePickerPresets" min="2026-08-01" max="2026-09-30" :append-to-body="false" show-week-numbers :disabled-date="date=>[0,6].includes(date.getUTCDay())" :before-change="guardProductionDatePicker" aria-label="Production release date" @change="(value,meta)=>productionDatePickerOutput=`change:${meta.source}:${value}`" @open-change="(open,meta)=>productionDatePickerOutput=`open:${meta.source}:${open}`" @invalid="meta=>productionDatePickerOutput=`invalid:${meta.code}:${meta.source||meta.kind||'unknown'}`" />
          <div class="interaction-row"><UiButton id="interaction-production-date-picker-api" size="sm" variant="outline" @click="productionDatePickerRef.select('2026-09-08','api')">Select by API</UiButton><UiButton id="interaction-production-date-picker-clear" size="sm" variant="outline" @click="productionDatePickerRef.clear('api')">Clear by API</UiButton></div>
          <output class="interaction-output" data-testid="production-date-picker-output">{{ productionDatePickerOutput }} / {{ productionDatePickerValue }} / {{ productionDatePickerOpen?'open':'closed' }} / {{ productionDatePickerView }}</output>
        </div>
      </section>

      <section class="interaction-case interaction-wide interaction-date-range-production-case" data-date-range-picker-state-contract="controlled default open view range-preview range-complete constraints presets escape clear rtl dark ssr">
        <h2>DateRangePicker production range panel, preview, guard and API contract</h2>
        <div class="interaction-stack">
          <UiDateRangePicker ref="productionDateRangeRef" v-model="productionDateRangeValue" v-model:open="productionDateRangeOpen" v-model:view-date="productionDateRangeView" default-view-date="2026-08-01" :append-to-body="false" :presets="[{key:'release',label:'Release window',value:['2026-08-20','2026-08-24']}]" aria-label="Production release window" @change="(payload)=>productionDateRangeOutput=`change:${payload.source}:${payload.complete}:${payload.value.join(':')}`" />
          <div class="interaction-row"><UiButton id="interaction-production-date-range-api" size="sm" variant="outline" @click="productionDateRangeRef.select(['2026-08-20','2026-08-24'],'api')">Select by API</UiButton><UiButton id="interaction-production-date-range-clear" size="sm" variant="outline" @click="productionDateRangeRef.clear('api')">Clear by API</UiButton></div>
          <output class="interaction-output" data-testid="production-date-range-output">{{ productionDateRangeOutput }} / {{ productionDateRangeValue.join(':') }} / {{ productionDateRangeOpen?'open':'closed' }} / {{ productionDateRangeView }}</output>
        </div>
      </section>

      <section class="interaction-case interaction-wide interaction-pagination-production-case">
        <h2>Production pagination window, guard and API contract</h2>
        <div class="interaction-stack">
          <UiPagination ref="productionPaginationRef" v-model:page="productionPaginationPage" v-model:page-size="productionPaginationSize" :total="1286" :page-size-options="[10,20,50,100]" :pager-count="7" show-first-last show-quick-jumper page-size-change-behavior="preserve-item" :before-change="guardProductionPagination" aria-label="Production release pages" @change="meta=>productionPaginationOutput=`change:${meta.source}:${meta.page}:${meta.pageSize}`" @invalid="meta=>productionPaginationOutput=`invalid:${meta.reason}:${meta.page}:${meta.pageSize}`"/>
          <UiButton id="production-pagination-api-next" size="sm" variant="outline" @click="productionPaginationRef?.next('api')">API next</UiButton>
          <output class="interaction-output" data-testid="pagination-production-output">{{ productionPaginationOutput }}</output>
        </div>
      </section>

      <section class="interaction-case interaction-wide interaction-table-production-case" data-table-state-contract="controlled uncontrolled selection expansion current row-policy async-guard nested-values sorting filters resize-pointer-keyboard virtual keyboard rtl ssr slots api datagrid-sync">
        <h2>Table production state, keyboard and API contract</h2>
        <UiTable id="interaction-production-table" ref="productionTableRef" v-model:selected-rows="productionTableSelected" v-model:expanded-rows="productionTableExpanded" v-model:current-row-key="productionTableCurrent" v-model:column-widths="productionTableWidths" v-model:sort-key="productionTableSortKey" v-model:sort-order="productionTableSortOrder" v-model:filters="productionTableFilters" :columns="productionTableColumns" :rows="productionTableRows" row-key="id" selectable select-on-row-click expandable highlight-current-row striped bordered resizable :is-row-selectable="row=>row.id!=='table-4'" :before-select="guardProductionTableSelect" aria-label="Production table evidence" @selection-change="(keys,meta)=>productionTableOutput=`selection:${meta.source}:${keys.join(',')}`" @expand-change="(keys,meta)=>productionTableOutput=`expand:${meta.source}:${keys.join(',')}`" @current-change="(key,meta)=>productionTableOutput=`current:${meta.source}:${key}`" @filter-change="(_filters,meta)=>productionTableOutput=`filter:${meta.source}:${meta.value??'all'}`" @column-resize="meta=>productionTableOutput=`resize:${meta.source}:${meta.key}:${meta.width??'auto'}`" @invalid="meta=>productionTableOutput=`invalid:${meta.reason}:${meta.kind}`"><template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':value==='Review'?'orange':'red'">{{ value }}</UiTag></template><template #expanded="{row}"><div>{{ row.detail }}</div></template></UiTable>
        <div class="interaction-row"><UiButton id="interaction-production-table-api-width" size="sm" variant="outline" @click="productionTableRef.setColumnWidth('name',256,'fixture-api')">Set width by API</UiButton><UiButton id="interaction-production-table-api-select" size="sm" variant="outline" @click="productionTableRef.selectRow('table-3',true,'fixture-api')">Exercise async guard</UiButton></div>
        <output class="interaction-output" data-testid="production-table-output">{{ productionTableOutput }}</output>
      </section>

      <section class="interaction-case interaction-wide interaction-select-production-case" data-select-state-contract="controlled uncontrolled native form reset search ime remote abort race cache loading error readonly disabled keyboard typeahead rtl ssr slots api">
        <h2>Select production contract</h2>
        <div class="interaction-grid">
          <UiFormItem label="Release cluster" required help="Search, keyboard, native form and public API"><UiSelect id="interaction-production-select" ref="productionSelectRef" v-model="productionSelectValue" :options="productionSelectOptions" name="releaseCluster" required searchable clearable :append-to-body="false" @change="(value,meta)=>productionSelectOutput=`select:${meta.source}:${value}`" @clear="(value,meta)=>productionSelectOutput=`clear:${meta.source}:${value}`"/></UiFormItem>
          <UiFormItem label="Remote release lane" help="Debounce, abort, race and cache"><UiSelect id="interaction-production-remote-select" v-model="productionRemoteSelect" searchable clearable :remote-method="fetchProductionSelect" :remote-debounce="0" :remote-min-chars="1" :append-to-body="false" @change="(value,meta)=>productionSelectOutput=`remote:${meta.source}:${value}`"/></UiFormItem>
          <UiFormItem label="Read only"><UiSelect id="interaction-production-readonly-select" model-value="locked" :options="[{label:'Locked',value:'locked'}]" readonly :append-to-body="false" @invalid="meta=>productionSelectOutput=`invalid:${meta.reason}`"/></UiFormItem>
          <div class="interaction-row"><UiButton id="interaction-production-select-api" size="sm" variant="outline" @click="productionSelectRef.setValue('east','fixture-api')">Select by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="production-select-output">{{ productionSelectOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-multi-select-production-case" data-multi-select-state-contract="controlled uncontrolled arrays native multiple reset search ime remote abort race cache min max select all tags backspace readonly keyboard rtl ssr slots api">
        <h2>MultiSelect production contract</h2>
        <div class="interaction-grid">
          <UiFormItem label="Release clusters" required help="Search, limits, tags, native multiple form and API"><UiMultiSelect id="interaction-production-multi-select" ref="productionMultiSelectRef" v-model="productionMultiSelectValue" :options="productionMultiSelectOptions" name="releaseClusters" required searchable clearable show-select-all :min-count="1" :max-count="2" :append-to-body="false" @change="(values,meta)=>productionMultiSelectOutput=`multi:${meta.source}:${values.join(',')}`" @remove="(option,meta)=>productionMultiSelectOutput=`remove:${meta.source}:${option.value}`" @select-all="(selected,values)=>productionMultiSelectOutput=`all:${selected}:${values.join(',')}`" @max="meta=>productionMultiSelectOutput=`max:${meta.maxCount}:${meta.value.join(',')}`"/></UiFormItem>
          <UiFormItem label="Remote release groups" help="Debounce, abort, race and cache"><UiMultiSelect id="interaction-production-remote-multi-select" v-model="productionRemoteMultiSelect" searchable clearable :remote-method="fetchProductionSelect" :remote-debounce="0" :remote-min-chars="1" :append-to-body="false" @change="(values,meta)=>productionMultiSelectOutput=`remote:${meta.source}:${values.join(',')}`"/></UiFormItem>
          <UiFormItem label="Read only"><UiMultiSelect id="interaction-production-readonly-multi-select" :model-value="['locked']" :options="[{label:'Locked',value:'locked'}]" readonly :append-to-body="false" @invalid="meta=>productionMultiSelectOutput=`invalid:${meta.reason}`"/></UiFormItem>
<div class="interaction-row"><UiButton id="interaction-production-multi-select-api" size="sm" variant="outline" @click="productionMultiSelectRef.select('north','fixture-api')">Select by API</UiButton><UiButton id="interaction-production-multi-select-close-api" size="sm" variant="text" @click="productionMultiSelectRef.hide('fixture-api')">Close by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="production-multi-select-output">{{ productionMultiSelectOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-tree-select-production-case" data-tree-select-state-contract="controlled uncontrolled scalar multiple expansion field mapping search ime lazy abort retry race cascade strict limits tags native reset readonly keyboard rtl ssr portal slots api">
        <h2>TreeSelect production contract</h2>
        <div class="interaction-grid">
          <form id="interaction-tree-select-form"><UiFormItem label="Delivery teams" required help="Hierarchy, search, cascade, limits, native multiple form and API"><UiTreeSelect id="interaction-production-tree-select" ref="productionTreeSelectRef" v-model="productionTreeSelectValue" :default-value="['frontend']" :options="productionTreeSelectOptions" name="deliveryTeams" required multiple checkable searchable clearable show-path default-expand-all :min-count="1" :max-count="3" :max-tag-count="2" :append-to-body="false" @change="(values,meta)=>productionTreeSelectOutput=`tree:${meta.source}:${values.join(',')}`" @invalid="meta=>productionTreeSelectOutput=`invalid:${meta.reason}`" @expand-change="(_keys,node,meta)=>productionTreeSelectOutput=`expand:${meta.source}:${node.value}:${meta.expanded}`"/></UiFormItem></form>
          <UiFormItem label="Lazy organization" help="AbortSignal-aware branch loading"><UiTreeSelect id="interaction-production-lazy-tree-select" :options="productionLazyTreeOptions" :load-data="loadProductionTree" :append-to-body="false" @load="payload=>productionTreeSelectOutput=`load:${payload.node.value}:${payload.children.length}`" @load-error="payload=>productionTreeSelectOutput=`load-error:${payload.node.value}`"/></UiFormItem>
          <UiFormItem label="Read only"><UiTreeSelect id="interaction-production-readonly-tree-select" model-value="frontend" :options="productionTreeSelectOptions" readonly :append-to-body="false" @invalid="meta=>productionTreeSelectOutput=`invalid:${meta.reason}`"/></UiFormItem>
          <div class="interaction-row"><UiButton id="interaction-production-tree-select-api" size="sm" variant="outline" @click="productionTreeSelectRef.select('design','fixture-api')">Select by API</UiButton><UiButton id="interaction-production-tree-select-load-api" size="sm" variant="outline" @click="productionTreeSelectRef.expand('experience','fixture-api')">Expand by API</UiButton><UiButton id="interaction-production-tree-select-close-api" size="sm" variant="text" @click="productionTreeSelectRef.hide('fixture-api')">Close by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="production-tree-select-output">{{ productionTreeSelectOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-cascader-production-case" data-cascader-state-contract="controlled uncontrolled path scalar field mapping search ime lazy abort retry race multiple strict limits tags native reset readonly keyboard rtl ssr portal slots api">
        <h2>Cascader production contract</h2>
        <div class="interaction-grid">
          <form id="interaction-cascader-form"><UiFormItem label="Delivery paths" required help="Path search, multiple limits, native form and API"><UiCascader id="interaction-production-cascader" ref="productionCascaderRef" v-model="productionCascaderValue" :default-value="[['product','platform','frontend']]" :options="productionCascaderOptions" name="deliveryPaths" required multiple searchable clearable :min-count="1" :max-count="2" :max-tag-count="1" :append-to-body="false" @change="(value,_paths,meta)=>productionCascaderOutput=`cascader:${meta.source}:${value.length}`" @invalid="meta=>productionCascaderOutput=`invalid:${meta.reason}`" @active-path-change="(path,meta)=>productionCascaderOutput=`path:${meta.source}:${path.join('/')}`"/></UiFormItem></form>
          <UiFormItem label="Lazy hierarchy" help="AbortSignal-aware branch loading"><UiCascader id="interaction-production-lazy-cascader" :options="productionLazyCascaderOptions" :load-data="loadProductionCascader" :append-to-body="false" @load="payload=>productionCascaderOutput=`load:${payload.node.value}:${payload.children.length}`" @load-error="payload=>productionCascaderOutput=`load-error:${payload.node.value}`"/></UiFormItem>
          <UiFormItem label="Read only"><UiCascader id="interaction-production-readonly-cascader" :model-value="['product','platform','frontend']" :options="productionCascaderOptions" readonly :append-to-body="false" @invalid="meta=>productionCascaderOutput=`invalid:${meta.reason}`"/></UiFormItem>
          <div class="interaction-row"><UiButton id="interaction-production-cascader-api" size="sm" variant="outline" @click="productionCascaderRef.select(['experience','design'],'fixture-api')">Select by API</UiButton><UiButton id="interaction-production-cascader-close-api" size="sm" variant="text" @click="productionCascaderRef.hide('fixture-api')">Close by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="production-cascader-output">{{ productionCascaderOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-transfer-production-case" data-transfer-state-contract="controlled uncontrolled mapping search ime select-all disabled min max order one-way loading error retry native reset keyboard virtual rtl ssr slots api">
        <h2>Transfer production contract</h2>
        <form id="interaction-transfer-form">
          <UiFormItem label="Workspace permissions" required help="Search, visible select-all, limits, virtual list, native form and exposed API">
            <UiTransfer id="interaction-production-transfer" ref="productionTransferRef" v-model="productionTransferValue" v-model:selected-keys="productionTransferSelected" v-model:search-values="productionTransferSearch" :default-value="['token']" :options="productionTransferOptions" searchable :min-count="1" :max-count="3" name="permissions" required :list-height="176" :item-height="36" :overscan="3" :operations="['Grant','Revoke']" @change="(value,meta)=>productionTransferOutput=`transfer:${meta.source}:${value.join(',')}`" @selection-change="(value,meta)=>{if(!String(meta.source).includes(':move'))productionTransferOutput=`selection:${meta.source}:${value.join(',')}`}" @search="(query,direction,meta)=>productionTransferOutput=`search:${direction}:${meta.source}:${query}`" @limit="meta=>productionTransferOutput=`limit:${meta.reason}:${meta.attempted}`" @invalid="meta=>productionTransferOutput=`invalid:${meta.reason}`">
              <template #footer="{visible,total}">{{ visible }} / {{ total }}</template>
            </UiTransfer>
          </UiFormItem>
        </form>
        <div class="interaction-row"><UiButton id="interaction-production-transfer-api" size="sm" variant="outline" @click="productionTransferRef.setValue(['token','audit'],'fixture-api')">Set by API</UiButton><UiButton id="interaction-production-transfer-clear" size="sm" variant="text" @click="productionTransferRef.clear('fixture-clear')">Clear</UiButton></div>
        <UiTransfer id="interaction-production-readonly-transfer" ref="productionReadonlyTransferRef" :model-value="['token']" :selected-keys="['api']" :options="productionTransferOptions.slice(0,4)" readonly @invalid="meta=>productionTransferOutput=`invalid:${meta.reason}`"/>
        <UiButton id="interaction-production-readonly-transfer-api" size="sm" variant="text" @click="productionReadonlyTransferRef.setValue(['token','api'],'fixture-api')">Exercise read-only guard</UiButton>
        <output class="interaction-output" data-testid="production-transfer-output">{{ productionTransferOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-selection-case" data-selection-state-contract="checkbox group array min max indeterminate radio keyboard switch guard loading form aria rtl ssr">
        <h2>Selection controls production contract</h2>
        <div class="interaction-grid">
          <UiCheckboxGroup v-model="selectionChannels" :options="selectionChannelOptions" label="Notification channels" name="channels" :min="1" :max="2" @change="(_value,meta)=>selectionOutput=`checkbox:${meta.value}:${meta.checked}:${selectionChannels.join(',')}`" @limit="meta=>selectionOutput=`limit:${meta.reason}:${selectionChannels.join(',')}`"/>
          <UiRadioGroup v-model="selectionPlan" :options="selectionPlanOptions" label="Workspace plan" name="plan" @change="(value,meta)=>selectionOutput=`radio:${meta.source}:${value}`"/>
          <div class="interaction-stack"><UiSwitch v-model="selectionPolicy" active-value="enabled" inactive-value="paused" name="releasePolicy" checked-text="Automatic release" unchecked-text="Release paused" aria-label="Release policy" :before-change="guardSelectionPolicy" @change="value=>selectionOutput=`switch:${value}`"/><div class="interaction-row"><UiCheckbox :model-value="false" indeterminate label="Mixed selection"/><UiCheckbox :model-value="false" readonly label="Read-only selection"/><UiRadio model-value="a" value="b" invalid label="Invalid radio"/></div></div>
        </div>
        <output class="interaction-output" data-testid="selection-output">{{ selectionOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-breadcrumb-case" data-breadcrumb-state-contract="collapse controlled keyboard focus link callback disabled current api rtl">
        <h2>Breadcrumb collapse, navigation and focus contract</h2>
        <UiBreadcrumb ref="breadcrumbRef" id="interaction-breadcrumb" v-model:expanded="breadcrumbExpanded" :items="breadcrumbItems" :max-items="4" :items-after-collapse="2" truncate aria-label="Interaction release location" @navigate="navigateBreadcrumb" @expand-change="changeBreadcrumbExpansion"/>
        <div class="interaction-row"><UiButton id="breadcrumb-api-navigate" size="sm" variant="outline" @click="breadcrumbRef.navigate('design','fixture-api')">Navigate by API</UiButton><UiButton id="breadcrumb-api-collapse" size="sm" variant="outline" @click="breadcrumbRef.collapse('fixture-api')">Collapse by API</UiButton></div>
        <output class="interaction-output" data-testid="breadcrumb-output">{{ breadcrumbOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-card-case">
        <h2>Card pointer, keyboard, selection and nested-action contract</h2>
        <div class="interaction-card-grid" data-card-state-contract>
          <UiCard id="interaction-card" title="Interactive release card" subtitle="Pointer, Enter and Space activation" variant="elevated" shadow="sm" hoverable interactive :selected="cardSelected" @activate="activateCard"><p>Whole-card activation keeps structured source metadata.</p><template #footer><span>{{ cardSelected?'Selected':'Not selected' }}</span></template></UiCard>
          <UiCard title="Composed controls" subtitle="Nested controls remain isolated" variant="outlined" shadow="none"><template #actions><UiButton id="card-nested-action" size="sm" variant="text" @click="cardOutput='nested:action'">Refresh</UiButton></template><p>Using this action does not activate the adjacent card.</p></UiCard>
          <UiCard id="interaction-card-disabled" title="Unavailable release card" interactive disabled><p>Removed from the tab order and activation path.</p></UiCard>
        </div>
        <output class="interaction-output" data-testid="card-output">{{ cardOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-button-case" data-button-state-contract="async duplicate-guard pointer keyboard focus link form disabled pressed icon rtl">
        <h2>Button async action, native semantics and imperative focus contract</h2>
        <div class="interaction-row">
          <UiButton id="interaction-button-action" :action="runButtonAction" loading-text="Publishing" @action-start="buttonOutput=`pending:${buttonActionRuns+1}`" @action-success="result=>buttonOutput=`success:${result.revision}:${result.runs}`">Publish release</UiButton>
          <UiButton id="interaction-button-toggle" shape="round" variant="secondary" :pressed="buttonPressed" @click="buttonPressed=!buttonPressed;buttonOutput=`pressed:${buttonPressed}`">Pin evidence</UiButton>
          <UiButton id="interaction-button-link" href="#button-release-target" target="_blank" icon="external" icon-position="end" variant="outline">Release docs</UiButton>
          <UiButton id="interaction-button-form" type="submit" form="interaction-release-form" name="intent" value="publish" variant="outline">Submit release</UiButton>
          <UiButton id="interaction-button-icon" icon="more" shape="circle" aria-label="More button actions" variant="outline"/>
          <UiButton id="interaction-button-disabled" disabled @click="buttonOutput='invalid:disabled'">Unavailable action</UiButton>
          <UiButton id="interaction-button-focus-target" ref="buttonRef" variant="text" @focus="buttonOutput='focus:api'">Focus target</UiButton>
          <UiButton id="interaction-button-focus-api" variant="text" @click="buttonRef.focus()">Focus via API</UiButton>
        </div>
        <i id="button-release-target"/>
        <output class="interaction-output" data-testid="button-output">{{ buttonOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-float-button-case" data-float-button-state-contract="standalone controlled default group guard selection keyboard focus escape link disabled loading backtop rtl">
        <h2>Floating actions, speed dial and back-to-top contract</h2>
        <div class="interaction-row">
          <UiFloatButton :teleport-to="false" icon="plus" label="Create floating task" action-key="create" @action="meta=>floatOutput=`action:${meta.source}:${meta.key}`" />
          <UiFloatButton :teleport-to="false" href="#float-release-target" icon="file" label="Floating release docs" />
          <UiFloatButton :teleport-to="false" icon="download" label="Loading floating action" loading />
          <UiFloatButton :teleport-to="false" icon="arrowUp" label="Back to top" back-top :visible="floatBackTopVisible" @back-top="meta=>floatOutput=`back-top:${meta.source}`" />
          <UiFloatButtonGroup :teleport-to="false" ref="floatGroupRef" aria-label="Interaction quick actions" :before-open-change="guardFloatOpen" @open-change="(open,meta)=>floatOutput=`open:${meta.source}:${open}`" @select="meta=>floatOutput=`select:${meta.source}:${meta.key}`">
            <UiFloatButton :teleport-to="false" icon="plus" label="New floating task" action-key="new" />
            <UiFloatButton :teleport-to="false" icon="settings" label="Floating settings" action-key="settings" />
          </UiFloatButtonGroup>
        </div>
        <i id="float-release-target" />
        <output class="interaction-output" data-testid="float-button-output">{{ floatOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-input-case" data-input-state-contract="native ime formatter parser clear escape password controlled focus api rtl">
        <h2>Input IME, parsing, clear and controlled password contract</h2>
        <div class="interaction-input-grid">
          <UiFormItem label="Release alias" required help="Composition commits once; Escape clears"><UiInput id="interaction-input" ref="inputRef" v-model.trim="inputValue" clearable clear-on-escape show-count :maxlength="24" name="releaseAlias" @input="(value,meta)=>inputOutput=`input:${meta.source}:${String(value)}`" @change="changeInput" @clear="(value,meta)=>inputOutput=`clear:${meta.source}:${String(value)}`" @enter="(value,_event,meta)=>inputOutput=`enter:${meta.source}:${String(value)}`"/></UiFormItem>
          <UiFormItem label="Controlled secret" help="Consumer owns visibility"><UiInput id="interaction-input-password" v-model="inputPassword" v-model:password-visible="inputPasswordVisible" type="password" password-toggle @password-visibility-change="(value,meta)=>inputOutput=`password:${meta.source}:${value}`"/></UiFormItem>
          <UiFormItem label="Package endpoint" help="Formatter and parser preserve the public value"><UiInput id="interaction-input-parser" model-value="release-center" :formatter="value=>String(value).toUpperCase()" :parser="value=>value.trim().toLowerCase().replace(/\s+/g,'-')" @change="changeInput"><template #prepend>pkg://</template><template #append>.stable</template></UiInput></UiFormItem>
          <div class="interaction-input-actions"><UiButton id="interaction-input-set-api" size="sm" variant="outline" @click="inputRef.setValue('api-release','fixture-api')">Set by API</UiButton><UiButton id="interaction-input-focus-api" size="sm" variant="text" @click="inputRef.focus()">Focus by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="input-output">{{ inputOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-textarea-case" data-textarea-state-contract="native ime formatter parser autosize clear escape submit focus api rtl">
        <h2>Textarea IME, autosize, parser, clear and keyboard-submit contract</h2>
        <div class="interaction-textarea-grid">
          <UiFormItem label="Release notes" required help="Composition commits once; Ctrl / Command + Enter submits"><UiTextarea id="interaction-textarea" ref="textareaRef" v-model.trim="textareaValue" :auto-size="{minRows:3,maxRows:5}" clearable clear-on-escape show-count :maxlength="120" name="releaseNotes" submit-on-enter="ctrl-or-meta" @input="(value,meta)=>textareaOutput=`input:${meta.source}:${String(value)}`" @change="changeTextarea" @clear="(value,meta)=>textareaOutput=`clear:${meta.source}:${String(value)}`" @submit="(value,_event,meta)=>textareaOutput=`submit:${meta.source}:${String(value)}`"><template #prefix>¶</template><template #footer="{count}">Autosaved · {{ count }}</template></UiTextarea></UiFormItem>
          <UiFormItem label="Formatted template" help="Focus restores the model; blur commits the parsed value"><UiTextarea id="interaction-textarea-parser" v-model="textareaParserValue" :formatter="value=>String(value).toUpperCase()" :parser="value=>value.trim().toLowerCase()" select-on-focus :rows="3" @change="changeTextarea"><template #suffix>MD</template></UiTextarea></UiFormItem>
          <UiFormItem label="Locked state"><UiTextarea id="interaction-textarea-locked" model-value="audit evidence" clearable readonly :rows="2"/></UiFormItem>
          <div class="interaction-textarea-actions"><UiButton id="interaction-textarea-set-api" size="sm" variant="outline" @click="textareaRef.setValue('api notes','fixture-api')">Set by API</UiButton><UiButton id="interaction-textarea-resize-api" size="sm" variant="outline" @click="textareaRef.resize('fixture-api')">Resize by API</UiButton><UiButton id="interaction-textarea-focus-api" size="sm" variant="text" @click="textareaRef.focus()">Focus by API</UiButton></div>
        </div>
        <output class="interaction-output" data-testid="textarea-output">{{ textareaOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-tag-case" data-tag-state-contract="selection close link keyboard disabled">
        <h2>Tag selection, close, link and keyboard contract</h2>
        <div class="interaction-row">
          <UiTag id="interaction-tag-checkable" checkable :checked="tagChecked" color="blue" @change="changeTag">{{ tagChecked?'Selected filter':'Available filter' }}</UiTag>
          <UiTag v-if="tagVisible" id="interaction-tag-removable" color="red" closable @close="closeTag">Failed build</UiTag>
          <UiTag id="interaction-tag-link" href="#tag-target" target="_blank" variant="outlined">Release notes</UiTag>
          <UiTag id="interaction-tag-disabled" checkable disabled>Unavailable</UiTag>
        </div>
        <output class="interaction-output" data-testid="tag-output">{{ tagOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-timeline-case" data-timeline-state-contract="selection keyboard disabled link horizontal rtl home end">
        <h2>Timeline selection, keyboard and link contract</h2>
        <UiTimeline id="interaction-timeline" v-model="timelineSelection" :items="timelineItems" selectable orientation="horizontal" placement="alternate" time-position="opposite" line="dashed" aria-label="Interaction release timeline" @change="changeTimeline" />
        <i id="interaction-timeline-target" />
        <output class="interaction-output" data-testid="timeline-output">{{ timelineOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide" data-tooltip-state-contract="controlled click outside escape focus hover delay aria-describedby">
        <h2>Tooltip trigger, dismissal and description contract</h2>
        <div class="interaction-row">
          <UiTooltip v-model:open="tooltipOpen" trigger="click" placement="bottom-start" wrap :max-width="220" content="Click-triggered release guidance closes with Escape or an outside pointer action." @open-change="changeTooltip"><UiButton id="tooltip-click-trigger">Tooltip click trigger</UiButton></UiTooltip>
          <UiTooltip content="Hover and keyboard focus keep independent open reasons." :show-delay="20" :hide-delay="20"><UiButton id="tooltip-focus-trigger" variant="outline">Tooltip focus trigger</UiButton></UiTooltip>
          <UiButton id="tooltip-outside-target" variant="text">Outside target</UiButton>
          <output class="interaction-output" data-testid="tooltip-output">{{ tooltipOutput }}</output>
        </div>
      </section>
      <section class="interaction-case interaction-wide" data-popover-state-contract="controlled click hover focus manual outside escape content focus-trap aria-controls">
        <h2>Popover trigger, focus and dismissal contract</h2>
        <div class="interaction-row">
          <UiPopover v-model="popoverOpen" title="Release actions" placement="bottom-start" :width="280" auto-focus trap-focus @open-change="changePopover">
            <template #trigger><UiButton id="popover-click-trigger">Popover click trigger</UiButton></template>
            <div class="visual-stack"><span>Review package and rollback evidence.</span><UiButton id="popover-first-action" variant="outline" size="sm">Inspect package</UiButton></div>
            <template #footer="{close}"><UiButton id="popover-keep-open" size="sm" variant="text" data-popover-keep-open>Keep open</UiButton><UiButton id="popover-finish" size="sm" @click="close('content')">Finish review</UiButton></template>
          </UiPopover>
          <UiPopover trigger="hover focus" title="Hover details" :show-delay="20" :hide-delay="20" :width="220"><template #trigger><UiButton id="popover-hover-trigger" variant="outline">Popover hover trigger</UiButton></template><UiButton id="popover-hover-action" size="sm">Panel action</UiButton></UiPopover>
          <UiPopover disabled title="Disabled"><template #trigger><UiButton id="popover-disabled-trigger" disabled>Disabled popover</UiButton></template>Unavailable.</UiPopover>
          <UiButton id="popover-outside-target" variant="text">Popover outside target</UiButton>
          <output class="interaction-output" data-testid="popover-output">{{ popoverOutput }}</output>
        </div>
      </section>
      <section class="interaction-case interaction-wide" data-dropdown-state-contract="controlled click hover focus contextmenu outside escape select tab arrows home end typeahead loop disabled checked aria-controls">
        <h2>Dropdown trigger, keyboard and dismissal contract</h2>
        <div class="interaction-row">
          <UiDropdown v-model="dropdownOpen" v-model:active-index="dropdownActive" :items="dropdownItems" placement="bottom-start" :close-on-select="false" @open-change="changeDropdown" @active-change="meta=>dropdownOutput=`active:${meta.source}:${meta.item?.key}`" @select="(item,meta)=>dropdownOutput=`select:${meta.source}:${item.key}`"><template #trigger><UiButton id="dropdown-click-trigger">Dropdown click trigger</UiButton></template></UiDropdown>
          <UiDropdown trigger="contextmenu" :items="dropdownItems.slice(1,5)"><template #trigger><UiButton id="dropdown-context-trigger" variant="outline">Dropdown context trigger</UiButton></template></UiDropdown>
          <UiDropdown disabled :items="dropdownItems"><template #trigger><UiButton id="dropdown-disabled-trigger" disabled>Disabled dropdown</UiButton></template></UiDropdown>
          <UiButton id="dropdown-outside-target" variant="text">Dropdown outside target</UiButton>
          <output class="interaction-output" data-testid="dropdown-output">{{ dropdownOutput }}</output>
        </div>
      </section>
      <section class="interaction-case interaction-wide" data-collapse-state-contract="controlled multiple async-guard lazy destroy keyboard focus disabled aria-controls api">
        <h2>Collapse state, lifecycle and keyboard contract</h2>
        <div class="interaction-row"><UiButton id="collapse-open-all" variant="outline" @click="collapseRef.openAll('fixture-api')">Open all</UiButton><UiButton id="collapse-close-all" variant="text" @click="collapseRef.closeAll('fixture-api')">Close all</UiButton><output class="interaction-output" data-testid="collapse-output">{{ collapseOutput }}</output></div>
        <UiCollapse id="interaction-collapse" ref="collapseRef" v-model="collapseOpen" :items="collapseItems" lazy destroy-on-hide loop :before-toggle="guardCollapse" :animated="false" aria-label="Interaction release sections" @change="(_value,meta)=>collapseOutput=`${meta.open?'open':'close'}:${meta.source}:${meta.key}`" @item-focus="meta=>collapseOutput=`focus:${meta.source}:${meta.key}`"/>
      </section>
      <section class="interaction-case interaction-wide interaction-steps-case" data-steps-state-contract="controlled navigation connectors keyboard disabled horizontal rtl home end">
        <h2>Steps navigation, keyboard and disabled contract</h2>
        <UiSteps id="interaction-steps" v-model="stepsCurrent" :items="stepsItems" type="navigation" loop aria-label="Interaction release steps" @change="changeSteps" />
        <output class="interaction-output" data-testid="steps-output">{{ stepsOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide interaction-typography-case">
        <h2>Typography copy, edit, ellipsis and expansion contract</h2>
        <UiTypography id="interaction-typography" v-model:content="typographyValue" variant="paragraph" :ellipsis="{rows:2,expandable:true}" :editable="{trigger:'both',maxLength:180}" copyable style="display:block;max-width:360px" @edit-start="typographyOutput=`start:${$event.source}`" @edit-end="typographyOutput=`save:${$event.value}`" @edit-cancel="typographyOutput=`cancel:${$event.source}`" @expand="typographyOutput=`expand:${$event.expanded}:${$event.rows}`" />
        <output class="interaction-output" data-testid="typography-output">{{ typographyOutput }}</output>
      </section>
      <section class="interaction-case interaction-wide">
        <h2>Anchor scroll and keyboard contract</h2>
        <div id="fixture-anchor-scroller" class="interaction-anchor-scroller">
          <UiAnchor v-model="anchorValue" :items="anchorItems" container="#fixture-anchor-scroller" :offset-top="8" :affix="false" aria-label="Anchor fixture" />
          <div id="fixture-anchor-overview" class="interaction-anchor-section"><strong>Overview</strong><span>Component foundations and usage.</span></div>
          <div id="fixture-anchor-api" class="interaction-anchor-section"><strong>API contract</strong><span>Props, events and item slots.</span></div>
          <div id="fixture-anchor-release" class="interaction-anchor-section"><strong>Release</strong><span>Package and verification evidence.</span></div>
        </div>
        <output class="interaction-output" data-testid="anchor-output">{{ anchorValue }}</output>
      </section>
      <section class="interaction-case interaction-wide">
        <h2>Scoped theme appearance contract</h2>
        <UiConfigProvider id="scoped-theme-provider" :appearance="scopedAppearance" :theme="scopedTheme">
          <div class="interaction-row">
            <UiButton id="theme-light" @click="scopedAppearance='light'">Light theme</UiButton>
            <UiButton id="theme-dark" @click="scopedAppearance='dark'">Dark theme</UiButton>
            <UiButton id="theme-system" @click="scopedAppearance='system'">System theme</UiButton>
            <UiPopover v-model="scopedPortalOpen" title="Scoped tenant panel"><template #trigger><UiButton id="theme-portal-trigger">Open themed portal</UiButton></template><span>Portal theme content</span></UiPopover>
          </div>
          <output class="interaction-output" data-testid="theme-output">{{ scopedAppearance }}</output>
        </UiConfigProvider>
      </section>
      <section class="interaction-case interaction-wide">
        <h2>Scoped motion preference contract</h2>
        <UiConfigProvider id="scoped-motion-provider" :motion="scopedMotion">
          <div class="interaction-row">
            <UiButton id="motion-full" @click="scopedMotion='full'">Full motion</UiButton>
            <UiButton id="motion-reduced" @click="scopedMotion='reduced'">Reduced motion</UiButton>
            <UiButton id="motion-system" @click="scopedMotion='system'">System motion</UiButton>
            <UiPopover v-model="scopedMotionPortalOpen" title="Scoped motion panel"><template #trigger><UiButton id="motion-portal-trigger">Open motion portal</UiButton></template><span>Portal motion content</span></UiPopover>
          </div>
          <output class="interaction-output" data-testid="motion-output">{{ scopedMotion }}</output>
        </UiConfigProvider>
      </section>
    </div>
    </template>
  </UiConfigProvider>
</template>

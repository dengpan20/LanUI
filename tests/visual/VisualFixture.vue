<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  UiAffix, UiAlert, UiAnchor, UiAutoComplete, UiBreadcrumb, UiButton, UiCalendar, UiCard, UiCarousel, UiConfigProvider, UiDatePicker, UiDateRangePicker, UiInput, UiInputTag, UiNumberInput, UiOtpInput, UiQueryBuilder,
  UiCascader, UiCheckbox, UiCheckboxGroup, UiDrawer, UiModal, UiMultiSelect, UiPagination, UiProgress, UiRadio, UiRadioGroup, UiSegmented, UiSwitch,
  UiImage, UiList, UiMentions, UiRate, UiSelect, UiSlider, UiStatistic, UiSteps, UiTable, UiTabs, UiTag, UiTimeline, UiTooltip, UiTransfer, UiTree, UiTreeSelect, UiColorPicker, UiCommandPalette,
  UiBarcode, UiCollapse, UiCronEditor, UiDataGrid, UiDateTimePicker, UiDateTimeRangePicker, UiDropdown, UiForm, UiFormItem, UiFormList, UiKeyValueEditor, UiPageHeader, UiPopover, UiQRCode, UiSchemaForm, UiSplitter, UiStatusPage, UiTextarea, UiTimeRangePicker, UiTour, UiTypography, UiUpload, UiVirtualList, UiWatermark,
} from '../../src/index.js'
import ApiReferencePage from '../../src/pages/ApiReferencePage.vue'

const props=defineProps({theme:String,direction:String,density:String,state:{type:String,default:'base'}})
const tab=ref('overview')
const anchorValue=ref('anchor-overview')
const segment=ref('month')
const commandOpen=ref(false)
const commandQuery=ref('')
const tourOpen=ref(props.state==='tour')
const tourCurrent=ref(0)
const visualAffixTarget=ref(null)
const visualAffixActive=ref(false)
const visualSplitterSizes=ref([24,48,28])
const visualSplitterPanels=[{key:'navigation',label:'Navigation',defaultSize:'24%',min:'14%',max:'38%',collapsible:true},{key:'workspace',label:'Workspace',min:'26%'},{key:'inspector',label:'Inspector',defaultSize:'28%',min:'16%',max:'42%',collapsible:true}]
const tourSteps=[
  {target:'#visual-tour-upload',title:'Add release assets',description:'Attach the approved package and verification record.',placement:'top-start'},
  {target:'#visual-tour-save',title:'Save the release',description:'Persist the release draft before requesting approval.',placement:'top'},
  {target:'#visual-tour-more',title:'Review more actions',description:'Open audit, rollback and publishing controls.',placement:'top-end'},
]
const brandColor=ref('#1677FFCC')
const visualImage=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><rect width="640" height="360" rx="24" fill="url(#g)"/><circle cx="520" cy="70" r="95" fill="white" opacity=".12"/><path d="M0 310 170 160l105 92 100-72 265 180H0Z" fill="white" opacity=".18"/><text x="34" y="58" fill="white" font-family="Arial" font-size="28" font-weight="700">Release media</text></svg>')}`
const commandItems=[{key:'dashboard',label:'Open dashboard',group:'Navigate'},{key:'settings',label:'Open settings',description:'Manage workspace',group:'Navigate'},{key:'disabled',label:'Disabled command',group:'Actions',disabled:true}]
const gridQuery=ref('')
const gridPage=ref(1)
const gridSelected=ref([])
const gridColumns=[{key:'name',label:'Work item',sortable:true},{key:'team',label:'Team'},{key:'status',label:'Status',filterable:true,filterOptions:['Ready','Review']}]
const gridRows=Array.from({length:18},(_,index)=>({id:`visual-grid-${index+1}`,name:`Release item ${index+1}`,team:['Design','Frontend','QA'][index%3],status:index%5===0?'Review':'Ready'}))
const virtualSelection=ref('visual-1')
const virtualRecords=Array.from({length:80},(_,index)=>({id:`visual-${index}`,label:`Release record ${String(index+1).padStart(2,'0')}`,status:index%4===0?'Review':'Ready'}))
const visualStepsCurrent=ref(1)
const visualBreadcrumbExpanded=ref(false)
const visualTooltipOpen=ref(true)
const visualPopoverOpen=ref(true)
const visualDropdownOpen=ref(true)
const visualDropdownItems=[{type:'heading',label:'Workspace actions'},{key:'edit',label:'Edit profile',icon:'edit',description:'Update customer information'},{key:'copy',label:'Copy link',shortcut:'⌘ C'},{key:'pin',label:'Pin to top',role:'menuitemcheckbox',checked:true},{key:'archive',label:'Archive project',disabled:true},{divider:true},{key:'disable',label:'Disable account',danger:true}]
const visualCollapseOpen=ref(['contract','evidence'])
const visualCollapseAccordion=ref('keyboard')
const visualButtonPressed=ref(true)
const visualInputValue=ref('Release Candidate 166')
const visualInputPassword=ref('LanUI-2026')
const visualInputPasswordVisible=ref(false)
const visualTextareaValue=ref('Multiline release notes grow from three to six rows while preserving native form semantics.')
const visualSelectValue=ref('east')
const visualSelectOptions=[{name:'East release cluster',id:'east',detail:'Shanghai and Hangzhou',terms:['east','hangzhou']},{name:'South release cluster',id:'south',detail:'Unavailable for this policy',locked:true},{name:'Global release cluster',id:'global',detail:'Cross-time-zone delivery',terms:['global','overseas']}]
const visualMultiSelectValue=ref(['east','global'])
const visualTreeSelectValue=ref(['frontend','design'])
const visualTreeSelectOptions=[
  {name:'Product & Engineering',id:'product',detail:'Core delivery teams',terms:['engineering','product'],children:[
    {name:'Frontend platform',id:'frontend',detail:'Design system and application shell'},
    {name:'Backend platform',id:'backend',detail:'Services and data contracts'},
  ]},
  {name:'Experience',id:'experience',detail:'Customer-facing disciplines',children:[
    {name:'Product design',id:'design',detail:'Interaction and visual language'},
    {name:'Research archive',id:'research',detail:'Unavailable for this policy',locked:true},
  ]},
]
const visualTransferValue=ref(['api','tokens'])
const visualTransferSelected=ref(['keyboard','a11y'])
const visualTransferOptions=[{label:'Component API',value:'api'},{label:'Design tokens',value:'tokens',description:'Theme and density variables'},{label:'Keyboard contract',value:'keyboard',description:'Focus and movement behavior'},{label:'Accessibility evidence',value:'a11y',description:'WCAG 2.2 AA and Axe'},{label:'Release package',value:'release',description:'Tarball and verification record'},{label:'Legacy archive',value:'legacy',description:'Unavailable resource',disabled:true}]
const visualTableSelected=ref(['table-1','table-3'])
const visualTableExpanded=ref(['table-1'])
const visualTableCurrent=ref('table-3')
const visualTableWidths=ref({name:224})
const visualTableSortKey=ref('name')
const visualTableSortOrder=ref('asc')
const visualTableFilters=ref({status:'Ready'})
const visualTableColumns=[
  {key:'name',label:'Release evidence',sortable:true,resizable:true},
  {key:'owner.name',dataKey:'owner.name',label:'Owner',resizable:true},
  {key:'status',label:'Status',filterable:true,filterOptions:[{label:'Ready',value:'Ready'},{label:'Review',value:'Review'},{label:'Blocked',value:'Blocked',disabled:true}]},
  {key:'coverage',label:'Coverage',formatter:value=>`${value}%`,resizable:true},
]
const visualTableRows=[
  {id:'table-1',name:'Component API contract',owner:{name:'Lin'},status:'Ready',coverage:100,detail:'60 props · 29 events · 13 slots'},
  {id:'table-2',name:'Keyboard and ARIA evidence',owner:{name:'Chen'},status:'Review',coverage:96,detail:'Roving focus · filters · resizing'},
  {id:'table-3',name:'Consumer package verification',owner:{name:'Wang'},status:'Ready',coverage:100,detail:'Root and subpath imports verified'},
  {id:'table-4',name:'Legacy compatibility audit',owner:{name:'Zhao'},status:'Blocked',coverage:82,detail:'Selection is unavailable for this row'},
]
const visualChannels=ref(['email','inbox'])
const visualPlan=ref('team')
const visualPolicy=ref('enabled')
const visualChannelOptions=[{label:'Email',value:'email',description:'Release and review results'},{label:'SMS',value:'sms',description:'Critical alerts only'},{label:'Inbox',value:'inbox'},{label:'Locked policy',value:'locked',disabled:true}]
const visualPlanOptions=[{label:'Starter',value:'starter',description:'Single workspace'},{label:'Team',value:'team',description:'Shared release workspace'},{label:'Enterprise',value:'enterprise',disabled:true}]
const visualCollapseItems=[{key:'contract',label:'Public component contract',content:'Root and subpath exports align Props, Emits, Slots and methods.',extra:'Required'},{key:'keyboard',label:'Keyboard and semantics',content:'Arrow, Home and End skip disabled headings.',extra:'WCAG'},{key:'evidence',label:'Release evidence',content:'Unit, visual, Axe, browser and package gates protect consumers.',extra:'Verified'},{key:'locked',label:'Restricted policy',content:'This panel is unavailable.',disabled:true}]
const visualBreadcrumbItems=[
  {key:'home',label:'Home',href:'#home',icon:'home'},
  {key:'workspace',label:'Workspace',href:'#workspace'},
  {key:'design',label:'Design system',href:'#design'},
  {key:'components',label:'Components',href:'#components'},
  {key:'navigation',label:'Navigation',href:'#navigation'},
  {key:'breadcrumb',label:'Breadcrumb contract'},
]
const visualStepsItems=[
  {key:'foundation',title:'Foundation audit',subtitle:'Complete',description:'Tokens and layout rules verified.'},
  {key:'components',title:'Component contract',subtitle:'In review',description:'Keyboard, ARIA and type coverage.'},
  {key:'approval',title:'Approval',subtitle:'Blocked',description:'Waiting for release evidence.',disabled:true},
  {key:'publish',title:'Publish package',subtitle:'Queued',description:'Tag, attest and release artifacts.'},
]
const visualTimelineSelection=ref('review')
const visualTimelineItems=[
  {key:'foundation',title:'Foundation audit',description:'Tokens, typography and layout constraints verified.',time:'09:15',datetime:'2026-08-20T09:15:00+08:00',status:'success',icon:'check'},
  {key:'review',title:'Component review',description:'Keyboard, ARIA and typed state contracts are under review.',time:'11:40',datetime:'2026-08-20T11:40:00+08:00',status:'primary',current:true},
  {key:'blocked',title:'Dependency approval',description:'Disabled until the package policy is approved.',time:'13:20',datetime:'2026-08-20T13:20:00+08:00',status:'warning',disabled:true},
  {key:'release',title:'Consumer release',description:'Publish package, evidence and rollback artifacts.',time:'16:30',datetime:'2026-08-20T16:30:00+08:00',status:'info',href:'#timeline-release'},
]
const visualListSelection=ref(['visual-list-1'])
const visualListRecords=Array.from({length:6},(_,index)=>({id:`visual-list-${index}`,title:`Release evidence ${index+1}`,description:['API and type contract','Keyboard and ARIA audit','Visual regression baseline'][index%3],disabled:index===4}))
const visualOtp=ref('204')
const visualMentions=ref('Review @de')
const visualMentionsRef=ref(null)
const visualInputTags=ref(['Vue 3','Design System','Accessibility'])
const visualInputTagRef=ref(null)
const visualQueryFields=[
  {key:'title',label:'Work item',type:'text',placeholder:'Search title'},
  {key:'status',label:'Status',type:'select',options:[{label:'Ready',value:'ready'},{label:'Review',value:'review'},{label:'Blocked',value:'blocked'}]},
  {key:'priority',label:'Priority',type:'number',min:1,max:5,step:1},
  {key:'dueAt',label:'Due date',type:'date'},
  {key:'labels',label:'Labels',type:'tags'},
]
const visualQuery=ref({id:'visual-root',combinator:'and',not:false,rules:[
  {id:'visual-rule-title',field:'title',operator:'contains',value:'release'},
  {id:'visual-group-status',combinator:'or',not:false,rules:[
    {id:'visual-rule-status',field:'status',operator:'equals',value:'ready'},
    {id:'visual-rule-priority',field:'priority',operator:'greaterOrEqual',value:3},
  ]},
  {id:'visual-rule-date',field:'dueAt',operator:'between',value:'2026-08-15',value2:'2026-08-31'},
]})
const visualCarouselIndex=ref(1)
const visualTimeRange=ref(['09:00','17:30'])
const visualDateTime=ref('2026-08-15T09:30')
const visualDateTimeRange=ref(['2026-08-15T09:30','2026-08-15T17:30'])
const visualCron=ref('0 9 * * 1-5')
const visualKeyValues=ref([
  {id:'authorization',key:'Authorization',value:'Bearer TOKEN',enabled:true},
  {id:'content-type',key:'Content-Type',value:'application/json',enabled:true},
  {id:'trace',key:'X-Trace-Id',value:'release-153',enabled:false},
])
const visualCarouselItems=[
  {key:'foundations',eyebrow:'FOUNDATIONS',title:'Shared visual language',description:'Semantic color, typography, spacing and motion tokens keep every product surface coherent.',metric:'359 locale keys'},
  {key:'components',eyebrow:'COMPONENTS',title:'Accessible by default',description:'Typed state, keyboard navigation, RTL behavior and reduced-motion support ship as one reusable contract.',metric:'91 public components'},
  {key:'delivery',eyebrow:'DELIVERY',title:'Verified before release',description:'Unit, visual, Axe, interaction, package and performance gates protect downstream consumers.',metric:'5 CI jobs'},
]
const visualMentionOptions=[
  {label:'Design owner',value:'design',description:'Design system review',trigger:'@'},
  {label:'Frontend owner',value:'frontend',description:'Implementation review',trigger:'@'},
  {label:'Release',value:'release',description:'Package and workflow evidence',trigger:'#'},
]
const visualForm=ref(null)
const visualFormModel=reactive({account:{email:''},profile:{displayName:'L'},contacts:[{name:'Owner',email:'owner@example.com'},{name:'Reviewer',email:'reviewer@example.com'}]})
const visualSchemaModel=reactive({account:{type:'business',name:'Lan UI workspace',email:'owner@example.com'},taxId:''})
const visualSchema=[{key:'workspace',title:'Workspace settings',description:'Schema-controlled layout and conditional validation.',columns:2,fields:[
  {name:'account.type',label:'Account type',type:'segmented',options:[{label:'Business',value:'business'},{label:'Personal',value:'personal'}],props:{block:true},span:2},
  {name:'account.name',label:'Workspace name',required:true,rules:[{required:true}]},
  {name:'account.email',label:'Owner email',required:true,rules:[{required:true},{type:'email'}]},
  {name:'taxId',label:'Tax ID',visible:model=>model.account.type==='business',required:true,rules:[{required:true}],span:2},
]}]
const visualSchemaListModel=reactive({reviewers:[
  {role:'Owner',name:'Lin',email:'owner@example.com'},
  {role:'Reviewer',name:'Chen',email:'reviewer@example.com'},
]})
const visualSchemaList=[{key:'reviewers',title:'Release reviewers',description:'Repeatable list nodes keep item fields, actions, validation, and responsive layout in one schema.',fields:[
  {key:'reviewers',name:'reviewers',type:'list',label:'Reviewers',min:1,max:4,columns:3,itemLabel:(_model,{index})=>`Reviewer ${index+1}`,defaultValue:({index})=>({role:'Reviewer',name:`Reviewer ${index+1}`,email:''}),fields:[
    {name:'role',label:'Role',type:'select',options:[{label:'Owner',value:'Owner'},{label:'Reviewer',value:'Reviewer'}]},
    {name:'name',label:'Name',required:true,rules:[{required:true}]},
    {name:'email',label:'Email',required:true,rules:[{required:true},{type:'email'}]},
  ]},
]}]
const visualUploadFiles=ref([
  {id:'upload-ready',name:'release-notes.pdf',size:184320,status:'ready',percent:0,raw:new File(['release'],'release-notes.pdf',{type:'application/pdf'})},
  {id:'upload-progress',name:'component-bundle.zip',size:2457600,status:'uploading',percent:46},
  {id:'upload-error',name:'token-audit.json',size:32768,status:'error',percent:68,error:'Network timeout',raw:new File(['tokens'],'token-audit.json',{type:'application/json'})},
  {id:'upload-success',name:'checksums.txt',size:2048,status:'success',percent:100},
])
onMounted(async()=>{if(props.state==='form'){await nextTick();await visualForm.value?.submit?.()}if(props.state==='mentions'){await nextTick();visualMentionsRef.value?.focus?.()}if(props.state==='input-tag'){await nextTick();visualInputTagRef.value?.focus?.()}})
const tableColumns=[
  {key:'name',label:'Project',fixed:'start',start:0},
  {key:'owner',label:'Owner'},
  {key:'status',label:'Status',fixed:'end',end:0},
]
const tableRows=[
  {id:1,name:'Design system',owner:'Lin',status:'Ready'},
  {id:2,name:'Admin portal',owner:'Chen',status:'Review'},
  {id:3,name:'Analytics',owner:'Wang',status:'Draft'},
]
</script>

<template>
  <UiConfigProvider id="visual-fixture" class="visual-fixture" tag="main" locale="en-US" :appearance="theme" :direction="direction" :density="density" :data-theme-case="theme">
    <ApiReferencePage v-if="state==='api-docs'" />
    <template v-else>
    <header class="visual-header">
      <div><small>LAN UI · REGRESSION FIXTURE</small><h1>Enterprise component baseline</h1></div>
      <div class="visual-meta"><UiTag color="blue">{{ theme }}</UiTag><UiTag color="green">{{ direction }}</UiTag><UiTag color="orange">{{ density }}</UiTag></div>
    </header>

    <section class="visual-grid">
      <UiCard title="Actions and states" title-tag="h2">
        <div class="visual-stack"><div class="visual-row"><UiButton>Primary</UiButton><UiButton variant="secondary">Secondary</UiButton><UiButton variant="outline">Outline</UiButton><UiButton variant="danger">Danger</UiButton></div><div class="visual-row"><UiButton icon="plus" size="sm">Create</UiButton><UiButton loading>Saving</UiButton><UiButton disabled>Disabled</UiButton></div></div>
      </UiCard>

      <UiCard title="Form controls" title-tag="h2">
        <div class="visual-form"><label>Name<UiInput model-value="Lan UI workspace"/></label><label>Region<UiSelect model-value="east" :options="[{label:'East region',value:'east'},{label:'West region',value:'west'}]"/></label><label>Office city<UiAutoComplete model-value="hangzhou" :options="[{label:'Hangzhou',value:'hangzhou',description:'East region'},{label:'Shenzhen',value:'shenzhen',description:'South region'}]"/></label><label>Quantity<UiNumberInput :model-value="12.5" :min="0" :max="100" :step="0.25"><template #suffix>items</template></UiNumberInput></label><label>Capacity<UiSlider :model-value="68" :step="5" tooltip="always" aria-label="Capacity"/></label><label>Service rating<UiRate :model-value="3.5" :step="0.5" show-text aria-label="Service rating"/></label><label class="visual-span">Delivery window<UiDateRangePicker :model-value="['2026-08-11','2026-08-28']"/></label></div>
      </UiCard>

      <UiCard title="Feedback and progress" title-tag="h2">
        <div class="visual-stack"><UiAlert type="success" title="Changes published" description="All package contracts passed."/><UiAlert type="warning" title="Review required" description="Two tokens are pending approval."/><UiStatistic title="Monthly revenue" :value="2864000" prefix="$" :trend="12.6"><template #extra>Compared with last month</template></UiStatistic><UiProgress :value="68"/><UiSteps :current="1" :items="[{title:'Foundation',description:'Tokens'},{title:'Components',description:'Contracts'},{title:'Delivery',description:'Package'}]"/></div>
      </UiCard>

      <UiCard title="Navigation choices" title-tag="h2">
        <div class="visual-stack"><UiTabs v-model="tab" :panels="false" :items="[{label:'Overview',value:'overview'},{label:'Usage',value:'usage'},{label:'API',value:'api'}]"/><UiSegmented v-model="segment" block :options="[{label:'Week',value:'week'},{label:'Month',value:'month'},{label:'Quarter',value:'quarter'}]"/><div class="visual-row"><UiTag color="blue">Active</UiTag><UiTag color="green">Success</UiTag><UiTag color="orange">Pending</UiTag><UiTag color="red">Error</UiTag></div></div>
      </UiCard>

      <UiCard title="Planning calendar" title-tag="h2">
        <UiCalendar :model-value="['2026-08-10','2026-08-16']" selection-mode="range" view-date="2026-08-01" today="2026-08-12" size="sm" show-week-numbers aria-label="Planning calendar" />
      </UiCard>

      <UiCard title="Media preview" title-tag="h2">
        <UiImage :src="visualImage" alt="Release media" preview loading="eager" style="width:100%;aspect-ratio:16/9" />
      </UiCard>

      <UiCard title="Virtualized records" title-tag="h2">
        <UiVirtualList v-model="virtualSelection" :items="virtualRecords" :item-size="44" :height="220" :overscan="2" selection-mode="single" aria-label="Virtualized records" bordered striped>
          <template #item="{item,selected}"><div class="visual-virtual-row"><strong>{{ item.label }}</strong><UiTag :color="selected?'blue':item.status==='Ready'?'green':'orange'">{{ selected?'Selected':item.status }}</UiTag></div></template>
        </UiVirtualList>
      </UiCard>
    </section>

    <UiCard title="Data table" title-tag="h2" class="visual-table-card">
      <UiTable :columns="tableColumns" :rows="tableRows">
        <template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':value==='Review'?'orange':'gray'">{{ value }}</UiTag></template>
      </UiTable>
      <UiPagination :page="2" :page-size="10" :total="86" aria-label="Project table pagination"/>
    </UiCard>
    <UiCard title="Managed data grid" title-tag="h2" class="visual-table-card visual-data-grid-card">
      <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:selected-rows="gridSelected" :columns="gridColumns" :rows="gridRows" :page-size="5" :page-size-options="[5,10]" :query-fields="['name','team','status']" selectable sticky-header max-height="320px" aria-label="Visual release data grid">
        <template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':'orange'">{{ value }}</UiTag></template>
      </UiDataGrid>
    </UiCard>
    <UiModal :model-value="state==='modal'" title="Publish component release" destroy-on-close>
      <p>Review the release notes before publishing this component package.</p>
      <template #footer><UiButton variant="secondary">Cancel</UiButton><UiButton>Publish</UiButton></template>
    </UiModal>
    <UiDrawer :model-value="state==='drawer'" title="Component settings" placement="end">
      <div class="visual-stack"><label>Package name<UiInput model-value="lan-ui-design-system"/></label><UiButton>Save settings</UiButton></div>
    </UiDrawer>
    <UiStatusPage v-if="state==='status'" status="500" embedded />
    <UiCard v-if="state==='form'" title="Managed form validation" title-tag="h2" class="visual-table-card">
      <UiForm ref="visualForm" :model="visualFormModel" show-error-summary error-summary-title="Review account details">
        <div class="visual-form"><UiFormItem name="account.email" label="Account email" required :rules="[{required:true},{type:'email'}]"><UiInput v-model="visualFormModel.account.email"/></UiFormItem><UiFormItem name="profile.displayName" label="Display name" :rules="[{min:2}]"><UiInput v-model="visualFormModel.profile.displayName"/></UiFormItem></div>
        <div class="ui-form-actions"><UiButton type="reset" variant="secondary">Reset</UiButton><UiButton type="submit">Save account</UiButton></div>
      </UiForm>
    </UiCard>
    <UiCard v-if="state==='form-list'" title="Dynamic contact fields" title-tag="h2" class="visual-table-card visual-form-list">
      <UiForm :model="visualFormModel">
        <UiFormItem name="contacts" label="Review contacts" group :rules="[{type:'array',min:1}]">
          <UiFormList v-slot="{fields,add,remove,move,canAdd,canRemove}" name="contacts" :min="1" :max="4" :default-value="()=>({name:'',email:''})" aria-label="Review contacts">
            <div v-for="(field,index) in fields" :key="field.key" class="visual-form-list-row">
              <div class="visual-form-list-heading"><strong>Contact {{ index+1 }}</strong><span><UiButton type="button" size="sm" variant="text" :disabled="index===0" @click="move(index,index-1)">Move up</UiButton><UiButton type="button" size="sm" variant="text" :disabled="!canRemove" @click="remove(index)">Remove</UiButton></span></div>
              <div class="visual-form"><UiFormItem :name="[...field.name,'name']" label="Name" required><UiInput v-model="visualFormModel.contacts[index].name"/></UiFormItem><UiFormItem :name="[...field.name,'email']" label="Email" required :rules="[{type:'email'}]"><UiInput v-model="visualFormModel.contacts[index].email"/></UiFormItem></div>
            </div>
            <UiButton type="button" variant="secondary" :disabled="!canAdd" @click="add()">Add contact</UiButton>
          </UiFormList>
        </UiFormItem>
      </UiForm>
    </UiCard>
    <UiCard v-if="state==='schema-form'" title="Schema-driven workspace" title-tag="h2" class="visual-table-card visual-schema-form">
      <UiSchemaForm :model="visualSchemaModel" :schema="visualSchema" show-error-summary error-summary-title="Review workspace settings">
        <template #actions="{validating,errors}"><span>{{ errors.length }} validation errors</span><UiButton type="submit" :loading="validating">Save workspace</UiButton></template>
      </UiSchemaForm>
    </UiCard>
    <UiCard v-if="state==='schema-form-list'" title="Schema repeatable reviewers" title-tag="h2" class="visual-table-card visual-schema-form-list">
      <UiSchemaForm :model="visualSchemaListModel" :schema="visualSchemaList">
        <template #actions><UiButton type="submit">Save reviewers</UiButton></template>
      </UiSchemaForm>
    </UiCard>
    <UiCard v-if="state==='upload-queue'" title="Production upload queue" title-tag="h2" class="visual-table-card visual-upload-queue">
      <UiUpload v-model="visualUploadFiles" multiple accept=".pdf,.zip,.json,.txt" :max-count="6" :concurrency="2" :auto-upload="false" :request="async()=>({ok:true})" aria-label="Release asset upload queue" />
    </UiCard>
    <UiCard v-if="state==='tour'" id="visual-tour-showcase" title="Product onboarding tour" title-tag="h2" class="visual-table-card">
      <div class="visual-stack"><UiAlert type="info" title="Target-aware onboarding" description="The active step stays visible, labelled and keyboard reachable."/><div class="visual-row"><UiButton id="visual-tour-upload" icon="upload">Add assets</UiButton><UiButton id="visual-tour-save" variant="secondary">Save draft</UiButton><UiButton id="visual-tour-more" variant="outline">More actions</UiButton></div></div>
    </UiCard>
    <UiTour v-if="state==='tour'" v-model="tourOpen" v-model:current="tourCurrent" :steps="tourSteps" aria-label="Release onboarding tour" />
    <UiCard v-if="state==='watermark'" title="Protected release document" title-tag="h2" class="visual-table-card visual-watermark-showcase">
      <UiWatermark :content="['Lan UI','INTERNAL']" :gap="[76,64]" :font="{fontSize:14,color:'rgba(37,99,235,.18)',fontWeight:650}" aria-label="Internal release watermark">
        <article class="visual-watermark-document"><div><strong>Release 1.39.0 evidence</strong><span>Package integrity, browser coverage and rollback verification</span></div><UiTag color="green">Verified</UiTag><dl><div><dt>Components</dt><dd>73</dd></div><div><dt>Runtime</dt><dd>Node 20 / 22 / 24</dd></div><div><dt>Browsers</dt><dd>Chromium / Firefox / WebKit</dd></div></dl></article>
      </UiWatermark>
    </UiCard>
    <UiCard v-if="state==='affix'" title="Container-aware sticky actions" title-tag="h2" class="visual-table-card visual-affix-showcase">
      <div ref="visualAffixTarget" class="visual-affix-target" tabindex="0" aria-label="Affix visual scroll container">
        <div class="visual-affix-intro">Scroll container boundary</div>
        <UiAffix :target="visualAffixTarget" :offset="12" @change="visualAffixActive=$event">
          <div class="visual-affix-bar"><strong>Release approval</strong><span>Width and boundary synchronized</span><UiTag :color="visualAffixActive?'green':'gray'">{{ visualAffixActive?'Pinned':'In flow' }}</UiTag><UiButton size="sm">Approve</UiButton></div>
        </UiAffix>
        <div class="visual-affix-records"><span v-for="index in 5" :key="index">Verification record {{ index }}</span></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='splitter'" title="Resizable workspace layout" title-tag="h2" class="visual-table-card visual-splitter-showcase">
      <UiSplitter v-model="visualSplitterSizes" class="visual-splitter" :panels="visualSplitterPanels" aria-label="Visual workspace splitter">
        <template #panel="{panel,size}"><div class="visual-splitter-panel" :class="{accent:panel.key==='workspace'}"><strong>{{ panel.label }}</strong><span>{{ size.toFixed(1) }}% of the responsive workspace</span><small v-if="panel.key==='navigation'">Projects<br>Components<br>Release evidence</small><small v-else-if="panel.key==='workspace'">Canvas · responsive ratios<br>Adjacent resize only</small><small v-else>Properties<br>Constraints<br>Audit trail</small></div></template>
      </UiSplitter>
    </UiCard>
    <UiCard v-if="state==='list'" title="Semantic data list" title-tag="h2" class="visual-table-card visual-list-showcase">
      <UiList v-model="visualListSelection" :items="visualListRecords" selection-mode="multiple" bordered hoverable :grid="{columns:1,md:2,gap:12}" :pagination="{position:'end',compact:true}" :default-page-size="4" :page-size-options="[4,8]" aria-label="Release evidence list">
        <template #header><span>Release readiness</span><UiTag color="blue">{{ visualListSelection.length }} selected</UiTag></template>
        <template #avatar="{index}"><span class="visual-list-avatar">{{ index+1 }}</span></template>
        <template #extra="{item}"><UiTag :color="item.disabled?'gray':'green'">{{ item.disabled?'Archived':'Ready' }}</UiTag></template>
        <template #footer>Responsive grid, selection, disabled state and pagination share one semantic contract.</template>
      </UiList>
    </UiCard>
    <UiCard v-if="state==='otp'" title="One-time code entry" title-tag="h2" class="visual-table-card visual-otp-showcase">
      <div class="visual-otp-grid">
        <UiFormItem label="Release verification" help="Mobile autofill, whole-code paste and automatic focus movement."><UiOtpInput v-model="visualOtp" :length="6" size="lg" separator="–" :separator-every="3"/></UiFormItem>
        <UiFormItem label="Masked approval code"><UiOtpInput model-value="4826" :length="4" mask/></UiFormItem>
        <UiFormItem label="Alphanumeric invite"><UiOtpInput model-value="A7B" :length="5" mode="alphanumeric" uppercase/></UiFormItem>
        <UiFormItem label="Validation state" error="The verification code has expired"><UiOtpInput model-value="98" :length="4" invalid/></UiFormItem>
      </div>
    </UiCard>
    <UiCard v-if="state==='mentions'" title="Contextual mentions" title-tag="h2" class="visual-table-card visual-mentions-showcase">
      <div class="visual-mentions-grid">
        <UiFormItem label="Release comment" help="The popup follows the caret and filters reviewers or topics."><UiMentions ref="visualMentionsRef" v-model="visualMentions" :options="visualMentionOptions" :triggers="['@','#']" show-count maxlength="160" :auto-size="{minRows:3,maxRows:5}" :append-to-body="false"/></UiFormItem>
        <UiFormItem label="Validation state" error="Mention at least one reviewer"><UiMentions model-value="Review is still missing an owner" :options="visualMentionOptions" invalid :rows="3"/></UiFormItem>
        <UiFormItem label="Read-only contract"><UiMentions model-value="Maintained by @design" :options="visualMentionOptions" readonly :rows="2"/></UiFormItem>
        <UiFormItem label="Disabled contract"><UiMentions model-value="Comment is locked" disabled :rows="2"/></UiFormItem>
      </div>
    </UiCard>
    <UiCard v-if="state==='input-tag'" title="Bulk tag input" title-tag="h2" class="visual-table-card visual-input-tag-showcase">
      <div class="visual-input-tag-grid">
        <UiFormItem label="Release capabilities" help="Enter, separators, paste, edit, selection and removal share one model."><UiInputTag ref="visualInputTagRef" v-model="visualInputTags" editable clearable :max-tags="8" :max-length="24"/></UiFormItem>
        <UiFormItem label="Collapsed contract" help="Three hidden tags expand when the control receives focus."><UiInputTag :model-value="['Vue','TypeScript','Vite','Vitest','Playwright']" collapse-tags :max-visible-tags="2"/></UiFormItem>
        <UiFormItem label="Validation state" error="Tag policy rejected the latest value"><UiInputTag :model-value="['release','policy-review']" invalid clearable/></UiFormItem>
        <UiFormItem label="Read-only and disabled" group><div class="visual-input-tag-states"><UiInputTag :model-value="['stable','readonly']" readonly/><UiInputTag :model-value="['locked']" disabled/></div></UiFormItem>
      </div>
    </UiCard>
    <UiCard v-if="state==='query-builder'" title="Recursive query builder" title-tag="h2" class="visual-table-card visual-query-builder-showcase">
      <div class="visual-query-builder-intro"><div><strong>Release work-item filter</strong><span>Typed fields, nested logic, NOT, reordering and keyboard actions share one controlled tree.</span></div><UiTag color="blue">AND · 4 rules · 1 group</UiTag></div>
      <UiQueryBuilder v-model="visualQuery" :fields="visualQueryFields" show-not name="releaseFilter" aria-label="Release work-item filter"/>
    </UiCard>
    <UiCard v-if="state==='carousel'" title="Accessible content rotation" title-tag="h2" class="visual-table-card visual-carousel-showcase">
      <UiCarousel v-model="visualCarouselIndex" :items="visualCarouselItems" :height="320" arrows="always" indicators="lines" indicator-position="outside" aria-label="Release capability highlights">
        <template #item="{item,index}"><div class="visual-carousel-slide" :data-tone="index"><small>{{ item.eyebrow }}</small><strong>{{ item.title }}</strong><p>{{ item.description }}</p><UiTag color="blue">{{ item.metric }}</UiTag></div></template>
      </UiCarousel>
    </UiCard>
    <UiCard v-if="state==='time-range'" title="Strict time-range input" title-tag="h2" class="visual-table-card visual-time-range-showcase">
      <div class="visual-time-range-grid">
        <UiFormItem label="Office service window" help="String model · 15 minute interval" composite><UiTimeRangePicker v-model="visualTimeRange" :step="900" min="08:00" max="22:00" aria-label="Office service window"/></UiFormItem>
        <UiFormItem label="Overnight exception" error="End time must not precede start time" composite><UiTimeRangePicker :model-value="['18:00','09:00']" :constrain="false" aria-label="Invalid overnight exception"/></UiFormItem>
        <UiFormItem label="Read-only policy" help="Schema Form disables time ranges in readonly mode" composite><UiTimeRangePicker :model-value="['10:00','16:00']" disabled aria-label="Disabled policy window"/></UiFormItem>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">string / Date / timestamp</UiTag><UiTag color="green">UTC / IANA zone</UiTag><UiTag color="orange">range-order validation</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='date-time'" title="Date-time scheduling adapters" title-tag="h2" class="visual-table-card visual-date-time-showcase">
      <div class="visual-date-time-grid">
        <UiFormItem label="Release starts" help="Dedicated single-value API · minute precision"><UiDateTimePicker v-model="visualDateTime" :step="900" min="2026-08-15T08:00" max="2026-08-31T20:00" aria-label="Release starts"/></UiFormItem>
        <UiFormItem label="Release window" help="Ordered range with shared constraints" composite><UiDateTimeRangePicker v-model="visualDateTimeRange" :step="900" min="2026-08-15T08:00" max="2026-08-31T20:00" aria-label="Release window"/></UiFormItem>
        <UiFormItem label="UTC approval" help="Date model · UTC serialization"><UiDateTimePicker :model-value="new Date('2026-08-15T01:30:00Z')" value-type="date" time-zone="UTC" precision="second" disabled aria-label="UTC approval"/></UiFormItem>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">UiDateTimePicker</UiTag><UiTag color="green">UiDateTimeRangePicker</UiTag><UiTag color="orange">string / Date / timestamp</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='qr-code'" title="Encoded release QR code" title-tag="h2" class="visual-table-card visual-qr-code-showcase">
      <div class="visual-qr-code-grid" data-qr-code-state-contract="active loading expired scanned svg ecc refresh download">
        <div><span>Active · branded · downloadable</span><UiQRCode value="https://lan-ui.example/release/1.50.0" level="H" color="#155EEF" :size="180" downloadable label="Lan UI release QR code" caption="Release 1.50.0"/></div>
        <div><span>Loading</span><UiQRCode value="lan-ui:loading" status="loading" :size="145" label="Loading release QR code"/></div>
        <div><span>Expired · refresh</span><UiQRCode value="lan-ui:expired" status="expired" :size="145" label="Expired release QR code"/></div>
        <div><span>Scanned</span><UiQRCode value="lan-ui:scanned" status="scanned" :size="145" label="Scanned release QR code"/></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">Real SVG matrix</UiTag><UiTag color="green">L / M / Q / H</UiTag><UiTag color="orange">SSR / lifecycle / export</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='barcode'" title="Encoded asset barcodes" title-tag="h2" class="visual-table-card visual-barcode-showcase">
      <div class="visual-barcode-grid" data-barcode-state-contract="code128 ean13 itf14 code39 active loading expired scanned svg refresh download">
        <div><span>CODE128 · branded · downloadable</span><UiBarcode value="LAN-UI-151-R1" format="CODE128" color="#155EEF" :width="2" :height="76" downloadable label="Lan UI asset barcode" caption="Release asset 1.51.0"/></div>
        <div><span>EAN13 · loading</span><UiBarcode value="5901234123457" format="EAN13" status="loading" :width="1.5" :height="62" :font-size="12" label="Loading EAN13 barcode"/></div>
        <div><span>ITF14 · scanned</span><UiBarcode value="10012345000017" format="ITF14" status="scanned" :width="1" :height="62" :font-size="12" label="Scanned ITF14 barcode"/></div>
        <div><span>CODE39 · expired</span><UiBarcode value="LANUI151" format="CODE39" status="expired" :width="1" :height="62" :font-size="12" label="Expired CODE39 barcode"/></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">Real binary bars</UiTag><UiTag color="green">CODE / EAN / UPC / ITF</UiTag><UiTag color="orange">SSR / lifecycle / export</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='cron-editor'" title="Validated automation schedules" title-tag="h2" class="visual-table-card visual-cron-editor-showcase">
      <div class="visual-cron-editor-grid" data-cron-editor-state-contract="preset custom valid invalid readonly disabled local utc preview form ssr">
        <UiFormItem label="Release automation" help="Five-field Unix Cron · wildcard, list, range and step syntax"><UiCronEditor v-model="visualCron" from="2026-08-20T08:00:00Z" time-zone="UTC" name="releaseSchedule"/></UiFormItem>
        <div class="visual-cron-editor-states"><UiFormItem label="Read-only backup"><UiCronEditor model-value="30 2 * * *" :preview-count="2" readonly/></UiFormItem><UiFormItem label="Validation error" error="Minute must be between 0 and 59"><UiCronEditor model-value="61 9 * * *" :preview-count="2" invalid/></UiFormItem></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">wildcard / list / range / step</UiTag><UiTag color="green">UTC / local preview</UiTag><UiTag color="orange">form / SSR / types</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='key-value-editor'" title="Structured request metadata" title-tag="h2" class="visual-table-card visual-key-value-showcase">
      <div class="visual-key-value-grid" data-key-value-state-contract="controlled custom-fields add remove reorder toggle import validation limits form responsive rtl ssr types">
        <UiFormItem label="Request headers" help="Keys are unique and use the canonical HTTP header pattern"><UiKeyValueEditor v-model="visualKeyValues" name="headers" :min-rows="1" :max-rows="6" key-pattern="^[A-Za-z][A-Za-z0-9-]*$" require-value/></UiFormItem>
        <div class="visual-key-value-states"><UiFormItem label="Read-only environment"><UiKeyValueEditor :model-value="[{key:'NODE_ENV',value:'production',enabled:true},{key:'LOG_LEVEL',value:'info',enabled:true}]" readonly/></UiFormItem><UiFormItem label="Duplicate validation" error="Keys must be unique"><UiKeyValueEditor :model-value="[{key:'REGION',value:'east',enabled:true},{key:'region',value:'west',enabled:true}]" require-value invalid/></UiFormItem></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">headers / env / metadata</UiTag><UiTag color="green">immutable change metadata</UiTag><UiTag color="orange">form / RTL / SSR / types</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='page-header'" title="Semantic page heading" title-tag="h2" class="visual-table-card visual-page-header-showcase">
      <div class="visual-page-header-stack" data-page-header-state-contract="breadcrumb back title description meta actions footer loading sticky responsive rtl ssr">
        <UiPageHeader title="Release evidence" description="Review component contracts, generated documentation and verification artifacts before publishing." :breadcrumbs="[{label:'Workspace',href:'#workspace'},{label:'Components',href:'#components'},{label:'PageHeader'}]" show-back bordered>
          <template #meta><UiTag color="green">Stable</UiTag><UiTag color="blue">89 components</UiTag></template>
          <template #actions><UiButton variant="outline">Preview</UiButton><UiButton>Publish</UiButton></template>
          <template #footer><UiTabs model-value="overview" :panels="false" :items="[{label:'Overview',value:'overview'},{label:'Contracts',value:'contracts'},{label:'Evidence',value:'evidence'}]"/></template>
        </UiPageHeader>
        <div class="visual-page-header-variants">
          <UiPageHeader title="Compact workspace" description="Small title scale with a custom metadata lane." size="sm" :breadcrumbs="[{label:'Admin',href:'#admin'},{label:'Settings'}]" show-back><template #meta><UiTag color="orange">Draft</UiTag></template></UiPageHeader>
          <UiPageHeader title="Loading release details" loading bordered aria-label="Loading page heading"/>
        </div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">semantic header</UiTag><UiTag color="green">responsive / RTL</UiTag><UiTag color="orange">sticky / reduced motion / SSR</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='button'" title="Production action controls" subtitle="Native semantics, async state, icons and responsive geometry" title-tag="h2" class="visual-table-card visual-button-showcase">
      <div class="visual-button-grid" data-button-state-contract="variants sizes disabled loading async action link form icon logical-position shape block pressed slots keyboard focus rtl reduced-motion ssr api">
        <section><h3>Variants</h3><div class="visual-row"><UiButton>Primary</UiButton><UiButton variant="secondary">Secondary</UiButton><UiButton variant="outline">Outline</UiButton><UiButton variant="text">Text</UiButton><UiButton variant="danger">Danger</UiButton><UiButton variant="danger-outline">Danger outline</UiButton></div></section>
        <section><h3>Icon and shape</h3><div class="visual-row"><UiButton icon="plus">Create</UiButton><UiButton icon="download" icon-position="end" variant="outline">Export</UiButton><UiButton icon="more" shape="circle" variant="outline" aria-label="More release actions"/><UiButton shape="round" variant="secondary" :pressed="visualButtonPressed">Pinned filter</UiButton></div></section>
        <section><h3>Size and state</h3><div class="visual-row visual-button-baseline"><UiButton size="sm">Small</UiButton><UiButton>Medium</UiButton><UiButton size="lg">Large</UiButton><UiButton loading loading-text="Publishing">Publish</UiButton><UiButton disabled>Disabled</UiButton></div></section>
        <section><h3>Native composition</h3><div class="visual-button-native"><UiButton href="#release-api" target="_blank" icon="external" icon-position="end" variant="text">API reference</UiButton><UiButton block shape="round" type="submit" form="visual-release-form" name="intent" value="publish">Publish all changes</UiButton></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">button / anchor / form</UiTag><UiTag color="green">pending / duplicate guard</UiTag><UiTag color="orange">RTL / reduced motion / SSR</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='input'" title="Production text inputs" subtitle="Native form semantics, IME-safe editing, formatting and complete operational states" title-tag="h2" class="visual-table-card visual-input-showcase">
      <div class="visual-input-grid" data-input-state-contract="native form ime formatter parser modifiers clear escape password controlled addons count loading invalid readonly disabled slots api rtl ssr">
        <UiFormItem label="Release name" required help="IME-safe model updates · Enter event · Escape clear"><UiInput v-model.trim="visualInputValue" icon="edit" clearable clear-on-escape select-on-focus show-count :maxlength="28" name="releaseName" autocomplete="off"/></UiFormItem>
        <UiFormItem label="Controlled secret" help="Visibility remains controlled by the consumer"><UiInput v-model="visualInputPassword" v-model:password-visible="visualInputPasswordVisible" type="password" icon="lock" password-toggle autocomplete="current-password"/></UiFormItem>
        <UiFormItem label="Package endpoint" help="Parser normalizes the editable draft"><UiInput model-value="release-center" :formatter="value=>String(value).toLowerCase()" :parser="value=>value.trim().replace(/\s+/g,'-')"><template #prepend>https://</template><template #suffix>stable</template><template #append>.lanui.dev</template></UiInput></UiFormItem>
        <div class="visual-input-state-field"><strong>Operational states</strong><div class="visual-input-states"><UiInput model-value="Synchronizing" loading aria-label="Loading release alias"/><UiInput model-value="duplicate-alias" invalid aria-label="Invalid release alias"/><UiInput model-value="SYSTEM-166" readonly aria-label="Read-only system identifier"/><UiInput model-value="Unavailable" disabled aria-label="Disabled input"/></div><span class="field-error">The release alias is already in use</span></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native / IME / model modifiers</UiTag><UiTag color="green">formatter / parser / slots</UiTag><UiTag color="orange">ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='textarea'" title="Production multiline inputs" subtitle="Autosize, IME-safe editing, keyboard submit and complete operational states" title-tag="h2" class="visual-table-card visual-textarea-showcase">
      <div class="visual-textarea-grid" data-textarea-state-contract="native form ime formatter parser modifiers autosize resize clear count submit loading invalid readonly disabled slots api rtl ssr">
        <UiFormItem label="Release notes" required help="Autosize 3–6 rows · Ctrl / Command + Enter submits"><UiTextarea v-model.trim="visualTextareaValue" :auto-size="{minRows:3,maxRows:6}" clearable clear-on-escape show-count :maxlength="180" name="releaseNotes" submit-on-enter="ctrl-or-meta"><template #prefix>¶</template><template #footer="{count}">Draft autosaved · {{ count }} characters</template></UiTextarea></UiFormItem>
        <UiFormItem label="Formatted template" help="Focus restores the editable value; blur formats the resting view"><UiTextarea model-value="release notes" :formatter="value=>String(value).toUpperCase()" :parser="value=>value.trim().toLowerCase()" select-on-focus :rows="3"><template #suffix>MD</template></UiTextarea></UiFormItem>
        <UiFormItem label="Size and resize policy" group><div class="visual-textarea-sizes"><UiTextarea size="sm" model-value="Small · fixed" :rows="2" resize="none" aria-label="Small fixed textarea"/><UiTextarea model-value="Medium · vertical" :rows="2" resize="vertical" aria-label="Medium vertical textarea"/><UiTextarea size="lg" model-value="Large · horizontal" :rows="2" resize="horizontal" aria-label="Large horizontal textarea"/></div></UiFormItem>
        <div class="visual-textarea-state-field"><strong>Operational states</strong><div class="visual-textarea-states"><UiTextarea model-value="Synchronizing" loading :rows="2" aria-label="Loading release notes"/><UiTextarea model-value="Needs policy review" invalid :rows="2" aria-label="Invalid release notes"/><UiTextarea model-value="Audit evidence" readonly :rows="2" aria-label="Read-only release notes"/><UiTextarea model-value="Policy locked" disabled :rows="2" aria-label="Disabled release notes"/></div><span class="field-error">The release notes require policy review</span></div>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">autosize / manual resize</UiTag><UiTag color="green">IME / parser / typed submit</UiTag><UiTag color="orange">ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='select'" title="Production select controls" subtitle="Controlled state, native forms, local and remote search, keyboard and complete operational states" title-tag="h2" class="visual-table-card visual-select-showcase">
      <div class="visual-select-grid" data-select-state-contract="controlled uncontrolled native form reset search ime remote abort race cache loading error readonly disabled keyboard typeahead rtl ssr slots api">
        <section class="visual-select-stage"><h3>Searchable mapped options</h3><UiFormItem label="Release cluster" required help="Search labels, descriptions or keywords"><UiSelect v-model="visualSelectValue" :options="visualSelectOptions" :field-names="{label:'name',value:'id',description:'detail',keywords:'terms',disabled:'locked'}" name="releaseCluster" required searchable clearable default-open><template #prefix>◈</template><template #footer="{options}">{{ options.length }} available records</template></UiSelect></UiFormItem></section>
        <section><h3>Sizes and operational states</h3><div class="visual-select-sizes"><UiSelect size="sm" model-value="Small" :options="['Small']" aria-label="Small select"/><UiSelect model-value="Medium" :options="['Medium']" aria-label="Medium select"/><UiSelect size="lg" model-value="Large" :options="['Large']" aria-label="Large select"/></div><div class="visual-select-states"><UiSelect model-value="Loading" :options="['Loading']" loading aria-label="Loading select"/><UiSelect invalid :options="['Required']" placeholder="Required value" aria-label="Invalid select"/><UiSelect model-value="Read only" :options="['Read only']" readonly aria-label="Read-only select"/><UiSelect model-value="Disabled" :options="['Disabled']" disabled aria-label="Disabled select"/></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native form / controlled open</UiTag><UiTag color="green">search / remote race / cache</UiTag><UiTag color="orange">keyboard / ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='multi-select'" title="Production multi-select controls" subtitle="Controlled arrays, constraints, tag composition, native multiple forms and resilient search" title-tag="h2" class="visual-table-card visual-multi-select-showcase">
      <div class="visual-multi-select-grid" data-multi-select-state-contract="controlled uncontrolled arrays field mapping search ime remote abort race cache min max select all hide selected tags backspace form rtl ssr slots api">
        <section class="visual-multi-select-stage"><h3>Mapped searchable records</h3><UiFormItem label="Release clusters" required help="Descriptions and keywords · maximum 3 records"><UiMultiSelect v-model="visualMultiSelectValue" :options="visualSelectOptions" :field-names="{label:'name',value:'id',description:'detail',keywords:'terms',disabled:'locked'}" name="releaseClusters" required searchable clearable show-select-all :max-count="3" :max-tag-count="1" default-open><template #prefix>◇</template><template #footer="{options}">{{ options.length }} visible records</template></UiMultiSelect></UiFormItem></section>
        <section><h3>Sizes and operational states</h3><div class="visual-multi-select-sizes"><UiMultiSelect size="sm" :model-value="['Small']" :options="['Small']" aria-label="Small multi select"/><UiMultiSelect :model-value="['Medium','Review']" :options="['Medium','Review']" :max-tag-count="1" aria-label="Medium multi select"/><UiMultiSelect size="lg" :model-value="['Large']" :options="['Large']" aria-label="Large multi select"/></div><div class="visual-multi-select-states"><UiMultiSelect :model-value="['Loading']" :options="['Loading']" loading aria-label="Loading multi select"/><UiMultiSelect invalid :options="['Required']" placeholder="Required values" aria-label="Invalid multi select"/><UiMultiSelect :model-value="['Read only']" :options="['Read only']" readonly aria-label="Read-only multi select"/><UiMultiSelect :model-value="['Disabled']" :options="['Disabled']" disabled aria-label="Disabled multi select"/></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native multiple / controlled arrays</UiTag><UiTag color="green">limits / select-all / tags</UiTag><UiTag color="orange">keyboard / ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='tree-select'" title="Production tree select controls" subtitle="Hierarchical selection, checkbox cascade, resilient search, native forms and lazy branch loading" title-tag="h2" class="visual-table-card visual-tree-select-showcase">
      <div class="visual-tree-select-grid" data-tree-select-state-contract="controlled uncontrolled scalar multiple expansion field mapping search ime lazy abort retry race cascade strict limits tags form keyboard rtl ssr portal slots api">
        <section class="visual-tree-select-stage"><h3>Mapped searchable hierarchy</h3><UiFormItem label="Delivery teams" required help="Paths and descriptions · maximum 3 leaf teams"><UiTreeSelect v-model="visualTreeSelectValue" :options="visualTreeSelectOptions" :field-names="{label:'name',value:'id',description:'detail',keywords:'terms',disabled:'locked'}" name="deliveryTeams" required multiple checkable searchable clearable default-expand-all show-path :max-count="3" :max-tag-count="1" :append-to-body="false"><template #prefix>◇</template><template #footer="{nodes}">{{ nodes.length }} visible nodes</template></UiTreeSelect></UiFormItem></section>
        <section><h3>Sizes and operational states</h3><div class="visual-tree-select-sizes"><UiTreeSelect size="sm" model-value="frontend" :options="visualTreeSelectOptions" default-expand-all aria-label="Small tree select"/><UiTreeSelect model-value="design" :options="visualTreeSelectOptions" show-path default-expand-all aria-label="Medium tree select"/><UiTreeSelect size="lg" model-value="backend" :options="visualTreeSelectOptions" default-expand-all aria-label="Large tree select"/></div><div class="visual-tree-select-states"><UiTreeSelect model-value="frontend" :options="visualTreeSelectOptions" loading aria-label="Loading tree select"/><UiTreeSelect invalid :options="visualTreeSelectOptions" placeholder="Required team" aria-label="Invalid tree select"/><UiTreeSelect model-value="design" :options="visualTreeSelectOptions" readonly aria-label="Read-only tree select"/><UiTreeSelect model-value="backend" :options="visualTreeSelectOptions" disabled aria-label="Disabled tree select"/></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native form / controlled expansion</UiTag><UiTag color="green">cascade / limits / lazy retry</UiTag><UiTag color="orange">keyboard / ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='selection'" title="Production selection controls" subtitle="Native inputs, typed groups, constraints, value mapping and complete operational states" title-tag="h2" class="visual-table-card visual-selection-showcase">
      <div class="visual-selection-grid" data-selection-state-contract="checkbox group boolean array true-value false-value min max indeterminate radio keyboard switch guard loading form aria rtl ssr">
        <section><UiCheckboxGroup v-model="visualChannels" :options="visualChannelOptions" label="Notification channels" name="channels" direction="vertical" :min="1" :max="3" required/><div class="visual-selection-sizes"><UiCheckbox size="sm" :model-value="true" label="Small selected"/><UiCheckbox :model-value="false" indeterminate label="Medium mixed"/><UiCheckbox size="lg" :model-value="false" invalid label="Large invalid"/></div></section>
        <section><UiRadioGroup v-model="visualPlan" :options="visualPlanOptions" label="Workspace plan" name="plan" direction="vertical" required/><div class="visual-selection-sizes"><UiRadio size="sm" model-value="a" value="a" label="Small selected"/><UiRadio model-value="a" value="b" readonly label="Medium read only"/><UiRadio size="lg" model-value="a" value="b" invalid label="Large invalid"/></div></section>
        <section class="visual-switch-contract"><strong>Switch values and states</strong><div class="visual-switch-list"><UiSwitch v-model="visualPolicy" active-value="enabled" inactive-value="paused" name="releasePolicy" checked-text="Automatic release" unchecked-text="Release paused"/><UiSwitch size="sm" :model-value="true" checked-text="Small"/><UiSwitch size="lg" :model-value="false" unchecked-text="Large"/><UiSwitch :model-value="true" loading aria-label="Synchronizing policy"/><UiSwitch :model-value="false" readonly aria-label="Read-only policy"/><UiSwitch :model-value="false" invalid aria-label="Invalid policy"/><UiSwitch :model-value="false" disabled aria-label="Disabled policy"/></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native form / groups / limits</UiTag><UiTag color="green">keyboard / async guard / values</UiTag><UiTag color="orange">ARIA / RTL / SSR / API</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='card'" title="Production content containers" subtitle="Variants, loading, selection and structured regions" title-tag="h2" class="visual-table-card visual-card-showcase">
      <div class="card-showcase-grid" data-card-state-contract="sizes variants cover header subtitle actions body footer hover interactive selected disabled loading link keyboard rtl reduced-motion ssr">
        <UiCard title="Release workspace" subtitle="Elevated · selected" variant="elevated" shadow="sm" hoverable interactive selected><template #cover><div class="visual-card-cover brand">Release evidence</div></template><p class="card-showcase-copy">The whole card exposes one keyboard and pointer activation contract.</p><template #footer><UiTag color="blue">Selected</UiTag></template></UiCard>
        <UiCard title="API contracts" subtitle="Outlined · composed actions" variant="outlined" shadow="none"><template #actions><UiButton size="sm" variant="text">Refresh</UiButton></template><p class="card-showcase-copy">Header, actions, body and footer remain distinct semantic regions.</p><template #footer><UiTag color="green">Verified</UiTag></template></UiCard>
        <UiCard title="Synchronizing package" subtitle="Filled · aria-busy" variant="filled" loading :loading-rows="4"/>
        <UiCard title="Archived workspace" subtitle="Disabled · unavailable" interactive disabled><p class="card-showcase-copy">Readable content with pointer and keyboard activation suppressed.</p></UiCard>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">default / outlined / elevated / filled</UiTag><UiTag color="green">pointer / keyboard / focus</UiTag><UiTag color="orange">loading / disabled / SSR</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='tag'" title="Production status tags" subtitle="Colors, variants, sizes and native interactions" title-tag="h2" class="visual-table-card visual-tag-showcase">
      <div class="visual-tag-grid" data-tag-state-contract="colors custom variants sizes dot round checkable closable link disabled keyboard rtl ssr">
        <section><h3>Semantic colors</h3><div class="visual-row"><UiTag color="blue" dot>In progress</UiTag><UiTag color="green" dot>Complete</UiTag><UiTag color="orange" dot>Pending</UiTag><UiTag color="red" dot>Failed</UiTag><UiTag color="gray">Archived</UiTag><UiTag color="purple">Review</UiTag></div></section>
        <section><h3>Variants and sizes</h3><div class="visual-row"><UiTag variant="soft" size="sm">Soft small</UiTag><UiTag color="green" variant="solid">Solid medium</UiTag><UiTag color="orange" variant="outlined" size="lg">Outlined large</UiTag><UiTag color="#0f766e" round>Custom round</UiTag></div></section>
        <section><h3>Action contracts</h3><div class="visual-row"><UiTag checkable checked>Selected filter</UiTag><UiTag checkable>Available filter</UiTag><UiTag color="red" closable>Removable</UiTag><UiTag href="#tag-docs" variant="outlined">Documentation</UiTag><UiTag checkable disabled>Unavailable</UiTag></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">native button / link</UiTag><UiTag color="green">aria-pressed / close label</UiTag><UiTag color="orange">controlled / SSR</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='timeline'" title="Release timeline" subtitle="Selection, status, time placement and orientation" title-tag="h2" class="visual-table-card visual-timeline-showcase">
      <div class="visual-timeline-grid" data-timeline-state-contract="vertical horizontal alternate opposite pending selection disabled link keyboard rtl loading empty ssr">
        <section><h3>Vertical · opposite time</h3><UiTimeline v-model="visualTimelineSelection" :items="visualTimelineItems" selectable pending time-position="opposite" dot-variant="solid" aria-label="Release progress timeline"/></section>
        <section><h3>Horizontal · alternate</h3><UiTimeline :items="visualTimelineItems.slice(0,3)" orientation="horizontal" placement="alternate" line="dashed" size="sm" interactive aria-label="Release stages timeline"/></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">roving focus / selection</UiTag><UiTag color="green">semantic time / status</UiTag><UiTag color="orange">vertical / horizontal / RTL</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='steps'" title="Release workflow steps" subtitle="Persistent connectors, navigation and responsive state" title-tag="h2" class="visual-table-card visual-steps-showcase">
      <div class="visual-steps-grid" data-steps-state-contract="connectors default navigation inline horizontal vertical label placement controlled uncontrolled linear disabled loading empty keyboard rtl responsive ssr">
        <section><h3>Navigation · horizontal labels</h3><UiSteps v-model="visualStepsCurrent" :items="visualStepsItems" type="navigation" interactive aria-label="Release workflow navigation"/></section>
        <section><h3>Vertical · explicit error</h3><UiSteps :items="visualStepsItems.slice(0,3).map((item,index)=>index===1?{...item,status:'error'}:item)" :current="1" direction="vertical" size="sm" aria-label="Release validation steps"/></section>
        <section><h3>Centered · vertical labels</h3><UiSteps :items="visualStepsItems.slice(0,3)" :current="1" label-placement="vertical" size="lg" aria-label="Release centered steps"/></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">dedicated connectors</UiTag><UiTag color="green">controlled navigation</UiTag><UiTag color="orange">responsive / keyboard / RTL</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='breadcrumb'" title="Navigation location paths" subtitle="Semantic links, long-path disclosure and stable current-page context" title-tag="h2" class="visual-table-card visual-breadcrumb-showcase">
      <div class="visual-breadcrumb-grid" data-breadcrumb-state-contract="semantic links buttons current disabled icons collapse controlled uncontrolled wrap nowrap truncate sizes separator loading empty slots focus rtl ssr">
        <section><h3>Collapsed · controlled</h3><UiBreadcrumb v-model:expanded="visualBreadcrumbExpanded" :items="visualBreadcrumbItems" :max-items="4" :items-after-collapse="2" truncate aria-label="Release location"/></section>
        <section><h3>Expanded · text separator</h3><UiBreadcrumb :items="visualBreadcrumbItems" :max-items="4" default-expanded separator="/" separator-mode="text" truncate :max-item-width="110" aria-label="Expanded release location"/></section>
        <section><h3>Disabled context</h3><UiBreadcrumb :items="[{key:'workspace',label:'Workspace',href:'#workspace',icon:'home'},{key:'restricted',label:'Restricted folder',disabled:true},{key:'evidence',label:'Release evidence'}]" size="sm" aria-label="Restricted location"/></section>
        <section><h3>Loading and empty</h3><UiBreadcrumb loading :loading-count="4" aria-label="Loading navigation location"/><UiBreadcrumb empty-text="No parent location" aria-label="Empty navigation location"/></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">ordered navigation</UiTag><UiTag color="green">controlled disclosure</UiTag><UiTag color="orange">RTL / loading / empty</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='tooltip'" title="Contextual tooltip guidance" subtitle="Trigger composition, collision-aware placement and accessible descriptions" title-tag="h2" class="visual-table-card visual-tooltip-showcase">
      <div class="visual-tooltip-grid" data-tooltip-state-contract="hover focus click manual controlled uncontrolled delays outside escape arrow wrap teleport theme rtl disabled empty ssr">
        <section><h3>Controlled · wrapping · arrow</h3><div class="visual-tooltip-stage"><UiTooltip v-model:open="visualTooltipOpen" trigger="manual" placement="bottom-start" :append-to-body="false" wrap :max-width="230" content="Long operational guidance wraps inside a predictable maximum width and remains attached to the trigger through aria-describedby."><UiButton id="visual-tooltip-controlled">Release guidance</UiButton></UiTooltip></div></section>
        <section><h3>Trigger contracts</h3><div class="visual-row"><UiTooltip content="Hover and keyboard focus share independent open reasons." :show-delay="120" :hide-delay="80"><UiButton variant="outline">Hover + Focus</UiButton></UiTooltip><UiTooltip content="Click again, press Escape, or click outside to close." trigger="click" placement="bottom-start"><UiButton variant="outline">Click</UiButton></UiTooltip><UiTooltip content="Disabled tooltip" disabled><UiButton disabled>Disabled</UiButton></UiTooltip></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">controlled / uncontrolled</UiTag><UiTag color="green">ARIA / Escape / outside</UiTag><UiTag color="orange">flip / shift / RTL</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='popover'" title="Interactive popover surfaces" subtitle="Trigger composition, focus policy, dismissal and portal-aware positioning" title-tag="h2" class="visual-table-card visual-popover-showcase">
      <div class="visual-popover-grid" data-popover-state-contract="click hover focus manual controlled uncontrolled delays outside escape content arrow portal focus-trap disabled loading rtl ssr">
        <section><h3>Controlled · focus trap · footer</h3><div class="visual-popover-stage"><UiPopover v-model="visualPopoverOpen" trigger="manual" title="Release actions" placement="bottom-start" :width="280" trap-focus><template #trigger><UiButton id="visual-popover-controlled">Review release</UiButton></template><p style="margin:0">Review the package, verification record and rollback before publishing.</p><template #footer="{close}"><UiButton size="sm" variant="text" data-popover-keep-open>Keep open</UiButton><UiButton size="sm" @click="close('content')">Approve</UiButton></template></UiPopover></div></section>
        <section><h3>Trigger and state contracts</h3><div class="visual-row"><UiPopover trigger="hover focus" title="Operational note" :show-delay="120" :hide-delay="80"><template #trigger><UiButton variant="outline">Hover + Focus</UiButton></template>The trigger and panel preserve independent hover and focus reasons.</UiPopover><UiPopover disabled title="Disabled panel"><template #trigger><UiButton disabled>Disabled</UiButton></template>Unavailable.</UiPopover><UiPopover default-open loading :append-to-body="false" title="Loading context" :width="210"><template #trigger><UiButton variant="outline">Loading</UiButton></template>Refreshing release evidence.</UiPopover></div></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">controlled / uncontrolled</UiTag><UiTag color="green">ARIA / focus / dismissal</UiTag><UiTag color="orange">portal / flip / RTL</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='dropdown'" title="Production dropdown menus" subtitle="Semantic items, complete keyboard navigation and collision-aware floating" title-tag="h2" class="visual-table-card visual-dropdown-showcase">
      <div class="visual-dropdown-grid" data-dropdown-state-contract="controlled uncontrolled click hover focus contextmenu manual portal placement collision outside escape select tab arrows home end typeahead loop disabled loading empty checked description rtl ssr">
        <section><h3>Controlled · semantic menu</h3><div class="visual-dropdown-stage"><UiDropdown v-model="visualDropdownOpen" trigger="manual" :items="visualDropdownItems" placement="bottom-start" :append-to-body="false" :active-index="1"><template #trigger><UiButton id="visual-dropdown-controlled">Release actions</UiButton></template></UiDropdown></div></section>
        <section><h3>Trigger and state contracts</h3><div class="visual-row"><UiDropdown default-open :append-to-body="false" trigger="manual" :items="visualDropdownItems.slice(1,4)" placement="bottom-start"><template #trigger><UiButton variant="outline">Default open</UiButton></template></UiDropdown><UiDropdown loading default-open :append-to-body="false" trigger="manual" :items="visualDropdownItems.slice(1,3)"><template #trigger><UiButton variant="outline">Loading</UiButton></template></UiDropdown><UiDropdown disabled :items="visualDropdownItems"><template #trigger><UiButton disabled>Disabled</UiButton></template></UiDropdown></div></section>
      </div>
    </UiCard>
    <UiCard v-if="state==='collapse'" title="Accessible disclosure sections" subtitle="State, lifecycle, keyboard and appearance contracts" title-tag="h2" class="visual-table-card visual-collapse-showcase">
      <div class="visual-collapse-grid" data-collapse-state-contract="controlled uncontrolled multiple accordion non-collapsible disabled lazy destroy motion sizes bordered ghost slots keyboard loading empty rtl ssr">
        <section><h3>Multiple · controlled · bordered</h3><UiCollapse v-model="visualCollapseOpen" :items="visualCollapseItems" lazy loop :animated="false" aria-label="Release evidence sections"><template #item-evidence="{content}"><div class="visual-collapse-evidence"><UiTag color="green">Passed</UiTag><span>{{ content }}</span></div></template></UiCollapse></section>
        <section><h3>Accordion · ghost · icon end</h3><UiCollapse v-model="visualCollapseAccordion" :items="visualCollapseItems.slice(0,3)" accordion :collapsible="false" ghost size="sm" :animated="false" expand-icon-position="end" aria-label="Release policy accordion"/></section>
        <section><h3>Loading and empty</h3><UiCollapse loading :loading-count="3" size="sm" aria-label="Loading release sections"/><UiCollapse :items="[]" empty-text="No release sections" ghost :animated="false" aria-label="Empty release sections"/></section>
      </div>
      <div class="visual-time-range-summary"><UiTag color="blue">controlled / accordion</UiTag><UiTag color="green">lazy / guard / reduced motion</UiTag><UiTag color="orange">keyboard / ARIA / RTL</UiTag></div>
    </UiCard>
    <UiCard v-if="state==='typography'" title="Semantic release typography" title-tag="h2" class="visual-table-card visual-typography-showcase">
      <div class="visual-typography-grid"><div><UiTypography variant="title" :level="3" content="Release evidence" tone="primary"/><UiTypography content="Consistent semantic hierarchy for operational documents." tone="secondary" size="sm"/><div class="visual-row"><UiTypography content="RELEASE_7F4A" code copyable/><UiTypography content="Ctrl + Enter" keyboard/></div></div><div><UiTypography variant="paragraph" tone="secondary" :ellipsis="{rows:2,expandable:true}" copyable editable style="display:block;max-width:430px" content="Lan UI uses one accessible text primitive for long configuration notes, release evidence, copyable identifiers and keyboard-confirmed inline editing. The same behavior is available to every standalone consumer without page-specific wrappers or duplicated icon actions."/><UiTypography content="Validation completed" tone="success" strong/><UiTypography content="A required value is missing" tone="danger"/></div></div>
    </UiCard>
    <UiConfigProvider v-if="state==='theme'" id="visual-scoped-dark" appearance="dark" :theme="{'brand-600':'#7C3AED','brand-text':'#C4B5FD'}" class="visual-table-card">
      <UiCard title="Scoped dark tenant theme" title-tag="h2">
        <div class="visual-stack"><UiAlert type="info" title="System-aware provider" description="Dark mode and tenant tokens are isolated to this subtree."/><div class="visual-row"><UiButton>Tenant action</UiButton><UiButton variant="secondary">Secondary</UiButton><UiTag color="blue">dark / scoped</UiTag></div></div>
      </UiCard>
    </UiConfigProvider>
    <UiConfigProvider v-if="state==='theme-portal'" id="visual-scoped-portal" appearance="dark" :theme="{'brand-600':'#7C3AED','brand-text':'#C4B5FD','bg-surface':'#131E2F'}" class="visual-table-card">
      <UiCard title="Scoped portal theme bridge" title-tag="h2"><div class="visual-stack"><UiAlert type="info" title="Provider subtree" description="The teleported panel keeps this tenant theme after moving under body."/><UiPopover :model-value="true" title="Tenant settings" placement="bottom-start"><template #trigger><UiButton id="visual-theme-portal-trigger">Open tenant panel</UiButton></template><div class="visual-stack"><strong>Dark scoped overlay</strong><span>Brand, surface, density and direction follow the provider.</span><UiButton size="sm">Apply tenant theme</UiButton></div></UiPopover></div></UiCard>
    </UiConfigProvider>
    <UiConfigProvider v-if="state==='motion'" id="visual-motion-reduced" motion="reduced" class="visual-table-card">
      <UiCard title="Scoped motion preferences" title-tag="h2"><div class="visual-stack"><UiAlert type="info" title="Reduced motion scope" description="Transitions, spinners, skeletons and smooth scrolling settle immediately in this subtree."/><div class="visual-row"><UiButton>Reduced action</UiButton><UiTag color="blue">reduced / scoped</UiTag></div><UiConfigProvider id="visual-motion-full" motion="full"><div class="visual-row"><UiButton variant="secondary">Nested full motion</UiButton><UiTag color="green">full override</UiTag></div></UiConfigProvider></div></UiCard>
    </UiConfigProvider>
    <UiCard v-if="state==='cascader'" title="Production cascader paths" title-tag="h2" class="visual-table-card visual-cascader-showcase">
      <div class="visual-stack" data-cascader-state-contract="controlled path search multiple limits tags loading invalid readonly disabled keyboard rtl portal slots api">
        <div class="visual-form visual-cascader-stage"><UiCascader aria-label="Delivery hierarchy" :model-value="[['engineering','frontend','admin'],['operations','release','stable']]" :options="[{label:'Engineering',value:'engineering',description:'Product delivery',children:[{label:'Frontend',value:'frontend',children:[{label:'Admin workspace',value:'admin',isLeaf:true},{label:'Mobile shell',value:'mobile',isLeaf:true}]}]},{label:'Operations',value:'operations',children:[{label:'Release',value:'release',children:[{label:'Stable lane',value:'stable',isLeaf:true},{label:'Preview lane',value:'preview',isLeaf:true}]}]}]" multiple searchable clearable :max-tag-count="1" :append-to-body="false" default-open><template #prefix>◇</template><template #footer="{options}">{{ options.length }} visible paths</template></UiCascader></div>
        <div class="visual-form"><UiCascader aria-label="Loading hierarchy" loading/><UiCascader aria-label="Invalid hierarchy" invalid/><UiCascader aria-label="Readonly hierarchy" :model-value="['engineering','frontend','admin']" readonly :options="[{label:'Engineering',value:'engineering',children:[{label:'Frontend',value:'frontend',children:[{label:'Admin workspace',value:'admin',isLeaf:true}]}]}]"/><UiCascader aria-label="Disabled hierarchy" disabled/></div>
        <div class="visual-time-range-summary"><UiTag color="blue">search / paths / tags</UiTag><UiTag color="green">lazy / form / Portal</UiTag><UiTag color="orange">keyboard / ARIA / RTL</UiTag></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='transfer'" title="Production resource transfer" title-tag="h2" class="visual-table-card visual-transfer-showcase">
      <div class="visual-stack" data-transfer-state-contract="controlled selection search mapping virtual limits states native form keyboard rtl slots api">
        <UiTransfer v-model="visualTransferValue" v-model:selected-keys="visualTransferSelected" :options="visualTransferOptions" searchable :min-count="1" :max-count="4" :operations="['Assign','Return']" :list-height="184" aria-label="Release resource assignment"><template #footer="{direction,visible,total}">{{ direction }} · {{ visible }}/{{ total }} visible</template></UiTransfer>
        <div class="visual-time-range-summary"><UiTag color="blue">search / select all / virtual</UiTag><UiTag color="green">native form / constraints</UiTag><UiTag color="orange">keyboard / ARIA / RTL</UiTag></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='pagination'" title="Production pagination navigation" title-tag="h2" class="visual-table-card visual-pagination-showcase">
      <div class="visual-stack" data-pagination-state-contract="controlled uncontrolled normalization window ellipsis quick-jump simple size disabled readonly loading keyboard rtl responsive slots api">
        <UiPagination :page="50" :page-size="20" :total="1286" :page-size-options="[10,20,50,100]" :pager-count="7" show-first-last show-quick-jumper page-size-change-behavior="preserve-item" aria-label="Release evidence pages"><template #total="{start,end,total}"><span><strong>{{ start }}–{{ end }}</strong> of {{ total }} release records</span></template></UiPagination>
        <div class="visual-form"><UiPagination :default-page="4" :default-page-size="20" :total="286" simple compact aria-label="Simple release pages"/><UiPagination :page="2" :total="86" readonly compact :show-size-changer="false" aria-label="Readonly release pages"/><UiPagination :page="2" :total="86" loading compact :show-size-changer="false" aria-label="Loading release pages"/></div>
        <div class="visual-time-range-summary"><UiTag color="blue">window / quick jump / sizes</UiTag><UiTag color="green">controlled / guarded / responsive</UiTag><UiTag color="orange">keyboard / ARIA / RTL</UiTag></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='table'" title="Production data table" subtitle="Controlled state, row policy, keyboard navigation and resilient data presentation" title-tag="h2" class="visual-table-card visual-table-showcase">
      <div class="visual-stack" data-table-state-contract="controlled uncontrolled selection expansion current row-policy async-guard nested-values sorting filters resize-pointer-keyboard virtual keyboard rtl ssr slots api datagrid-sync">
        <UiTable v-model:selected-rows="visualTableSelected" v-model:expanded-rows="visualTableExpanded" v-model:current-row-key="visualTableCurrent" v-model:column-widths="visualTableWidths" v-model:sort-key="visualTableSortKey" v-model:sort-order="visualTableSortOrder" v-model:filters="visualTableFilters" :columns="visualTableColumns" :rows="visualTableRows" row-key="id" selectable select-on-row-click expandable highlight-current-row striped bordered resizable sticky-header :is-row-selectable="row=>row.id!=='table-4'" aria-label="Release verification records"><template #header-name="{column}"><span>{{ column.label }} · P78</span></template><template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':value==='Review'?'orange':'gray'">{{ value }}</UiTag></template><template #expanded="{row}"><div class="visual-table-detail"><strong>{{ row.name }}</strong><span>{{ row.detail }}</span></div></template></UiTable>
        <div class="visual-time-range-summary"><UiTag color="blue">selection / expansion / current</UiTag><UiTag color="green">sort / filters / resize</UiTag><UiTag color="orange">keyboard / ARIA / RTL</UiTag></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='date-picker'" title="Production date picker" subtitle="Controlled value, panel, presets, constraints and keyboard calendar" title-tag="h2" class="visual-table-card visual-date-picker-showcase">
      <div class="visual-stack" data-date-picker-state-contract="controlled default open view calendar constraints disabled-date presets guard keyboard rtl portal ssr slots api native-fallback">
        <UiDatePicker model-value="2026-08-24" default-open view-date="2026-08-01" :append-to-body="false" :presets="[{key:'release',label:'Release',value:'2026-08-24'},{key:'review',label:'Review',value:'2026-09-08'}]" min="2026-08-01" max="2026-09-30" show-week-numbers :disabled-date="date=>[0,6].includes(date.getUTCDay())" aria-label="Release date" />
        <div class="visual-time-range-summary"><UiTag color="blue">controlled / presets / guard</UiTag><UiTag color="green">calendar / constraints / ARIA</UiTag><UiTag color="orange">keyboard / RTL / SSR</UiTag></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='anchor'" title="Page anchor navigation" title-tag="h2" class="visual-table-card visual-anchor-showcase">
      <div class="visual-anchor-grid">
        <UiAnchor v-model="anchorValue" :affix="false" aria-label="Release document outline" :items="[{key:'anchor-overview',href:'#visual-anchor-overview',title:'Overview'},{key:'anchor-contracts',href:'#visual-anchor-contracts',title:'Contracts',children:[{key:'anchor-events',href:'#visual-anchor-events',title:'Events and slots'}]},{key:'anchor-disabled',href:'#visual-anchor-disabled',title:'Archived section',disabled:true}]" />
        <div class="visual-anchor-copy"><UiAnchor model-value="usage" direction="horizontal" :affix="false" aria-label="Package guide tabs" :items="[{key:'install',href:'#visual-anchor-install',title:'Install'},{key:'usage',href:'#visual-anchor-usage',title:'Usage'},{key:'release',href:'#visual-anchor-release',title:'Release'}]" /><div id="visual-anchor-overview"><strong>Scroll-aware documentation outline</strong><p>Active sections, nested levels, disabled links and horizontal navigation share the same typed contract.</p></div><div id="visual-anchor-contracts"><span>Element container · offset 72px · bounds 8px</span></div><i id="visual-anchor-events" /></div>
      </div>
    </UiCard>
    <UiCard v-if="state==='advanced'" title="Advanced form controls" title-tag="h2" class="visual-table-card">
      <div class="visual-form">
        <UiMultiSelect aria-label="Team members" :model-value="['lin']" :options="[{label:'Lin',value:'lin'},{label:'Chen',value:'chen'}]"/>
        <UiTreeSelect aria-label="Organization unit" model-value="frontend" :options="[{label:'Engineering',value:'engineering',children:[{label:'Frontend',value:'frontend'}]}]"/>
        <UiCascader aria-label="Office location" :model-value="['china','hangzhou']" :options="[{label:'China',value:'china',children:[{label:'Hangzhou',value:'hangzhou'}]}]"/>
        <UiTree aria-label="Resource permissions" model-value="frontend" :checked-keys="['frontend']" :default-expanded-keys="['engineering']" :data="[{label:'Engineering',value:'engineering',children:[{label:'Frontend',value:'frontend'},{label:'Backend',value:'backend'}]},{label:'Archive',value:'archive',disabled:true}]" checkable show-line bordered/>
        <UiColorPicker id="visual-color-trigger" v-model="brandColor" alpha show-contrast :presets="['#1677FF','#10B981','#F59E0B']" />
        <UiRate id="visual-rate" :model-value="4.5" :step="0.5" show-text aria-label="Advanced rating" />
        <UiCommandPalette v-model="commandOpen" v-model:query="commandQuery" :commands="commandItems"><template #trigger="{open}"><UiButton id="visual-command-trigger" @click="open">Open command palette</UiButton></template></UiCommandPalette>
      </div>
    </UiCard>
    </template>
  </UiConfigProvider>
</template>

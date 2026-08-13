<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  UiAlert, UiAutoComplete, UiButton, UiCalendar, UiCard, UiConfigProvider, UiDateRangePicker, UiInput, UiNumberInput,
  UiCascader, UiDrawer, UiModal, UiMultiSelect, UiPagination, UiProgress, UiSegmented,
  UiImage, UiRate, UiSelect, UiSlider, UiStatistic, UiSteps, UiTable, UiTabs, UiTag, UiTree, UiTreeSelect, UiColorPicker, UiCommandPalette,
  UiDataGrid, UiForm, UiFormItem, UiFormList, UiPopover, UiSchemaForm, UiStatusPage, UiUpload, UiVirtualList,
} from '../../src/index.js'

const props=defineProps({theme:String,direction:String,density:String,state:{type:String,default:'base'}})
const tab=ref('overview')
const segment=ref('month')
const commandOpen=ref(false)
const commandQuery=ref('')
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
onMounted(async()=>{if(props.state==='form'){await nextTick();await visualForm.value?.submit?.()}})
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
  </UiConfigProvider>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  UiAffix, UiAnchor, UiAutoComplete, UiButton, UiCalendar, UiCarousel, UiConfigProvider, UiDrawer, UiForm, UiFormItem, UiFormList, UiSchemaForm, UiInput, UiInputTag, UiMenu,
  UiImage, UiList, UiMentions, UiModal, UiNumberInput, UiOtpInput, UiPagination, UiPopconfirm, UiPopover, UiQueryBuilder, UiRate, UiSelect, UiSlider, UiSwitch, UiTable, UiTabs, UiUpload,
  UiTree, UiStatistic,
  UiColorPicker,
  UiCommandPalette,
  UiDataGrid, UiSplitter, UiStatusPage, UiTimeRangePicker, UiTour, UiTypography, UiVirtualList, UiWatermark,
} from '../../src/index.js'
import ApiReferencePage from '../../src/pages/ApiReferencePage.vue'

defineProps({ direction: { type: String, default: 'ltr' }, state: { type: String, default: 'base' } })

const region = ref('')
const anchorValue=ref('fixture-anchor-overview')
const anchorItems=[{key:'fixture-anchor-overview',href:'#fixture-anchor-overview',title:'Overview'},{key:'fixture-anchor-disabled',href:'#fixture-anchor-disabled',title:'Disabled',disabled:true},{key:'fixture-anchor-api',href:'#fixture-anchor-api',title:'API contract'},{key:'fixture-anchor-release',href:'#fixture-anchor-release',title:'Release'}]
const officeCity = ref('')
const tab = ref('overview')
const modalOpen = ref(false)
const drawerOpen = ref(false)
const confirmResult = ref('idle')
const page = ref(1)
const pageSize = ref(10)
const enabled = ref(false)
const quantity = ref(12.5)
const volume = ref(40)
const priceRange = ref([20,80])
const serviceRating = ref(3.5)
const statisticValue = ref(1000)
const statisticTrend = ref(5)
const statisticLoading = ref(false)
const calendarRange = ref(['2026-08-10','2026-08-16'])
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
function refreshStatistic(){statisticLoading.value=true;setTimeout(()=>{statisticValue.value=1250;statisticTrend.value=-2.5;statisticLoading.value=false},40)}
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
        <UiTimeRangePicker v-model="timeRangeValue" :constrain="false" :step="900" min="08:00" max="22:00" aria-label="Interaction service window" @change="payload=>timeRangeOutput=`change:${payload.valid}:${payload.value[0]||'empty'}:${payload.value[1]||'empty'}`" @invalid="payload=>timeRangeOutput=`invalid:${payload.code}`" @focus="payload=>timeRangeOutput=`focus:${payload.index}`" @clear="timeRangeOutput='clear'" />
        <output class="interaction-output" data-testid="time-range-output">{{ timeRangeOutput }}</output>
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

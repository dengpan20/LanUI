<script setup>
import { reactive, ref } from 'vue'
import {
  UiAutoComplete, UiButton, UiConfigProvider, UiDrawer, UiForm, UiFormItem, UiInput, UiMenu,
  UiModal, UiNumberInput, UiPagination, UiPopconfirm, UiRate, UiSelect, UiSlider, UiSwitch, UiTable, UiTabs, UiUpload,
  UiTree, UiStatistic,
  UiColorPicker,
  UiCommandPalette,
} from '../../src/index.js'

defineProps({ direction: { type: String, default: 'ltr' } })

const region = ref('')
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
const files = ref([])
const uploadError = ref('')
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
const brandColor = ref('#1677FFCC')
const commandItems = [
  {key:'dashboard',label:'Open dashboard',description:'Review metrics',group:'Navigate',keywords:['home']},
  {key:'settings',label:'Open settings',description:'Manage workspace',group:'Navigate',keywords:['preferences']},
  {key:'disabled',label:'Disabled command',group:'Actions',disabled:true},
]
const formModel = reactive({ name: '' })
const formResult = ref('idle')

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

      <section class="interaction-case">
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

      <section class="interaction-case interaction-wide">
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
    </div>
  </UiConfigProvider>
</template>

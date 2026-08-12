<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiCalendar,
  UiAutoComplete,
  UiCommandPalette,
  UiColorPicker,
  UiForm,
  UiFormItem,
  UiInput,
  UiImage,
  UiModal,
  UiRate,
  UiStatistic,
  UiStatusPage,
  UiTable,
  UiTabs,
  UiTree,
  UiVirtualList,
} from 'lan-ui-design-system'
import type { Key, UiCommandPaletteCommand, UiTableColumn, UiTableSortChange, UiTabsItem } from 'lan-ui-design-system'

const open = ref(false)
const activeTab = ref<Key>('summary')
interface FormModel extends Record<string, unknown> { name:string }
const model = ref<FormModel>({ name: '' })
const office = ref('')
const resource = ref<Key>('dashboard')
const checkedResources = ref<Key[]>(['dashboard'])
const commandOpen = ref(false)
const commandQuery = ref('')
const brandColor = ref('#1677FFCC')
const serviceRating = ref(3.5)
const releaseRange = ref(['2026-08-10','2026-08-16'])
const imagePreviewOpen = ref(false)
const imagePreviewIndex = ref(0)
const virtualSelection = ref<Key>('typed-1')
const virtualItems = Array.from({length:100},(_,index)=>({id:`typed-${index}`,label:`Typed row ${index+1}`}))
const commands:UiCommandPaletteCommand[] = [{key:'dashboard',label:'Open dashboard',group:'Navigate',keywords:['home']}]
const resources = [{label:'Workspace',value:'workspace',children:[{label:'Dashboard',value:'dashboard'}]}]
const columns:UiTableColumn[] = [{ key:'name', label:'Name', sortable:true }]
const rows = [{ id:1, name:'Lan UI' }]
const tabs:UiTabsItem[] = [{ label:'Summary', value:'summary' }]

function submit(value:Record<string, unknown>, event:SubmitEvent) {
  event.preventDefault()
  model.value.name = String(value.name ?? '')
}
function sort(payload:UiTableSortChange) {
  activeTab.value = payload.key
}
</script>

<template>
  <UiButton @click="open=true">Open</UiButton>
  <UiModal v-model="open" title="Typed modal">
    Typed content
    <template #footer="{ close }"><UiButton @click="close">Close</UiButton></template>
  </UiModal>
  <UiForm :model="model" @submit="submit">
    <template #default="{ validate, reset }">
      <UiFormItem label="Name" name="name">
        <template #default="{ controlId, invalid }">
          <UiInput :id="controlId" v-model="model.name" :invalid="invalid" />
        </template>
      </UiFormItem>
      <UiFormItem label="Office"><UiAutoComplete v-model="office" :options="[{label:'Hangzhou',value:'hangzhou'}]" /></UiFormItem>
      <UiButton @click="validate()">Validate</UiButton>
      <UiButton @click="reset">Reset</UiButton>
    </template>
  </UiForm>
  <UiTable :columns="columns" :rows="rows" @sort-change="sort">
    <template #cell-name="{ value, column, rowIndex }">{{ column.label }}: {{ value }} / {{ rowIndex }}</template>
  </UiTable>
  <UiTabs v-model="activeTab" :items="tabs">
    <template #panel-summary="{ item }">{{ typeof item === 'object' ? item.label : item }}</template>
  </UiTabs>
  <UiTree v-model="resource" v-model:checked-keys="checkedResources" :data="resources" :default-expanded-keys="['workspace']" checkable show-line>
    <template #node="{ node, selected }">{{ node.label }} / {{ selected }}</template>
  </UiTree>
  <UiCommandPalette v-model="commandOpen" v-model:query="commandQuery" :commands="commands">
    <template #trigger="{ open }"><UiButton @click="open">Commands</UiButton></template>
    <template #command="{ command, active }">{{ command.label }} / {{ active }}</template>
  </UiCommandPalette>
  <UiFormItem label="Brand color"><UiColorPicker v-model="brandColor" alpha show-contrast :presets="['#1677FF','#10B981']" /></UiFormItem>
  <UiFormItem label="Service rating"><UiRate v-model="serviceRating" :step="0.5" show-text :formatter="(value,max)=>`${value} / ${max}`"><template #text="{ text }">{{ text }}</template></UiRate></UiFormItem>
  <UiStatistic title="Revenue" :value="2864000" prefix="$" :trend="12.6"><template #trend="{ direction, tone }">{{ direction }}/{{ tone }}</template><template #extra>Updated now</template></UiStatistic>
  <UiCalendar v-model="releaseRange" selection-mode="range" view-date="2026-08-01" today="2026-08-12">
    <template #cell="{ date, selected, range }">{{ date }}/{{ selected }}/{{ range.inRange }}</template>
    <template #footer="{ today, clear }"><UiButton @click="today">Today</UiButton><UiButton @click="clear()">Clear</UiButton></template>
  </UiCalendar>
  <UiImage v-model:preview-open="imagePreviewOpen" v-model:preview-index="imagePreviewIndex" src="/typed-thumb.jpg" alt="Typed gallery" preview :preview-list="['/typed-a.jpg','/typed-b.jpg']">
    <template #error="{ retry }"><UiButton @click="retry">Retry</UiButton></template>
    <template #caption="{ index, src }">{{ index }} / {{ src }}</template>
    <template #toolbar="{ zoomIn, rotate, scale }"><UiButton @click="zoomIn()">{{ scale }}</UiButton><UiButton @click="rotate(90)">Rotate</UiButton></template>
  </UiImage>
  <UiVirtualList v-model="virtualSelection" :items="virtualItems" item-key="id" :item-size="(_item,index)=>index%2?44:52" height="220" selection-mode="single" measure bordered>
    <template #item="{ index, itemKey, selected, disabled }">{{ index }} / {{ itemKey }} / {{ selected }} / {{ disabled }}</template>
    <template #error="{ retry }"><UiButton @click="retry">Retry list</UiButton></template>
  </UiVirtualList>
  <UiStatusPage status="403" embedded @home="open=false"><template #extra>Typed status page</template></UiStatusPage>
</template>

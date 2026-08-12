<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiAutoComplete,
  UiCommandPalette,
  UiColorPicker,
  UiForm,
  UiFormItem,
  UiInput,
  UiModal,
  UiRate,
  UiTable,
  UiTabs,
  UiTree,
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
</template>

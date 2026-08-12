<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiAutoComplete,
  UiForm,
  UiFormItem,
  UiInput,
  UiModal,
  UiTable,
  UiTabs,
} from 'lan-ui-design-system'
import type { Key, UiTableColumn, UiTableSortChange, UiTabsItem } from 'lan-ui-design-system'

const open = ref(false)
const activeTab = ref<Key>('summary')
interface FormModel extends Record<string, unknown> { name:string }
const model = ref<FormModel>({ name: '' })
const office = ref('')
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
</template>

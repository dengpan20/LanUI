<script setup>
import { ref } from 'vue'
import {
  UiAlert, UiAutoComplete, UiButton, UiCard, UiConfigProvider, UiDateRangePicker, UiInput, UiNumberInput,
  UiCascader, UiDrawer, UiModal, UiMultiSelect, UiPagination, UiProgress, UiSegmented,
  UiSelect, UiSlider, UiSteps, UiTable, UiTabs, UiTag, UiTree, UiTreeSelect,
} from '../../src/index.js'

defineProps({theme:String,direction:String,density:String,state:{type:String,default:'base'}})
const tab=ref('overview')
const segment=ref('month')
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
  <UiConfigProvider id="visual-fixture" class="visual-fixture" tag="main" locale="en-US" :direction="direction" :density="density" :data-theme-case="theme">
    <header class="visual-header">
      <div><small>LAN UI · REGRESSION FIXTURE</small><h1>Enterprise component baseline</h1></div>
      <div class="visual-meta"><UiTag color="blue">{{ theme }}</UiTag><UiTag color="green">{{ direction }}</UiTag><UiTag color="orange">{{ density }}</UiTag></div>
    </header>

    <section class="visual-grid">
      <UiCard title="Actions and states" title-tag="h2">
        <div class="visual-stack"><div class="visual-row"><UiButton>Primary</UiButton><UiButton variant="secondary">Secondary</UiButton><UiButton variant="outline">Outline</UiButton><UiButton variant="danger">Danger</UiButton></div><div class="visual-row"><UiButton icon="plus" size="sm">Create</UiButton><UiButton loading>Saving</UiButton><UiButton disabled>Disabled</UiButton></div></div>
      </UiCard>

      <UiCard title="Form controls" title-tag="h2">
        <div class="visual-form"><label>Name<UiInput model-value="Lan UI workspace"/></label><label>Region<UiSelect model-value="east" :options="[{label:'East region',value:'east'},{label:'West region',value:'west'}]"/></label><label>Office city<UiAutoComplete model-value="hangzhou" :options="[{label:'Hangzhou',value:'hangzhou',description:'East region'},{label:'Shenzhen',value:'shenzhen',description:'South region'}]"/></label><label>Quantity<UiNumberInput :model-value="12.5" :min="0" :max="100" :step="0.25"><template #suffix>items</template></UiNumberInput></label><label>Capacity<UiSlider :model-value="68" :step="5" tooltip="always" aria-label="Capacity"/></label><label class="visual-span">Delivery window<UiDateRangePicker :model-value="['2026-08-11','2026-08-28']"/></label></div>
      </UiCard>

      <UiCard title="Feedback and progress" title-tag="h2">
        <div class="visual-stack"><UiAlert type="success" title="Changes published" description="All package contracts passed."/><UiAlert type="warning" title="Review required" description="Two tokens are pending approval."/><UiProgress :value="68"/><UiSteps :current="1" :items="[{title:'Foundation',description:'Tokens'},{title:'Components',description:'Contracts'},{title:'Delivery',description:'Package'}]"/></div>
      </UiCard>

      <UiCard title="Navigation choices" title-tag="h2">
        <div class="visual-stack"><UiTabs v-model="tab" :panels="false" :items="[{label:'Overview',value:'overview'},{label:'Usage',value:'usage'},{label:'API',value:'api'}]"/><UiSegmented v-model="segment" block :options="[{label:'Week',value:'week'},{label:'Month',value:'month'},{label:'Quarter',value:'quarter'}]"/><div class="visual-row"><UiTag color="blue">Active</UiTag><UiTag color="green">Success</UiTag><UiTag color="orange">Pending</UiTag><UiTag color="red">Error</UiTag></div></div>
      </UiCard>
    </section>

    <UiCard title="Data table" title-tag="h2" class="visual-table-card">
      <UiTable :columns="tableColumns" :rows="tableRows">
        <template #cell-status="{value}"><UiTag :color="value==='Ready'?'green':value==='Review'?'orange':'gray'">{{ value }}</UiTag></template>
      </UiTable>
      <UiPagination :page="2" :page-size="10" :total="86"/>
    </UiCard>
    <UiModal :model-value="state==='modal'" title="Publish component release" destroy-on-close>
      <p>Review the release notes before publishing this component package.</p>
      <template #footer><UiButton variant="secondary">Cancel</UiButton><UiButton>Publish</UiButton></template>
    </UiModal>
    <UiDrawer :model-value="state==='drawer'" title="Component settings" placement="end">
      <div class="visual-stack"><label>Package name<UiInput model-value="lan-ui-design-system"/></label><UiButton>Save settings</UiButton></div>
    </UiDrawer>
    <UiCard v-if="state==='advanced'" title="Advanced form controls" title-tag="h2" class="visual-table-card">
      <div class="visual-form">
        <UiMultiSelect aria-label="Team members" :model-value="['lin']" :options="[{label:'Lin',value:'lin'},{label:'Chen',value:'chen'}]"/>
        <UiTreeSelect aria-label="Organization unit" model-value="frontend" :options="[{label:'Engineering',value:'engineering',children:[{label:'Frontend',value:'frontend'}]}]"/>
        <UiCascader aria-label="Office location" :model-value="['china','hangzhou']" :options="[{label:'China',value:'china',children:[{label:'Hangzhou',value:'hangzhou'}]}]"/>
        <UiTree aria-label="Resource permissions" model-value="frontend" :checked-keys="['frontend']" :default-expanded-keys="['engineering']" :data="[{label:'Engineering',value:'engineering',children:[{label:'Frontend',value:'frontend'},{label:'Backend',value:'backend'}]},{label:'Archive',value:'archive',disabled:true}]" checkable show-line bordered/>
      </div>
    </UiCard>
  </UiConfigProvider>
</template>

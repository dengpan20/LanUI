<script setup lang="ts">
import { ref } from 'vue'
import {
  UiAffix,
  UiBarcode,
  UiButton,
  UiCalendar,
  UiAutoComplete,
  UiCommandPalette,
  UiCronEditor,
  UiColorPicker,
  UiDataGrid,
  UiForm,
  UiFormItem,
  UiFormList,
  UiSchemaForm,
  UiInput,
  UiImage,
  UiModal,
  UiRate,
  UiStatistic,
  UiStatusPage,
  UiTable,
  UiTabs,
  UiTree,
  UiTour,
  UiUpload,
  UiVirtualList,
  UiWatermark,
} from 'lan-ui-design-system'
import type { Key, UiCommandPaletteCommand, UiSchemaFormNode, UiTableColumn, UiTableSortChange, UiTabsItem, UiTourStep, UiUploadFile, UiUploadInstance, UiUploadRequestContext, UiWatermarkFont } from 'lan-ui-design-system'

const open = ref(false)
const gridQuery = ref('')
const gridPage = ref(1)
const gridSelected = ref<Key[]>([])
const activeTab = ref<Key>('summary')
interface FormModel extends Record<string, unknown> { name:string; contacts:Array<{email:string}>; password:string; confirm:string }
const model = ref<FormModel>({ name: '', contacts:[{email:''}], password:'', confirm:'' })
const schema:UiSchemaFormNode<FormModel>[]=[{key:'profile',title:'Profile',fields:[{name:'name',label:'Name',required:true,rules:[{required:true}]},{name:'password',label:'Password',props:{type:'password'}},{name:'confirm',label:'Confirm',visible:current=>Boolean(current.password),dependencies:['password']},{key:'contacts',name:'contacts',type:'list',label:'Contacts',min:1,max:4,defaultValue:({index})=>({email:`typed-${index}@example.com`}),itemLabel:(_current,{index})=>`Contact ${Number(index)+1}`,fields:[{name:'email',label:'Email',rules:[{required:true,type:'email'}],props:(_current,{index})=>({placeholder:`Email ${Number(index)+1}`})}]}]}]
const office = ref('')
const resource = ref<Key>('dashboard')
const checkedResources = ref<Key[]>(['dashboard'])
const commandOpen = ref(false)
const commandQuery = ref('')
const brandColor = ref('#1677FFCC')
const serviceRating = ref(3.5)
const releaseCron=ref('0 9 * * 1-5')
const releaseRange = ref(['2026-08-10','2026-08-16'])
const imagePreviewOpen = ref(false)
const imagePreviewIndex = ref(0)
const tourOpen=ref(false)
const tourCurrent=ref(0)
const tourSteps:UiTourStep[]=[{target:'#typed-tour-target',title:'Typed target',description:'Typed tour step.'}]
const watermarkFont:UiWatermarkFont={color:'rgba(37,99,235,.16)',fontSize:14,fontWeight:650,textAlign:'center',lineHeight:20}
const affixTarget=ref<HTMLElement|null>(null)
const virtualSelection = ref<Key>('typed-1')
const virtualItems = Array.from({length:100},(_,index)=>({id:`typed-${index}`,label:`Typed row ${index+1}`}))
const commands:UiCommandPaletteCommand[] = [{key:'dashboard',label:'Open dashboard',group:'Navigate',keywords:['home']}]
const resources = [{label:'Workspace',value:'workspace',children:[{label:'Dashboard',value:'dashboard'}]}]
const columns:UiTableColumn[] = [{ key:'name', label:'Name', sortable:true }]
const rows = [{ id:1, name:'Lan UI' }]
const tabs:UiTabsItem[] = [{ label:'Summary', value:'summary' }]
const uploadFiles=ref<UiUploadFile[]>([])
const uploadRef=ref<UiUploadInstance>()
async function uploadRequest({file,signal,onProgress}:UiUploadRequestContext){
  if(signal.aborted)throw new DOMException('Aborted','AbortError')
  onProgress(75)
  return {url:`/assets/${file?.name||'asset'}`}
}

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
  <UiForm :model="model" show-error-summary focus-on-error @submit="submit">
    <template #default="{ validate, validateField, reset, resetFields, errors, validating, dirty }">
      <UiFormItem label="Name" name="name">
        <template #default="{ controlId, invalid }">
          <UiInput :id="controlId" v-model="model.name" :invalid="invalid" />
        </template>
      </UiFormItem>
      <UiFormItem label="Contacts" name="contacts" :rules="[{type:'array',min:1}]" group>
        <UiFormList name="contacts" :min="1" :max="4" :default-value="{email:''}" aria-label="Contacts">
          <template #default="{fields,add,remove,move,canAdd}">
            <div v-for="field in fields" :key="field.key">
              <UiFormItem :name="[...field.name,'email']" :label="`Email ${field.index+1}`" :rules="[{required:true,type:'email'}]"><UiInput v-model="model.contacts[field.index].email" /></UiFormItem>
              <UiButton @click="move(field.index,Math.max(0,field.index-1))">Move</UiButton><UiButton @click="remove(field.index)">Remove</UiButton>
            </div>
            <UiButton :disabled="!canAdd" @click="add()">Add contact</UiButton>
          </template>
        </UiFormList>
      </UiFormItem>
      <UiFormItem label="Confirm" name="confirm" :dependencies="['password']" :rules="[{validator:(value,current)=>value===current.password||'Mismatch'}]"><UiInput v-model="model.confirm" /></UiFormItem>
      <UiFormItem label="Office"><UiAutoComplete v-model="office" :options="[{label:'Hangzhou',value:'hangzhou'}]" /></UiFormItem>
      <UiButton @click="validate()">Validate</UiButton>
      <UiButton :loading="validating" @click="validateField('name')">Validate name {{ errors.length }}/{{ dirty }}</UiButton>
      <UiButton @click="resetFields('name')">Reset name</UiButton>
      <UiButton @click="reset">Reset</UiButton>
    </template>
  </UiForm>
  <UiSchemaForm :model="model" :schema="schema" show-error-summary @field-change="payload=>payload.name" @list-change="payload=>payload.change.previous" @list-limit="payload=>payload.limit.action" @schema-error="payload=>payload.kind">
    <template #field-confirm="{ value, update }"><UiInput :model-value="String(value||'')" @update:model-value="update" /></template>
    <template #field-contacts-email="{ index, value, update }"><UiInput :model-value="String(value||'')" :placeholder="`Contact ${Number(index)+1}`" @update:model-value="update" /></template>
    <template #actions="{ validating, errors }"><UiButton type="submit" :loading="validating">Save schema {{ errors.length }}</UiButton></template>
  </UiSchemaForm>
  <UiDataGrid v-model:query="gridQuery" v-model:page="gridPage" v-model:selected-rows="gridSelected" :columns="columns" :rows="rows" selectable :query-fields="['name']">
    <template #cell-name="{ value, rowIndex }">{{ value }} / {{ rowIndex }}</template>
    <template #footer="{ total, state }">{{ total }} / {{ state.page }}</template>
  </UiDataGrid>
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
  <UiFormItem label="Release schedule"><UiCronEditor v-model="releaseCron" time-zone="UTC" :preview-count="3"><template #actions="{ valid, runs }">{{ valid }} / {{ runs.length }}</template></UiCronEditor></UiFormItem>
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
  <UiUpload ref="uploadRef" v-model="uploadFiles" multiple accept=".pdf,image/*" :request="uploadRequest" :concurrency="2" :before-upload="async file=>file" :before-remove="async()=>true" @progress="payload=>payload.percent" @success="payload=>payload.response" @upload-error="payload=>payload.error">
    <template #trigger="{open,busy,remaining}"><UiButton :loading="busy" @click="open">Select {{ remaining }}</UiButton></template>
    <template #file="{file,retry,abort,remove}"><span>{{ file.name }} / {{ file.status }}</span><UiButton @click="retry(file.id)">Retry</UiButton><UiButton @click="abort(file.id)">Cancel</UiButton><UiButton @click="remove(file.id)">Remove</UiButton></template>
  </UiUpload>
  <UiButton id="typed-tour-target" @click="tourOpen=true">Open typed tour</UiButton>
  <UiTour v-model="tourOpen" v-model:current="tourCurrent" :steps="tourSteps"><template #actions="{finish}"><UiButton @click="finish">Done</UiButton></template></UiTour>
  <div ref="affixTarget"><UiAffix :target="()=>affixTarget" position="top" :offset="8" :z-index="120" @change="(value,meta)=>[value,meta.scrollTop]"><UiButton>Typed sticky action</UiButton></UiAffix></div>
  <UiWatermark :content="['Lan UI','TYPED']" :gap="[80,64]" :font="watermarkFont" image-cross-origin="anonymous" aria-label="Typed watermark" @remove="payload=>payload.reason"><article>Typed protected document</article></UiWatermark>
  <UiBarcode value="LAN-UI-151" format="CODE128" status="scanned" downloadable><template #caption="{ value, status }">{{ value }} / {{ status }}</template></UiBarcode>
  <UiStatusPage status="403" embedded @home="open=false"><template #extra>Typed status page</template></UiStatusPage>
</template>

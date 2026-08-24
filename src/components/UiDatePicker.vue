<script setup>
import { computed, inject, nextTick, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UiCalendar from './UiCalendar.vue'
import UiPopover from './UiPopover.vue'
import { focusWithRetry } from './focusUtils.js'
import { useComponentSize, useLocale } from '../config-runtime.js'
import { compareDateValues, dateValueToDate, fromDateValue, inferDateValueType, toDateValue } from '../date.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Date,Number],default:undefined}, defaultValue:{type:[String,Date,Number],default:''},
  open:{type:Boolean,default:undefined}, defaultOpen:Boolean,
  viewDate:{type:[String,Date,Number],default:undefined}, defaultViewDate:{type:[String,Date,Number],default:''},
  mode:{type:String,default:'date',validator:value=>['date','time','datetime'].includes(value)},
  valueType:{type:String,default:'auto',validator:value=>['auto','string','date','timestamp'].includes(value)},
  timeZone:{type:String,default:'local'}, disambiguation:{type:String,default:'compatible',validator:value=>['compatible','earlier','later','reject'].includes(value)},
  precision:{type:String,default:'minute',validator:value=>['minute','second','millisecond'].includes(value)},
  step:{type:[String,Number],default:undefined}, referenceDate:{type:[String,Date,Number],default:undefined},
  icon:{type:String,default:'calendar'}, placeholder:{type:String,default:''},
  min:{type:[String,Date,Number],default:''}, max:{type:[String,Date,Number],default:''}, disabledDate:Function,
  presets:{type:Array,default:()=>[]}, size:{type:String,default:''}, clearable:{type:Boolean,default:true},
  editable:{type:Boolean,default:true}, readonly:Boolean, disabled:Boolean, loading:Boolean, invalid:Boolean,
  panel:{type:Boolean,default:true}, placement:{type:String,default:'bottom-start'}, panelWidth:{type:[String,Number],default:360},
  appendToBody:{type:Boolean,default:true}, teleportTo:{type:[String,Object],default:'body'},
  closeOnSelect:{type:Boolean,default:true}, openOnClick:{type:Boolean,default:true}, openOnFocus:Boolean, openOnArrowDown:{type:Boolean,default:true},
  firstDayOfWeek:{type:[String,Number],default:'auto'}, weekdayFormat:{type:String,default:'short'},
  fixedWeeks:{type:Boolean,default:true}, showOutsideDays:{type:Boolean,default:true}, showWeekNumbers:Boolean,
  showToday:{type:Boolean,default:true}, showPanelClear:{type:Boolean,default:true},
  beforeChange:Function, beforeOpenChange:Function, ariaLabel:{type:String,default:''},
})
const emit=defineEmits([
  'update:modelValue','change','input','clear','invalid','select',
  'update:open','open-change','open','close','update:viewDate','view-change','panel-change','preset-select',
  'focus','blur','keydown','guard-error',
])

const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const inputRef=ref(null), popoverRef=ref(null)
const focused=ref(false), internalValue=ref(props.defaultValue), internalOpen=ref(props.defaultOpen), internalView=ref(props.defaultViewDate)
const changePending=ref(false), openPending=ref(false), inputRevision=ref(0)
let calendarViewPrevious
const generatedId=`ui-date-picker-${useId()}`
const controlledValue=computed(()=>props.modelValue!==undefined), controlledOpen=computed(()=>props.open!==undefined), controlledView=computed(()=>props.viewDate!==undefined)
const resolvedValue=computed(()=>controlledValue.value?props.modelValue:internalValue.value)
const supportsPanel=computed(()=>props.panel&&props.mode==='date')
const resolvedOpen=computed(()=>supportsPanel.value&&(controlledOpen.value?props.open:internalOpen.value))
const resolvedView=computed(()=>controlledView.value?props.viewDate:internalView.value)
const blocked=computed(()=>props.disabled||props.readonly||props.loading||changePending.value)
const inputType=computed(()=>({datetime:'datetime-local',time:'time'}[props.mode]||'date'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`${generatedId}-input`)
const panelId=computed(()=>`${controlId.value}-panel`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t(props.mode==='time'?'date.timePlaceholder':props.mode==='datetime'?'date.datetimePlaceholder':'date.placeholder'))
const inputAttrs=computed(()=>{const reserved=new Set(['class','style','id','role','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-expanded','aria-controls','aria-haspopup','aria-autocomplete']);return Object.fromEntries(Object.entries(attrs).filter(([key])=>!reserved.has(key)))})
const resolvedValueType=computed(()=>props.valueType==='auto'?inferDateValueType(resolvedValue.value):props.valueType)
const valueOptions=computed(()=>({mode:props.mode,valueType:resolvedValueType.value,timeZone:props.timeZone,disambiguation:props.disambiguation,precision:props.precision,step:props.step,referenceDate:props.referenceDate}))
const nativeValue=computed(()=>toDateValue(resolvedValue.value,valueOptions.value))
const nativeMin=computed(()=>toDateValue(props.min,valueOptions.value)||undefined)
const nativeMax=computed(()=>toDateValue(props.max,valueOptions.value)||undefined)
const normalizedPresets=computed(()=>props.presets.map((preset,index)=>typeof preset==='object'&&preset!==null?{...preset,key:preset.key??index}:{label:String(preset),value:preset,key:index}))

function eventSafe(event){return event&&typeof event==='object'?event:undefined}
function resetNative(){inputRevision.value+=1;nextTick(()=>{if(inputRef.value)inputRef.value.value=nativeValue.value})}
function emptyValue(){return resolvedValueType.value==='string'?'':null}
function invalid(reason,source,details={}){const payload=reason==='invalid-date-value'?{code:reason,...details}:{code:reason,reason,source,...details};emit('invalid',payload);return false}
function validate(value,raw,source){
  if(value===null&&raw)return invalid('invalid-date-value',source,{value:raw})
  if(value===null||value==='')return true
  if(nativeMin.value&&compareDateValues(value,props.min,valueOptions.value)<0)return invalid('date-before-min',source,{value,min:props.min})
  if(nativeMax.value&&compareDateValues(value,props.max,valueOptions.value)>0)return invalid('date-after-max',source,{value,max:props.max})
  if(props.mode==='date'&&props.disabledDate){
    const key=toDateValue(value,valueOptions.value),date=dateValueToDate(key,{...valueOptions.value,valueType:'date'})
    try{if(props.disabledDate(date,{date:key,currentMonth:true}))return invalid('date-disabled',source,{value,date:key})}
    catch(error){emit('guard-error',error,{kind:'disabled-date',source,value});return invalid('disabled-date-error',source,{value,error})}
  }
  return true
}
function applyValue(value,meta){
  if(!controlledValue.value)internalValue.value=value
  emit('update:modelValue',value);emit('change',value,meta)
  if(['calendar','preset','api'].includes(meta.source))emit('select',value,meta)
  resetNative();return meta
}
function runGuard(kind,guard,meta,apply){
  const pending=kind==='change'?changePending:openPending
  if(pending.value)return invalid('pending',meta.source,{kind})
  if(!guard)return apply()
  let outcome
  try{outcome=guard(meta)}catch(error){emit('guard-error',error,{kind,...meta});return invalid('guard-error',meta.source,{kind,error})}
  if(!outcome||typeof outcome.then!=='function')return outcome===false?invalid('guard-rejected',meta.source,{kind}):apply()
  pending.value=true
  return Promise.resolve(outcome).then(allowed=>allowed===false?invalid('guard-rejected',meta.source,{kind}):apply()).catch(error=>{emit('guard-error',error,{kind,...meta});return invalid('guard-error',meta.source,{kind,error})}).finally(()=>{pending.value=false})
}
function commit(value,source='api',event,details={}){
  if(changePending.value)return invalid('pending',source,{kind:'change'})
  if(props.disabled||props.readonly||props.loading)return invalid('blocked',source,{kind:'change'})
  const raw=details.raw??toDateValue(value,valueOptions.value)
  if(!validate(value,raw,source)){resetNative();return false}
  const meta={source,value,previous:resolvedValue.value,raw,event:eventSafe(event),...details}
  return runGuard('change',props.beforeChange,meta,()=>applyValue(value,meta))
}
function update(event){
  const raw=event.target.value,value=fromDateValue(raw,valueOptions.value)
  emit('input',raw,{source:'input',raw,event})
  const result=commit(value,'input',event,{raw})
  if(result&&typeof result.then==='function')result.then(outcome=>{if(!outcome)resetNative()})
}
function clear(source='clear',event){
  if(!props.clearable||!nativeValue.value)return false
  const value=emptyValue(),result=commit(value,source,event,{raw:'',cleared:true})
  const announce=meta=>{if(meta)emit('clear',{...meta,source})}
  if(result&&typeof result.then==='function')return result.then(meta=>{announce(meta);return meta})
  announce(result);return result
}
async function focusCalendar(){
  await nextTick()
  return focusWithRetry(()=>{const panel=popoverRef.value?.panel?.value??popoverRef.value?.panel;return panel?.querySelector('.ui-calendar-day[tabindex="0"]')||panel?.querySelector('.ui-calendar-day:not([aria-disabled="true"])')})
}
function applyOpen(value,meta){
  if(!controlledOpen.value)internalOpen.value=value
  emit('update:open',value);emit('open-change',value,meta);emit(value?'open':'close',meta)
  if(value&&['keyboard','api'].includes(meta.source))focusCalendar()
  return meta
}
function requestOpen(value,source='api',event,details={}){
  if(!supportsPanel.value){if(value)return openNative();return false}
  if(value&&(props.disabled||props.loading))return invalid('blocked',source,{kind:'open'})
  if(value===resolvedOpen.value)return false
  const meta={open:value,previous:resolvedOpen.value,source,event:eventSafe(event),...details}
  return runGuard('open',props.beforeOpenChange,meta,()=>applyOpen(value,meta))
}
function onPopoverRequest(value,meta){requestOpen(value,meta?.source||'popover',meta?.event,meta)}
function openNative(){
  if(props.disabled||props.loading)return false
  try{inputRef.value?.showPicker();return true}catch{inputRef.value?.focus();return false}
}
function show(source='api',event){return supportsPanel.value?requestOpen(true,source,event):openNative()}
function hide(source='api',event){return requestOpen(false,source,event)}
function toggle(source='api',event){return resolvedOpen.value?hide(source,event):show(source,event)}
function onPointerDown(event){if(supportsPanel.value){event.preventDefault();inputRef.value?.focus({preventScroll:true})}}
function onInputClick(event){if(props.openOnClick)show('pointer',event)}
function onInputFocus(event){focused.value=true;emit('focus',event,{source:'focus',open:resolvedOpen.value});if(props.openOnFocus)show('focus',event)}
function onInputBlur(event){focused.value=false;emit('blur',event,{source:'blur',open:resolvedOpen.value})}
function onInputKeydown(event){
  emit('keydown',event,{open:resolvedOpen.value,value:resolvedValue.value})
  if(props.openOnArrowDown&&event.key==='ArrowDown'&&!event.altKey&&supportsPanel.value){event.preventDefault();show('keyboard',event)}
  else if(event.key==='Enter'&&supportsPanel.value&&!props.editable){event.preventDefault();show('keyboard',event)}
  else if((event.key==='Delete'||event.key==='Backspace')&&props.clearable&&!props.editable&&nativeValue.value){event.preventDefault();clear('keyboard',event)}
}
async function onCalendarChange(value,calendarMeta){
  const result=await commit(value,'calendar',undefined,{calendar:calendarMeta,raw:toDateValue(value,valueOptions.value)})
  if(result&&props.closeOnSelect)requestOpen(false,'selection')
}
function setViewDate(value,source='api',meta={}){
  const previous=resolvedView.value
  if(!controlledView.value)internalView.value=value
  emit('update:viewDate',value);emit('view-change',{value,previous,source,...meta});return value
}
function onCalendarView(value){calendarViewPrevious=resolvedView.value;if(!controlledView.value)internalView.value=value;emit('update:viewDate',value)}
function onCalendarViewChange(meta){emit('view-change',{...meta,previous:meta?.previous??calendarViewPrevious});calendarViewPrevious=undefined}
async function choosePreset(preset,event){
  if(preset.disabled||blocked.value)return invalid(preset.disabled?'preset-disabled':'blocked','preset',{preset})
  const value=typeof preset.value==='function'?preset.value({value:resolvedValue.value,now:new Date()}):preset.value
  const output=resolvedValueType.value==='string'?toDateValue(value,valueOptions.value):value
  const result=await commit(output,'preset',event,{preset,raw:toDateValue(output,valueOptions.value)})
  if(result){emit('preset-select',preset,result);if(props.closeOnSelect)requestOpen(false,'selection')}
  return result
}
function focus(options){inputRef.value?.focus(options);return typeof document!=='undefined'&&document.activeElement===inputRef.value}
function blur(){inputRef.value?.blur();return true}
function select(value,source='api'){return commit(value,source)}
function getState(){return{value:resolvedValue.value,nativeValue:nativeValue.value,open:resolvedOpen.value,viewDate:resolvedView.value,pending:{change:changePending.value,open:openPending.value},valid:!resolvedInvalid.value}}

watch(()=>props.defaultValue,value=>{if(!controlledValue.value&&resolvedValue.value===''&&value!==undefined)internalValue.value=value})
watch(()=>props.disabled,value=>{if(value&&resolvedOpen.value)requestOpen(false,'disabled')})

defineExpose({input:inputRef,popover:popoverRef,value:resolvedValue,open:resolvedOpen,pending:{change:changePending,open:openPending},getState,focus,blur,show,hide,toggle,clear,select,setViewDate,focusCalendar,openNative})
</script>

<template>
  <span class="ui-date-picker" :class="[attrs.class,`size-${resolvedSize}`,{focused,open:resolvedOpen,invalid:resolvedInvalid,disabled,readonly,loading:loading||changePending||openPending,'has-value':nativeValue,'has-panel':supportsPanel}]" :style="attrs.style" :data-time-zone="timeZone" :data-value-type="resolvedValueType" :data-state="resolvedOpen?'open':'closed'">
    <UiPopover ref="popoverRef" :model-value="resolvedOpen" trigger="manual" :disabled="disabled" :loading="loading||changePending||openPending" :placement="placement" :width="panelWidth" :min-width="280" :arrow="false" :append-to-body="appendToBody" :teleport-to="teleportTo" :popover-id="panelId" role="dialog" :aria-label="t('date.calendarPanel')" @open-change="onPopoverRequest">
      <template #trigger>
        <slot name="prefix" :open="resolvedOpen" :value="resolvedValue"><AppIcon :name="icon" :size="15" class="ui-date-icon"/></slot>
        <input :key="inputRevision" ref="inputRef" v-bind="inputAttrs" :id="controlId" class="ui-date-native" :type="inputType" :value="nativeValue" :placeholder="resolvedPlaceholder" :min="nativeMin" :max="nativeMax" :step="step" :readonly="readonly||(!editable&&supportsPanel)" :disabled="disabled" :aria-label="props.ariaLabel||attrs['aria-label']" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-busy="loading||changePending||openPending||undefined" @input="update" @pointerdown="onPointerDown" @click="onInputClick" @focus="onInputFocus" @blur="onInputBlur" @keydown="onInputKeydown"/>
        <slot name="suffix" :open="resolvedOpen" :value="resolvedValue"/>
        <slot v-if="clearable&&nativeValue&&!disabled&&!readonly" name="clear" :clear="clear" :pending="changePending"><button type="button" class="ui-date-action" :aria-label="t('date.clear')" :aria-controls="controlId" :disabled="loading||changePending" @mousedown.prevent @click.stop="clear('clear',$event)"><AppIcon name="close" :size="12"/></button></slot>
        <slot name="toggle" :open="resolvedOpen" :toggle="toggle" :pending="openPending"><button type="button" class="ui-date-action calendar-action" :data-ui-popover-trigger="supportsPanel?'':'false'" :aria-label="t(resolvedOpen?'date.close':'date.open')" :aria-controls="supportsPanel?panelId:controlId" :aria-expanded="supportsPanel?resolvedOpen:undefined" :aria-haspopup="supportsPanel?'dialog':undefined" :disabled="disabled||loading||openPending" @mousedown.prevent @click.stop="toggle('button',$event)"><AppIcon name="chevronDown" :size="12"/></button></slot>
        <span v-if="loading||changePending||openPending" class="ui-date-loading" aria-hidden="true"><AppIcon name="loading" :size="12"/></span>
      </template>

    <div class="ui-date-picker-panel-content" :class="{'has-presets':normalizedPresets.length}" :data-mode="mode">
      <aside v-if="normalizedPresets.length" class="ui-date-picker-presets" :aria-label="t('date.presets')">
        <button v-for="preset in normalizedPresets" :key="preset.key" type="button" :disabled="preset.disabled||blocked" @click="choosePreset(preset,$event)"><slot name="preset" :preset="preset" :select="event=>choosePreset(preset,event)">{{ preset.label }}</slot></button>
      </aside>
      <slot name="panel" :value="resolvedValue" :view-date="resolvedView" :select="select" :close="hide" :set-view-date="setViewDate">
        <UiCalendar :model-value="resolvedValue" selection-mode="single" :value-type="resolvedValueType" :time-zone="timeZone" :disambiguation="disambiguation" :view-date="resolvedView" :default-view-date="defaultViewDate" :min="min" :max="max" :first-day-of-week="firstDayOfWeek" :weekday-format="weekdayFormat" :fixed-weeks="fixedWeeks" :show-outside-days="showOutsideDays" :show-week-numbers="showWeekNumbers" :disabled-date="disabledDate" :size="resolvedSize" :bordered="false" :readonly="readonly" :disabled="disabled||loading||changePending" :allow-clear="showPanelClear&&clearable" :aria-label="t('date.calendarPanel')" @change="onCalendarChange" @update:view-date="onCalendarView" @view-change="onCalendarViewChange" @panel-change="emit('panel-change',$event)">
          <template v-if="$slots.header" #header="scope"><slot name="header" v-bind="scope"/></template>
          <template v-if="$slots.cell" #cell="scope"><slot name="cell" v-bind="scope"/></template>
          <template v-if="$slots.year" #year="scope"><slot name="year" v-bind="scope"/></template>
          <template #footer="scope"><slot name="footer" v-bind="scope" :close="hide"><button v-if="showToday" type="button" class="ui-calendar-today" @click="scope.today">{{ t('calendar.today') }}</button><button v-if="showPanelClear&&clearable&&nativeValue" type="button" class="ui-calendar-clear" :disabled="blocked" @click="clear('panel')">{{ t('calendar.clear') }}</button></slot></template>
        </UiCalendar>
      </slot>
      </div>
    </UiPopover>
  </span>
</template>

<script setup>
import { computed, nextTick, ref, toRef, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'
import { fromDateValue, inferDateValueType, toDateValue } from '../date.js'

const props=defineProps({
  modelValue:{type:[String,Date,Number,Array],default:''},
  selectionMode:{type:String,default:'single'},
  valueType:{type:String,default:'auto'},
  timeZone:{type:String,default:'local'},
  disambiguation:{type:String,default:'compatible'},
  viewDate:{type:[String,Date,Number],default:''},
  defaultViewDate:{type:[String,Date,Number],default:''},
  today:{type:[String,Date,Number],default:''},
  min:{type:[String,Date,Number],default:''},
  max:{type:[String,Date,Number],default:''},
  firstDayOfWeek:{type:[String,Number],default:'auto'},
  weekdayFormat:{type:String,default:'short'},
  fixedWeeks:{type:Boolean,default:true},
  showOutsideDays:{type:Boolean,default:true},
  showWeekNumbers:Boolean,
  maxSelections:{type:Number,default:0},
  disabledDate:{type:Function,default:null},
  size:{type:String,default:''},
  bordered:{type:Boolean,default:true},
  readonly:Boolean,
  disabled:Boolean,
  allowClear:{type:Boolean,default:true},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','clear','update:viewDate','view-change','panel-change','focus','blur'])

const DAY=86400000
const pad=value=>String(value).padStart(2,'0')
function parts(key){const match=String(key||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return match?{year:Number(match[1]),month:Number(match[2]),day:Number(match[3])}:null}
function keyOf(year,month,day){return `${String(year).padStart(4,'0')}-${pad(month)}-${pad(day)}`}
function utcOf(key){const value=parts(key);return value?new Date(Date.UTC(value.year,value.month-1,value.day)):null}
function fromUtc(date){return keyOf(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate())}
function daysInMonth(year,month){return new Date(Date.UTC(year,month,0)).getUTCDate()}
function addDays(key,amount){const date=utcOf(key);if(!date)return '';date.setUTCDate(date.getUTCDate()+amount);return fromUtc(date)}
function addMonths(key,amount){const value=parts(key);if(!value)return '';const cursor=new Date(Date.UTC(value.year,value.month-1+amount,1));return keyOf(cursor.getUTCFullYear(),cursor.getUTCMonth()+1,Math.min(value.day,daysInMonth(cursor.getUTCFullYear(),cursor.getUTCMonth()+1)))}
function startOfMonth(key){const value=parts(key);return value?keyOf(value.year,value.month,1):''}
function compare(left,right){return left===right?0:left<right?-1:1}

const {locale,t,formatDate,formatNumber}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(toRef(props,'size'))
const mode=computed(()=>['single','multiple','range'].includes(props.selectionMode)?props.selectionMode:'single')
const dateOptions=computed(()=>({mode:'date',timeZone:props.timeZone,disambiguation:props.disambiguation}))
const resolvedValueType=computed(()=>props.valueType==='auto'?inferDateValueType(Array.isArray(props.modelValue)?props.modelValue:props.modelValue):props.valueType)
function inputKey(value){return toDateValue(value,dateOptions.value)}
function outputValue(key){return fromDateValue(key,{...dateOptions.value,valueType:resolvedValueType.value})}
const todayKey=computed(()=>inputKey(props.today)||toDateValue(Date.now(),dateOptions.value))
const minKey=computed(()=>inputKey(props.min))
const maxKey=computed(()=>inputKey(props.max))
const selectedKeys=computed(()=>{
  const input=Array.isArray(props.modelValue)?props.modelValue:[props.modelValue]
  const keys=input.map(inputKey).filter(Boolean)
  return mode.value==='single'?keys.slice(0,1):mode.value==='range'?keys.slice(0,2).sort():[...new Set(keys)].sort()
})
function initialView(){return startOfMonth(inputKey(props.viewDate)||inputKey(props.defaultViewDate)||selectedKeys.value[0]||todayKey.value)}
const visibleMonth=ref(initialView())
const initialActive=[...selectedKeys.value,todayKey.value].find(key=>key?.slice(0,7)===visibleMonth.value.slice(0,7))||visibleMonth.value
const activeDate=ref(initialActive)
const rootRef=ref(null)
const panel=ref('month')
const hoverDate=ref('')

watch(()=>props.viewDate,value=>{const key=startOfMonth(inputKey(value));if(key){visibleMonth.value=key;ensureActiveInView()}})
watch(selectedKeys,keys=>{if(keys[0]&&!activeDate.value)activeDate.value=keys[0]})

function localeFirstDay(){
  const fallback=locale.value.name==='en-US'?0:1
  try{
    const localeObject=new Intl.Locale(locale.value.name)
    const weekInfo=localeObject.weekInfo??localeObject.getWeekInfo?.()
    const value=Number(weekInfo?.firstDay)
    return Number.isInteger(value)?value%7:fallback
  }catch{return fallback}
}
const firstDay=computed(()=>props.firstDayOfWeek==='auto'?localeFirstDay():Math.min(6,Math.max(0,Number(props.firstDayOfWeek)||0)))
const weekdays=computed(()=>Array.from({length:7},(_,index)=>{
  const weekday=(firstDay.value+index)%7
  const date=new Date(Date.UTC(2024,0,7+weekday))
  let label=''
  try{label=formatDate(date,{weekday:['narrow','short','long'].includes(props.weekdayFormat)?props.weekdayFormat:'short',timeZone:'UTC'})}catch{label=String(weekday)}
  return {weekday,label,long:formatDate(date,{weekday:'long',timeZone:'UTC'})}
}))
const monthLabel=computed(()=>formatDate(utcOf(visibleMonth.value),{year:'numeric',month:'long',timeZone:'UTC'}))
const visibleParts=computed(()=>parts(visibleMonth.value)||parts(todayKey.value))
const yearRangeStart=computed(()=>Math.floor(visibleParts.value.year/12)*12)
const yearRangeLabel=computed(()=>`${formatNumber(yearRangeStart.value,{useGrouping:false})}–${formatNumber(yearRangeStart.value+11,{useGrouping:false})}`)
const years=computed(()=>Array.from({length:12},(_,index)=>yearRangeStart.value+index))

function isoWeek(key){
  const date=utcOf(key);date.setUTCDate(date.getUTCDate()+4-(date.getUTCDay()||7))
  const start=new Date(Date.UTC(date.getUTCFullYear(),0,1))
  return Math.ceil((((date-start)/DAY)+1)/7)
}
function isUnavailable(key){
  if(!key)return true
  if(minKey.value&&compare(key,minKey.value)<0)return true
  if(maxKey.value&&compare(key,maxKey.value)>0)return true
  if(props.disabledDate){
    try{return Boolean(props.disabledDate(utcOf(key),{date:key,currentMonth:key.slice(0,7)===visibleMonth.value.slice(0,7)}))}catch{return false}
  }
  return false
}
function rangeState(key){
  if(mode.value!=='range'||!selectedKeys.value.length)return {start:false,end:false,inRange:false,preview:false,pending:false}
  const start=selectedKeys.value[0],end=selectedKeys.value[1]
  if(end)return {start:key===start,end:key===end,inRange:key>start&&key<end,preview:false,pending:false}
  if(!hoverDate.value||hoverDate.value===start)return {start:key===start,end:false,inRange:false,preview:false,pending:key===start}
  const low=[start,hoverDate.value].sort()[0],high=[start,hoverDate.value].sort()[1]
  return {start:key===low,end:key===high,inRange:key>low&&key<high,preview:key>=low&&key<=high,pending:false}
}
function dayLabel(key){return formatDate(utcOf(key),{dateStyle:'full',timeZone:'UTC'})}
function cellDescription(cell){
  const labels=[dayLabel(cell.date)]
  if(cell.selected)labels.push(t('calendar.selected'))
  if(cell.range.start)labels.push(t('calendar.rangeStart'))
  if(cell.range.end)labels.push(t('calendar.rangeEnd'))
  if(cell.disabled)labels.push(t('calendar.unavailable'))
  return labels.join(', ')
}
const cells=computed(()=>{
  const first=startOfMonth(visibleMonth.value)
  const offset=(utcOf(first).getUTCDay()-firstDay.value+7)%7
  const count=props.fixedWeeks?42:Math.ceil((offset+daysInMonth(visibleParts.value.year,visibleParts.value.month))/7)*7
  const start=addDays(first,-offset)
  return Array.from({length:count},(_,index)=>{
    const date=addDays(start,index),value=parts(date),currentMonth=date.slice(0,7)===visibleMonth.value.slice(0,7)
    const range=rangeState(date),selected=selectedKeys.value.includes(date)
    return {date,label:value.day,currentMonth,today:date===todayKey.value,selected,disabled:isUnavailable(date),weekend:[0,6].includes(utcOf(date).getUTCDay()),hidden:!props.showOutsideDays&&!currentMonth,range}
  })
})
const weeks=computed(()=>Array.from({length:cells.value.length/7},(_,index)=>({number:isoWeek(cells.value[index*7].date),days:cells.value.slice(index*7,index*7+7)})))

function setView(key,source='api'){
  const next=startOfMonth(key)
  if(!next||next===visibleMonth.value)return
  const previous=visibleMonth.value
  visibleMonth.value=next
  emit('update:viewDate',next)
  emit('view-change',{value:next,previous,source})
}
function ensureActiveInView(){
  if(activeDate.value.slice(0,7)!==visibleMonth.value.slice(0,7))activeDate.value=visibleMonth.value
}
function navigate(amount,source='button'){
  if(panel.value==='year'){
    const next=addMonths(visibleMonth.value,amount*144)
    visibleMonth.value=next
    emit('update:viewDate',next);emit('view-change',{value:next,previous:addMonths(next,-amount*144),source:'year-range'})
    return
  }
  const next=addMonths(visibleMonth.value,amount)
  setView(next,source)
  activeDate.value=addMonths(activeDate.value||visibleMonth.value,amount)
}
function setPanel(value){if(panel.value===value)return;panel.value=value;emit('panel-change',value)}
function chooseYear(year){
  const value=visibleParts.value
  const next=keyOf(year,value.month,1)
  setView(next,'year-select')
  const active=parts(activeDate.value)||value
  activeDate.value=keyOf(year,active.month,Math.min(active.day,daysInMonth(year,active.month)))
  setPanel('month')
  nextTick(()=>focusActive())
}
function emptyValue(){return mode.value==='single'?(resolvedValueType.value==='string'?'':null):[]}
function clear(source='button'){
  if(props.disabled||props.readonly||!props.allowClear||!selectedKeys.value.length)return
  const value=emptyValue();emit('update:modelValue',value);emit('change',value,{source,selectionMode:mode.value,date:''});emit('clear',{source})
}
function selectDate(key,source='pointer'){
  if(props.disabled||props.readonly||isUnavailable(key))return
  let keys=[]
  if(mode.value==='single')keys=[key]
  else if(mode.value==='multiple'){
    keys=selectedKeys.value.includes(key)?selectedKeys.value.filter(item=>item!==key):[...selectedKeys.value,key].sort()
    if(props.maxSelections>0&&keys.length>props.maxSelections)return
  }else{
    const [start,end]=selectedKeys.value
    keys=!start||end?[key]:[start,key].sort()
  }
  const output=mode.value==='single'?outputValue(keys[0]):keys.map(outputValue)
  emit('update:modelValue',output)
  emit('change',output,{source,selectionMode:mode.value,date:key})
  activeDate.value=key;hoverDate.value=''
}
function focusActive(){rootRef.value?.querySelector(`.ui-calendar-day[data-date="${activeDate.value}"]`)?.focus()}
async function moveFocus(key){
  let next=key,guard=0,directionStep=compare(key,activeDate.value||key)||1
  while(isUnavailable(next)&&guard<366){next=addDays(next,directionStep);guard++}
  activeDate.value=next
  if(next.slice(0,7)!==visibleMonth.value.slice(0,7))setView(next,'keyboard')
  await nextTick();focusActive()
}
function onKeydown(event,key){
  let next=''
  const horizontal=direction.value==='rtl'?-1:1
  if(event.key==='ArrowRight')next=addDays(key,horizontal)
  else if(event.key==='ArrowLeft')next=addDays(key,-horizontal)
  else if(event.key==='ArrowDown')next=addDays(key,7)
  else if(event.key==='ArrowUp')next=addDays(key,-7)
  else if(event.key==='Home')next=addDays(key,-((utcOf(key).getUTCDay()-firstDay.value+7)%7))
  else if(event.key==='End')next=addDays(key,6-((utcOf(key).getUTCDay()-firstDay.value+7)%7))
  else if(event.key==='PageDown')next=addMonths(key,event.shiftKey?12:1)
  else if(event.key==='PageUp')next=addMonths(key,event.shiftKey?-12:-1)
  else if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDate(key,'keyboard');return}
  else if((event.key==='Delete'||event.key==='Backspace')&&props.allowClear){event.preventDefault();clear('keyboard');return}
  if(next){event.preventDefault();moveFocus(next)}
}
function onFocus(event,key){activeDate.value=key;emit('focus',event)}
function goToday(){
  activeDate.value=todayKey.value;setView(todayKey.value,'today')
  if(!props.readonly&&!isUnavailable(todayKey.value))selectDate(todayKey.value,'today')
  nextTick(()=>focusActive())
}
</script>

<template>
  <section ref="rootRef" class="ui-calendar" :class="[`size-${resolvedSize}`,{bordered,disabled,readonly,'show-week-numbers':showWeekNumbers}]" :dir="direction" :data-selection-mode="mode" :aria-label="ariaLabel||t('calendar.label')">
    <slot name="header" :label="monthLabel" :view-date="visibleMonth" :panel="panel" :previous="()=>navigate(-1)" :next="()=>navigate(1)" :set-panel="setPanel">
      <header class="ui-calendar-header">
        <button type="button" class="ui-calendar-nav" :aria-label="panel==='year'?t('calendar.previousYearRange'):t('calendar.previousMonth')" :disabled="disabled" @click="navigate(-1)"><AppIcon name="chevronRight" :size="15" class="ui-calendar-prev-icon"/></button>
        <button type="button" class="ui-calendar-title" :aria-label="t('calendar.selectYear')" :aria-expanded="panel==='year'" :disabled="disabled" @click="setPanel(panel==='month'?'year':'month')">{{ panel==='year'?yearRangeLabel:monthLabel }}<AppIcon name="chevronDown" :size="12" class="ui-calendar-panel-icon" :class="{open:panel==='year'}"/></button>
        <button type="button" class="ui-calendar-nav" :aria-label="panel==='year'?t('calendar.nextYearRange'):t('calendar.nextMonth')" :disabled="disabled" @click="navigate(1)"><AppIcon name="chevronRight" :size="15" class="ui-calendar-next-icon"/></button>
      </header>
    </slot>

    <div v-if="panel==='year'" class="ui-calendar-years" role="grid" :aria-label="t('calendar.selectYear')">
      <button v-for="year in years" :key="year" type="button" role="gridcell" class="ui-calendar-year" :class="{current:year===visibleParts.year,today:year===parts(todayKey).year}" :aria-selected="year===visibleParts.year" :disabled="disabled" @click="chooseYear(year)">
        <slot name="year" :year="year" :selected="year===visibleParts.year">{{ formatNumber(year,{useGrouping:false}) }}</slot>
      </button>
    </div>

    <div v-else class="ui-calendar-grid" role="grid" :aria-label="monthLabel" :aria-readonly="readonly||undefined" :aria-disabled="disabled||undefined" :aria-multiselectable="mode==='multiple'||mode==='range'||undefined">
      <div class="ui-calendar-weekdays" role="row">
        <span v-if="showWeekNumbers" role="columnheader" class="ui-calendar-week-number" :aria-label="t('calendar.week')">{{ t('calendar.weekShort') }}</span>
        <span v-for="weekday in weekdays" :key="weekday.weekday" role="columnheader" class="ui-calendar-weekday" :aria-label="weekday.long">{{ weekday.label }}</span>
      </div>
      <div v-for="week in weeks" :key="week.days[0].date" class="ui-calendar-week" role="row">
        <span v-if="showWeekNumbers" role="rowheader" class="ui-calendar-week-number" :aria-label="`${t('calendar.week')} ${week.number}`">{{ week.number }}</span>
        <button v-for="cell in week.days" :key="cell.date" type="button" role="gridcell" class="ui-calendar-day" :class="{outside:!cell.currentMonth,today:cell.today,selected:cell.selected,disabled:cell.disabled,weekend:cell.weekend,hidden:cell.hidden,'range-start':cell.range.start,'range-end':cell.range.end,'range-pending':cell.range.pending,'in-range':cell.range.inRange,'range-preview':cell.range.preview}" :data-date="cell.date" :tabindex="cell.date===activeDate&&!cell.hidden?0:-1" :aria-label="cellDescription(cell)" :aria-selected="cell.selected||cell.range.inRange" :aria-disabled="cell.disabled||cell.hidden||undefined" :disabled="disabled" @click="selectDate(cell.date)" @keydown="onKeydown($event,cell.date)" @focus="onFocus($event,cell.date)" @blur="emit('blur',$event)" @mouseenter="hoverDate=cell.disabled?'':cell.date" @mouseleave="hoverDate=''">
          <slot name="cell" v-bind="cell"><span class="ui-calendar-day-label">{{ cell.label }}</span></slot>
        </button>
      </div>
    </div>

    <footer class="ui-calendar-footer">
      <slot name="footer" :today="goToday" :clear="clear">
        <button type="button" class="ui-calendar-today" :disabled="disabled" @click="goToday">{{ t('calendar.today') }}</button>
        <button v-if="allowClear&&selectedKeys.length" type="button" class="ui-calendar-clear" :disabled="disabled||readonly" @click="clear()">{{ t('calendar.clear') }}</button>
      </slot>
    </footer>
  </section>
</template>

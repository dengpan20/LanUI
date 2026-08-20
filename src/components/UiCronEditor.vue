<script setup>
import { computed, inject, ref, toRef, useAttrs, useId, watch } from 'vue'
import { useComponentSize, useLocale } from '../config-runtime.js'
import { getNextCronRuns, parseCronExpression } from './cronUtils.js'

defineOptions({inheritAttrs:false})
const props=defineProps({
  modelValue:{type:String,default:'0 9 * * 1-5'},
  presets:{type:Array,default:()=>[]},
  previewCount:{type:Number,default:5},
  timeZone:{type:String,default:'local'},
  from:{type:[Date,String,Number],default:null},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  required:Boolean,
  name:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','input','change','invalid','preset','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const {t,formatDate}=useLocale()
const resolvedSize=useComponentSize(toRef(props,'size'))
const uid=useId()
const inputRef=ref(null)
const draft=ref(props.modelValue)
const focused=ref(false)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-cron-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const parsed=computed(()=>parseCronExpression(draft.value))
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||!parsed.value.valid)
const normalizedTimeZone=computed(()=>props.timeZone==='UTC'?'UTC':'local')
const defaultPresets=computed(()=>[
  {key:'every-15-minutes',label:t('cron.preset.every15'),value:'*/15 * * * *'},
  {key:'hourly',label:t('cron.preset.hourly'),value:'0 * * * *'},
  {key:'daily',label:t('cron.preset.daily'),value:'0 9 * * *'},
  {key:'weekdays',label:t('cron.preset.weekdays'),value:'0 9 * * 1-5'},
  {key:'monthly',label:t('cron.preset.monthly'),value:'0 9 1 * *'},
])
const resolvedPresets=computed(()=>props.presets.length?props.presets:defaultPresets.value)
const activePreset=computed(()=>resolvedPresets.value.find(item=>String(item.value).trim().replace(/\s+/g,' ')===parsed.value.expression)?.key??'custom')
const fieldValues=computed(()=>{
  const parts=parsed.value.valid?parsed.value.expression.split(' '):String(draft.value||'').trim().split(/\s+/)
  return [t('cron.field.minute'),t('cron.field.hour'),t('cron.field.day'),t('cron.field.month'),t('cron.field.weekday')].map((label,index)=>({label,value:parts[index]??'—'}))
})
const baseDate=computed(()=>props.from==null?new Date():new Date(props.from))
const previewRuns=computed(()=>getNextCronRuns(parsed.value,{count:props.previewCount,from:baseDate.value,timeZone:normalizedTimeZone.value}))
const errorText=computed(()=>parsed.value.valid?'':t(`cron.error.${parsed.value.error.code}`))
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','value','disabled','readonly','required','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-required',
].includes(key))))

watch(()=>props.modelValue,value=>{if(value!==draft.value)draft.value=value})
function commit(value,source='input'){
  const next=String(value??'')
  const previous=draft.value
  draft.value=next
  emit('input',next,{source,valid:parsed.value.valid,error:parsed.value.error})
  if(next!==props.modelValue)emit('update:modelValue',next)
  if(next!==previous)emit('change',next,{source,previous,valid:parsed.value.valid,error:parsed.value.error})
  if(!parsed.value.valid)emit('invalid',parsed.value.error)
  return parsed.value.valid
}
function onInput(event){commit(event.target.value,'input')}
function applyPreset(preset){
  if(props.disabled||props.readonly)return false
  const valid=commit(preset.value,'preset')
  emit('preset',{key:preset.key,label:preset.label,value:preset.value,valid})
  return valid
}
function validate(value=draft.value){return parseCronExpression(value)}
function nextRuns(count=props.previewCount,from=baseDate.value){return getNextCronRuns(validate(),{count,from,timeZone:normalizedTimeZone.value})}
function setExpression(value,source='api'){
  if(props.disabled||props.readonly)return false
  return commit(value,source)
}
function focus(){if(props.disabled)return false;inputRef.value?.focus();return Boolean(inputRef.value)}
function blur(){inputRef.value?.blur()}
function onFocus(event){focused.value=true;emit('focus',event)}
function onBlur(event){focused.value=false;emit('blur',event)}
function formatRun(date){return formatDate(date,{dateStyle:'medium',timeStyle:'short',timeZone:normalizedTimeZone.value==='UTC'?'UTC':undefined})}
defineExpose({input:inputRef,focus,blur,validate,nextRuns,setExpression,applyPreset})
</script>

<template>
  <div class="ui-cron-editor" :class="[`size-${resolvedSize}`,attrs.class,{disabled,readonly,invalid:resolvedInvalid,focused}]" :style="attrs.style" :data-valid="parsed.valid?'true':'false'" :data-preset="activePreset">
    <slot name="header" :valid="parsed.valid" :expression="draft">
      <div class="ui-cron-header"><strong>{{ t('cron.title') }}</strong><span>{{ t('cron.unixHint') }}</span></div>
    </slot>
    <div class="ui-cron-presets" role="group" :aria-label="t('cron.presets')">
      <slot name="presets" :presets="resolvedPresets" :active="activePreset" :apply="applyPreset">
        <button v-for="preset in resolvedPresets" :key="preset.key??preset.value" type="button" class="ui-cron-preset" :class="{active:activePreset===(preset.key??preset.value)}" :aria-pressed="activePreset===(preset.key??preset.value)" :disabled="disabled||readonly||preset.disabled" @click="applyPreset(preset)">{{ preset.label }}</button>
      </slot>
    </div>
    <label class="ui-cron-expression" :for="controlId">
      <span class="ui-cron-expression-label">{{ t('cron.expression') }}</span>
      <input v-bind="passthroughAttrs" :id="controlId" ref="inputRef" class="ui-cron-input" type="text" spellcheck="false" autocomplete="off" :value="draft" :name="name||attrs.name" :disabled="disabled" :readonly="readonly" :required="required" :aria-label="ariaLabel||attrs['aria-label']" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-required="required||undefined" @input="onInput" @focus="onFocus" @blur="onBlur" />
      <span class="ui-cron-status" :class="parsed.valid?'valid':'error'" :role="parsed.valid?'status':'alert'" aria-live="polite">{{ parsed.valid?t('cron.valid'):errorText }}</span>
    </label>
    <div class="ui-cron-fields" :aria-label="t('cron.fields')">
      <span v-for="field in fieldValues" :key="field.label" class="ui-cron-field"><code>{{ field.value }}</code><small>{{ field.label }}</small></span>
    </div>
    <div class="ui-cron-preview">
      <div class="ui-cron-preview-heading"><strong>{{ t('cron.nextRuns') }}</strong><span>{{ normalizedTimeZone==='UTC'?'UTC':t('cron.localTime') }}</span></div>
      <slot name="preview" :runs="previewRuns" :valid="parsed.valid" :format="formatRun">
        <ol v-if="parsed.valid&&previewRuns.length" class="ui-cron-run-list"><li v-for="(run,index) in previewRuns" :key="run.toISOString()"><span>{{ index+1 }}</span><time :datetime="run.toISOString()">{{ formatRun(run) }}</time></li></ol>
        <p v-else class="ui-cron-empty">{{ parsed.valid?t('cron.noRuns'):t('cron.fixExpression') }}</p>
      </slot>
    </div>
    <slot name="actions" :valid="parsed.valid" :expression="draft" :runs="previewRuns" :set-expression="setExpression" />
  </div>
</template>

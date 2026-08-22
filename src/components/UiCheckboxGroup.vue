<script setup>
import { computed, inject, provide, ref, toRef, useAttrs, useId } from 'vue'
import UiCheckbox from './UiCheckbox.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:Array,default:undefined},
  defaultValue:{type:Array,default:()=>[]},
  options:{type:Array,default:()=>[]},
  label:{type:String,default:''},
  direction:{type:String,default:'horizontal'},
  size:{type:String,default:''},
  name:{type:String,default:''},
  min:{type:Number,default:0},
  max:{type:Number,default:Infinity},
  disabled:Boolean,
  readonly:Boolean,
  loading:Boolean,
  invalid:Boolean,
  required:Boolean,
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','change','limit','focus','blur','invalid'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const internal=ref([...props.defaultValue])
const focused=ref(false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
const controlled=computed(()=>props.modelValue!==undefined)
const value=computed(()=>controlled.value?[...(props.modelValue||[])]:[...internal.value])
const normalizedOptions=computed(()=>props.options.map(option=>typeof option==='object'&&option!==null?option:{label:String(option),value:option}))
const safeMin=computed(()=>Math.max(0,Math.trunc(Number.isFinite(props.min)?props.min:0)))
const safeMax=computed(()=>Math.max(safeMin.value,Number.isFinite(props.max)?Math.trunc(props.max):Infinity))
const constraintInvalid=computed(()=>value.value.length<safeMin.value||value.value.length>safeMax.value)
const resolvedInvalid=computed(()=>props.invalid||constraintInvalid.value||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const groupId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-checkbox-group-${uid}`)
const labelId=computed(()=>props.label?`${groupId.value}-label`:formItem?.labelId?.value||undefined)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const accessibleLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(labelId.value?undefined:t('checkboxGroup.label')))
const state=computed(()=>props.loading?'loading':props.disabled?'disabled':props.readonly?'readonly':resolvedInvalid.value?'invalid':focused.value?'focused':'ready')
function includes(target){return value.value.some(item=>Object.is(item,target))}
function commit(next,source='api',nativeEvent,valueKey){
  const previous=value.value
  const payload={source,value:valueKey,checked:valueKey===undefined?undefined:next.some(item=>Object.is(item,valueKey)),previous,next:[...next],nativeEvent}
  if(!controlled.value)internal.value=[...next]
  emit('update:modelValue',[...next]);emit('change',[...next],payload)
  return payload
}
function toggle(target,nextChecked=!includes(target),source='api',nativeEvent){
  if(props.disabled||props.loading||props.readonly){
    emit('invalid',{reason:props.disabled?'disabled':props.loading?'loading':'readonly',source,value:target,current:value.value})
    return false
  }
  const previous=value.value
  const next=nextChecked
    ? previous.some(item=>Object.is(item,target))?previous:[...previous,target]
    : previous.filter(item=>!Object.is(item,target))
  const limitReason=next.length>safeMax.value?'max':next.length<safeMin.value?'min':''
  if(limitReason){const payload={reason:limitReason,source,value:target,current:previous,min:safeMin.value,max:safeMax.value};emit('limit',payload);emit('invalid',payload);return false}
  return commit(next,source,nativeEvent,target)
}
function setValue(next,source='api'){
  if(props.disabled||props.loading||props.readonly){emit('invalid',{reason:props.disabled?'disabled':props.loading?'loading':'readonly',source,current:value.value});return false}
  const unique=[]
  for(const item of Array.isArray(next)?next:[])if(!unique.some(value=>Object.is(value,item)))unique.push(item)
  if(unique.length<safeMin.value||unique.length>safeMax.value){const payload={reason:unique.length<safeMin.value?'min':'max',source,current:value.value,min:safeMin.value,max:safeMax.value};emit('limit',payload);emit('invalid',payload);return false}
  return commit(unique,source)
}
function selectAll(source='api'){
  const enabled=normalizedOptions.value.filter(option=>!option.disabled&&!option.readonly).map(option=>option.value).slice(0,Number.isFinite(safeMax.value)?safeMax.value:undefined)
  return setValue(enabled,source)
}
function clear(source='api'){return setValue(normalizedOptions.value.filter(option=>!option.disabled&&!option.readonly).slice(0,safeMin.value).map(option=>option.value),source)}
function focus(options){const target=rootRef.value?.querySelector('input:not(:disabled)');target?.focus(options);return Boolean(target)}
function blur(){const active=rootRef.value?.ownerDocument?.activeElement;if(rootRef.value?.contains(active)){active?.blur();return true}return false}
function onFocusin(event){if(focused.value)return;focused.value=true;emit('focus',event,{value:value.value})}
function onFocusout(event){if(rootRef.value?.contains(event.relatedTarget))return;focused.value=false;emit('blur',event,{value:value.value})}
provide('uiCheckboxGroupContext',{value,size:resolvedSize,name:computed(()=>props.name||undefined),disabled:computed(()=>props.disabled),readonly:computed(()=>props.readonly),loading:computed(()=>props.loading),invalid:resolvedInvalid,required:computed(()=>false),toggle,includes})
defineExpose({root:rootRef,value,focus,blur,toggle,setValue,selectAll,clear})
</script>

<template>
  <div ref="rootRef" class="ui-checkbox-group" :class="[`direction-${direction}`,`size-${resolvedSize}`,attrs.class,{disabled,readonly,loading,invalid:resolvedInvalid,focused}]" :style="attrs.style" :id="groupId" role="group" :aria-label="accessibleLabel" :aria-labelledby="attrs['aria-labelledby']||labelId" :aria-describedby="describedby" :aria-disabled="disabled||readonly||undefined" :aria-invalid="resolvedInvalid||undefined" :aria-busy="loading||undefined" :data-required="resolvedRequired||undefined" data-ui-checkbox-group :data-state="state" @focusin="onFocusin" @focusout="onFocusout">
    <span v-if="label" :id="labelId" class="ui-selection-group-label"><slot name="label">{{ label }}</slot></span>
    <div class="ui-selection-group-options"><slot :value="value" :toggle="toggle" :disabled="disabled" :readonly="readonly"><UiCheckbox v-for="(option,index) in normalizedOptions" :key="option.key??option.value??index" :value="option.value" :label="option.label" :description="option.description" :disabled="option.disabled" :readonly="option.readonly" :indeterminate="option.indeterminate" :aria-label="option.ariaLabel"><template v-if="$slots.option" #default><slot name="option" :option="option" :index="index" :checked="includes(option.value)"/></template></UiCheckbox></slot></div>
  </div>
</template>

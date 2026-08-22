<script setup>
import { computed, inject, nextTick, onMounted, ref, toRef, useAttrs, useId, useSlots, watchEffect } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[Boolean,String,Number,Array],default:false},
  value:{type:[String,Number,Boolean],default:true},
  trueValue:{type:[String,Number,Boolean],default:true},
  falseValue:{type:[String,Number,Boolean],default:false},
  label:{type:String,default:''},
  description:{type:String,default:''},
  size:{type:String,default:''},
  labelPlacement:{type:String,default:'end'},
  disabled:Boolean,
  readonly:Boolean,
  loading:Boolean,
  indeterminate:Boolean,
  invalid:Boolean,
  required:Boolean,
  name:{type:String,default:''},
  form:{type:String,default:''},
  autofocus:Boolean,
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','input','change','focus','blur','invalid'])
const attrs=useAttrs()
const slots=useSlots()
const uid=useId()
const inputRef=ref(null)
const rootRef=ref(null)
const focused=ref(false)
const activationSource=ref('pointer')
const group=inject('uiCheckboxGroupContext',null)
const formItem=inject('uiFormItemContext',null)
const globalSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()

const inGroup=computed(()=>Boolean(group))
const resolvedSize=computed(()=>props.size||group?.size?.value||globalSize.value)
const resolvedDisabled=computed(()=>props.disabled||group?.disabled?.value||false)
const resolvedReadonly=computed(()=>props.readonly||group?.readonly?.value||false)
const resolvedLoading=computed(()=>props.loading||group?.loading?.value||false)
const resolvedInvalid=computed(()=>props.invalid||group?.invalid?.value||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||group?.required?.value||(!inGroup.value&&formItem?.required?.value)||false)
const resolvedName=computed(()=>props.name||group?.name?.value||undefined)
const model=computed(()=>group?.value?.value??props.modelValue)
const checked=computed(()=>Array.isArray(model.value)?model.value.some(item=>Object.is(item,props.value)):Object.is(model.value,props.trueValue))
const controlId=computed(()=>attrs.id||(!inGroup.value?formItem?.controlId?.value:undefined)||`ui-checkbox-${uid}`)
const descriptionId=computed(()=>props.description?`${controlId.value}-description`:undefined)
const visibleLabel=computed(()=>Boolean(props.label||slots.default))
const explicitAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||'')
const labelledby=computed(()=>attrs['aria-labelledby']||(explicitAriaLabel.value||visibleLabel.value?undefined:formItem?.labelId?.value)||undefined)
const describedby=computed(()=>[attrs['aria-describedby']||formItem?.describedby?.value,descriptionId.value].filter(Boolean).join(' ')||undefined)
const accessibleLabel=computed(()=>explicitAriaLabel.value||(visibleLabel.value||labelledby.value?undefined:t('checkbox.label')))
const state=computed(()=>resolvedLoading.value?'loading':resolvedDisabled.value?'disabled':resolvedReadonly.value?'readonly':resolvedInvalid.value?'invalid':props.indeterminate?'mixed':checked.value?'checked':focused.value?'focused':'unchecked')
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','checked','value','name','form','disabled','readonly','required','autofocus','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-checked','aria-busy','aria-required','aria-readonly',
].includes(key))))

watchEffect(()=>{if(inputRef.value)inputRef.value.indeterminate=Boolean(props.indeterminate)})

function ownValue(nextChecked){
  if(Array.isArray(props.modelValue)){
    const previous=[...props.modelValue]
    return nextChecked
      ? previous.some(item=>Object.is(item,props.value))?previous:[...previous,props.value]
      : previous.filter(item=>!Object.is(item,props.value))
  }
  return nextChecked?props.trueValue:props.falseValue
}
function meta(source,nextChecked,previous,next,nativeEvent){return {source,value:props.value,checked:nextChecked,previous,next,group:inGroup.value,nativeEvent}}
function restoreNative(){nextTick(()=>{if(inputRef.value){inputRef.value.checked=checked.value;inputRef.value.indeterminate=Boolean(props.indeterminate)}})}
function commit(nextChecked,source='api',nativeEvent){
  if(resolvedDisabled.value||resolvedLoading.value||resolvedReadonly.value){
    const reason=resolvedReadonly.value?'readonly':resolvedLoading.value?'loading':'disabled'
    const payload={reason,source,value:props.value,checked:checked.value}
    emit('invalid',payload)
    restoreNative()
    return false
  }
  if(group){
    const result=group.toggle(props.value,nextChecked,source,nativeEvent)
    if(!result){restoreNative();return false}
    emit('input',result.next,result)
    emit('change',result.next,result)
    return result
  }
  const previous=Array.isArray(props.modelValue)?[...props.modelValue]:props.modelValue
  const next=ownValue(nextChecked)
  const payload=meta(source,nextChecked,previous,next,nativeEvent)
  emit('update:modelValue',next)
  emit('input',next,payload)
  emit('change',next,payload)
  return payload
}
function onChange(event){commit(event.target.checked,activationSource.value,event)}
function onClick(event){if(resolvedReadonly.value||resolvedLoading.value){event.preventDefault();emit('invalid',{reason:resolvedReadonly.value?'readonly':'loading',source:event.detail===0?'keyboard':'pointer',value:props.value,checked:checked.value});restoreNative()}}
function onPointerdown(){activationSource.value='pointer'}
function onKeydown(event){activationSource.value='keyboard';if((resolvedReadonly.value||resolvedLoading.value)&&[' ','Enter'].includes(event.key))event.preventDefault()}
function onFocus(event){focused.value=true;emit('focus',event,meta('focus',checked.value,model.value,model.value,event))}
function onBlur(event){focused.value=false;emit('blur',event,meta('blur',checked.value,model.value,model.value,event))}
function focus(options){if(resolvedDisabled.value)return false;inputRef.value?.focus(options);return Boolean(inputRef.value)}
function blur(){inputRef.value?.blur();return Boolean(inputRef.value)}
function toggle(source='api'){return commit(!checked.value,source)}
function setChecked(value,source='api'){return commit(Boolean(value),source)}

onMounted(()=>{if(props.autofocus)nextTick(()=>focus())})
defineExpose({root:rootRef,input:inputRef,checked,focus,blur,toggle,setChecked})
</script>

<template>
  <label ref="rootRef" class="checkbox ui-checkbox" :class="[`size-${resolvedSize}`,`label-${labelPlacement}`,attrs.class,{checked,disabled:resolvedDisabled,readonly:resolvedReadonly,loading:resolvedLoading,indeterminate,invalid:resolvedInvalid,focused}]" :style="attrs.style" data-ui-checkbox :data-state="state">
    <input v-bind="passthroughAttrs" :id="controlId" ref="inputRef" class="ui-checkbox-native" type="checkbox" :name="resolvedName" :form="form||undefined" :value="value" :checked="checked" :indeterminate="indeterminate" :disabled="resolvedDisabled" :required="resolvedRequired" :autofocus="autofocus" :aria-label="accessibleLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-checked="indeterminate?'mixed':String(checked)" :aria-invalid="resolvedInvalid||undefined" :aria-busy="resolvedLoading||undefined" :aria-required="resolvedRequired||undefined" :aria-readonly="resolvedReadonly||undefined" @pointerdown="onPointerdown" @keydown="onKeydown" @click="onClick" @change="onChange" @focus="onFocus" @blur="onBlur" />
    <span class="ui-checkbox-indicator" aria-hidden="true"><slot name="indicator" :checked="checked" :indeterminate="indeterminate" :loading="resolvedLoading"><span v-if="resolvedLoading" class="spinner ui-checkbox-spinner"/><AppIcon v-else-if="indeterminate" name="minus" :size="11"/><AppIcon v-else-if="checked" name="check" :size="12"/></slot></span>
    <span v-if="visibleLabel||description" class="ui-selection-copy"><span v-if="visibleLabel" class="ui-selection-label"><slot>{{ label }}</slot></span><span v-if="description" :id="descriptionId" class="ui-selection-description"><slot name="description">{{ description }}</slot></span></span>
  </label>
</template>

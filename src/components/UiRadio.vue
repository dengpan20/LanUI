<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, useSlots } from 'vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number,Boolean],default:undefined},
  value:{type:[String,Number,Boolean],default:true},
  label:{type:String,default:''},
  description:{type:String,default:''},
  name:{type:String,default:''},
  size:{type:String,default:''},
  labelPlacement:{type:String,default:'end'},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  required:Boolean,
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
const group=inject('uiRadioGroupContext',null)
const formItem=inject('uiFormItemContext',null)
const globalSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
const inGroup=computed(()=>Boolean(group))
const model=computed(()=>group?.value?.value??props.modelValue)
const checked=computed(()=>Object.is(model.value,props.value))
const resolvedSize=computed(()=>props.size||group?.size?.value||globalSize.value)
const resolvedDisabled=computed(()=>props.disabled||group?.disabled?.value||false)
const resolvedReadonly=computed(()=>props.readonly||group?.readonly?.value||false)
const resolvedInvalid=computed(()=>props.invalid||group?.invalid?.value||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||group?.required?.value||formItem?.required?.value||false)
const resolvedName=computed(()=>props.name||group?.name?.value||undefined)
const controlId=computed(()=>attrs.id||(!inGroup.value?formItem?.controlId?.value:undefined)||`ui-radio-${uid}`)
const descriptionId=computed(()=>props.description?`${controlId.value}-description`:undefined)
const visibleLabel=computed(()=>Boolean(props.label||slots.default))
const explicitAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||'')
const labelledby=computed(()=>attrs['aria-labelledby']||(explicitAriaLabel.value||visibleLabel.value?undefined:formItem?.labelId?.value)||undefined)
const describedby=computed(()=>[attrs['aria-describedby']||formItem?.describedby?.value,descriptionId.value].filter(Boolean).join(' ')||undefined)
const accessibleLabel=computed(()=>explicitAriaLabel.value||(visibleLabel.value||labelledby.value?undefined:t('radio.label')))
const state=computed(()=>resolvedDisabled.value?'disabled':resolvedReadonly.value?'readonly':resolvedInvalid.value?'invalid':checked.value?'checked':focused.value?'focused':'unchecked')
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','checked','value','name','disabled','readonly','required','autofocus','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-checked','aria-required','aria-readonly',
].includes(key))))
function meta(source,previous,nativeEvent){return {source,value:props.value,previous,next:props.value,checked:true,group:inGroup.value,nativeEvent}}
function restoreNative(){nextTick(()=>{if(inputRef.value)inputRef.value.checked=checked.value})}
function select(source='api',nativeEvent){
  if(resolvedDisabled.value||resolvedReadonly.value){emit('invalid',{reason:resolvedDisabled.value?'disabled':'readonly',source,value:props.value,current:model.value});restoreNative();return false}
  if(checked.value)return false
  if(group){const result=group.select(props.value,source,nativeEvent);if(!result){restoreNative();return false}emit('input',props.value,result);emit('change',props.value,result);return result}
  const payload=meta(source,props.modelValue,nativeEvent);emit('update:modelValue',props.value);emit('input',props.value,payload);emit('change',props.value,payload);return payload
}
function onChange(event){select(activationSource.value,event)}
function onClick(event){if(resolvedReadonly.value){event.preventDefault();emit('invalid',{reason:'readonly',source:event.detail===0?'keyboard':'pointer',value:props.value,current:model.value});restoreNative()}}
function onPointerdown(){activationSource.value='pointer'}
function onKeydown(event){activationSource.value='keyboard';if(resolvedReadonly.value&&[' ','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))event.preventDefault()}
function onFocus(event){focused.value=true;emit('focus',event,meta('focus',model.value,event))}
function onBlur(event){focused.value=false;emit('blur',event,meta('blur',model.value,event))}
function focus(options){if(resolvedDisabled.value)return false;inputRef.value?.focus(options);return Boolean(inputRef.value)}
function blur(){inputRef.value?.blur();return Boolean(inputRef.value)}
const registration={value:computed(()=>props.value),input:inputRef,disabled:resolvedDisabled,readonly:resolvedReadonly}
onMounted(()=>{group?.register?.(registration);if(props.autofocus)nextTick(()=>focus())})
onBeforeUnmount(()=>group?.unregister?.(registration))
defineExpose({root:rootRef,input:inputRef,checked,focus,blur,select})
</script>

<template>
  <label ref="rootRef" class="radio ui-radio" :class="[`size-${resolvedSize}`,`label-${labelPlacement}`,attrs.class,{checked,disabled:resolvedDisabled,readonly:resolvedReadonly,invalid:resolvedInvalid,focused}]" :style="attrs.style" data-ui-radio :data-state="state">
    <input v-bind="passthroughAttrs" :id="controlId" ref="inputRef" class="ui-radio-native" type="radio" :name="resolvedName" :value="value" :checked="checked" :disabled="resolvedDisabled" :required="resolvedRequired" :autofocus="autofocus" :aria-label="accessibleLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-required="resolvedRequired||undefined" :aria-disabled="resolvedReadonly||undefined" @pointerdown="onPointerdown" @keydown="onKeydown" @click="onClick" @change="onChange" @focus="onFocus" @blur="onBlur" />
    <span class="ui-radio-indicator" aria-hidden="true"><slot name="indicator" :checked="checked"><span/></slot></span>
    <span v-if="visibleLabel||description" class="ui-selection-copy"><span v-if="visibleLabel" class="ui-selection-label"><slot>{{ label }}</slot></span><span v-if="description" :id="descriptionId" class="ui-selection-description"><slot name="description">{{ description }}</slot></span></span>
  </label>
</template>

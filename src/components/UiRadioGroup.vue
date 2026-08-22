<script setup>
import { computed, inject, nextTick, provide, ref, toRef, useAttrs, useId } from 'vue'
import UiRadio from './UiRadio.vue'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number,Boolean],default:undefined},
  defaultValue:{type:[String,Number,Boolean],default:undefined},
  options:{type:Array,default:()=>[]},
  label:{type:String,default:''},
  direction:{type:String,default:'horizontal'},
  size:{type:String,default:''},
  name:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  required:Boolean,
  keyboard:{type:Boolean,default:true},
  loop:{type:Boolean,default:true},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','input','change','focus','blur','invalid'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const internal=ref(props.defaultValue)
const focused=ref(false)
const registrations=[]
const resolvedSize=useComponentSize(toRef(props,'size'))
const direction=useDirection()
const {t}=useLocale()
const controlled=computed(()=>props.modelValue!==undefined)
const value=computed(()=>controlled.value?props.modelValue:internal.value)
const normalizedOptions=computed(()=>props.options.map(option=>typeof option==='object'&&option!==null?option:{label:String(option),value:option}))
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const groupId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-radio-group-${uid}`)
const labelId=computed(()=>props.label?`${groupId.value}-label`:formItem?.labelId?.value||undefined)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedName=computed(()=>props.name||`ui-radio-group-name-${uid}`)
const accessibleLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(labelId.value?undefined:t('radioGroup.label')))
const state=computed(()=>props.disabled?'disabled':props.readonly?'readonly':resolvedInvalid.value?'invalid':focused.value?'focused':'ready')
function select(next,source='api',nativeEvent){
  if(props.disabled||props.readonly){emit('invalid',{reason:props.disabled?'disabled':'readonly',source,value:next,current:value.value});return false}
  if(Object.is(value.value,next))return false
  const payload={source,value:next,previous:value.value,next,checked:true,group:true,nativeEvent}
  if(!controlled.value)internal.value=next
  emit('update:modelValue',next);emit('input',next,payload);emit('change',next,payload)
  return payload
}
function focus(options){const target=rootRef.value?.querySelector('input:checked:not(:disabled),input:not(:disabled)');target?.focus(options);return Boolean(target)}
function blur(){const active=rootRef.value?.ownerDocument?.activeElement;if(rootRef.value?.contains(active)){active?.blur();return true}return false}
function onFocusin(event){if(focused.value)return;focused.value=true;emit('focus',event,{value:value.value})}
function onFocusout(event){if(rootRef.value?.contains(event.relatedTarget))return;focused.value=false;emit('blur',event,{value:value.value})}
function register(record){if(!registrations.includes(record))registrations.push(record)}
function unregister(record){const index=registrations.indexOf(record);if(index>=0)registrations.splice(index,1)}
function onKeydown(event){
  if(!props.keyboard||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return
  if(props.disabled||props.readonly){event.preventDefault();emit('invalid',{reason:props.disabled?'disabled':'readonly',source:'keyboard',current:value.value});return}
  const enabled=registrations.filter(record=>!record.disabled.value&&!record.readonly.value&&record.input.value)
  if(!enabled.length)return
  let index=enabled.findIndex(record=>record.input.value===event.target)
  if(index<0)index=enabled.findIndex(record=>Object.is(record.value.value,value.value))
  if(event.key==='Home')index=0
  else if(event.key==='End')index=enabled.length-1
  else{
    const backwards=event.key==='ArrowUp'||(direction.value==='rtl'?event.key==='ArrowRight':event.key==='ArrowLeft')
    const candidate=index+(backwards?-1:1)
    index=props.loop?(candidate+enabled.length)%enabled.length:Math.max(0,Math.min(enabled.length-1,candidate))
  }
  const target=enabled[index]
  if(!target)return
  event.preventDefault();select(target.value.value,'keyboard',event);nextTick(()=>target.input.value?.focus())
}
provide('uiRadioGroupContext',{value,size:resolvedSize,name:resolvedName,disabled:computed(()=>props.disabled),readonly:computed(()=>props.readonly),invalid:resolvedInvalid,required:resolvedRequired,select,register,unregister})
defineExpose({root:rootRef,value,focus,blur,select})
</script>

<template>
  <div ref="rootRef" class="ui-radio-group" :class="[`direction-${props.direction}`,`size-${resolvedSize}`,attrs.class,{disabled,readonly,invalid:resolvedInvalid,focused}]" :style="attrs.style" :id="groupId" role="radiogroup" :aria-label="accessibleLabel" :aria-labelledby="attrs['aria-labelledby']||labelId" :aria-describedby="describedby" :aria-disabled="disabled||readonly||undefined" :aria-invalid="resolvedInvalid||undefined" :aria-required="resolvedRequired||undefined" data-ui-radio-group :data-state="state" @keydown="onKeydown" @focusin="onFocusin" @focusout="onFocusout">
    <span v-if="label" :id="labelId" class="ui-selection-group-label"><slot name="label">{{ label }}</slot></span>
    <div class="ui-selection-group-options"><slot :value="value" :select="select" :disabled="disabled" :readonly="readonly"><UiRadio v-for="(option,index) in normalizedOptions" :key="option.key??option.value??index" :value="option.value" :label="option.label" :description="option.description" :disabled="option.disabled" :readonly="option.readonly" :aria-label="option.ariaLabel"><template v-if="$slots.option" #default><slot name="option" :option="option" :index="index" :checked="Object.is(value,option.value)"/></template></UiRadio></slot></div>
  </div>
</template>

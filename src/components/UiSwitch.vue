<script setup>
import { computed, inject, nextTick, onMounted, ref, toRef, useAttrs, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[Boolean,String,Number],default:false},
  activeValue:{type:[Boolean,String,Number],default:true},
  inactiveValue:{type:[Boolean,String,Number],default:false},
  disabled:Boolean,
  readonly:Boolean,
  loading:Boolean,
  invalid:Boolean,
  required:Boolean,
  autofocus:Boolean,
  size:{type:String,default:''},
  name:{type:String,default:''},
  form:{type:String,default:''},
  submitValue:{type:[String,Number],default:undefined},
  checkedText:{type:String,default:''},
  uncheckedText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  beforeChange:{type:Function,default:undefined},
})
const emit=defineEmits(['update:modelValue','input','change','before-change','focus','blur','invalid'])
const attrs=useAttrs()
const uid=useId()
const formItem=inject('uiFormItemContext',null)
const rootRef=ref(null)
const buttonRef=ref(null)
const focused=ref(false)
const pending=ref(false)
const requestId=ref(0)
const {t}=useLocale()
const resolvedSize=useComponentSize(toRef(props,'size'))
const checked=computed(()=>Object.is(props.modelValue,props.activeValue))
const busy=computed(()=>props.loading||pending.value)
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-switch-${uid}`)
const text=computed(()=>checked.value?props.checkedText:props.uncheckedText)
const textId=computed(()=>text.value?`${controlId.value}-text`:undefined)
const explicitAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||'')
const labelledby=computed(()=>attrs['aria-labelledby']||(explicitAriaLabel.value?undefined:formItem?.labelId?.value||textId.value)||undefined)
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const accessibleLabel=computed(()=>explicitAriaLabel.value||(labelledby.value?undefined:t('switch.label')))
const formValue=computed(()=>props.submitValue??(props.activeValue===true?'on':String(props.activeValue)))
const state=computed(()=>busy.value?'loading':props.disabled?'disabled':props.readonly?'readonly':resolvedInvalid.value?'invalid':checked.value?'checked':focused.value?'focused':'unchecked')
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','type','role','name','form','value','disabled','readonly','required','autofocus','aria-label','aria-labelledby','aria-describedby','aria-checked','aria-invalid','aria-busy','aria-required','aria-readonly',
].includes(key))))
function meta(source,next,previous=props.modelValue,nativeEvent){return {source,checked:Object.is(next,props.activeValue),previous,next,nativeEvent}}
function finish(next,source,event,id){
  if(id!==requestId.value)return false
  pending.value=false
  const payload=meta(source,next,props.modelValue,event)
  emit('update:modelValue',next);emit('input',next,payload);emit('change',next,payload)
  return payload
}
function reject(reason,source,next,event,error,id){
  if(id!==requestId.value)return false
  pending.value=false
  const payload={reason,source,checked:Object.is(next,props.activeValue),value:next,current:props.modelValue,nativeEvent:event,error}
  emit('invalid',payload)
  return false
}
function toggle(source='api',event){
  if(props.disabled||busy.value||props.readonly){
    emit('invalid',{reason:props.disabled?'disabled':busy.value?'loading':'readonly',source,checked:checked.value,value:props.modelValue,current:props.modelValue,nativeEvent:event})
    return false
  }
  const next=checked.value?props.inactiveValue:props.activeValue
  const payload=meta(source,next,props.modelValue,event)
  emit('before-change',next,payload)
  let decision
  try{decision=props.beforeChange?.(next,payload,event)}catch(error){return reject('guard-error',source,next,event,error,requestId.value)}
  if(decision&&typeof decision.then==='function'){
    const id=++requestId.value;pending.value=true
    return Promise.resolve(decision).then(allowed=>allowed===false?reject('guard',source,next,event,undefined,id):finish(next,source,event,id),error=>reject('guard-error',source,next,event,error,id))
  }
  if(decision===false)return reject('guard',source,next,event,undefined,requestId.value)
  return finish(next,source,event,requestId.value)
}
function onClick(event){toggle(event.detail===0?'keyboard':'pointer',event)}
function onFocus(event){focused.value=true;emit('focus',event,meta('focus',props.modelValue,props.modelValue,event))}
function onBlur(event){focused.value=false;emit('blur',event,meta('blur',props.modelValue,props.modelValue,event))}
function focus(options){if(props.disabled)return false;buttonRef.value?.focus(options);return Boolean(buttonRef.value)}
function blur(){buttonRef.value?.blur();return Boolean(buttonRef.value)}
function setChecked(value,source='api'){if(Boolean(value)===checked.value)return false;return toggle(source)}
onMounted(()=>{if(props.autofocus)nextTick(()=>focus())})
defineExpose({root:rootRef,button:buttonRef,checked,pending,focus,blur,toggle,setChecked})
</script>

<template>
  <span ref="rootRef" class="ui-switch-root" :class="[`size-${resolvedSize}`,attrs.class,{checked,disabled,readonly,loading:busy,invalid:resolvedInvalid,focused,'has-text':text||$slots['checked-text']||$slots['unchecked-text']}]" :style="attrs.style" data-ui-switch :data-state="state">
    <button v-bind="passthroughAttrs" :id="controlId" ref="buttonRef" type="button" class="switch ui-switch" :class="[`size-${resolvedSize}`,{on:checked,loading:busy,invalid:resolvedInvalid,readonly}]" role="switch" :aria-label="accessibleLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-checked="String(checked)" :aria-invalid="resolvedInvalid||undefined" :aria-busy="busy||undefined" :aria-required="resolvedRequired||undefined" :aria-readonly="readonly||undefined" :disabled="disabled||busy" :autofocus="autofocus" @click="onClick" @focus="onFocus" @blur="onBlur">
      <span class="ui-switch-handle" aria-hidden="true"><slot v-if="busy" name="loading"><AppIcon name="refresh" :size="10"/></slot><slot v-else-if="checked" name="checked-icon"><AppIcon name="check" :size="10"/></slot><slot v-else name="unchecked-icon"/></span>
    </button>
    <input v-if="name&&checked" type="hidden" :name="name" :form="form||undefined" :value="formValue" />
    <span v-if="text||$slots['checked-text']||$slots['unchecked-text']" :id="textId" class="ui-switch-text"><slot v-if="checked" name="checked-text">{{ checkedText }}</slot><slot v-else name="unchecked-text">{{ uncheckedText }}</slot></span>
  </span>
</template>

<script setup>
import { nextTick, onMounted, provide, reactive, ref, toRaw } from 'vue'
const props=defineProps({model:{type:Object,required:true},rules:{type:Object,default:()=>{}},validateOnSubmit:{type:Boolean,default:true}})
const emit=defineEmits(['submit','invalid','reset'])
const fields=reactive(new Map());let initial={}
const submitPointer=ref(false)
const clone=value=>structuredClone(toRaw(value))
onMounted(()=>{initial=clone(props.model)})
function register(name,api){if(name)fields.set(name,api)}
function unregister(name){fields.delete(name)}
async function validate(names=[...fields.keys()]){const results=await Promise.all(names.map(name=>fields.get(name)?.validate('submit')??true));const valid=results.every(Boolean);if(!valid){await nextTick();document.querySelector('.ui-form-item.invalid input,.ui-form-item.invalid button,.ui-form-item.invalid textarea')?.focus()}return valid}
function clearValidate(names=[...fields.keys()]){names.forEach(name=>fields.get(name)?.clear())}
function reset(){Object.keys(props.model).forEach(key=>delete props.model[key]);Object.assign(props.model,clone(initial));fields.forEach(field=>field.clear());emit('reset')}
async function submit(event){const valid=props.validateOnSubmit?await validate():true;if(valid)emit('submit',clone(props.model),event);else emit('invalid',props.model,event)}
function pointerdown(event){
  submitPointer.value=!!event.target?.closest?.('button[type="submit"],input[type="submit"]')
  if(submitPointer.value)fields.forEach(field=>field.prepareSubmitPointer?.())
  if(submitPointer.value)setTimeout(()=>{submitPointer.value=false},250)
}
provide('uiFormContext',{model:props.model,rules:props.rules,register,unregister,submitPointer})
defineExpose({validate,clearValidate,reset})
</script>
<template><form class="ui-form" novalidate @pointerdown.capture="pointerdown" @submit.prevent="submit"><slot :validate="validate" :reset="reset"/></form></template>

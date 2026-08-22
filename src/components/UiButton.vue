<script setup>
import { computed, ref, toRef, useAttrs, useSlots } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize } from '../config-runtime.js'
import { useReducedMotion } from '../motion.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  variant:{type:String,default:'primary',validator:value=>['primary','secondary','outline','text','danger','danger-outline'].includes(value)},
  size:{type:String,default:'',validator:value=>['','sm','md','lg'].includes(value)},
  icon:{type:String,default:''},
  iconPosition:{type:String,default:'start',validator:value=>['start','end'].includes(value)},
  iconSize:{type:[Number,String],default:15},
  loading:Boolean,
  loadingText:{type:String,default:''},
  disabled:Boolean,
  type:{type:String,default:'button',validator:value=>['button','submit','reset'].includes(value)},
  block:Boolean,
  shape:{type:String,default:'default',validator:value=>['default','round','circle'].includes(value)},
  href:{type:String,default:''},
  target:{type:String,default:''},
  rel:{type:String,default:''},
  download:{type:[Boolean,String],default:false},
  autofocus:Boolean,
  form:{type:String,default:''},
  name:{type:String,default:''},
  value:{type:[String,Number],default:undefined},
  action:{type:Function,default:null},
  preventDefault:Boolean,
  stopPropagation:Boolean,
  ariaLabel:{type:String,default:''},
  pressed:{type:[Boolean,String],default:undefined,validator:value=>value===undefined||value===true||value===false||value==='mixed'},
})
const emit=defineEmits(['click','action-start','action-success','action-error'])
const attrs=useAttrs()
const slots=useSlots()
const reducedMotion=useReducedMotion()
const resolvedSize=useComponentSize(toRef(props,'size'))
const root=ref(null)
const internalPending=ref(false)
const nextActivationSource=ref('')

const isLink=computed(()=>Boolean(props.href))
const pending=computed(()=>Boolean(props.loading||internalPending.value))
const disabledState=computed(()=>Boolean(props.disabled||pending.value))
const iconOnly=computed(()=>!slots.default&&Boolean(props.icon||slots.icon||pending.value))
const accessibleLabel=computed(()=>props.ariaLabel||(iconOnly.value?(props.loadingText||props.icon||undefined):undefined))
const safeRel=computed(()=>props.rel||(props.target==='_blank'?'noopener noreferrer':''))
const state=computed(()=>pending.value?'loading':props.disabled?'disabled':props.pressed===true?'pressed':'ready')
const rootAttrs=computed(()=>{
  const {class:_class,style:_style,onClick:_click,...forwarded}=attrs
  const common={
    ...forwarded,
    'aria-label':accessibleLabel.value,
    'aria-busy':pending.value||undefined,
    'aria-disabled':disabledState.value||undefined,
    'aria-pressed':props.pressed===undefined?undefined:String(props.pressed),
  }
  if(isLink.value)return{
    ...common,
    href:disabledState.value?undefined:props.href,
    target:props.target||undefined,
    rel:safeRel.value||undefined,
    download:props.download||undefined,
    tabindex:disabledState.value?-1:forwarded.tabindex,
  }
  return{
    ...common,
    type:props.type,
    disabled:disabledState.value||undefined,
    autofocus:props.autofocus||undefined,
    form:props.form||undefined,
    name:props.name||undefined,
    value:props.value,
  }
})
const rootClasses=computed(()=>[
  `btn-${props.variant}`,
  resolvedSize.value!=='md'&&`btn-${resolvedSize.value}`,
  pending.value&&'btn-loading',props.block&&'is-block',
  props.shape!=='default'&&`shape-${props.shape}`,
  iconOnly.value&&'is-icon-only',props.iconPosition==='end'&&'icon-end',
  props.pressed===true&&'is-pressed',reducedMotion.value&&'motion-disabled',attrs.class,
])

function activationMeta(event,source=event?.detail===0?'keyboard':'pointer'){
  return{source,variant:props.variant,size:resolvedSize.value,href:props.href||undefined,pressed:props.pressed,pending:pending.value}
}
async function activate(event){
  if(disabledState.value){event?.preventDefault?.();event?.stopPropagation?.();return false}
  if(props.preventDefault)event.preventDefault()
  if(props.stopPropagation)event.stopPropagation()
  const source=nextActivationSource.value||undefined
  nextActivationSource.value=''
  const meta=activationMeta(event,source)
  emit('click',event,meta)
  if(!props.action)return meta
  internalPending.value=true
  const started={...meta,pending:true}
  emit('action-start',started,event)
  try{
    const result=await props.action(event,started)
    emit('action-success',result,started,event)
    return result
  }catch(error){
    emit('action-error',error,started,event)
    return false
  }finally{internalPending.value=false}
}
function focus(options){if(!root.value||disabledState.value)return false;root.value.focus(options);return typeof document!=='undefined'&&document.activeElement===root.value}
function blur(){if(!root.value)return false;root.value.blur();return typeof document==='undefined'||document.activeElement!==root.value}
function click(){if(!root.value||disabledState.value)return false;nextActivationSource.value='api';root.value.click();return true}

defineExpose({root,pending,focus,blur,click})
</script>

<template>
  <component :is="isLink?'a':'button'" ref="root" v-bind="rootAttrs" class="btn ui-button" :class="rootClasses" :style="attrs.style" :data-state="state" :data-icon-position="iconPosition" data-ui-button @click="activate">
    <span v-if="pending" class="ui-button-loading" aria-hidden="true"><slot name="loading" :pending="pending" :size="resolvedSize"><span class="spinner"/></slot></span>
    <span v-else-if="(icon||slots.icon)&&iconPosition==='start'" class="ui-button-icon ui-button-icon-start" aria-hidden="true"><slot name="icon" position="start" :size="iconSize"><AppIcon :name="icon" :size="iconSize"/></slot></span>
    <span v-if="slots.prefix" class="ui-button-prefix"><slot name="prefix" :pending="pending" :disabled="disabledState"/></span>
    <span v-if="slots.default||loadingText" class="ui-button-label"><template v-if="pending&&loadingText">{{ loadingText }}</template><slot v-else/></span>
    <span v-if="slots.suffix" class="ui-button-suffix"><slot name="suffix" :pending="pending" :disabled="disabledState"/></span>
    <span v-if="!pending&&(icon||slots.icon)&&iconPosition==='end'" class="ui-button-icon ui-button-icon-end" aria-hidden="true"><slot name="icon" position="end" :size="iconSize"><AppIcon :name="icon" :size="iconSize"/></slot></span>
  </component>
</template>

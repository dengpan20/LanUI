<script setup>
import { nextTick, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config-runtime.js'
const props=defineProps({modelValue:[String,Number],items:{type:Array,default:()=>[]},orientation:{type:String,default:'horizontal'},size:{type:String,default:'md'},panels:{type:Boolean,default:true}})
const emit=defineEmits(['update:modelValue','change','close'])
const buttons=ref([])
const direction=useDirection()
const {t}=useLocale()
const itemValue=item=>typeof item==='object'?item.value:item
const itemLabel=item=>typeof item==='object'?item.label:item
function select(item){if(item?.disabled)return;const value=itemValue(item);emit('update:modelValue',value);emit('change',value)}
async function keydown(event,index){const enabled=props.items.map((item,i)=>({item,i})).filter(({item})=>!item.disabled);const current=enabled.findIndex(entry=>entry.i===index);const previous=props.orientation==='vertical'?'ArrowUp':direction.value==='rtl'?'ArrowRight':'ArrowLeft';const next=props.orientation==='vertical'?'ArrowDown':direction.value==='rtl'?'ArrowLeft':'ArrowRight';let target=-1;if(event.key===next)target=(current+1)%enabled.length;if(event.key===previous)target=(current-1+enabled.length)%enabled.length;if(event.key==='Home')target=0;if(event.key==='End')target=enabled.length-1;if(target<0)return;event.preventDefault();select(enabled[target].item);await nextTick();buttons.value[enabled[target].i]?.focus()}
</script>
<template><div class="ui-tabs" :class="[`orientation-${orientation}`,`size-${size}`]" :data-active-value="String(modelValue)"><div class="ui-tabs-list" role="tablist" :aria-orientation="orientation"><span v-for="(item,index) in items" :key="itemValue(item)" class="ui-tab-wrap"><button :ref="el=>buttons[index]=el" type="button" role="tab" class="ui-tab" :id="`tab-${itemValue(item)}`" :aria-controls="panels?`panel-${itemValue(item)}`:undefined" :aria-selected="modelValue===itemValue(item)" :tabindex="modelValue===itemValue(item)?0:-1" :disabled="item.disabled" @click="select(item)" @keydown="keydown($event,index)"><AppIcon v-if="item.icon" :name="item.icon" :size="14"/><span>{{ itemLabel(item) }}</span></button><button v-if="item.closable" type="button" class="ui-tab-close" :aria-label="t('tabs.close',{label:itemLabel(item)})" @click="emit('close',itemValue(item))"><AppIcon name="close" :size="11"/></button></span></div><div v-if="panels" v-for="item in items" v-show="modelValue===itemValue(item)" :key="`panel-${itemValue(item)}`" class="ui-tab-panel" role="tabpanel" :id="`panel-${itemValue(item)}`" :aria-labelledby="`tab-${itemValue(item)}`" tabindex="0"><slot :name="`panel-${itemValue(item)}`" :item="item"><slot :item="item"/></slot></div></div></template>

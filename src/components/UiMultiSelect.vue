<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'
defineOptions({ inheritAttrs: false })

const props=defineProps({modelValue:{type:Array,default:()=>[]},options:{type:Array,default:()=>[]},placeholder:{type:String,default:''},searchable:Boolean,disabled:Boolean,invalid:Boolean,maxTagCount:{type:Number,default:2}})
const emit=defineEmits(['update:modelValue','change','open-change'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const root=ref(null)
const searchInput=ref(null)
const open=ref(false)
const query=ref('')
const activeIndex=ref(-1)
const listboxId=`ui-multi-list-${uid}`
const optionValue=o=>typeof o==='object'?o.value:o
const optionLabel=o=>typeof o==='object'?o.label:o
const filtered=computed(()=>props.options.filter(o=>!query.value||String(optionLabel(o)).toLowerCase().includes(query.value.toLowerCase())))
const selectedOptions=computed(()=>props.options.filter(o=>props.modelValue.includes(optionValue(o))))
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t('multiselect.placeholder'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const optionId=index=>`ui-multi-option-${uid}-${index}`
const activeDescendant=computed(()=>open.value&&activeIndex.value>=0?optionId(activeIndex.value):undefined)

function enabledIndex(start,delta){if(!filtered.value.length)return-1;let index=start;for(let count=0;count<filtered.value.length;count+=1){index=(index+delta+filtered.value.length)%filtered.value.length;if(!filtered.value[index]?.disabled)return index}return-1}
function setOpen(value){if(props.disabled)return;open.value=value;emit('open-change',value);if(value){activeIndex.value=enabledIndex(-1,1);if(props.searchable)nextTick(()=>searchInput.value?.focus())}else query.value=''}
function toggle(option){if(!option||option.disabled)return;const value=optionValue(option);const next=props.modelValue.includes(value)?props.modelValue.filter(item=>item!==value):[...props.modelValue,value];emit('update:modelValue',next);emit('change',next)}
function outside(event){if(root.value&&!root.value.contains(event.target))setOpen(false)}
function keydown(event){
  if(props.disabled)return
  if(!open.value&&['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();setOpen(true);return}
  if(!open.value)return
  if(event.key==='Escape'||event.key==='Tab'){setOpen(false);return}
  if(event.key==='ArrowDown'){event.preventDefault();activeIndex.value=enabledIndex(activeIndex.value,1)}
  else if(event.key==='ArrowUp'){event.preventDefault();activeIndex.value=enabledIndex(activeIndex.value,-1)}
  else if(event.key==='Home'){event.preventDefault();activeIndex.value=enabledIndex(-1,1)}
  else if(event.key==='End'){event.preventDefault();activeIndex.value=enabledIndex(0,-1)}
  else if((event.key==='Enter'||event.key===' ')&&filtered.value[activeIndex.value]){event.preventDefault();toggle(filtered.value[activeIndex.value])}
}
function searchKeydown(event){if(['ArrowDown','ArrowUp','Home','End','Enter','Escape','Tab'].includes(event.key))keydown(event)}
watch(filtered,list=>{if(activeIndex.value>=list.length||list[activeIndex.value]?.disabled)activeIndex.value=enabledIndex(-1,1)})
onMounted(()=>{document.addEventListener('pointerdown',outside)})
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside)})
</script>
<template><div ref="root" class="ui-multi-select" :class="[attrs.class,{open,disabled,invalid:resolvedInvalid}]" :style="attrs.style"><div v-bind="controlAttrs" :id="controlId" class="control ui-multi-select-trigger" role="combobox" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="open?listboxId:undefined" :aria-activedescendant="activeDescendant" :aria-disabled="disabled" :aria-invalid="resolvedInvalid || undefined" :aria-labelledby="labelledby" :aria-describedby="describedby" :tabindex="disabled?-1:0" @click="setOpen(!open)" @keydown="keydown"><span v-if="selectedOptions.length" class="ui-multi-tags"><span v-for="option in selectedOptions.slice(0,maxTagCount)" :key="optionValue(option)" class="ui-multi-tag">{{ optionLabel(option) }}<button type="button" :aria-label="t('multiselect.remove',{label:optionLabel(option)})" @click.stop="toggle(option)"><AppIcon name="close" :size="10"/></button></span><span v-if="selectedOptions.length>maxTagCount" class="ui-multi-tag">+{{ selectedOptions.length-maxTagCount }}</span></span><span v-else class="placeholder">{{ resolvedPlaceholder }}</span><AppIcon name="chevronDown" :size="14"/></div><Transition name="select-menu"><div v-if="open" :id="listboxId" class="ui-multi-menu" role="listbox" aria-multiselectable="true" :aria-labelledby="labelledby"><div v-if="searchable" class="ui-multi-search"><AppIcon name="search" :size="13"/><input ref="searchInput" v-model="query" :placeholder="t('multiselect.search')" :aria-label="t('multiselect.search')" :aria-controls="listboxId" :aria-activedescendant="activeDescendant" @keydown.stop="searchKeydown"/></div><button v-for="(option,index) in filtered" :id="optionId(index)" :key="optionValue(option)" type="button" role="option" tabindex="-1" :class="{active:index===activeIndex}" :aria-selected="modelValue.includes(optionValue(option))" :disabled="option.disabled" @mouseenter="!option.disabled&&(activeIndex=index)" @click="toggle(option)"><span class="ui-option-check"><AppIcon v-if="modelValue.includes(optionValue(option))" name="check" :size="11"/></span><span>{{ optionLabel(option) }}</span></button><div v-if="!filtered.length" class="ui-select-empty">{{ t('multiselect.empty') }}</div></div></Transition></div></template>

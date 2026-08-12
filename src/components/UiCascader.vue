<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config.js'
defineOptions({ inheritAttrs: false })

const props=defineProps({modelValue:{type:Array,default:()=>[]},options:{type:Array,default:()=>[]},placeholder:{type:String,default:''},disabled:Boolean,invalid:Boolean})
const emit=defineEmits(['update:modelValue','change','open-change'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const root=ref(null)
const open=ref(false)
const path=ref([])
const activeColumn=ref(0)
const activeIndex=ref(0)
const direction=useDirection()
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t('cascader.placeholder'))
const menuId=`ui-cascader-${uid}`

function sync(){let nodes=props.options;path.value=[];for(const value of props.modelValue){const node=nodes.find(item=>item.value===value);if(!node)break;path.value.push(node);nodes=node.children||[]}}
watch(()=>props.modelValue,sync,{immediate:true,deep:true})
const columns=computed(()=>{const result=[props.options];path.value.forEach(node=>{if(node.children?.length)result.push(node.children)});return result})
const label=computed(()=>path.value.map(node=>node.label).join(' / '))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const optionId=(column,index)=>`ui-cascader-option-${uid}-${column}-${index}`
const activeDescendant=computed(()=>open.value?optionId(activeColumn.value,activeIndex.value):undefined)
function enabledIndex(options,start,delta){if(!options?.length)return-1;let index=start;for(let count=0;count<options.length;count+=1){index=(index+delta+options.length)%options.length;if(!options[index]?.disabled)return index}return-1}
function setOpen(value){if(props.disabled)return;open.value=value;emit('open-change',value);if(value){activeColumn.value=Math.max(0,Math.min(columns.value.length-1,path.value.length-1));const options=columns.value[activeColumn.value]||[];const selectedIndex=options.findIndex(node=>path.value[activeColumn.value]?.value===node.value&&!node.disabled);activeIndex.value=selectedIndex>=0?selectedIndex:enabledIndex(options,-1,1)}}
function choose(node,index){if(!node||node.disabled)return;path.value=path.value.slice(0,index);path.value.push(node);if(node.children?.length){activeColumn.value=index+1;activeIndex.value=enabledIndex(node.children,-1,1)}else{const values=path.value.map(item=>item.value);emit('update:modelValue',values);emit('change',values,path.value);setOpen(false)}}
function keydown(event){
  if(props.disabled)return
  if(!open.value&&['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();setOpen(true);return}
  if(!open.value)return
  const options=columns.value[activeColumn.value]||[]
  const node=options[activeIndex.value]
  const forwardKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  const backKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  if(event.key==='Escape'||event.key==='Tab'){setOpen(false);return}
  if(event.key==='ArrowDown'){event.preventDefault();activeIndex.value=enabledIndex(options,activeIndex.value,1)}
  else if(event.key==='ArrowUp'){event.preventDefault();activeIndex.value=enabledIndex(options,activeIndex.value,-1)}
  else if(event.key==='Home'){event.preventDefault();activeIndex.value=enabledIndex(options,-1,1)}
  else if(event.key==='End'){event.preventDefault();activeIndex.value=enabledIndex(options,0,-1)}
  else if(event.key===forwardKey&&node?.children?.length){event.preventDefault();choose(node,activeColumn.value)}
  else if(event.key===backKey&&activeColumn.value>0){event.preventDefault();activeColumn.value-=1;const parentOptions=columns.value[activeColumn.value]||[];activeIndex.value=Math.max(0,parentOptions.findIndex(item=>item.value===path.value[activeColumn.value]?.value))}
  else if((event.key==='Enter'||event.key===' ')&&node){event.preventDefault();choose(node,activeColumn.value)}
}
function outside(event){if(root.value&&!root.value.contains(event.target))setOpen(false)}
onMounted(()=>document.addEventListener('pointerdown',outside))
onBeforeUnmount(()=>document.removeEventListener('pointerdown',outside))
</script>
<template><div ref="root" class="ui-cascader" :class="[attrs.class,{open,invalid:resolvedInvalid}]" :style="attrs.style"><button v-bind="controlAttrs" :id="controlId" type="button" class="control ui-cascader-trigger" role="combobox" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="open?menuId:undefined" :aria-activedescendant="activeDescendant" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :disabled="disabled" @click="setOpen(!open)" @keydown="keydown"><span :class="{placeholder:!label}">{{ label||resolvedPlaceholder }}</span><AppIcon name="chevronDown" :size="14"/></button><Transition name="select-menu"><div v-if="open" :id="menuId" class="ui-cascader-menu"><div v-for="(options,columnIndex) in columns" :key="columnIndex" class="ui-cascader-column" role="listbox" :aria-label="t('cascader.level',{level:columnIndex+1})"><button v-for="(node,index) in options" :id="optionId(columnIndex,index)" :key="node.value" type="button" role="option" tabindex="-1" :class="{active:columnIndex===activeColumn&&index===activeIndex}" :aria-selected="path[columnIndex]?.value===node.value" :disabled="node.disabled" @mouseenter="!node.disabled&&(activeColumn=columnIndex,activeIndex=index)" @click="choose(node,columnIndex)"><span>{{ node.label }}</span><AppIcon v-if="node.children?.length" class="ui-directional-icon" name="chevronRight" :size="12"/></button></div></div></Transition></div></template>

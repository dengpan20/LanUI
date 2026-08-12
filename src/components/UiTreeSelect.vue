<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config.js'
defineOptions({ inheritAttrs: false })

const props=defineProps({modelValue:[String,Number],options:{type:Array,default:()=>[]},placeholder:{type:String,default:''},disabled:Boolean,invalid:Boolean})
const emit=defineEmits(['update:modelValue','change','open-change'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const root=ref(null)
const open=ref(false)
const expanded=ref(new Set())
const activeIndex=ref(-1)
const direction=useDirection()
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t('tree.placeholder'))
const treeId=`ui-tree-${uid}`
const flat=computed(()=>{const result=[];const walk=(nodes,level=0)=>nodes.forEach(node=>{result.push({...node,level});if(node.children?.length&&expanded.value.has(node.value))walk(node.children,level+1)});walk(props.options);return result})
const find=(nodes,value)=>{for(const node of nodes){if(node.value===value)return node;const child=find(node.children||[],value);if(child)return child}}
const selected=computed(()=>find(props.options,props.modelValue))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style'].includes(key))))
const itemId=index=>`ui-tree-item-${uid}-${index}`
const activeDescendant=computed(()=>open.value&&activeIndex.value>=0?itemId(activeIndex.value):undefined)

function enabledIndex(start,delta){if(!flat.value.length)return-1;let index=start;for(let count=0;count<flat.value.length;count+=1){index=(index+delta+flat.value.length)%flat.value.length;if(!flat.value[index]?.disabled)return index}return-1}
function setOpen(value){if(props.disabled)return;open.value=value;emit('open-change',value);if(value){const selectedIndex=flat.value.findIndex(node=>node.value===props.modelValue&&!node.disabled);activeIndex.value=selectedIndex>=0?selectedIndex:enabledIndex(-1,1)}}
function expand(node,value){const next=new Set(expanded.value);const shouldExpand=value??!next.has(node.value);shouldExpand?next.add(node.value):next.delete(node.value);expanded.value=next}
function select(node){if(!node||node.disabled)return;emit('update:modelValue',node.value);emit('change',node.value,node);setOpen(false)}
function parentIndex(index){const level=flat.value[index]?.level??0;for(let i=index-1;i>=0;i-=1)if(flat.value[i].level===level-1)return i;return index}
function keydown(event){
  if(props.disabled)return
  if(!open.value&&['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();setOpen(true);return}
  if(!open.value)return
  const node=flat.value[activeIndex.value]
  const expandKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  const collapseKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  if(event.key==='Escape'||event.key==='Tab'){setOpen(false);return}
  if(event.key==='ArrowDown'){event.preventDefault();activeIndex.value=enabledIndex(activeIndex.value,1)}
  else if(event.key==='ArrowUp'){event.preventDefault();activeIndex.value=enabledIndex(activeIndex.value,-1)}
  else if(event.key==='Home'){event.preventDefault();activeIndex.value=enabledIndex(-1,1)}
  else if(event.key==='End'){event.preventDefault();activeIndex.value=enabledIndex(0,-1)}
  else if(event.key===expandKey&&node?.children?.length){event.preventDefault();if(!expanded.value.has(node.value))expand(node,true);else activeIndex.value=Math.min(activeIndex.value+1,flat.value.length-1)}
  else if(event.key===collapseKey&&node){event.preventDefault();if(node.children?.length&&expanded.value.has(node.value))expand(node,false);else activeIndex.value=parentIndex(activeIndex.value)}
  else if((event.key==='Enter'||event.key===' ')&&node){event.preventDefault();select(node)}
}
function outside(event){if(root.value&&!root.value.contains(event.target))setOpen(false)}
watch(flat,list=>{if(activeIndex.value>=list.length||list[activeIndex.value]?.disabled)activeIndex.value=enabledIndex(-1,1)})
onMounted(()=>document.addEventListener('pointerdown',outside))
onBeforeUnmount(()=>document.removeEventListener('pointerdown',outside))
</script>
<template><div ref="root" class="ui-tree-select" :class="[attrs.class,{open,invalid:resolvedInvalid}]" :style="attrs.style"><button v-bind="controlAttrs" :id="controlId" type="button" class="control ui-tree-trigger" role="combobox" aria-haspopup="tree" :aria-expanded="open" :aria-controls="open?treeId:undefined" :aria-activedescendant="activeDescendant" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :disabled="disabled" @click="setOpen(!open)" @keydown="keydown"><span :class="{placeholder:!selected}">{{ selected?.label||resolvedPlaceholder }}</span><AppIcon name="chevronDown" :size="14"/></button><Transition name="select-menu"><div v-if="open" :id="treeId" class="ui-tree-menu" role="tree" :aria-labelledby="labelledby"><div v-for="(node,index) in flat" :id="itemId(index)" :key="node.value" class="ui-tree-select-row" :class="{active:index===activeIndex}" :style="{paddingInlineStart:`${8+node.level*18}px`}" role="treeitem" :aria-level="node.level+1" :aria-expanded="node.children?.length?expanded.has(node.value):undefined" :aria-selected="modelValue===node.value" @mouseenter="!node.disabled&&(activeIndex=index)"><button v-if="node.children?.length" type="button" tabindex="-1" class="ui-tree-select-expand" :aria-label="t(expanded.has(node.value)?'tree.collapse':'tree.expand')" @click="expand(node)"><AppIcon class="ui-directional-icon" name="chevronRight" :size="12"/></button><span v-else class="ui-tree-select-spacer"/><button type="button" tabindex="-1" class="ui-tree-select-node-label" :disabled="node.disabled" @click="select(node)">{{ node.label }}</button></div></div></Transition></div></template>

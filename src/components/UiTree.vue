<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useDirection, useLocale } from '../config.js'

defineOptions({inheritAttrs:false})

const props=defineProps({
  data:{type:Array,default:()=>[]},
  modelValue:{type:[String,Number,Array],default:undefined},
  expandedKeys:{type:Array,default:undefined},
  checkedKeys:{type:Array,default:undefined},
  defaultValue:{type:[String,Number,Array],default:undefined},
  defaultExpandedKeys:{type:Array,default:()=>[]},
  defaultCheckedKeys:{type:Array,default:()=>[]},
  multiple:Boolean,
  selectable:{type:Boolean,default:true},
  checkable:Boolean,
  checkStrictly:Boolean,
  defaultExpandAll:Boolean,
  accordion:Boolean,
  disabled:Boolean,
  invalid:Boolean,
  filter:{type:String,default:''},
  filterMethod:Function,
  loadData:Function,
  showIcon:{type:Boolean,default:true},
  showLine:Boolean,
  bordered:Boolean,
  expandOnClickNode:Boolean,
  checkOnClickNode:Boolean,
  virtual:Boolean,
  height:{type:[Number,String],default:undefined},
  itemHeight:{type:Number,default:34},
  overscan:{type:Number,default:4},
  indent:{type:Number,default:20},
  nodeKey:{type:String,default:'value'},
  labelKey:{type:String,default:'label'},
  childrenKey:{type:String,default:'children'},
  emptyText:{type:String,default:''},
  size:{type:String,default:''},
})
const emit=defineEmits([
  'update:modelValue','select-change','node-click',
  'update:expandedKeys','expand-change',
  'update:checkedKeys','check-change',
  'load','load-error','data-error','focus','blur',
])

const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const activeKey=ref(undefined)
const selectionAnchor=ref(undefined)
const scrollTop=ref(0)
const internalValue=ref(props.defaultValue)
const internalExpanded=ref(new Set(props.defaultExpandedKeys))
const internalChecked=ref(new Set(props.defaultCheckedKeys))
const loadedChildren=ref(new Map())
const loadingKeys=ref(new Set())
const loadErrors=ref(new Map())
const requestControllers=new Map()
const requestSequences=new Map()
let resizeObserver=null
let typeahead=''
let typeaheadTimer=null
let defaultExpandInitialized=false
let defaultCheckInitialized=false

const {t}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(computed(()=>props.size))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-tree-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedEmptyText=computed(()=>props.emptyText||t('tree.empty'))
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','tabindex','aria-labelledby','aria-describedby','aria-invalid'].includes(key))))
const getKey=node=>node?.[props.nodeKey]??node?.value
const getLabel=node=>String(node?.[props.labelKey]??node?.label??getKey(node)??'')
const rawChildren=node=>Array.isArray(node?.[props.childrenKey])?node[props.childrenKey]:[]
const childrenFor=node=>loadedChildren.value.has(getKey(node))?loadedChildren.value.get(getKey(node)):rawChildren(node)
const checkboxDisabled=node=>props.disabled||node?.disabled||node?.disableCheckbox||node?.checkable===false
const selectableDisabled=node=>props.disabled||node?.disabled||node?.selectable===false

const treeModel=computed(()=>{
  const records=[]
  const byKey=new Map()
  const childrenByParent=new Map()
  const errors=[]
  function walk(nodes,parent=null,level=1){
    const list=Array.isArray(nodes)?nodes:[]
    list.forEach((node,position)=>{
      const key=getKey(node)
      if(key===undefined||key===null||key===''){errors.push({code:'missing-key',node});return}
      if(byKey.has(key)){errors.push({code:'duplicate-key',key,node});return}
      const children=childrenFor(node)
      const loaded=loadedChildren.value.has(key)
      const branch=loaded?children.length>0:children.length>0||Boolean(props.loadData&&node?.isLeaf===false)
      const record={key,node,parentKey:parent?.key,parent,level,position:position+1,setSize:list.length,branch,children}
      byKey.set(key,record);records.push(record)
      if(parent){const siblings=childrenByParent.get(parent.key)||[];siblings.push(record);childrenByParent.set(parent.key,siblings)}
      else{const roots=childrenByParent.get(undefined)||[];roots.push(record);childrenByParent.set(undefined,roots)}
      if(children.length)walk(children,record,level+1)
    })
  }
  walk(props.data)
  for(const siblings of childrenByParent.values())siblings.forEach((record,index)=>{record.position=index+1;record.setSize=siblings.length})
  records.forEach((record,index)=>{record.index=index})
  return {records,byKey,childrenByParent,errors}
})

const expandedSet=computed(()=>props.expandedKeys===undefined?internalExpanded.value:new Set(props.expandedKeys))
const checkedSet=computed(()=>props.checkedKeys===undefined?internalChecked.value:new Set(props.checkedKeys))
const selectedSet=computed(()=>{
  const value=props.modelValue===undefined?internalValue.value:props.modelValue
  return new Set(Array.isArray(value)?value:value===undefined||value===null?[]:[value])
})

function ownFilterMatch(record,query){
  if(!query)return true
  try{return props.filterMethod?Boolean(props.filterMethod(query,record.node)):getLabel(record.node).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
  catch{return false}
}
const filterVisibleKeys=computed(()=>{
  const query=props.filter.trim()
  if(!query)return null
  const visible=new Set()
  for(let index=treeModel.value.records.length-1;index>=0;index-=1){
    const record=treeModel.value.records[index]
    const childVisible=(treeModel.value.childrenByParent.get(record.key)||[]).some(child=>visible.has(child.key))
    if(ownFilterMatch(record,query)||childVisible)visible.add(record.key)
  }
  return visible
})
const visibleRecords=computed(()=>treeModel.value.records.filter(record=>{
  if(filterVisibleKeys.value)return filterVisibleKeys.value.has(record.key)
  let parent=record.parent
  while(parent){if(!expandedSet.value.has(parent.key))return false;parent=parent.parent}
  return true
}).map((record,visibleIndex)=>({...record,visibleIndex})))

function stateFor(record,set=checkedSet.value,memo=new Map()){
  if(!record)return {checked:false,indeterminate:false}
  if(memo.has(record.key))return memo.get(record.key)
  const children=(treeModel.value.childrenByParent.get(record.key)||[]).filter(child=>!checkboxDisabled(child.node))
  let state
  if(props.checkStrictly||!children.length)state={checked:set.has(record.key),indeterminate:false}
  else{
    const states=children.map(child=>stateFor(child,set,memo))
    const checked=states.length>0&&states.every(item=>item.checked)
    state={checked,indeterminate:!checked&&states.some(item=>item.checked||item.indeterminate)}
  }
  memo.set(record.key,state);return state
}
const checkStates=computed(()=>{
  const memo=new Map()
  for(let index=treeModel.value.records.length-1;index>=0;index-=1)stateFor(treeModel.value.records[index],checkedSet.value,memo)
  return memo
})
const halfCheckedKeys=computed(()=>treeModel.value.records.filter(record=>checkStates.value.get(record.key)?.indeterminate).map(record=>record.key))

const treeHeight=computed(()=>{
  const value=props.height??(props.virtual?320:undefined)
  return value===undefined?undefined:typeof value==='number'?`${value}px`:value
})
const measuredViewport=ref(320)
const viewportHeight=computed(()=>{
  if(typeof props.height==='number')return props.height
  if(typeof props.height==='string'&&/^\s*\d+(?:\.\d+)?px\s*$/.test(props.height))return parseFloat(props.height)
  return measuredViewport.value
})
const normalizedItemHeight=computed(()=>Math.max(24,Number.isFinite(props.itemHeight)?props.itemHeight:34))
const virtualRange=computed(()=>{
  if(!props.virtual)return {start:0,end:visibleRecords.value.length}
  const viewport=Math.max(1,viewportHeight.value||320)
  const overscan=Math.max(0,Math.floor(props.overscan))
  const start=Math.max(0,Math.floor(scrollTop.value/normalizedItemHeight.value)-overscan)
  return {start,end:Math.min(visibleRecords.value.length,Math.ceil((scrollTop.value+viewport)/normalizedItemHeight.value)+overscan)}
})
const renderedRecords=computed(()=>visibleRecords.value.slice(virtualRange.value.start,virtualRange.value.end))
const rootStyle=computed(()=>[attrs.style,{
  ...(treeHeight.value?{height:treeHeight.value}:{}),
  ...(props.virtual?{overflow:'auto'}:{}),
}])
const contentStyle=computed(()=>props.virtual?{height:`${visibleRecords.value.length*normalizedItemHeight.value}px`}:undefined)
const recordStyle=record=>({
  paddingInlineStart:`${8+(record.level-1)*Math.max(12,props.indent)}px`,
  '--tree-line-offset':`${Math.max(8,8+(record.level-1)*Math.max(12,props.indent)-Math.max(12,props.indent)/2)}px`,
  ...(props.virtual?{position:'absolute',insetInline:'0',top:`${record.visibleIndex*normalizedItemHeight.value}px`,height:`${normalizedItemHeight.value}px`}:{}),
})
const itemId=record=>`ui-tree-node-${uid}-${record.index}`
const activeRecord=computed(()=>treeModel.value.byKey.get(activeKey.value))
const activeDescendant=computed(()=>activeRecord.value&&visibleRecords.value.some(record=>record.key===activeRecord.value.key)?itemId(activeRecord.value):undefined)

function orderedKeys(set){return treeModel.value.records.filter(record=>set.has(record.key)).map(record=>record.key)}
function updateExpanded(next,record,expanded,source='pointer'){
  internalExpanded.value=next
  const keys=orderedKeys(next)
  emit('update:expandedKeys',keys)
  emit('expand-change',keys,record.node,{expanded,source})
}
function abortLoad(key){requestControllers.get(key)?.abort();requestControllers.delete(key)}
async function loadRecord(record){
  if(!props.loadData||!record?.branch||rawChildren(record.node).length||loadedChildren.value.has(record.key)||loadingKeys.value.has(record.key))return
  abortLoad(record.key)
  const sequence=(requestSequences.get(record.key)||0)+1
  requestSequences.set(record.key,sequence)
  const controller=typeof AbortController==='undefined'?null:new AbortController()
  if(controller)requestControllers.set(record.key,controller)
  loadingKeys.value=new Set([...loadingKeys.value,record.key])
  const errors=new Map(loadErrors.value);errors.delete(record.key);loadErrors.value=errors
  try{
    const result=await props.loadData(record.node,{signal:controller?.signal})
    if(requestSequences.get(record.key)!==sequence||controller?.signal.aborted)return
    const children=Array.isArray(result)?result:[]
    const nextLoaded=new Map(loadedChildren.value);nextLoaded.set(record.key,children);loadedChildren.value=nextLoaded
    emit('load',{node:record.node,children})
    if(!props.checkStrictly&&checkedSet.value.has(record.key)&&children.length){
      await nextTick()
      const next=new Set(checkedSet.value)
      const refreshed=treeModel.value.byKey.get(record.key)
      for(const child of treeModel.value.childrenByParent.get(refreshed?.key)||[])addCheckableSubtree(child,next)
      normalizeParentChecks(next)
      commitChecked(next,refreshed,true,'load')
    }
    if(props.defaultExpandAll&&props.expandedKeys===undefined){
      const expanded=new Set(internalExpanded.value)
      treeModel.value.records.filter(item=>item.branch).forEach(item=>expanded.add(item.key))
      internalExpanded.value=expanded
    }
  }catch(error){
    if(requestSequences.get(record.key)!==sequence||controller?.signal.aborted||error?.name==='AbortError')return
    const nextErrors=new Map(loadErrors.value);nextErrors.set(record.key,error);loadErrors.value=nextErrors
    emit('load-error',{error,node:record.node})
  }finally{
    if(requestSequences.get(record.key)===sequence){
      const loading=new Set(loadingKeys.value);loading.delete(record.key);loadingKeys.value=loading
      requestControllers.delete(record.key)
    }
  }
}
function setExpanded(record,expanded,source='pointer'){
  if(!record?.branch||props.disabled||record.node?.disabled)return
  const next=new Set(expandedSet.value)
  if(expanded){
    if(props.accordion)for(const sibling of treeModel.value.childrenByParent.get(record.parentKey)||[])next.delete(sibling.key)
    next.add(record.key);void loadRecord(record)
  }else next.delete(record.key)
  updateExpanded(next,record,expanded,source)
}
function toggleExpanded(record,source='pointer'){setExpanded(record,!expandedSet.value.has(record.key),source)}

function commitSelection(value,record,selected,source){
  internalValue.value=value
  emit('update:modelValue',value)
  emit('select-change',value,record.node,{selected,source})
}
function selectRecord(record,source='pointer',event=null){
  if(!props.selectable||selectableDisabled(record?.node))return
  if(props.multiple){
    const next=new Set(selectedSet.value)
    if(event?.shiftKey&&selectionAnchor.value!==undefined){
      const start=visibleRecords.value.findIndex(item=>item.key===selectionAnchor.value)
      const end=visibleRecords.value.findIndex(item=>item.key===record.key)
      if(start>=0&&end>=0)for(const item of visibleRecords.value.slice(Math.min(start,end),Math.max(start,end)+1))if(!selectableDisabled(item.node))next.add(item.key)
    }else if(event?.ctrlKey||event?.metaKey){next.has(record.key)?next.delete(record.key):next.add(record.key)}
    else{next.clear();next.add(record.key)}
    selectionAnchor.value=record.key
    commitSelection(orderedKeys(next),record,next.has(record.key),source)
  }else{selectionAnchor.value=record.key;commitSelection(record.key,record,true,source)}
}

function addCheckableSubtree(record,set){
  if(!record||checkboxDisabled(record.node))return
  set.add(record.key)
  if(!props.checkStrictly)for(const child of treeModel.value.childrenByParent.get(record.key)||[])addCheckableSubtree(child,set)
}
function removeCheckableSubtree(record,set){
  if(!record||checkboxDisabled(record.node))return
  set.delete(record.key)
  if(!props.checkStrictly)for(const child of treeModel.value.childrenByParent.get(record.key)||[])removeCheckableSubtree(child,set)
}
function normalizeParentChecks(set){
  if(props.checkStrictly)return
  for(let index=treeModel.value.records.length-1;index>=0;index-=1){
    const record=treeModel.value.records[index]
    if(checkboxDisabled(record.node))continue
    const children=(treeModel.value.childrenByParent.get(record.key)||[]).filter(child=>!checkboxDisabled(child.node))
    if(!children.length)continue
    const all=children.every(child=>stateFor(child,set,new Map()).checked)
    all?set.add(record.key):set.delete(record.key)
  }
}
function commitChecked(next,record,checked,source){
  internalChecked.value=next
  const keys=orderedKeys(next)
  const memo=new Map();treeModel.value.records.forEach(item=>stateFor(item,next,memo))
  const half=treeModel.value.records.filter(item=>memo.get(item.key)?.indeterminate).map(item=>item.key)
  emit('update:checkedKeys',keys)
  emit('check-change',keys,{node:record.node,checked,halfCheckedKeys:half,source})
}
function toggleChecked(record,source='pointer'){
  if(!props.checkable||checkboxDisabled(record?.node))return
  const next=new Set(checkedSet.value)
  const checked=checkStates.value.get(record.key)?.checked
  checked?removeCheckableSubtree(record,next):addCheckableSubtree(record,next)
  normalizeParentChecks(next)
  commitChecked(next,record,!checked,source)
}

function activate(record,{focus=true}={}){
  if(!record||record.node?.disabled)return
  activeKey.value=record.key
  if(focus)rootRef.value?.focus({preventScroll:true})
  void nextTick(ensureActiveVisible)
}
function ensureActiveVisible(){
  const index=visibleRecords.value.findIndex(record=>record.key===activeKey.value)
  if(index<0||!rootRef.value)return
  if(props.virtual){
    const top=index*normalizedItemHeight.value,bottom=top+normalizedItemHeight.value
    if(top<rootRef.value.scrollTop)rootRef.value.scrollTop=top
    else if(bottom>rootRef.value.scrollTop+rootRef.value.clientHeight)rootRef.value.scrollTop=bottom-rootRef.value.clientHeight
  }else rootRef.value.querySelector(`#${CSS.escape(itemId(visibleRecords.value[index]))}`)?.scrollIntoView?.({block:'nearest'})
}
function enabledVisibleIndex(start,delta){
  if(!visibleRecords.value.length)return-1
  let index=start
  for(let count=0;count<visibleRecords.value.length;count+=1){
    index=(index+delta+visibleRecords.value.length)%visibleRecords.value.length
    if(!visibleRecords.value[index]?.node?.disabled)return index
  }
  return-1
}
function move(delta){
  const current=visibleRecords.value.findIndex(record=>record.key===activeKey.value)
  const index=enabledVisibleIndex(current<0?(delta>0?-1:0):current,delta)
  if(index>=0)activate(visibleRecords.value[index],{focus:false})
}
function selectBoundary(end=false){const index=enabledVisibleIndex(end?0:-1,end?-1:1);if(index>=0)activate(visibleRecords.value[index],{focus:false})}
function parentRecord(record){return record?.parentKey===undefined?undefined:treeModel.value.byKey.get(record.parentKey)}
function firstChild(record){return (treeModel.value.childrenByParent.get(record?.key)||[]).find(child=>!child.node?.disabled)}
function expandSiblings(record){
  const siblings=(treeModel.value.childrenByParent.get(record?.parentKey)||[]).filter(sibling=>sibling.branch&&!sibling.node?.disabled)
  if(!siblings.length)return
  const next=new Set(expandedSet.value)
  siblings.forEach(sibling=>{next.add(sibling.key);void loadRecord(sibling)})
  updateExpanded(next,record,true,'keyboard')
}
function runTypeahead(character){
  clearTimeout(typeaheadTimer);typeahead+=character.toLocaleLowerCase();typeaheadTimer=setTimeout(()=>{typeahead=''},500)
  const current=visibleRecords.value.findIndex(record=>record.key===activeKey.value)
  for(let offset=1;offset<=visibleRecords.value.length;offset+=1){const record=visibleRecords.value[(current+offset+visibleRecords.value.length)%visibleRecords.value.length];if(!record.node?.disabled&&getLabel(record.node).toLocaleLowerCase().startsWith(typeahead)){activate(record,{focus:false});break}}
}
function onKeydown(event){
  if(props.disabled)return
  const record=activeRecord.value||visibleRecords.value.find(item=>!item.node?.disabled)
  if(!record)return
  const expandKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  const collapseKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  if(event.key==='ArrowDown'){event.preventDefault();move(1)}
  else if(event.key==='ArrowUp'){event.preventDefault();move(-1)}
  else if(event.key==='Home'){event.preventDefault();selectBoundary(false)}
  else if(event.key==='End'){event.preventDefault();selectBoundary(true)}
  else if(event.key===expandKey){event.preventDefault();if(record.branch&&!expandedSet.value.has(record.key))setExpanded(record,true,'keyboard');else{const child=firstChild(record);if(child)activate(child,{focus:false})}}
  else if(event.key===collapseKey){event.preventDefault();if(record.branch&&expandedSet.value.has(record.key))setExpanded(record,false,'keyboard');else{const parent=parentRecord(record);if(parent)activate(parent,{focus:false})}}
  else if(event.key==='*'){event.preventDefault();expandSiblings(record)}
  else if(event.key==='Enter'){event.preventDefault();selectRecord(record,'keyboard',event)}
  else if(event.key===' '){event.preventDefault();props.checkable?toggleChecked(record,'keyboard'):selectRecord(record,'keyboard',event)}
  else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)runTypeahead(event.key)
}
function onNodeClick(record,event){
  activate(record)
  emit('node-click',record.node,event)
  if(props.checkOnClickNode&&props.checkable)toggleChecked(record,'pointer')
  else selectRecord(record,'pointer',event)
  if(props.expandOnClickNode&&record.branch)toggleExpanded(record,'pointer')
}
function onFocus(event){if(activeKey.value===undefined){const first=visibleRecords.value.find(record=>!record.node?.disabled);if(first)activeKey.value=first.key}emit('focus',event)}
function onScroll(event){scrollTop.value=event.currentTarget.scrollTop}
function retryLoad(record,event){event.stopPropagation();const errors=new Map(loadErrors.value);errors.delete(record.key);loadErrors.value=errors;void loadRecord(record)}
function focus(options){rootRef.value?.focus(options)}
defineExpose({focus,activeKey,halfCheckedKeys})

watch(()=>props.data,()=>{
  for(const key of requestControllers.keys())abortLoad(key)
  requestSequences.clear();loadedChildren.value=new Map();loadErrors.value=new Map();loadingKeys.value=new Set()
},{deep:true})
watch(()=>props.loadData,()=>{for(const key of requestControllers.keys())abortLoad(key);requestSequences.clear();loadedChildren.value=new Map();loadErrors.value=new Map();loadingKeys.value=new Set()})
watch(()=>treeModel.value.errors.map(error=>`${error.code}:${String(error.key??'')}`).join('|'),signature=>{if(signature)emit('data-error',{errors:treeModel.value.errors})},{immediate:true})
watch(()=>treeModel.value.records.map(record=>record.key),()=>{
  if(!defaultExpandInitialized&&props.expandedKeys===undefined&&treeModel.value.records.length){
    defaultExpandInitialized=true
    if(props.defaultExpandAll)internalExpanded.value=new Set(treeModel.value.records.filter(record=>record.branch).map(record=>record.key))
  }
  if(!defaultCheckInitialized&&props.checkedKeys===undefined&&(treeModel.value.records.length||!props.defaultCheckedKeys.length)){
    defaultCheckInitialized=true
    const next=new Set()
    for(const key of props.defaultCheckedKeys){const record=treeModel.value.byKey.get(key);if(record)addCheckableSubtree(record,next)}
    normalizeParentChecks(next);internalChecked.value=next
  }
},{immediate:true})
watch(visibleRecords,records=>{if(!records.some(record=>record.key===activeKey.value)){const first=records.find(record=>!record.node?.disabled);activeKey.value=first?.key}})
onMounted(()=>{
  const measure=()=>{if(rootRef.value?.clientHeight)measuredViewport.value=rootRef.value.clientHeight}
  measure()
  if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(measure);resizeObserver.observe(rootRef.value)}
})
onBeforeUnmount(()=>{clearTimeout(typeaheadTimer);resizeObserver?.disconnect();for(const key of requestControllers.keys())abortLoad(key)})
</script>

<template>
  <div
    v-bind="controlAttrs"
    :id="controlId"
    ref="rootRef"
    class="ui-tree"
    :class="[`size-${resolvedSize}`,attrs.class,{disabled,bordered,invalid:resolvedInvalid,checkable,virtual,'show-line':showLine}]"
    :style="rootStyle"
    role="tree"
    :tabindex="disabled?-1:(attrs.tabindex??0)"
    :aria-disabled="disabled||undefined"
    :aria-multiselectable="multiple||undefined"
    :aria-activedescendant="activeDescendant"
    :aria-labelledby="labelledby"
    :aria-describedby="describedby"
    :aria-invalid="resolvedInvalid||undefined"
    :aria-busy="loadingKeys.size>0||undefined"
    @keydown="onKeydown"
    @focus="onFocus"
    @blur="emit('blur',$event)"
    @scroll="onScroll"
  >
    <div v-if="visibleRecords.length" class="ui-tree-content" role="none" :style="contentStyle">
      <div
        v-for="record in renderedRecords"
        :id="itemId(record)"
        :key="record.key"
        class="ui-tree-node"
        :class="{active:record.key===activeKey,selected:selectedSet.has(record.key),disabled:record.node.disabled,expanded:expandedSet.has(record.key),loading:loadingKeys.has(record.key),error:loadErrors.has(record.key)}"
        :style="recordStyle(record)"
        role="treeitem"
        :aria-level="record.level"
        :aria-posinset="record.position"
        :aria-setsize="record.setSize"
        :aria-expanded="record.branch?expandedSet.has(record.key):undefined"
        :aria-selected="selectable?selectedSet.has(record.key):undefined"
        :aria-disabled="record.node.disabled||undefined"
        @mouseenter="!record.node.disabled&&activate(record,{focus:false})"
        @click="onNodeClick(record,$event)"
      >
        <button v-if="record.branch" type="button" tabindex="-1" class="ui-tree-toggle" :disabled="disabled||record.node.disabled" :aria-label="t(expandedSet.has(record.key)?'tree.collapseNode':'tree.expandNode',{label:getLabel(record.node)})" @click.stop="toggleExpanded(record)">
          <AppIcon v-if="loadingKeys.has(record.key)" class="ui-tree-loading" name="refresh" :size="13"/>
          <AppIcon v-else class="ui-directional-icon" name="chevronRight" :size="13"/>
        </button>
        <span v-else class="ui-tree-toggle-spacer" aria-hidden="true"/>
        <button v-if="checkable" type="button" tabindex="-1" class="ui-tree-check" role="checkbox" :aria-checked="checkStates.get(record.key)?.indeterminate?'mixed':String(checkStates.get(record.key)?.checked||false)" :aria-label="t(checkStates.get(record.key)?.checked?'tree.uncheckNode':'tree.checkNode',{label:getLabel(record.node)})" :disabled="checkboxDisabled(record.node)" @click.stop="activate(record);toggleChecked(record)">
          <AppIcon v-if="checkStates.get(record.key)?.checked" name="check" :size="12"/>
          <span v-else-if="checkStates.get(record.key)?.indeterminate" class="ui-tree-check-minus" aria-hidden="true"/>
        </button>
        <span v-if="showIcon" class="ui-tree-icon" aria-hidden="true"><slot name="icon" :node="record.node" :expanded="expandedSet.has(record.key)"><AppIcon :name="record.node.icon||(record.branch?'folder':'file')" :size="15"/></slot></span>
        <span class="ui-tree-label"><slot name="node" :node="record.node" :level="record.level" :selected="selectedSet.has(record.key)" :checked="checkStates.get(record.key)?.checked||false" :indeterminate="checkStates.get(record.key)?.indeterminate||false" :expanded="expandedSet.has(record.key)" :loading="loadingKeys.has(record.key)">{{ getLabel(record.node) }}</slot></span>
        <button v-if="loadErrors.has(record.key)" type="button" tabindex="-1" class="ui-tree-retry" :aria-label="t('tree.retryNode',{label:getLabel(record.node)})" @click="retryLoad(record,$event)"><AppIcon name="refresh" :size="13"/>{{ t('tree.retry') }}</button>
        <span v-else-if="loadingKeys.has(record.key)" class="ui-tree-status" role="status">{{ t('tree.loading') }}</span>
        <span v-if="$slots.suffix" class="ui-tree-suffix"><slot name="suffix" :node="record.node"/></span>
      </div>
    </div>
    <div v-else class="ui-tree-empty"><slot name="empty"><AppIcon name="folder" :size="20"/><span>{{ resolvedEmptyText }}</span></slot></div>
  </div>
</template>

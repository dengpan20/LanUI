<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { focusWithRetry } from './focusUtils.js'
import { scrollElementWithin } from './scrollUtils.js'
import { useComponentSize, useDirection, useLanUiConfig, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number,Array],default:undefined},
  defaultValue:{type:[String,Number,Array],default:undefined},
  open:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  options:{type:Array,default:()=>[]},
  fieldNames:{type:Object,default:()=>({})},
  placeholder:{type:String,default:''},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  loading:Boolean,
  clearable:Boolean,
  clearValue:{type:[String,Number],default:''},
  multiple:Boolean,
  checkable:Boolean,
  checkStrictly:Boolean,
  selectable:{type:Boolean,default:true},
  expandedKeys:{type:Array,default:undefined},
  defaultExpandedKeys:{type:Array,default:()=>[]},
  defaultExpandAll:Boolean,
  expandOnClickNode:Boolean,
  closeOnSelect:{type:Boolean,default:undefined},
  searchable:Boolean,
  filterNode:{type:[Boolean,Function],default:true},
  loadData:Function,
  virtual:Boolean,
  height:{type:[Number,String],default:260},
  itemHeight:{type:Number,default:34},
  overscan:{type:Number,default:4},
  indent:{type:Number,default:18},
  maxCount:{type:Number,default:Infinity},
  minCount:{type:Number,default:0},
  maxTagCount:{type:Number,default:3},
  showPath:Boolean,
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  errorText:{type:String,default:''},
  searchPlaceholder:{type:String,default:''},
  placement:{type:String,default:'bottom-start',validator:value=>['top-start','top-end','bottom-start','bottom-end'].includes(value)},
  appendToBody:{type:Boolean,default:true},
  name:String,
  form:String,
  required:Boolean,
  autofocus:Boolean,
  ariaLabel:String,
})
const emit=defineEmits([
  'update:modelValue','update:open','update:expandedKeys','input','change','select','deselect','clear','search',
  'open-change','expand-change','check-change','load','load-error','invalid','focus','blur',
])

const attrs=useAttrs()
const slots=useSlots()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const triggerRef=ref(null)
const panelRef=ref(null)
const viewportRef=ref(null)
const searchInputRef=ref(null)
const nativeRef=ref(null)
const internalValue=ref(props.modelValue===undefined?normalizeValue(props.defaultValue):normalizeValue(props.modelValue))
const internalOpen=ref(props.defaultOpen)
const internalExpanded=ref(uniqueValues(props.defaultExpandedKeys))
const activeIndex=ref(-1)
const query=ref('')
const focused=ref(false)
const composing=ref(false)
const scrollTop=ref(0)
const loadedChildren=ref(new Map())
const loadingKeys=ref([])
const loadErrors=ref(new Map())
const selectedMemory=ref(new Map())
const dropUp=ref(false)
const loadControllers=new Map()
const loadSequences=new Map()
let typeahead=''
let typeaheadTimer=null
let resetForm=null
let defaultExpandInitialized=false

const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const config=useLanUiConfig()
const direction=useDirection()
const {t}=useLocale()
const resolvedSize=useComponentSize(toRef(props,'size'))
const fieldMap=computed(()=>(Object.freeze({
  label:props.fieldNames.label||'label',
  value:props.fieldNames.value||'value',
  children:props.fieldNames.children||'children',
  disabled:props.fieldNames.disabled||'disabled',
  selectable:props.fieldNames.selectable||'selectable',
  checkable:props.fieldNames.checkable||'checkable',
  disableCheckbox:props.fieldNames.disableCheckbox||'disableCheckbox',
  isLeaf:props.fieldNames.isLeaf||'isLeaf',
  icon:props.fieldNames.icon||'icon',
  description:props.fieldNames.description||'description',
  keywords:props.fieldNames.keywords||'keywords',
})))

function valuesEqual(left,right){return Object.is(left,right)}
function includesValue(values,value){return values.some(item=>valuesEqual(item,value))}
function uniqueValues(values){
  const source=Array.isArray(values)?values:values===undefined||values===null?[]:[values]
  return source.reduce((result,value)=>{if(!includesValue(result,value))result.push(value);return result},[])
}
function normalizeValue(value){
  if(props?.multiple)return uniqueValues(value)
  return Array.isArray(value)?value[0]??props?.clearValue??'':value
}

const resolvedValue=computed(()=>props.modelValue===undefined?internalValue.value:normalizeValue(props.modelValue))
const resolvedValues=computed(()=>props.multiple?uniqueValues(resolvedValue.value):resolvedValue.value===undefined||resolvedValue.value===null?[]:[resolvedValue.value])
const resolvedOpen=computed(()=>props.open===undefined?internalOpen.value:props.open)
const resolvedExpanded=computed(()=>uniqueValues(props.expandedKeys===undefined?internalExpanded.value:props.expandedKeys))
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedRequired=computed(()=>props.required||formItem?.required?.value||false)
const resolvedPlaceholder=computed(()=>props.placeholder||t('tree.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('tree.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('tree.loading'))
const resolvedErrorText=computed(()=>props.errorText||t('tree.loadError'))
const resolvedSearchPlaceholder=computed(()=>props.searchPlaceholder||t('tree.search'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-tree-select-${uid}`)
const treeId=`ui-tree-select-tree-${uid}`
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||undefined)
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','form','required','autofocus','disabled','readonly','aria-label','aria-labelledby',
  'aria-describedby','aria-invalid','aria-busy','aria-required','role','tabindex',
].includes(key))))
const maxSelectionCount=computed(()=>Number.isFinite(props.maxCount)?Math.max(0,Math.floor(props.maxCount)):Infinity)
const minSelectionCount=computed(()=>Number.isFinite(props.minCount)?Math.max(0,Math.floor(props.minCount)):0)
const visibleTagCount=computed(()=>Math.max(0,Math.floor(Number.isFinite(props.maxTagCount)?props.maxTagCount:3)))
const resolvedCloseOnSelect=computed(()=>props.closeOnSelect===undefined?!props.multiple:props.closeOnSelect)
const state=computed(()=>props.disabled?'disabled':props.readonly?'readonly':props.loading?'loading':resolvedInvalid.value?'invalid':resolvedOpen.value?'open':focused.value?'focused':'ready')

function rawChildren(raw,value){
  if(loadedChildren.value.has(value))return loadedChildren.value.get(value)
  const children=raw?.[fieldMap.value.children]
  return Array.isArray(children)?children:[]
}
const treeModel=computed(()=>{
  const records=[]
  const duplicateValues=[]
  function walk(nodes,parent=null,level=1,pathValues=[],pathLabels=[]){
    const source=Array.isArray(nodes)?nodes:[]
    source.forEach((raw,position)=>{
      const value=raw&&typeof raw==='object'?(raw[fieldMap.value.value]??raw[fieldMap.value.label]):raw
      const label=String(raw&&typeof raw==='object'?(raw[fieldMap.value.label]??value??''):(raw??''))
      if(records.some(record=>valuesEqual(record.value,value))){duplicateValues.push(value);return}
      const keywords=raw&&typeof raw==='object'?raw[fieldMap.value.keywords]:[]
      const children=rawChildren(raw,value)
      const isLeaf=Boolean(raw&&typeof raw==='object'&&raw[fieldMap.value.isLeaf]===true)
      const record={
        raw,value,key:raw&&typeof raw==='object'?(raw.key??value):value,label,
        description:String(raw&&typeof raw==='object'?(raw[fieldMap.value.description]??''):''),
        keywords:Array.isArray(keywords)?keywords:keywords==null?[]:[keywords],
        icon:raw&&typeof raw==='object'?raw[fieldMap.value.icon]:undefined,
        disabled:Boolean(raw&&typeof raw==='object'&&raw[fieldMap.value.disabled]),
        selectable:!(raw&&typeof raw==='object'&&raw[fieldMap.value.selectable]===false),
        checkable:!(raw&&typeof raw==='object'&&raw[fieldMap.value.checkable]===false),
        disableCheckbox:Boolean(raw&&typeof raw==='object'&&raw[fieldMap.value.disableCheckbox]),
        isLeaf,parent,level,position:position+1,setSize:source.length,
        pathValues:[...pathValues,value],pathLabels:[...pathLabels,label],children:[],
      }
      record.branch=!isLeaf&&(children.length>0||Boolean(props.loadData))
      records.push(record)
      const before=records.length
      if(children.length)walk(children,record,level+1,record.pathValues,record.pathLabels)
      record.children=records.slice(before).filter(child=>child.parent===record)
    })
  }
  walk(props.options)
  records.forEach((record,index)=>{record.index=index})
  return {records,duplicateValues}
})
function findRecord(value){return treeModel.value.records.find(record=>valuesEqual(record.value,value))||null}
function publicNode(record){
  if(!record)return undefined
  return {key:record.key,label:record.label,value:record.value,description:record.description,icon:record.icon,disabled:record.disabled,selectable:record.selectable,checkable:record.checkable,isLeaf:record.isLeaf,pathValues:[...record.pathValues],pathLabels:[...record.pathLabels],level:record.level,raw:record.raw}
}
function nodeLabel(record){return props.showPath?record.pathLabels.join(' / '):record.label}
function matchesRecord(record,text){
  if(props.filterNode===false)return true
  if(typeof props.filterNode==='function'){
    try{return props.filterNode(String(text),publicNode(record))!==false}catch{return false}
  }
  const needle=String(text??'').trim().toLocaleLowerCase()
  if(!needle)return true
  return [record.label,record.value,record.description,...record.keywords,...record.pathLabels]
    .map(value=>String(value??'').toLocaleLowerCase()).some(value=>value.includes(needle))
}
const visibleRecords=computed(()=>{
  const text=props.searchable?query.value.trim():''
  const expanded=resolvedExpanded.value
  if(text){
    const visible=[]
    for(const record of treeModel.value.records){
      if(!matchesRecord(record,text))continue
      let current=record
      while(current){if(!visible.includes(current))visible.push(current);current=current.parent}
    }
    return treeModel.value.records.filter(record=>visible.includes(record)).map((record,visibleIndex)=>({...record,visibleIndex}))
  }
  return treeModel.value.records.filter(record=>{
    let parent=record.parent
    while(parent){if(!includesValue(expanded,parent.value))return false;parent=parent.parent}
    return true
  }).map((record,visibleIndex)=>({...record,visibleIndex}))
})
const normalizedItemHeight=computed(()=>Math.max(28,Number.isFinite(props.itemHeight)?props.itemHeight:34))
const resolvedHeight=computed(()=>typeof props.height==='number'?`${Math.max(120,props.height)}px`:props.height||'260px')
const viewportHeight=computed(()=>typeof props.height==='number'?Math.max(120,props.height):260)
const virtualRange=computed(()=>{
  if(!props.virtual)return {start:0,end:visibleRecords.value.length}
  const overscan=Math.max(0,Math.floor(props.overscan))
  const start=Math.max(0,Math.floor(scrollTop.value/normalizedItemHeight.value)-overscan)
  const end=Math.min(visibleRecords.value.length,Math.ceil((scrollTop.value+viewportHeight.value)/normalizedItemHeight.value)+overscan)
  return {start,end}
})
const renderedRecords=computed(()=>visibleRecords.value.slice(virtualRange.value.start,virtualRange.value.end))
const treeContentStyle=computed(()=>props.virtual?{height:`${visibleRecords.value.length*normalizedItemHeight.value}px`,position:'relative'}:undefined)
function rowStyle(record){
  const indent=`${8+(record.level-1)*Math.max(10,props.indent)}px`
  return props.virtual?{position:'absolute',insetInline:'0',top:`${record.visibleIndex*normalizedItemHeight.value}px`,height:`${normalizedItemHeight.value}px`,paddingInlineStart:indent}:{paddingInlineStart:indent}
}

function nodeDisabled(record){return props.disabled||record.disabled||!props.selectable||!record.selectable}
function checkboxDisabled(record){return nodeDisabled(record)||record.disableCheckbox||!record.checkable}
function selected(record){return includesValue(resolvedValues.value,record.value)}
function checkState(record,memo=new Map()){
  if(!record)return {checked:false,indeterminate:false}
  if(memo.has(record.value))return memo.get(record.value)
  const children=record.children.filter(child=>!checkboxDisabled(child))
  let result
  if(props.checkStrictly||!children.length)result={checked:selected(record),indeterminate:false}
  else{
    const states=children.map(child=>checkState(child,memo))
    const checked=selected(record)||(states.length>0&&states.every(item=>item.checked))
    result={checked,indeterminate:!checked&&states.some(item=>item.checked||item.indeterminate)}
  }
  memo.set(record.value,result);return result
}
const checkStates=computed(()=>{
  const memo=new Map()
  for(let index=treeModel.value.records.length-1;index>=0;index-=1)checkState(treeModel.value.records[index],memo)
  return memo
})
function rememberRecord(record){if(!record)return;const next=new Map(selectedMemory.value);next.set(record.value,record);selectedMemory.value=next}
const selectedRecords=computed(()=>resolvedValues.value.map(value=>findRecord(value)||selectedMemory.value.get(value)||{
  key:value,value,label:String(value??''),description:'',icon:undefined,pathValues:[value],pathLabels:[String(value??'')],
  level:1,isLeaf:true,disabled:false,selectable:true,checkable:true,raw:null,
}))
const hasValue=computed(()=>props.multiple?resolvedValues.value.length>0:selectedRecords.value.length>0&&(
  findRecord(resolvedValue.value)||!valuesEqual(resolvedValue.value,props.clearValue)
))
const displayLabel=computed(()=>hasValue.value&&selectedRecords.value[0]?nodeLabel(selectedRecords.value[0]):'')
const visibleSelectedRecords=computed(()=>selectedRecords.value.slice(0,visibleTagCount.value))
const hiddenTagCount=computed(()=>Math.max(0,selectedRecords.value.length-visibleSelectedRecords.value.length))
const hasPrefix=computed(()=>Boolean(slots.prefix))
const hasSuffix=computed(()=>Boolean(slots.suffix))
const hasActions=computed(()=>Boolean(props.loading||(props.clearable&&hasValue.value&&!props.disabled&&!props.readonly)))
const itemId=index=>`${treeId}-item-${index}`
const activeDescendant=computed(()=>resolvedOpen.value&&activeIndex.value>=0&&visibleRecords.value[activeIndex.value]?itemId(activeIndex.value):undefined)
const menuWidth=computed(()=>`${Math.max(180,rootRef.value?.getBoundingClientRect().width||0)}px`)
const resolvedPlacement=computed(()=>{
  if(direction.value!=='rtl')return props.placement
  if(props.placement.endsWith('-start'))return props.placement.replace(/-start$/,'-end')
  if(props.placement.endsWith('-end'))return props.placement.replace(/-end$/,'-start')
  return props.placement
})
const {floatingStyle,resolvedPlacement:actualPlacement,update:updatePosition}=useFloatingPosition({
  triggerRef:rootRef,panelRef,open:computed(()=>resolvedOpen.value&&props.appendToBody),placement:resolvedPlacement,offset:6,
  zIndex:computed(()=>config.value.zIndex+55),
})
const panelStyle=computed(()=>props.appendToBody?{...floatingStyle.value,width:menuWidth.value,minWidth:menuWidth.value}:undefined)
const opensUp=computed(()=>props.appendToBody?actualPlacement.value.startsWith('top'):dropUp.value)

function emitInvalid(reason,source,extra={}){
  const payload={reason,source,value:props.multiple?[...resolvedValues.value]:resolvedValue.value,query:query.value,...extra}
  emit('invalid',payload);return false
}
function openMeta(source,previous,nativeEvent){return {source,previous,query:query.value,nativeEvent}}
function enabledIndex(start,delta){
  const records=visibleRecords.value
  if(!records.length)return -1
  let index=start
  for(let count=0;count<records.length;count+=1){
    index=(index+delta+records.length)%records.length
    if(!nodeDisabled(records[index]))return index
  }
  return -1
}
function selectedIndex(){return visibleRecords.value.findIndex(record=>selected(record)&&!nodeDisabled(record))}
function resetActive(){
  const index=selectedIndex()
  activeIndex.value=index>=0?index:enabledIndex(-1,1)
  nextTick(()=>{updatePosition();scrollToActive()})
}
function prepareOpen(){
  initializeExpanded()
  const rect=rootRef.value?.getBoundingClientRect()
  const viewport=typeof innerHeight==='number'?innerHeight:0
  dropUp.value=props.placement.startsWith('top')||Boolean(rect&&viewport-rect.bottom<280&&rect.top>280)
  resetActive()
  nextTick(()=>focusWithRetry(()=>props.searchable?searchInputRef.value:triggerRef.value))
}
function cleanupClose({focusTrigger=false}={}){
  activeIndex.value=-1
  if(props.searchable&&query.value){query.value='';emit('search','',{source:'close'})}
  if(focusTrigger)nextTick(()=>focusWithRetry(()=>triggerRef.value))
}
function setOpen(value,source='api',nativeEvent){
  const next=Boolean(value)
  const previous=resolvedOpen.value
  if(props.disabled)return emitInvalid('disabled',source,{nativeEvent})
  if(props.readonly&&next)return emitInvalid('readonly',source,{nativeEvent})
  if(next===previous){if(next)resetActive();return false}
  if(props.open===undefined)internalOpen.value=next
  emit('update:open',next);emit('open-change',next,openMeta(source,previous,nativeEvent))
  if(next)prepareOpen();else cleanupClose({focusTrigger:source==='escape'})
  return true
}
function toggleOpen(source='api',nativeEvent){return setOpen(!resolvedOpen.value,source,nativeEvent)}

function initializeExpanded(){
  if(defaultExpandInitialized||!props.defaultExpandAll)return
  defaultExpandInitialized=true
  if(props.expandedKeys!==undefined)return
  internalExpanded.value=uniqueValues([...internalExpanded.value,...treeModel.value.records.filter(record=>record.branch).map(record=>record.value)])
}
function commitExpanded(values,record,expanded,source,nativeEvent){
  const next=uniqueValues(values)
  const previous=[...resolvedExpanded.value]
  if(props.expandedKeys===undefined)internalExpanded.value=next
  const meta={source,expanded,previous,next:[...next],node:publicNode(record),nativeEvent}
  emit('update:expandedKeys',next);emit('expand-change',next,publicNode(record),meta)
  nextTick(()=>{resetActive();updatePosition()})
  return meta
}
function setLoading(value,loading){
  const next=loadingKeys.value.filter(item=>!valuesEqual(item,value))
  if(loading)next.push(value)
  loadingKeys.value=next
}
function isLoading(record){return includesValue(loadingKeys.value,record.value)}
async function loadNode(record,{source='api',force=false,nativeEvent}={}){
  if(!record||!props.loadData||record.isLeaf)return []
  if(!force&&loadedChildren.value.has(record.value))return loadedChildren.value.get(record.value)
  loadControllers.get(record.value)?.abort()
  const sequence=(loadSequences.get(record.value)||0)+1
  loadSequences.set(record.value,sequence)
  const controller=typeof AbortController==='undefined'?null:new AbortController()
  loadControllers.set(record.value,controller)
  setLoading(record.value,true)
  const errors=new Map(loadErrors.value);errors.delete(record.value);loadErrors.value=errors
  try{
    const result=await props.loadData(publicNode(record),{signal:controller?.signal,source})
    if(loadSequences.get(record.value)!==sequence||controller?.signal.aborted)return []
    const children=Array.isArray(result)?result:[]
    const loaded=new Map(loadedChildren.value);loaded.set(record.value,children);loadedChildren.value=loaded
    emit('load',{node:publicNode(record),children,source})
    nextTick(()=>{resetActive();updatePosition()})
    return children
  }catch(error){
    if(loadSequences.get(record.value)!==sequence||error?.name==='AbortError'||controller?.signal.aborted)return []
    const nextErrors=new Map(loadErrors.value);nextErrors.set(record.value,error);loadErrors.value=nextErrors
    const payload={node:publicNode(record),error,source}
    emit('load-error',payload);emitInvalid('load-error',source,{error,node:publicNode(record),nativeEvent})
    return []
  }finally{
    if(loadSequences.get(record.value)===sequence){setLoading(record.value,false);loadControllers.delete(record.value)}
  }
}
async function toggleExpanded(record,expanded=!includesValue(resolvedExpanded.value,record?.value),source='api',nativeEvent){
  if(!record||!record.branch||props.disabled)return false
  const next=resolvedExpanded.value.filter(value=>!valuesEqual(value,record.value))
  if(expanded)next.push(record.value)
  const meta=commitExpanded(next,record,expanded,source,nativeEvent)
  if(expanded&&props.loadData&&!record.children.length&&!loadedChildren.value.has(record.value))await loadNode(record,{source,nativeEvent})
  return meta
}
function expand(value,source='api'){const record=findRecord(value);return toggleExpanded(record,true,source)}
function collapse(value,source='api'){const record=findRecord(value);return toggleExpanded(record,false,source)}
function toggleExpand(value,expanded,source='api',nativeEvent){
  const record=findRecord(value)
  return toggleExpanded(record,expanded===undefined?!includesValue(resolvedExpanded.value,record?.value):expanded,source,nativeEvent)
}
function reloadNode(value,source='api'){return loadNode(findRecord(value),{source,force:true})}

function changeMeta(action,record,source,previous,next,nativeEvent){return {action,source,node:publicNode(record),previous,next,query:query.value,nativeEvent}}
function commitValue(next,record,action,source='api',nativeEvent){
  const previous=props.multiple?[...resolvedValues.value]:resolvedValue.value
  const normalized=props.multiple?uniqueValues(next):normalizeValue(next)
  if(props.multiple){
    if(normalized.length>maxSelectionCount.value)return emitInvalid('max-count',source,{maxCount:maxSelectionCount.value,requested:normalized,node:publicNode(record),nativeEvent})
    if(normalized.length<minSelectionCount.value)return emitInvalid('min-count',source,{minCount:minSelectionCount.value,requested:normalized,node:publicNode(record),nativeEvent})
  }
  if(props.modelValue===undefined)internalValue.value=normalized
  if(record)rememberRecord(record)
  const emittedValue=props.multiple?[...normalized]:normalized
  const meta=changeMeta(action,record,source,previous,emittedValue,nativeEvent)
  emit('update:modelValue',emittedValue);emit('input',emittedValue,meta);emit('change',emittedValue,meta)
  if(action==='select')emit('select',emittedValue,publicNode(record),meta)
  if(action==='deselect')emit('deselect',emittedValue,publicNode(record),meta)
  if(props.checkable)emit('check-change',emittedValue,publicNode(record),meta)
  return meta
}
function descendants(record){
  const result=[]
  const walk=node=>{for(const child of node.children){result.push(child);walk(child)}}
  walk(record);return result
}
function normalizeCascade(values){
  const next=uniqueValues(values)
  for(let index=treeModel.value.records.length-1;index>=0;index-=1){
    const record=treeModel.value.records[index]
    const children=record.children.filter(child=>!checkboxDisabled(child))
    if(!children.length)continue
    const all=children.every(child=>includesValue(next,child.value))
    const existing=next.findIndex(value=>valuesEqual(value,record.value))
    if(all&&existing<0)next.push(record.value)
    if(!all&&existing>=0)next.splice(existing,1)
  }
  return next
}
function selectRecord(record,source='api',nativeEvent){
  if(!record)return emitInvalid('unknown-node',source,{nativeEvent})
  if(props.loading)return emitInvalid('loading',source,{node:publicNode(record),nativeEvent})
  if(props.readonly)return emitInvalid('readonly',source,{node:publicNode(record),nativeEvent})
  if(nodeDisabled(record)||(props.checkable&&checkboxDisabled(record)))return emitInvalid('node-disabled',source,{node:publicNode(record),nativeEvent})
  if(!props.multiple){
    const meta=commitValue(record.value,record,'select',source,nativeEvent)
    if(meta!==false&&resolvedCloseOnSelect.value)setOpen(false,'select',nativeEvent)
    return meta
  }
  let next=[...resolvedValues.value]
  const targets=props.checkable&&!props.checkStrictly?[record,...descendants(record)].filter(item=>!checkboxDisabled(item)):[record]
  const removing=targets.every(item=>includesValue(next,item.value))
  for(const target of targets){
    const index=next.findIndex(value=>valuesEqual(value,target.value))
    if(removing&&index>=0)next.splice(index,1)
    else if(!removing&&index<0){next.push(target.value);rememberRecord(target)}
  }
  if(props.checkable&&!props.checkStrictly)next=normalizeCascade(next)
  const action=removing?'deselect':'select'
  const meta=commitValue(next,record,action,source,nativeEvent)
  if(meta!==false&&resolvedCloseOnSelect.value)setOpen(false,'select',nativeEvent)
  return meta
}
function select(value,source='api'){return selectRecord(findRecord(value),source)}
function remove(value,source='api'){
  const record=findRecord(value)||selectedMemory.value.get(value)
  if(!props.multiple){if(!valuesEqual(resolvedValue.value,value))return false;return clear(source)}
  if(!includesValue(resolvedValues.value,value))return false
  const next=resolvedValues.value.filter(item=>!valuesEqual(item,value))
  return commitValue(props.checkable&&!props.checkStrictly?normalizeCascade(next):next,record,'deselect',source)
}
function clear(source='api',nativeEvent){
  if(props.disabled)return emitInvalid('disabled',source,{nativeEvent})
  if(props.readonly)return emitInvalid('readonly',source,{nativeEvent})
  const next=props.multiple?[]:props.clearValue
  if(props.multiple&&minSelectionCount.value>0)return emitInvalid('min-count',source,{minCount:minSelectionCount.value,requested:next,nativeEvent})
  const previous=props.multiple?[...resolvedValues.value]:resolvedValue.value
  if(props.modelValue===undefined)internalValue.value=next
  const meta=changeMeta('clear',null,source,previous,next,nativeEvent)
  emit('update:modelValue',next);emit('input',next,meta);emit('change',next,meta);emit('clear',meta)
  selectedMemory.value=new Map()
  return meta
}
function setValue(value,source='api'){
  const next=props.multiple?uniqueValues(value):normalizeValue(value)
  const record=props.multiple?findRecord(next.at(-1)):findRecord(next)
  return commitValue(next,record,'set',source)
}
function clearFromControl(event){event.preventDefault();event.stopPropagation();clear('clear',event)}
function removeTag(record,event){event.preventDefault();event.stopPropagation();remove(record.value,'tag')}

function onSearchInput(event){
  query.value=event.target.value
  if(composing.value||event.isComposing)return
  emit('search',query.value,{source:'input'});resetActive()
}
function onCompositionEnd(event){
  composing.value=false;query.value=event.target.value
  emit('search',query.value,{source:'composition'});resetActive()
}
function closeOutside(event){if(rootRef.value?.contains(event.target)||panelRef.value?.contains(event.target))return;setOpen(false,'outside',event)}
function onScroll(event){scrollTop.value=event.currentTarget.scrollTop}
function scrollToActive(){
  if(activeIndex.value<0)return false
  if(props.virtual&&viewportRef.value){
    const top=activeIndex.value*normalizedItemHeight.value
    const bottom=top+normalizedItemHeight.value
    if(top<viewportRef.value.scrollTop)viewportRef.value.scrollTop=top
    else if(bottom>viewportRef.value.scrollTop+viewportHeight.value)viewportRef.value.scrollTop=bottom-viewportHeight.value
  }
  nextTick(()=>{
    if(typeof document==='undefined')return
    scrollElementWithin(document.getElementById(itemId(activeIndex.value)),viewportRef.value)
  })
  return true
}
function moveActive(delta){activeIndex.value=enabledIndex(activeIndex.value,delta);scrollToActive()}
function moveBoundary(end=false){activeIndex.value=enabledIndex(end?0:-1,end?-1:1);scrollToActive()}
function findTypeahead(text){
  const needle=text.toLocaleLowerCase(),records=visibleRecords.value
  const start=Math.max(activeIndex.value,0)
  for(let offset=1;offset<=records.length;offset+=1){
    const index=(start+offset)%records.length
    if(!nodeDisabled(records[index])&&records[index].label.toLocaleLowerCase().startsWith(needle)){activeIndex.value=index;scrollToActive();return}
  }
}
function handleTypeahead(event){
  if(props.searchable||event.ctrlKey||event.metaKey||event.altKey||event.key.length!==1)return false
  typeahead+=event.key
  if(typeaheadTimer)clearTimeout(typeaheadTimer)
  typeaheadTimer=setTimeout(()=>{typeahead='';typeaheadTimer=null},500)
  if(!resolvedOpen.value)setOpen(true,'typeahead',event)
  findTypeahead(typeahead);return true
}
function parentIndex(record){return record?.parent?visibleRecords.value.findIndex(item=>valuesEqual(item.value,record.parent.value)):activeIndex.value}
async function onKeydown(event){
  if(props.disabled)return
  if(props.readonly){if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();emitInvalid('readonly','keyboard',{nativeEvent:event})};return}
  if(event.isComposing||event.keyCode===229)return
  if(!resolvedOpen.value&&['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();setOpen(true,'keyboard',event);return}
  if(!resolvedOpen.value){handleTypeahead(event);return}
  const record=visibleRecords.value[activeIndex.value]
  const expandKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  const collapseKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  if(event.key==='ArrowDown'){event.preventDefault();moveActive(1)}
  else if(event.key==='ArrowUp'){event.preventDefault();moveActive(-1)}
  else if(event.key==='Home'){event.preventDefault();moveBoundary(false)}
  else if(event.key==='End'){event.preventDefault();moveBoundary(true)}
  else if(event.key===expandKey&&record?.branch){
    event.preventDefault()
    if(!includesValue(resolvedExpanded.value,record.value))await toggleExpanded(record,true,'keyboard',event)
    else{const childIndex=visibleRecords.value.findIndex(item=>item.parent&&valuesEqual(item.parent.value,record.value));if(childIndex>=0)activeIndex.value=childIndex}
    scrollToActive()
  }else if(event.key===collapseKey&&record){
    event.preventDefault()
    if(record.branch&&includesValue(resolvedExpanded.value,record.value))await toggleExpanded(record,false,'keyboard',event)
    else activeIndex.value=parentIndex(record)
    scrollToActive()
  }else if(event.key==='Enter'||(event.key===' '&&event.target!==searchInputRef.value)){
    event.preventDefault();if(record)selectRecord(record,'keyboard',event)
  }else if(event.key==='Escape'){event.preventDefault();setOpen(false,'escape',event)}
  else if(event.key==='Tab')setOpen(false,'tab',event)
  else handleTypeahead(event)
}
function onNodeClick(record,event){
  if(props.expandOnClickNode&&record.branch&&!props.checkable)toggleExpanded(record,!includesValue(resolvedExpanded.value,record.value),'pointer',event)
  else selectRecord(record,'pointer',event)
}
function handleFocusIn(event){if(focused.value)return;focused.value=true;emit('focus',event,{value:resolvedValue.value,query:query.value})}
function handleFocusOut(event){
  setTimeout(()=>{
    const active=typeof document==='undefined'?null:document.activeElement
    if(rootRef.value?.contains(active)||panelRef.value?.contains(active)||!focused.value)return
    focused.value=false;emit('blur',event,{value:resolvedValue.value,query:query.value})
  },0)
}
function focus(options){if(props.disabled)return false;triggerRef.value?.focus(options);return Boolean(triggerRef.value)}
function blur(){searchInputRef.value?.blur();triggerRef.value?.blur();return Boolean(triggerRef.value)}
function show(source='api'){return setOpen(true,source)}
function hide(source='api'){return setOpen(false,source)}
function onNativeInvalid(event){emitInvalid('required','native',{nativeEvent:event});nextTick(()=>focus())}
function onFormReset(){
  const next=normalizeValue(props.defaultValue)
  const previous=props.multiple?[...resolvedValues.value]:resolvedValue.value
  if(props.modelValue===undefined)internalValue.value=next
  const meta=changeMeta('reset',null,'reset',previous,next)
  emit('update:modelValue',next);emit('input',next,meta);emit('change',next,meta)
  if(props.expandedKeys===undefined)internalExpanded.value=uniqueValues(props.defaultExpandedKeys)
  defaultExpandInitialized=false;selectedMemory.value=new Map();setOpen(false,'reset')
}

watch(()=>props.modelValue,value=>{if(value!==undefined)internalValue.value=normalizeValue(value)})
watch(()=>props.multiple,()=>{internalValue.value=normalizeValue(resolvedValue.value)})
watch(()=>props.options,()=>{loadedChildren.value=new Map();loadErrors.value=new Map();defaultExpandInitialized=false;nextTick(()=>{initializeExpanded();resetActive()})})
watch(()=>props.open,(value,previous)=>{if(value===undefined||value===previous)return;if(value)prepareOpen();else cleanupClose()})
watch([visibleRecords,resolvedExpanded],()=>{if(resolvedOpen.value)resetActive()})
watch(query,()=>nextTick(updatePosition))

onMounted(()=>{
  document.addEventListener('pointerdown',closeOutside)
  resetForm=nativeRef.value?.form||null
  resetForm?.addEventListener('reset',onFormReset)
  initializeExpanded()
  for(const record of treeModel.value.records)if(selected(record))rememberRecord(record)
  if(props.autofocus)nextTick(()=>focus())
  if(resolvedOpen.value)prepareOpen()
})
onBeforeUnmount(()=>{
  document.removeEventListener('pointerdown',closeOutside)
  resetForm?.removeEventListener('reset',onFormReset)
  for(const controller of loadControllers.values())controller?.abort()
  loadControllers.clear()
  if(typeaheadTimer)clearTimeout(typeaheadTimer)
})

defineExpose({
  root:rootRef,trigger:triggerRef,panel:panelRef,native:nativeRef,value:resolvedValue,open:resolvedOpen,expandedKeys:resolvedExpanded,
  query,activeIndex,loadingKeys,loadErrors,focus,blur,show,hide,toggle:toggleOpen,clear,select,remove,setValue,expand,collapse,
  toggleExpand,loadNode:reloadNode,scrollToActive,
})
</script>

<template>
  <div ref="rootRef" class="ui-tree-select" :class="[`size-${resolvedSize}`,attrs.class,{open:resolvedOpen,'drop-up':opensUp,disabled,readonly,loading,invalid:resolvedInvalid,multiple,checkable,searchable,clearable,'has-prefix':hasPrefix,'has-suffix':hasSuffix,'has-actions':hasActions}]" :style="attrs.style" data-ui-tree-select :data-state="state" @focusin="handleFocusIn" @focusout="handleFocusOut" @keydown="onKeydown">
    <select v-if="name||resolvedRequired" ref="nativeRef" class="ui-tree-select-native" :name="name" :form="form" :required="resolvedRequired" :disabled="disabled" :multiple="multiple" tabindex="-1" aria-hidden="true" @invalid="onNativeInvalid">
      <option v-if="!multiple" :value="String(clearValue)" :selected="!hasValue">{{ resolvedPlaceholder }}</option>
      <option v-for="record in treeModel.records" :key="`native-${typeof record.value}-${String(record.value)}`" :value="String(record.value)" :selected="includesValue(resolvedValues,record.value)">{{ record.label }}</option>
      <option v-for="record in selectedRecords.filter(item=>!treeModel.records.some(known=>valuesEqual(known.value,item.value)))" :key="`native-memory-${typeof record.value}-${String(record.value)}`" :value="String(record.value)" selected>{{ record.label }}</option>
    </select>
    <div v-bind="passthroughAttrs" :id="controlId" ref="triggerRef" class="control ui-tree-trigger" :tabindex="disabled?-1:0" role="combobox" aria-haspopup="tree" :aria-expanded="resolvedOpen" :aria-controls="resolvedOpen&&!loading?treeId:undefined" :aria-activedescendant="!searchable?activeDescendant:undefined" :aria-autocomplete="searchable?'list':undefined" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-disabled="disabled||undefined" :aria-readonly="readonly||undefined" :aria-invalid="resolvedInvalid||undefined" :aria-required="resolvedRequired||undefined" :aria-busy="loading||undefined" @click="toggleOpen('pointer',$event)">
      <span v-if="hasPrefix" class="ui-tree-select-affix ui-tree-select-prefix"><slot name="prefix" :value="resolvedValue" :nodes="selectedRecords.map(publicNode)"/></span>
      <span v-if="multiple&&hasValue" class="ui-tree-select-tags">
        <span v-for="record in visibleSelectedRecords" :key="`${typeof record.value}-${String(record.value)}`" class="ui-tree-select-tag" :class="{disabled:record.disabled}">
          <slot name="tag" :node="publicNode(record)" :remove="event=>removeTag(record,event)"><span class="ui-tree-select-tag-label">{{ nodeLabel(record) }}</span><button v-if="!disabled&&!readonly&&!record.disabled" type="button" :aria-label="t('tree.removeNode',{label:record.label})" @mousedown.prevent @click="removeTag(record,$event)"><AppIcon name="close" :size="10"/></button></slot>
        </span>
        <span v-if="hiddenTagCount" class="ui-tree-select-tag ui-tree-select-overflow-tag">+{{ hiddenTagCount }}</span>
      </span>
      <span v-else-if="hasValue" class="ui-tree-select-value"><slot name="value" :node="publicNode(selectedRecords[0])" :value="resolvedValue">{{ displayLabel }}</slot></span>
      <span v-else class="placeholder ui-tree-select-placeholder"><slot name="placeholder">{{ resolvedPlaceholder }}</slot></span>
      <span v-if="hasSuffix" class="ui-tree-select-affix ui-tree-select-suffix"><slot name="suffix" :value="resolvedValue" :nodes="selectedRecords.map(publicNode)"/></span>
      <span class="ui-tree-select-arrow" aria-hidden="true"><slot name="arrow" :open="resolvedOpen"><AppIcon name="chevronDown" :size="15"/></slot></span>
    </div>
    <span v-if="loading" class="ui-tree-select-loading" role="status" :aria-label="resolvedLoadingText"><slot name="loading"><span class="spinner ui-tree-select-spinner"/></slot></span>
    <button v-else-if="clearable&&hasValue&&!disabled&&!readonly" type="button" class="ui-tree-select-clear" :aria-label="t('tree.clear')" :aria-controls="controlId" @mousedown.prevent @click="clearFromControl"><slot name="clear-icon"><AppIcon name="close" :size="12"/></slot></button>
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="select-portal">
        <div v-if="resolvedOpen" v-bind="portalThemeAttrs" class="ui-tree-select-portal" :style="portalThemeStyle" :role="appendToBody?'region':undefined" :aria-label="appendToBody?`${resolvedAriaLabel||resolvedPlaceholder} popup`:undefined" @focusin="handleFocusIn" @focusout="handleFocusOut" @keydown="onKeydown">
          <div ref="panelRef" class="ui-tree-menu ui-tree-select-menu" :class="{'ui-floating-panel':appendToBody}" :style="panelStyle" :data-placement="appendToBody?actualPlacement:(dropUp?'top-start':'bottom-start')" :dir="direction" :aria-busy="loading||undefined">
            <label v-if="searchable" class="ui-tree-select-search"><slot name="search-prefix"><AppIcon name="search" :size="14"/></slot><input ref="searchInputRef" :value="query" type="search" autocomplete="off" :placeholder="resolvedSearchPlaceholder" :aria-label="resolvedSearchPlaceholder" :aria-controls="treeId" :aria-activedescendant="activeDescendant" @input="onSearchInput" @compositionstart="composing=true" @compositionend="onCompositionEnd" @keydown.stop="onKeydown"/></label>
            <div v-if="loading" class="ui-select-state ui-tree-select-loading-state" role="status" aria-live="polite"><slot name="loading"><span class="spinner ui-tree-select-spinner"/><span>{{ resolvedLoadingText }}</span></slot></div>
            <div v-else-if="treeModel.duplicateValues.length" class="ui-select-state ui-tree-select-error" role="alert"><slot name="error" :error="{code:'duplicate-value',values:treeModel.duplicateValues}"><AppIcon name="warning" :size="18"/><span>{{ resolvedErrorText }}</span></slot></div>
            <div v-else ref="viewportRef" class="ui-tree-select-viewport" :style="{maxHeight:resolvedHeight,height:virtual?resolvedHeight:undefined}" tabindex="0" @scroll="onScroll">
              <div v-if="visibleRecords.length" :id="treeId" class="ui-tree-select-tree" role="tree" :aria-label="resolvedAriaLabel||resolvedPlaceholder" :aria-multiselectable="multiple||undefined" :style="treeContentStyle">
                <div v-for="record in renderedRecords" :id="itemId(record.visibleIndex)" :key="`${typeof record.value}-${String(record.value)}`" class="ui-tree-select-row" :class="{active:record.visibleIndex===activeIndex,selected:selected(record),disabled:nodeDisabled(record),loading:isLoading(record),error:loadErrors.has(record.value)}" :style="rowStyle(record)" role="treeitem" :aria-level="record.level" :aria-posinset="record.position" :aria-setsize="record.setSize" :aria-expanded="record.branch?includesValue(resolvedExpanded,record.value):undefined" :aria-selected="!checkable?selected(record):undefined" :aria-checked="checkable?(checkStates.get(record.value)?.indeterminate?'mixed':String(checkStates.get(record.value)?.checked||false)):undefined" :aria-disabled="nodeDisabled(record)||undefined" @pointerdown.prevent @mouseenter="!nodeDisabled(record)&&(activeIndex=record.visibleIndex)">
                  <button v-if="record.branch" type="button" tabindex="-1" class="ui-tree-select-expand" :aria-label="t(includesValue(resolvedExpanded,record.value)?'tree.collapseNode':'tree.expandNode',{label:record.label})" :disabled="disabled||record.disabled" @click.stop="toggleExpanded(record,!includesValue(resolvedExpanded,record.value),'pointer',$event)"><span v-if="isLoading(record)" class="spinner ui-tree-select-node-spinner"/><AppIcon v-else class="ui-directional-icon" name="chevronRight" :size="12"/></button>
                  <span v-else class="ui-tree-select-spacer"/>
                  <span v-if="checkable" class="ui-tree-select-check" aria-hidden="true"><AppIcon v-if="checkStates.get(record.value)?.checked" name="check" :size="11"/><span v-else-if="checkStates.get(record.value)?.indeterminate" class="ui-tree-select-indeterminate"/></span>
                  <slot name="icon" :node="publicNode(record)" :expanded="includesValue(resolvedExpanded,record.value)"><AppIcon v-if="record.icon" class="ui-tree-select-icon" :name="record.icon" :size="14"/></slot>
                  <button type="button" tabindex="-1" class="ui-tree-select-node-label" :disabled="nodeDisabled(record)||(checkable&&checkboxDisabled(record))" @click="onNodeClick(record,$event)">
                    <slot name="node" :node="publicNode(record)" :selected="selected(record)" :checked="checkStates.get(record.value)?.checked||false" :indeterminate="checkStates.get(record.value)?.indeterminate||false" :expanded="includesValue(resolvedExpanded,record.value)" :active="record.visibleIndex===activeIndex"><span class="ui-tree-select-node-copy"><span>{{ record.label }}</span><small v-if="record.description">{{ record.description }}</small></span></slot>
                  </button>
                  <button v-if="loadErrors.has(record.value)" type="button" tabindex="-1" class="ui-tree-select-retry" :aria-label="t('tree.retryNode',{label:record.label})" @click.stop="reloadNode(record.value,'retry')"><AppIcon name="refresh" :size="12"/>{{ t('tree.retry') }}</button>
                </div>
              </div>
              <div v-else class="ui-select-state ui-tree-select-empty" role="status"><slot name="empty" :query="query"><AppIcon name="search" :size="18"/><span>{{ resolvedEmptyText }}</span></slot></div>
            </div>
            <div v-if="$slots.footer" class="ui-select-footer"><slot name="footer" :query="query" :nodes="visibleRecords.map(publicNode)" :value="resolvedValue" :expanded-keys="resolvedExpanded"/></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

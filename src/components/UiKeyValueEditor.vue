<script setup>
import { computed, inject, nextTick, ref, toRef, useAttrs, useId, watch } from 'vue'
import { useComponentSize, useLocale } from '../config-runtime.js'

defineOptions({inheritAttrs:false})
const props=defineProps({
  modelValue:{type:Array,default:()=>[]},
  keyField:{type:String,default:'key'},
  valueField:{type:String,default:'value'},
  enabledField:{type:String,default:'enabled'},
  itemKey:{type:String,default:'id'},
  defaultItem:{type:Object,default:()=>({key:'',value:'',enabled:true})},
  minRows:{type:Number,default:0},
  maxRows:{type:Number,default:Infinity},
  allowDuplicateKeys:Boolean,
  allowEmptyKey:Boolean,
  requireValue:Boolean,
  caseSensitive:Boolean,
  keyPattern:{type:[String,RegExp],default:null},
  keyPlaceholder:{type:String,default:''},
  valuePlaceholder:{type:String,default:''},
  addable:{type:Boolean,default:true},
  removable:{type:Boolean,default:true},
  reorderable:{type:Boolean,default:true},
  toggleable:{type:Boolean,default:true},
  separator:{type:String,default:'='},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  required:Boolean,
  name:{type:String,default:''},
  ariaLabel:{type:String,default:''},
})
const emit=defineEmits(['update:modelValue','input','change','add','remove','move','toggle','invalid','limit','import','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const {t}=useLocale()
const resolvedSize=useComponentSize(toRef(props,'size'))
const uid=useId()
const rootRef=ref(null)
const rows=ref([])
const focused=ref(false)
let serial=0
const nextUid=()=>`ui-key-value-${uid}-${++serial}`
const minimum=computed(()=>Math.max(0,Math.trunc(Number.isFinite(props.minRows)?props.minRows:0)))
const maximum=computed(()=>Math.max(minimum.value,Number.isFinite(props.maxRows)?Math.trunc(props.maxRows):Infinity))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-key-value-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']||props.ariaLabel?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedAriaLabel=computed(()=>props.ariaLabel||attrs['aria-label']||(!labelledby.value?t('keyValue.title'):undefined))
const pattern=computed(()=>{
  if(props.keyPattern instanceof RegExp)return props.keyPattern
  if(!props.keyPattern)return null
  try{return new RegExp(props.keyPattern)}catch{return null}
})
const passthroughAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>![
  'id','class','style','name','disabled','readonly','required','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-required',
].includes(key))))

function normalizeItem(item={}){
  const source=item&&typeof item==='object'?item:{}
  return {
    ...source,
    [props.keyField]:String(source[props.keyField]??''),
    [props.valueField]:String(source[props.valueField]??''),
    [props.enabledField]:source[props.enabledField]!==false,
  }
}
function sync(source){
  const previous=rows.value
  const byKey=new Map(previous.filter(row=>row.item?.[props.itemKey]!=null).map(row=>[String(row.item[props.itemKey]),row]))
  rows.value=(Array.isArray(source)?source:[]).map((item,index)=>{
    const normalized=normalizeItem(item)
    const stable=normalized[props.itemKey]!=null?byKey.get(String(normalized[props.itemKey])):previous[index]
    return {uid:stable?.uid||nextUid(),item:normalized}
  })
}
watch(()=>props.modelValue,sync,{immediate:true,deep:true})
watch(()=>[props.keyField,props.valueField,props.enabledField],()=>sync(props.modelValue))
const values=computed(()=>rows.value.map(row=>({...row.item})))
const canAdd=computed(()=>props.addable&&!props.disabled&&!props.readonly&&rows.value.length<maximum.value)
const canRemove=computed(()=>props.removable&&!props.disabled&&!props.readonly&&rows.value.length>minimum.value)

function validationFor(source=values.value){
  const items=Array.isArray(source)?source.map(normalizeItem):[]
  const errors=[]
  if(items.length<minimum.value)errors.push({code:'min-rows',row:-1,field:'editor',min:minimum.value})
  if(items.length>maximum.value)errors.push({code:'max-rows',row:-1,field:'editor',max:maximum.value})
  const occurrences=new Map()
  items.forEach((item,row)=>{
    const raw=String(item[props.keyField]??'')
    const key=raw.trim()
    const value=String(item[props.valueField]??'')
    if(!props.allowEmptyKey&&!key)errors.push({code:'empty-key',row,field:'key',key})
    if(key&&pattern.value){pattern.value.lastIndex=0;if(!pattern.value.test(key))errors.push({code:'invalid-key',row,field:'key',key})}
    if(props.requireValue&&!value.trim())errors.push({code:'empty-value',row,field:'value',key})
    if(key){const identity=props.caseSensitive?key:key.toLocaleLowerCase();const list=occurrences.get(identity)||[];list.push(row);occurrences.set(identity,list)}
  })
  if(!props.allowDuplicateKeys)for(const [key,indexes] of occurrences)if(indexes.length>1)for(const row of indexes)errors.push({code:'duplicate-key',row,field:'key',key})
  const rowErrors=items.map((_,row)=>errors.filter(error=>error.row===row))
  return {valid:errors.length===0,errors,rowErrors,values:items}
}
const validation=computed(()=>validationFor())
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||!validation.value.valid)
function errorText(error){return t(`keyValue.error.${error.code}`,{min:error.min,max:error.max,key:error.key||''})}

function emitLimit(action){
  const detail={action,min:minimum.value,max:maximum.value,length:rows.value.length}
  emit('limit',detail)
  return false
}
function commit(next,type,detail={}){
  const previous=getValue()
  const normalized=next.map(normalizeItem)
  const previousRows=rows.value
  const previousByKey=new Map(previousRows.filter(row=>row.item?.[props.itemKey]!=null).map(row=>[String(row.item[props.itemKey]),row.uid]))
  rows.value=normalized.map((item,index)=>({uid:detail.uids?.[index]||(item[props.itemKey]!=null?previousByKey.get(String(item[props.itemKey])):previousRows[index]?.uid)||nextUid(),item}))
  const result=validationFor(normalized)
  const current=normalized.map(item=>({...item}))
  const meta={type,source:detail.source||type,previous,values:current,validation:result,...detail}
  delete meta.uids
  emit('update:modelValue',current)
  emit('input',current,meta)
  emit('change',current,meta)
  if(!result.valid)emit('invalid',result,meta)
  return meta
}
function updateRow(index,field,value,source='input'){
  if(props.disabled||props.readonly||!rows.value[index])return false
  const next=getValue()
  next[index]={...next[index],[field]:value}
  return commit(next,'update',{source,index,field,value,uids:rows.value.map(row=>row.uid)})
}
function add(item=props.defaultItem,index=rows.value.length,source='api'){
  if(!canAdd.value)return emitLimit('add')
  const target=Math.max(0,Math.min(rows.value.length,Math.trunc(Number(index)||0)))
  const inserted=normalizeItem(item)
  const next=getValue()
  next.splice(target,0,inserted)
  const uids=rows.value.map(row=>row.uid);uids.splice(target,0,nextUid())
  const meta=commit(next,'add',{source,index:target,item:{...inserted},uids})
  emit('add',meta)
  nextTick(()=>rootRef.value?.querySelector(`[data-row-index="${target}"] .ui-key-value-key`)?.focus())
  return meta
}
function remove(index,source='api'){
  if(!canRemove.value)return rows.value.length<=minimum.value?emitLimit('remove'):false
  const target=Math.trunc(Number(index))
  if(target<0||target>=rows.value.length)return false
  const next=getValue();const [removed]=next.splice(target,1)
  const uids=rows.value.map(row=>row.uid);uids.splice(target,1)
  const meta=commit(next,'remove',{source,index:target,item:removed,uids})
  emit('remove',meta)
  nextTick(()=>rootRef.value?.querySelector(`[data-row-index="${Math.min(target,next.length-1)}"] .ui-key-value-key`)?.focus())
  return meta
}
function move(from,to,source='api'){
  if(!props.reorderable||props.disabled||props.readonly)return false
  const start=Math.trunc(Number(from));const target=Math.trunc(Number(to))
  if(start<0||target<0||start>=rows.value.length||target>=rows.value.length||start===target)return false
  const next=getValue();const [item]=next.splice(start,1);next.splice(target,0,item)
  const uids=rows.value.map(row=>row.uid);const [rowUid]=uids.splice(start,1);uids.splice(target,0,rowUid)
  const meta=commit(next,'move',{source,from:start,to:target,uids})
  emit('move',meta)
  nextTick(()=>rootRef.value?.querySelector(`[data-row-index="${target}"] .ui-key-value-key`)?.focus())
  return meta
}
function toggle(index,source='api'){
  if(!props.toggleable||props.disabled||props.readonly||!rows.value[index])return false
  const value=!Boolean(rows.value[index].item[props.enabledField])
  const next=getValue();next[index]={...next[index],[props.enabledField]:value}
  const meta=commit(next,'toggle',{source,index,field:props.enabledField,value,uids:rows.value.map(row=>row.uid)})
  if(meta)emit('toggle',{...meta,enabled:value})
  return meta
}
function replace(items,source='api'){
  if(props.disabled||props.readonly||!Array.isArray(items))return false
  if(items.length<minimum.value||items.length>maximum.value)return emitLimit('replace')
  return commit(items,'replace',{source})
}
function importText(text,options={}){
  if(props.disabled||props.readonly)return false
  const separator=String(options.separator??props.separator)
  const parsed=[];const invalidLines=[]
  String(text??'').split(/\r?\n/).forEach((line,index)=>{
    const trimmed=line.trim()
    if(!trimmed||trimmed.startsWith('#'))return
    const split=separator?line.indexOf(separator):-1
    if(split<0){invalidLines.push(index+1);return}
    parsed.push(normalizeItem({[props.keyField]:line.slice(0,split).trim(),[props.valueField]:line.slice(split+separator.length).trim(),[props.enabledField]:true}))
  })
  if(invalidLines.length){const current=getValue();const result={valid:false,errors:invalidLines.map(line=>({code:'invalid-import',row:-1,field:'editor',line})),rowErrors:current.map(()=>[]),values:current};emit('invalid',result,{type:'import',source:'import',invalidLines});return false}
  const next=options.mode==='append'?[...getValue(),...parsed]:parsed
  if(next.length<minimum.value||next.length>maximum.value)return emitLimit('import')
  const meta=commit(next,'import',{source:'import',mode:options.mode==='append'?'append':'replace',count:parsed.length})
  emit('import',meta)
  return meta
}
function validate(items=values.value){return validationFor(items)}
function getValue(){return values.value.map(item=>({...item}))}
function focus(index=0,field='key'){
  if(props.disabled)return false
  const selector=`[data-row-index="${Math.max(0,Math.trunc(Number(index)||0))}"] .ui-key-value-${field==='value'?'value':'key'}`
  const target=rootRef.value?.querySelector(selector)
  target?.focus();return Boolean(target)
}
function onFocus(event){if(!focused.value){focused.value=true;emit('focus',event,{values:getValue()})}}
function onBlur(event){setTimeout(()=>{if(typeof document!=='undefined'&&rootRef.value?.contains(document.activeElement))return;focused.value=false;emit('blur',event,{values:getValue(),validation:validation.value})},0)}
function inputName(index,field){return props.name?`${props.name}[${index}][${field}]`:undefined}

defineExpose({add,remove,move,toggle,replace,importText,validate,getValue,focus,values,validation,canAdd,canRemove})
</script>

<template>
  <div v-bind="passthroughAttrs" ref="rootRef" class="ui-key-value-editor" :class="[`size-${resolvedSize}`,attrs.class,{disabled,readonly,invalid:resolvedInvalid,focused}]" :style="attrs.style" role="group" :aria-label="resolvedAriaLabel" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" :aria-disabled="disabled||undefined" :aria-required="required||formItem?.required?.value||undefined" :data-valid="validation.valid?'true':'false'">
    <slot name="header" :values="values" :validation="validation">
      <div class="ui-key-value-header"><strong>{{ t('keyValue.title') }}</strong><span :class="validation.valid?'valid':'error'" :role="validation.valid?'status':'alert'" aria-live="polite">{{ validation.valid?t('keyValue.valid'):t('keyValue.errorSummary',{count:validation.errors.length}) }}</span></div>
    </slot>
    <div v-if="rows.length" class="ui-key-value-columns" aria-hidden="true"><span v-if="toggleable"/><span>{{ t('keyValue.key') }}</span><span>{{ t('keyValue.value') }}</span><span>{{ t('keyValue.actions') }}</span></div>
    <div v-if="rows.length" class="ui-key-value-list" role="list">
      <div v-for="(row,index) in rows" :key="row.uid" class="ui-key-value-row" :class="{off:!row.item[enabledField],invalid:validation.rowErrors[index]?.length}" role="listitem" :data-row-index="index">
        <slot name="row" :item="row.item" :index="index" :errors="validation.rowErrors[index]" :update="updateRow" :remove="remove" :move="move" :toggle="toggle">
          <input v-if="toggleable&&name" type="hidden" :name="inputName(index,enabledField)" :value="String(Boolean(row.item[enabledField]))" :disabled="disabled"/>
          <label v-if="toggleable" class="ui-key-value-toggle"><input type="checkbox" :checked="row.item[enabledField]" :disabled="disabled||readonly" :aria-label="t('keyValue.toggleRow',{row:index+1})" @change="toggle(index,'toggle')"/><span/></label>
          <input :id="index===0?controlId:`${controlId}-key-${index}`" class="ui-key-value-input ui-key-value-key" type="text" autocomplete="off" spellcheck="false" :value="row.item[keyField]" :placeholder="keyPlaceholder||t('keyValue.keyPlaceholder')" :disabled="disabled" :readonly="readonly" :required="required&&!allowEmptyKey" :name="inputName(index,keyField)" :aria-label="t('keyValue.keyRow',{row:index+1})" :aria-describedby="describedby" :aria-invalid="Boolean(validation.rowErrors[index]?.some(error=>error.field==='key'))||undefined" @input="updateRow(index,keyField,$event.target.value,'key-input')" @focus="onFocus" @blur="onBlur"/>
          <input class="ui-key-value-input ui-key-value-value" type="text" autocomplete="off" :value="row.item[valueField]" :placeholder="valuePlaceholder||t('keyValue.valuePlaceholder')" :disabled="disabled" :readonly="readonly" :required="requireValue" :name="inputName(index,valueField)" :aria-label="t('keyValue.valueRow',{row:index+1})" :aria-describedby="describedby" :aria-invalid="Boolean(validation.rowErrors[index]?.some(error=>error.field==='value'))||undefined" @input="updateRow(index,valueField,$event.target.value,'value-input')" @focus="onFocus" @blur="onBlur"/>
          <div class="ui-key-value-actions">
            <button v-if="reorderable" type="button" :disabled="disabled||readonly||index===0" :aria-label="t('keyValue.moveUp',{row:index+1})" @click="move(index,index-1,'button')">↑</button>
            <button v-if="reorderable" type="button" :disabled="disabled||readonly||index===rows.length-1" :aria-label="t('keyValue.moveDown',{row:index+1})" @click="move(index,index+1,'button')">↓</button>
            <button v-if="removable" type="button" class="danger" :disabled="!canRemove" :aria-label="t('keyValue.removeRow',{row:index+1})" @click="remove(index,'button')">×</button>
          </div>
          <ul v-if="validation.rowErrors[index]?.length" class="ui-key-value-errors"><li v-for="error in validation.rowErrors[index]" :key="`${error.code}-${error.field}`">{{ errorText(error) }}</li></ul>
        </slot>
      </div>
    </div>
    <slot v-else name="empty" :add="add" :can-add="canAdd"><div class="ui-key-value-empty">{{ t('keyValue.empty') }}</div></slot>
    <div class="ui-key-value-footer">
      <button v-if="addable" type="button" class="ui-key-value-add" :disabled="!canAdd" @click="add(defaultItem,rows.length,'button')">＋ {{ t('keyValue.add') }}</button>
      <span>{{ t('keyValue.count',{count:rows.length,max:Number.isFinite(maximum)?maximum:'∞'}) }}</span>
      <slot name="actions" :values="values" :validation="validation" :add="add" :import-text="importText"/>
    </div>
  </div>
</template>

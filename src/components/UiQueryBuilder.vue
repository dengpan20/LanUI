<script setup>
import { computed, nextTick, ref, useId } from 'vue'
import UiButton from './UiButton.vue'
import UiDatePicker from './UiDatePicker.vue'
import UiIcon from './UiIcon.vue'
import UiInput from './UiInput.vue'
import UiInputTag from './UiInputTag.vue'
import UiMultiSelect from './UiMultiSelect.vue'
import UiNumberInput from './UiNumberInput.vue'
import UiSelect from './UiSelect.vue'
import UiSwitch from './UiSwitch.vue'
import { useLocale } from '../config-runtime.js'

defineOptions({ name: 'UiQueryBuilder' })

const props=defineProps({
  modelValue:{type:Object,default:()=>({combinator:'and',rules:[]})},
  fields:{type:Array,default:()=>[]},
  operators:{type:Array,default:()=>[]},
  combinators:{type:Array,default:()=>[]},
  allowGroups:{type:Boolean,default:true},
  showNot:Boolean,
  maxDepth:{type:Number,default:3},
  minRules:{type:Number,default:0},
  maxRules:{type:Number,default:20},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  compact:Boolean,
  emitIds:{type:Boolean,default:true},
  validateOnChange:{type:Boolean,default:true},
  ruleValidator:{type:Function,default:undefined},
  caseSensitive:Boolean,
  name:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  depth:{type:Number,default:0},
})
const emit=defineEmits(['update:modelValue','change','add','remove','move','duplicate','invalid','action'])
const {t,locale}=useLocale()
const uid=useId()
const root=ref(null)
const showErrors=ref(false)
const liveMessage=ref('')
const objectIds=new WeakMap()
let serial=0

const defaultOperatorDefinitions=computed(()=>[
  {key:'equals',label:t('query.operator.equals'),arity:1},
  {key:'notEquals',label:t('query.operator.notEquals'),arity:1},
  {key:'contains',label:t('query.operator.contains'),arity:1,types:['text']},
  {key:'notContains',label:t('query.operator.notContains'),arity:1,types:['text']},
  {key:'startsWith',label:t('query.operator.startsWith'),arity:1,types:['text']},
  {key:'endsWith',label:t('query.operator.endsWith'),arity:1,types:['text']},
  {key:'greaterThan',label:t('query.operator.greaterThan'),arity:1,types:['number','date']},
  {key:'greaterOrEqual',label:t('query.operator.greaterOrEqual'),arity:1,types:['number','date']},
  {key:'lessThan',label:t('query.operator.lessThan'),arity:1,types:['number','date']},
  {key:'lessOrEqual',label:t('query.operator.lessOrEqual'),arity:1,types:['number','date']},
  {key:'between',label:t('query.operator.between'),arity:2,types:['number','date']},
  {key:'in',label:t('query.operator.in'),arity:1,multiple:true},
  {key:'notIn',label:t('query.operator.notIn'),arity:1,multiple:true},
  {key:'isEmpty',label:t('query.operator.isEmpty'),arity:0},
  {key:'isNotEmpty',label:t('query.operator.isNotEmpty'),arity:0},
])
const resolvedOperators=computed(()=>{
  const source=props.operators.length?props.operators:defaultOperatorDefinitions.value
  return source.map(item=>typeof item==='object'?{arity:1,...item}:{key:String(item),label:String(item),arity:1})
})
const resolvedCombinators=computed(()=>{
  const source=props.combinators.length?props.combinators:[{value:'and',label:t('query.combinator.and')},{value:'or',label:t('query.combinator.or')}]
  return source.map(item=>typeof item==='object'?{value:item.value??item.key,label:item.label??item.value??item.key,disabled:Boolean(item.disabled)}:{value:String(item),label:String(item)})
})
const normalizedFields=computed(()=>props.fields.map(item=>typeof item==='object'?{type:'text',...item}:{key:String(item),label:String(item),type:'text'}))
const currentGroup=computed(()=>isGroup(props.modelValue)?props.modelValue:{combinator:'and',rules:[]})
const groupRules=computed(()=>Array.isArray(currentGroup.value.rules)?currentGroup.value.rules:[])
const canEdit=computed(()=>!props.disabled&&!props.readonly)
const maxDepthValue=computed(()=>Math.max(0,Math.trunc(Number(props.maxDepth)||0)))
const minRulesValue=computed(()=>Math.max(0,Math.trunc(Number(props.minRules)||0)))
const maxRulesValue=computed(()=>Math.max(minRulesValue.value,Number.isFinite(props.maxRules)?Math.trunc(props.maxRules):Infinity))
const canAddRule=computed(()=>canEdit.value&&groupRules.value.length<maxRulesValue.value&&normalizedFields.value.some(field=>!field.disabled))
const canAddGroup=computed(()=>canAddRule.value&&props.allowGroups&&props.depth<maxDepthValue.value)
const counts=computed(()=>countNodes(currentGroup.value))
const errors=computed(()=>collectErrors(currentGroup.value))
const resolvedInvalid=computed(()=>props.invalid||(showErrors.value&&errors.value.length>0))
const serializedValue=computed(()=>JSON.stringify(publicTree(currentGroup.value)))
const groupLabel=computed(()=>props.ariaLabel||t(props.depth?'query.nestedLabel':'query.label'))

function isGroup(node){return Boolean(node&&typeof node==='object'&&Array.isArray(node.rules))}
function nodeId(node,type='rule'){
  if(node?.id!==undefined&&node?.id!==null&&String(node.id))return String(node.id)
  if(node&&typeof node==='object'){
    if(!objectIds.has(node))objectIds.set(node,`${uid}-${type}-${++serial}`)
    return objectIds.get(node)
  }
  return `${uid}-${type}-${++serial}`
}
function cloneNode(node){
  if(isGroup(node))return{...node,id:nodeId(node,'group'),combinator:node.combinator||'and',rules:node.rules.map(cloneNode)}
  return{...(node&&typeof node==='object'?node:{}),id:nodeId(node,'rule')}
}
function stripIds(node){
  if(!node||typeof node!=='object')return node
  const {id,...rest}=node
  void id
  if(isGroup(node))return{...rest,rules:node.rules.map(stripIds)}
  return rest
}
function publicTree(node,includeIds=props.emitIds){const copy=cloneNode(node);return includeIds?copy:stripIds(copy)}
function fieldFor(rule){return normalizedFields.value.find(field=>String(field.key)===String(rule?.field))||null}
function operatorFor(rule){return resolvedOperators.value.find(operator=>String(operator.key)===String(rule?.operator))||null}
function availableOperators(rule){
  const field=fieldFor(rule);if(!field)return []
  const source=Array.isArray(field.operators)&&field.operators.length?field.operators.map(item=>typeof item==='object'?{arity:1,...item}:resolvedOperators.value.find(operator=>String(operator.key)===String(item))).filter(Boolean):resolvedOperators.value
  return source.filter(operator=>!operator.types?.length||operator.types.includes(field.type)).map(operator=>({label:operator.label,value:operator.key,disabled:Boolean(operator.disabled)}))
}
function firstOperator(field){
  const probe={field:field?.key};const available=availableOperators(probe)
  const requested=field?.defaultOperator
  return String(available.find(item=>String(item.value)===String(requested))?.value??available.find(item=>!item.disabled)?.value??'')
}
function defaultValue(field,operator){
  if(field&&Object.prototype.hasOwnProperty.call(field,'defaultValue'))return typeof field.defaultValue==='function'?field.defaultValue({field,operator}):field.defaultValue
  if(operator?.multiple)return[]
  if(field?.type==='boolean')return false
  if(field?.type==='number')return null
  return''
}
function makeRule(){
  const field=normalizedFields.value.find(item=>!item.disabled)||null
  const operatorKey=firstOperator(field);const operator=resolvedOperators.value.find(item=>String(item.key)===operatorKey)
  const rule={id:`${uid}-rule-${++serial}`,field:field?.key??'',operator:operatorKey,value:defaultValue(field,operator)}
  if(Number(operator?.arity)===2)rule.value2=defaultValue(field,operator)
  return rule
}
function makeGroup(){return{id:`${uid}-group-${++serial}`,combinator:resolvedCombinators.value.find(item=>!item.disabled)?.value||'and',rules:[makeRule()]}}
function announce(message){liveMessage.value='';nextTick(()=>{liveMessage.value=message})}
function focusNode(id){nextTick(()=>{const nodes=root.value?.querySelectorAll?.('[data-query-node]')||[];const target=[...nodes].find(node=>node.dataset.queryNode===String(id));target?.querySelector?.('[role="combobox"],input,button')?.focus?.()})}
function action(type,detail={}){const payload={type,depth:props.depth,groupId:nodeId(currentGroup.value,'group'),...detail};emit(type,payload);emit('action',payload);return payload}
function commit(next,source,detail={}){
  const previous=publicTree(currentGroup.value);const value=publicTree(next);const nextErrors=collectErrors(next)
  emit('update:modelValue',value)
  const payload={source,value,previous,valid:nextErrors.length===0,errors:nextErrors,...detail}
  emit('change',payload)
  if(props.validateOnChange&&nextErrors.length)emit('invalid',{source,errors:nextErrors,value})
  return payload
}
function replaceRule(index,nextNode,source,detail={}){
  const next=cloneNode(currentGroup.value);next.rules[index]=cloneNode(nextNode);return commit(next,source,{index,...detail})
}
function addRule(index=groupRules.value.length){
  if(!canAddRule.value){announce(t('query.limit',{max:maxRulesValue.value}));return false}
  const next=cloneNode(currentGroup.value);const target=Math.max(0,Math.min(next.rules.length,Math.trunc(Number(index)||0)));const rule=makeRule();next.rules.splice(target,0,rule)
  const payload=commit(next,'add-rule',{index:target,node:rule});action('add',{kind:'rule',index:target,node:rule});announce(t('query.addedRule'));focusNode(rule.id);return payload
}
function addGroup(index=groupRules.value.length){
  if(!canAddGroup.value){announce(props.depth>=maxDepthValue.value?t('query.depthLimit',{max:maxDepthValue.value}):t('query.limit',{max:maxRulesValue.value}));return false}
  const next=cloneNode(currentGroup.value);const target=Math.max(0,Math.min(next.rules.length,Math.trunc(Number(index)||0)));const group=makeGroup();next.rules.splice(target,0,group)
  const payload=commit(next,'add-group',{index:target,node:group});action('add',{kind:'group',index:target,node:group});announce(t('query.addedGroup'));focusNode(group.id);return payload
}
function removeNode(index){
  if(!canEdit.value||groupRules.value.length<=minRulesValue.value)return false
  const next=cloneNode(currentGroup.value);const [removed]=next.rules.splice(index,1);if(!removed)return false
  const kind=isGroup(removed)?'group':'rule';const payload=commit(next,`remove-${kind}`,{index,node:removed});action('remove',{kind,index,node:removed});announce(t(kind==='group'?'query.removedGroup':'query.removedRule'));nextTick(()=>root.value?.querySelector?.('[data-query-add-rule]')?.focus?.());return payload
}
function duplicateNode(index){
  if(!canAddRule.value)return false
  const source=groupRules.value[index];if(!source)return false
  const duplicate=cloneNode(source);const renew=node=>{node.id=`${uid}-${isGroup(node)?'group':'rule'}-${++serial}`;if(isGroup(node))node.rules.forEach(renew)};renew(duplicate)
  const next=cloneNode(currentGroup.value);next.rules.splice(index+1,0,duplicate);const kind=isGroup(duplicate)?'group':'rule';const payload=commit(next,'duplicate',{index:index+1,node:duplicate});action('duplicate',{kind,index:index+1,node:duplicate});announce(t('query.duplicated'));focusNode(duplicate.id);return payload
}
function moveNode(index,direction){
  if(!canEdit.value)return false
  const target=index+direction;if(index<0||target<0||index>=groupRules.value.length||target>=groupRules.value.length)return false
  const next=cloneNode(currentGroup.value);const [node]=next.rules.splice(index,1);next.rules.splice(target,0,node);const payload=commit(next,'move',{from:index,to:target,node});action('move',{kind:isGroup(node)?'group':'rule',from:index,to:target,node});announce(t('query.moved'));focusNode(node.id);return payload
}
function updateField(index,value){
  const previous=groupRules.value[index];const field=normalizedFields.value.find(item=>String(item.key)===String(value))||null;const operatorKey=firstOperator(field);const operator=resolvedOperators.value.find(item=>String(item.key)===operatorKey)
  const next={...cloneNode(previous),field:value,operator:operatorKey,value:defaultValue(field,operator)};delete next.value2;if(Number(operator?.arity)===2)next.value2=defaultValue(field,operator)
  return replaceRule(index,next,'field',{field:value})
}
function updateOperator(index,value){
  const previous=groupRules.value[index];const operator=resolvedOperators.value.find(item=>String(item.key)===String(value));const next={...cloneNode(previous),operator:value}
  if(Number(operator?.arity)===0){delete next.value;delete next.value2}else{if(!Object.prototype.hasOwnProperty.call(next,'value'))next.value=defaultValue(fieldFor(next),operator);if(Number(operator?.arity)===2&&!Object.prototype.hasOwnProperty.call(next,'value2'))next.value2=defaultValue(fieldFor(next),operator);if(Number(operator?.arity)!==2)delete next.value2;if(operator?.multiple&&!Array.isArray(next.value))next.value=[]}
  return replaceRule(index,next,'operator',{operator:value})
}
function updateValue(index,position,value){const previous=cloneNode(groupRules.value[index]);if(position===1)previous.value2=value;else previous.value=value;return replaceRule(index,previous,'value',{position,value})}
function updateNode(index,node){return replaceRule(index,node,'nested',{node})}
function updateCombinator(value){const next=cloneNode(currentGroup.value);next.combinator=value;return commit(next,'combinator',{combinator:value})}
function toggleNot(){if(!canEdit.value||!props.showNot)return false;const next=cloneNode(currentGroup.value);next.not=!next.not;return commit(next,'not',{not:next.not})}
function clear(){if(!canEdit.value)return false;const next={...cloneNode(currentGroup.value),rules:[]};const payload=commit(next,'clear',{cleared:true});action('remove',{kind:'all',index:-1,node:null});announce(t('query.cleared'));return payload}
function editorCount(rule){return Number(operatorFor(rule)?.arity)===2?2:Number(operatorFor(rule)?.arity)===0?0:1}
function editorValue(rule,position){return position===1?rule.value2:rule.value}
function editorKind(rule){const field=fieldFor(rule);const operator=operatorFor(rule);if(operator?.editor)return operator.editor;if(operator?.multiple)return field?.options?.length?'multi-select':'input-tag';return field?.type||'text'}
function editorOptions(rule){return fieldFor(rule)?.options||[]}
function editorPlaceholder(rule,position){const field=fieldFor(rule);if(Number(operatorFor(rule)?.arity)===2)return position===0?t('query.valueFrom'):t('query.valueTo');return field?.placeholder||t('query.value')}
function valueEmpty(value){return value===undefined||value===null||value===''||(Array.isArray(value)&&value.length===0)}
function validationMessage(result){return typeof result==='string'?result:result===false?t('query.invalidValue'):''}
function validateRule(rule,path){
  const result=[];const field=fieldFor(rule);const operator=operatorFor(rule);const base={path,id:nodeId(rule,'rule'),rule}
  if(!field)result.push({...base,code:'field',message:t('query.fieldRequired')})
  if(field&&!operator)result.push({...base,code:'operator',message:t('query.operatorRequired')})
  if(operator&&Number(operator.arity)>0&&valueEmpty(rule.value))result.push({...base,code:'value',message:t('query.valueRequired')})
  if(operator&&Number(operator.arity)===2&&valueEmpty(rule.value2))result.push({...base,code:'value2',message:t('query.valueRequired')})
  if(operator&&Number(operator.arity)===2&&!valueEmpty(rule.value)&&!valueEmpty(rule.value2)&&rule.value>rule.value2)result.push({...base,code:'order',message:t('query.rangeOrder')})
  const context={field,operator,path,group:currentGroup.value}
  for(const validator of [field?.validate,props.ruleValidator])if(typeof validator==='function'){
    try{const message=validationMessage(validator(rule.value,rule,context));if(message)result.push({...base,code:'custom',message})}catch(error){result.push({...base,code:'exception',message:t('query.validationError'),error})}
  }
  return result
}
function collectErrors(group,path=[]){
  const result=[];const rules=Array.isArray(group?.rules)?group.rules:[]
  if(rules.length<minRulesValue.value)result.push({path,id:nodeId(group,'group'),group,code:'minimum',message:t('query.minimum',{min:minRulesValue.value})})
  rules.forEach((node,index)=>{const nextPath=[...path,index];if(isGroup(node))result.push(...collectErrors(node,nextPath));else result.push(...validateRule(node,nextPath))})
  return result
}
function errorFor(rule){if(!(props.invalid||showErrors.value))return'';return errors.value.find(error=>error.id===nodeId(rule,'rule'))?.message||''}
function countNodes(group){let rules=0,groups=0;for(const node of group?.rules||[]){if(isGroup(node)){groups+=1;const nested=countNodes(node);rules+=nested.rules;groups+=nested.groups}else rules+=1}return{rules,groups}}
function getPathValue(record,path){return String(path||'').split('.').filter(Boolean).reduce((value,key)=>value==null?undefined:value[key],record)}
function compare(left,right){if(Object.is(left,right))return 0;if(left==null)return-1;if(right==null)return 1;if(typeof left==='number'&&typeof right==='number')return left-right;return String(left).localeCompare(String(right),locale.value.name,{numeric:true,sensitivity:props.caseSensitive?'variant':'base'})}
function contains(left,right){const normalize=value=>props.caseSensitive?String(value??''):String(value??'').toLocaleLowerCase(locale.value.name);return normalize(left).includes(normalize(right))}
function evaluateRule(rule,record){
  const field=fieldFor(rule);const operator=operatorFor(rule);if(!field||!operator)return false
  const actual=typeof field.getValue==='function'?field.getValue(record,rule):getPathValue(record,field.key);const expected=rule.value
  if(typeof operator.test==='function')return Boolean(operator.test(actual,expected,rule,record))
  if(operator.key==='equals')return compare(actual,expected)===0
  if(operator.key==='notEquals')return compare(actual,expected)!==0
  if(operator.key==='contains')return contains(actual,expected)
  if(operator.key==='notContains')return!contains(actual,expected)
  if(operator.key==='startsWith'){const a=props.caseSensitive?String(actual??''):String(actual??'').toLocaleLowerCase(locale.value.name);const b=props.caseSensitive?String(expected??''):String(expected??'').toLocaleLowerCase(locale.value.name);return a.startsWith(b)}
  if(operator.key==='endsWith'){const a=props.caseSensitive?String(actual??''):String(actual??'').toLocaleLowerCase(locale.value.name);const b=props.caseSensitive?String(expected??''):String(expected??'').toLocaleLowerCase(locale.value.name);return a.endsWith(b)}
  if(operator.key==='greaterThan')return compare(actual,expected)>0
  if(operator.key==='greaterOrEqual')return compare(actual,expected)>=0
  if(operator.key==='lessThan')return compare(actual,expected)<0
  if(operator.key==='lessOrEqual')return compare(actual,expected)<=0
  if(operator.key==='between')return compare(actual,expected)>=0&&compare(actual,rule.value2)<=0
  if(operator.key==='in'||operator.key==='notIn'){const found=(Array.isArray(expected)?expected:[expected]).some(value=>compare(actual,value)===0);return operator.key==='in'?found:!found}
  if(operator.key==='isEmpty')return valueEmpty(actual)
  if(operator.key==='isNotEmpty')return!valueEmpty(actual)
  return false
}
function matches(record,group=currentGroup.value){const values=(group.rules||[]).map(node=>isGroup(node)?matches(record,node):evaluateRule(node,record));const matched=(group.combinator||'and')==='or'?values.some(Boolean):values.every(Boolean);return group.not?!matched:matched}
function validate(){showErrors.value=true;const result=errors.value;const payload={source:'validate',errors:result,value:publicTree(currentGroup.value)};if(result.length)emit('invalid',payload);return{valid:result.length===0,errors:result}}
function getValue(options={}){return publicTree(currentGroup.value,options.includeIds??props.emitIds)}
function onRuleKeydown(event,index){if(!canEdit.value||event.target?.tagName==='INPUT')return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();duplicateNode(index)}else if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();addRule(index+1)}else if(event.altKey&&event.key==='ArrowUp'){event.preventDefault();moveNode(index,-1)}else if(event.altKey&&event.key==='ArrowDown'){event.preventDefault();moveNode(index,1)}else if(event.altKey&&event.key==='Backspace'){event.preventDefault();removeNode(index)}}

defineExpose({root,addRule,addGroup,remove:removeNode,duplicate:duplicateNode,move:moveNode,clear,validate,getValue,matches,errors,counts})
</script>

<template>
  <section ref="root" class="ui-query-builder" :class="[`depth-${depth}`,{compact,disabled,readonly,invalid:resolvedInvalid,'is-negated':currentGroup.not}]" role="group" :aria-label="groupLabel" :aria-disabled="disabled||undefined" :aria-readonly="readonly||undefined" :aria-invalid="resolvedInvalid||undefined" :data-query-depth="depth">
    <header class="ui-query-builder-header">
      <div class="ui-query-builder-combinator">
        <span class="ui-query-builder-match">{{ t('query.match') }}</span>
        <UiSelect :model-value="currentGroup.combinator||'and'" :options="resolvedCombinators" :disabled="!canEdit" :aria-label="t('query.combinatorLabel')" @update:model-value="updateCombinator"/>
        <span class="ui-query-builder-match">{{ t('query.conditions') }}</span>
        <button v-if="showNot" type="button" class="ui-query-builder-not" :class="{active:currentGroup.not}" :aria-pressed="Boolean(currentGroup.not)" :disabled="!canEdit" @click="toggleNot">{{ t('query.not') }}</button>
      </div>
      <div class="ui-query-builder-header-actions">
        <UiButton data-query-add-rule variant="secondary" size="sm" icon="plus" :disabled="!canAddRule" @click="addRule()">{{ t('query.addRule') }}</UiButton>
        <UiButton v-if="allowGroups&&depth<maxDepthValue" variant="secondary" size="sm" icon="layers" :disabled="!canAddGroup" @click="addGroup()">{{ t('query.addGroup') }}</UiButton>
        <button v-if="groupRules.length" type="button" class="icon-btn ui-query-builder-clear" :aria-label="t('query.clear')" :title="t('query.clear')" :disabled="!canEdit" @click="clear"><UiIcon name="trash" :size="15"/></button>
      </div>
    </header>

    <div v-if="groupRules.length" class="ui-query-builder-rules">
      <template v-for="(node,index) in groupRules" :key="nodeId(node,isGroup(node)?'group':'rule')">
        <div v-if="isGroup(node)" class="ui-query-builder-node ui-query-builder-group-node" :data-query-node="nodeId(node,'group')" @keydown="onRuleKeydown($event,index)">
          <UiQueryBuilder :model-value="node" :fields="fields" :operators="operators" :combinators="combinators" :allow-groups="allowGroups" :show-not="showNot" :max-depth="maxDepthValue" :min-rules="minRulesValue" :max-rules="maxRulesValue" :disabled="disabled" :readonly="readonly" :invalid="invalid||showErrors" :compact="compact" :emit-ids="emitIds" :validate-on-change="validateOnChange" :rule-validator="ruleValidator" :case-sensitive="caseSensitive" :depth="depth+1" @update:model-value="updateNode(index,$event)" @action="emit('action',$event)"/>
          <div v-if="canEdit" class="ui-query-builder-node-actions" role="group" :aria-label="t('query.groupActions')">
            <button type="button" class="icon-btn" :aria-label="t('query.moveUp')" :title="t('query.moveUp')" :disabled="index===0" @click="moveNode(index,-1)"><UiIcon name="arrowUp" :size="14"/></button>
            <button type="button" class="icon-btn" :aria-label="t('query.moveDown')" :title="t('query.moveDown')" :disabled="index===groupRules.length-1" @click="moveNode(index,1)"><UiIcon name="arrowDown" :size="14"/></button>
            <button type="button" class="icon-btn" :aria-label="t('query.duplicateGroup')" :title="t('query.duplicateGroup')" :disabled="!canAddRule" @click="duplicateNode(index)"><UiIcon name="copy" :size="14"/></button>
            <button type="button" class="icon-btn danger" :aria-label="t('query.removeGroup')" :title="t('query.removeGroup')" :disabled="groupRules.length<=minRulesValue" @click="removeNode(index)"><UiIcon name="trash" :size="14"/></button>
          </div>
        </div>

        <div v-else class="ui-query-builder-node ui-query-builder-rule" :class="{invalid:Boolean(errorFor(node))}" role="group" :aria-label="t('query.ruleLabel',{index:index+1})" :aria-describedby="errorFor(node)?`${nodeId(node,'rule')}-error`:undefined" :data-query-node="nodeId(node,'rule')" tabindex="-1" @keydown="onRuleKeydown($event,index)">
          <div class="ui-query-builder-control is-field">
            <span class="sr-only">{{ t('query.field') }}</span>
            <slot name="field" :rule="node" :index="index" :field="fieldFor(node)" :update="value=>updateField(index,value)">
              <UiSelect :model-value="node.field" :options="normalizedFields.map(field=>({label:field.label,value:field.key,disabled:field.disabled}))" :disabled="!canEdit" :invalid="Boolean(errorFor(node)&&!fieldFor(node))" :placeholder="t('query.field')" :aria-label="t('query.fieldFor',{index:index+1})" @update:model-value="updateField(index,$event)"/>
            </slot>
          </div>
          <div class="ui-query-builder-control is-operator">
            <span class="sr-only">{{ t('query.operator') }}</span>
            <slot name="operator" :rule="node" :index="index" :operator="operatorFor(node)" :options="availableOperators(node)" :update="value=>updateOperator(index,value)">
              <UiSelect :model-value="node.operator" :options="availableOperators(node)" :disabled="!canEdit||!fieldFor(node)" :invalid="Boolean(errorFor(node)&&!operatorFor(node))" :placeholder="t('query.operator')" :aria-label="t('query.operatorFor',{index:index+1})" @update:model-value="updateOperator(index,$event)"/>
            </slot>
          </div>
          <div v-if="editorCount(node)" class="ui-query-builder-values" :class="{'is-range':editorCount(node)===2}">
            <template v-for="position in editorCount(node)" :key="position">
              <span v-if="position===2" class="ui-query-builder-range-separator" aria-hidden="true">–</span>
              <div class="ui-query-builder-control is-value">
                <slot name="value" :rule="node" :index="index" :field="fieldFor(node)" :operator="operatorFor(node)" :position="position-1" :value="editorValue(node,position-1)" :update="value=>updateValue(index,position-1,value)">
                  <UiNumberInput v-if="editorKind(node)==='number'" :model-value="editorValue(node,position-1)" :min="fieldFor(node)?.min" :max="fieldFor(node)?.max" :step="fieldFor(node)?.step" :placeholder="editorPlaceholder(node,position-1)" :disabled="disabled" :readonly="readonly" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiDatePicker v-else-if="editorKind(node)==='date'" :model-value="editorValue(node,position-1)" value-type="string" :min="fieldFor(node)?.min" :max="fieldFor(node)?.max" :placeholder="editorPlaceholder(node,position-1)" :disabled="!canEdit" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiSelect v-else-if="editorKind(node)==='select'" :model-value="editorValue(node,position-1)" :options="editorOptions(node)" searchable clearable :placeholder="editorPlaceholder(node,position-1)" :disabled="!canEdit" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiMultiSelect v-else-if="editorKind(node)==='multi-select'" :model-value="Array.isArray(editorValue(node,position-1))?editorValue(node,position-1):[]" :options="editorOptions(node)" searchable :placeholder="editorPlaceholder(node,position-1)" :disabled="!canEdit" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiInputTag v-else-if="editorKind(node)==='input-tag'" :model-value="Array.isArray(editorValue(node,position-1))?editorValue(node,position-1):[]" :placeholder="editorPlaceholder(node,position-1)" :disabled="disabled" :readonly="readonly" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiSwitch v-else-if="editorKind(node)==='boolean'" :model-value="Boolean(editorValue(node,position-1))" :disabled="!canEdit" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                  <UiInput v-else :model-value="editorValue(node,position-1)??''" :placeholder="editorPlaceholder(node,position-1)" :disabled="disabled" :readonly="readonly" :invalid="Boolean(errorFor(node))" :aria-label="t('query.valueFor',{index:index+1,position})" @update:model-value="updateValue(index,position-1,$event)"/>
                </slot>
              </div>
            </template>
          </div>
          <div v-else class="ui-query-builder-no-value">{{ t('query.noValue') }}</div>
          <div v-if="canEdit" class="ui-query-builder-node-actions" role="group" :aria-label="t('query.ruleActions')">
            <slot name="rule-actions" :rule="node" :index="index" :move="direction=>moveNode(index,direction)" :duplicate="()=>duplicateNode(index)" :remove="()=>removeNode(index)">
              <button type="button" class="icon-btn" :aria-label="t('query.moveUp')" :title="t('query.moveUp')" :disabled="index===0" @click="moveNode(index,-1)"><UiIcon name="arrowUp" :size="14"/></button>
              <button type="button" class="icon-btn" :aria-label="t('query.moveDown')" :title="t('query.moveDown')" :disabled="index===groupRules.length-1" @click="moveNode(index,1)"><UiIcon name="arrowDown" :size="14"/></button>
              <button type="button" class="icon-btn" :aria-label="t('query.duplicateRule')" :title="t('query.duplicateRule')" :disabled="!canAddRule" @click="duplicateNode(index)"><UiIcon name="copy" :size="14"/></button>
              <button type="button" class="icon-btn danger" :aria-label="t('query.removeRule')" :title="t('query.removeRule')" :disabled="groupRules.length<=minRulesValue" @click="removeNode(index)"><UiIcon name="trash" :size="14"/></button>
            </slot>
          </div>
          <span v-if="errorFor(node)" :id="`${nodeId(node,'rule')}-error`" class="ui-query-builder-error" role="alert">{{ errorFor(node) }}</span>
        </div>
      </template>
    </div>

    <slot v-else name="empty" :add-rule="addRule" :add-group="addGroup">
      <div class="ui-query-builder-empty"><UiIcon name="filter" :size="20"/><span>{{ t('query.empty') }}</span><button v-if="canAddRule" type="button" class="ui-query-builder-empty-action" @click="addRule()">{{ t('query.addFirst') }}</button></div>
    </slot>
    <footer class="ui-query-builder-footer"><span>{{ t('query.summary',{rules:counts.rules,groups:counts.groups}) }}</span><span v-if="showErrors&&errors.length" class="ui-query-builder-summary-error" role="alert">{{ t('query.errorSummary',{count:errors.length}) }}</span></footer>
    <input v-if="name&&depth===0" type="hidden" :name="name" :value="serializedValue">
    <span class="sr-only" aria-live="polite">{{ liveMessage }}</span>
  </section>
</template>

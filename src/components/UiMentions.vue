<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  modelValue:{type:[String,Number],default:''},
  options:{type:Array,default:()=>[]},
  triggers:{type:[String,Array],default:'@'},
  fetchSuggestions:Function,
  debounce:{type:Number,default:200},
  minChars:{type:Number,default:0},
  filterOption:Function,
  validateSearch:Function,
  formatMention:Function,
  suffix:{type:String,default:' '},
  allowSpaces:Boolean,
  placeholder:{type:String,default:''},
  rows:{type:Number,default:3},
  autoSize:{type:[Boolean,Object],default:false},
  maxlength:{type:[String,Number]},
  showCount:Boolean,
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  highlightFirst:{type:Boolean,default:true},
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  placement:{type:String,default:'bottom-start',validator:value=>['top-start','top-end','bottom-start','bottom-end'].includes(value)},
  appendToBody:{type:Boolean,default:true},
  cache:{type:Boolean,default:true},
})
const emit=defineEmits(['update:modelValue','input','change','search','select','open-change','load-error','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const textareaRef=ref(null)
const panelRef=ref(null)
const open=ref(false)
const focused=ref(false)
const composing=ref(false)
const loading=ref(false)
const remoteError=ref(null)
const remoteOptions=ref([])
const activeIndex=ref(-1)
const context=ref(null)
const draft=ref(String(props.modelValue??''))
const committedValue=ref(String(props.modelValue??''))
let debounceTimer=null
let requestController=null
let requestSequence=0
const requestCache=new Map()

const {t}=useLocale()
const direction=useDirection()
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const resolvedSize=useComponentSize(toRef(props,'size'))
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-mentions-${uid}`)
const listboxId=`ui-mentions-list-${uid}`
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const resolvedPlaceholder=computed(()=>props.placeholder||t('mentions.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('mentions.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('mentions.loading'))
const value=computed(()=>draft.value)
const count=computed(()=>Array.from(value.value).length)
const triggerList=computed(()=>[...new Set((Array.isArray(props.triggers)?props.triggers:[props.triggers]).map(item=>String(item??'')).filter(Boolean))].sort((a,b)=>b.length-a.length))
const normalizedOptions=computed(()=>props.options.map(normalizeOption).filter(option=>!option.trigger||option.trigger===context.value?.trigger))
const resolvedPlacement=computed(()=>{
  if(direction.value!=='rtl')return props.placement
  if(props.placement.endsWith('-start'))return props.placement.replace(/-start$/,'-end')
  if(props.placement.endsWith('-end'))return props.placement.replace(/-end$/,'-start')
  return props.placement
})
const controlAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-labelledby','aria-describedby'].includes(key))))

function normalizeOption(option){
  if(option&&typeof option==='object')return {label:String(option.label??option.value??''),value:option.value??option.label??'',disabled:!!option.disabled,keywords:Array.isArray(option.keywords)?option.keywords:[],description:option.description==null?'':String(option.description),trigger:option.trigger==null?'':String(option.trigger),raw:option}
  return {label:String(option),value:String(option),disabled:false,keywords:[],description:'',trigger:'',raw:option}
}
function defaultFilter(query,option){
  const needle=String(query).toLocaleLowerCase()
  return [option.label,option.value,...option.keywords].some(term=>String(term??'').toLocaleLowerCase().includes(needle))
}
const localSuggestions=computed(()=>normalizedOptions.value.filter(option=>props.filterOption?props.filterOption(context.value?.query??'',option):defaultFilter(context.value?.query??'',option)))
const suggestions=computed(()=>props.fetchSuggestions?remoteOptions.value:localSuggestions.value)
const optionId=index=>`ui-mentions-option-${uid}-${index}`
const activeDescendant=computed(()=>open.value&&activeIndex.value>=0&&suggestions.value[activeIndex.value]?optionId(activeIndex.value):undefined)
const menuWidth=computed(()=>`${Math.max(220,Math.min(420,rootRef.value?.getBoundingClientRect().width||280))}px`)
const optionKey=(option,index)=>`${option.trigger}:${typeof option.value}:${String(option.value)}:${index}`

const caretRect=ref({left:0,right:0,top:0,bottom:0,width:0,height:0,x:0,y:0,toJSON(){}})
const caretAnchorRef=ref({getBoundingClientRect:()=>caretRect.value})
const {floatingStyle,resolvedPlacement:actualPlacement,update:updatePosition}=useFloatingPosition({
  triggerRef:caretAnchorRef,
  panelRef,
  open:computed(()=>open.value&&props.appendToBody),
  placement:resolvedPlacement,
  offset:6,
  zIndex:338,
})
const panelStyle=computed(()=>props.appendToBody?{...floatingStyle.value,width:menuWidth.value,minWidth:menuWidth.value}:undefined)

function enabledIndex(start,delta){
  if(!suggestions.value.length)return -1
  let index=start
  for(let countIndex=0;countIndex<suggestions.value.length;countIndex+=1){
    index=(index+delta+suggestions.value.length)%suggestions.value.length
    if(!suggestions.value[index]?.disabled)return index
  }
  return -1
}
function resetActive(){activeIndex.value=props.highlightFirst?enabledIndex(-1,1):-1;nextTick(updatePosition)}
function setOpen(next){
  if(props.disabled||props.readonly||!context.value)next=false
  if(open.value===next)return
  open.value=next
  emit('open-change',next)
  if(next)resetActive();else activeIndex.value=-1
}
function clearDebounce(){if(debounceTimer){clearTimeout(debounceTimer);debounceTimer=null}}
function abortRequest(){requestSequence+=1;requestController?.abort();requestController=null;loading.value=false}
function contextAt(text,caret){
  const source=String(text??'').slice(0,Math.max(0,caret))
  let candidate=null
  for(const trigger of triggerList.value){
    let index=source.lastIndexOf(trigger)
    while(index>=0){
      const previous=index===0?'':source[index-1]
      const boundary=index===0||/[\s([{]/.test(previous)
      const query=source.slice(index+trigger.length)
      const validText=!query.includes('\n')&&(props.allowSpaces||!/[\s]/.test(query))
      if(boundary&&validText&&query.length>=Math.max(0,props.minChars)&&(props.validateSearch?props.validateSearch(query,trigger,text):true)){
        if(!candidate||index>candidate.start)candidate={trigger,query,start:index,end:caret}
        break
      }
      index=source.lastIndexOf(trigger,index-1)
    }
  }
  return candidate
}
function updateCaretAnchor(){
  const textarea=textareaRef.value
  if(!textarea||typeof document==='undefined'||typeof getComputedStyle==='undefined')return
  const caret=textarea.selectionStart??value.value.length
  const mirror=document.createElement('div')
  const computedStyle=getComputedStyle(textarea)
  const copied=['fontFamily','fontSize','fontWeight','fontStyle','fontVariant','letterSpacing','lineHeight','textTransform','textIndent','textAlign','wordSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','boxSizing','whiteSpace','overflowWrap','wordBreak','tabSize']
  Object.assign(mirror.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',inset:'0 auto auto 0',width:`${textarea.getBoundingClientRect().width}px`,height:'auto',overflow:'hidden',whiteSpace:'pre-wrap'})
  for(const property of copied)mirror.style[property]=computedStyle[property]
  mirror.textContent=value.value.slice(0,caret)
  const marker=document.createElement('span');marker.textContent='\u200b';mirror.append(marker);document.body.append(mirror)
  const rootRect=textarea.getBoundingClientRect();const markerRect=marker.getBoundingClientRect();const mirrorRect=mirror.getBoundingClientRect();const lineHeight=Number.parseFloat(computedStyle.lineHeight)||Number.parseFloat(computedStyle.fontSize)||16
  const left=rootRect.left+(markerRect.left-mirrorRect.left)-textarea.scrollLeft
  const top=rootRect.top+(markerRect.top-mirrorRect.top)-textarea.scrollTop
  caretRect.value={left,right:left,top,bottom:top+lineHeight,width:0,height:lineHeight,x:left,y:top,toJSON(){return this}}
  mirror.remove();nextTick(updatePosition)
}
function updateContext({immediate=false}={}){
  if(props.disabled||props.readonly){close();return}
  const textarea=textareaRef.value
  const found=contextAt(value.value,textarea?.selectionStart??value.value.length)
  const changed=found?.trigger!==context.value?.trigger||found?.query!==context.value?.query||found?.start!==context.value?.start
  context.value=found
  if(!found){clearDebounce();abortRequest();remoteOptions.value=[];remoteError.value=null;setOpen(false);return}
  updateCaretAnchor();setOpen(true)
  if(changed)scheduleSuggestions(found,{immediate})
}
async function loadSuggestions(requestContext){
  if(!props.fetchSuggestions||!requestContext)return
  const key=`${requestContext.trigger}\u0000${requestContext.query}`
  emit('search',requestContext.query,{trigger:requestContext.trigger,start:requestContext.start})
  if(props.cache&&requestCache.has(key)){abortRequest();remoteOptions.value=requestCache.get(key);remoteError.value=null;resetActive();return}
  abortRequest();const sequence=++requestSequence
  const controller=typeof AbortController==='undefined'?null:new AbortController();requestController=controller;loading.value=true;remoteError.value=null
  try{
    const result=await props.fetchSuggestions(requestContext.query,{trigger:requestContext.trigger,signal:controller?.signal})
    if(sequence!==requestSequence||controller?.signal.aborted)return
    const normalized=(Array.isArray(result)?result:[]).map(normalizeOption).filter(option=>!option.trigger||option.trigger===requestContext.trigger)
    remoteOptions.value=normalized;if(props.cache)requestCache.set(key,normalized);resetActive()
  }catch(error){
    if(sequence!==requestSequence||error?.name==='AbortError'||controller?.signal.aborted)return
    remoteOptions.value=[];remoteError.value=error;emit('load-error',{error,query:requestContext.query,trigger:requestContext.trigger});resetActive()
  }finally{if(sequence===requestSequence){loading.value=false;requestController=null}}
}
function scheduleSuggestions(requestContext,{immediate=false}={}){
  clearDebounce()
  if(!props.fetchSuggestions){emit('search',requestContext.query,{trigger:requestContext.trigger,start:requestContext.start});resetActive();return}
  const delay=immediate?0:Math.max(0,Number.isFinite(props.debounce)?props.debounce:200)
  if(!delay){void loadSuggestions(requestContext);return}
  const snapshot={...requestContext};debounceTimer=setTimeout(()=>{debounceTimer=null;void loadSuggestions(snapshot)},delay)
}
function resize(){
  const textarea=textareaRef.value
  if(!textarea||!props.autoSize)return
  const config=typeof props.autoSize==='object'?props.autoSize:{};const style=getComputedStyle(textarea);const line=Number.parseFloat(style.lineHeight)||20;const numeric=property=>Number.parseFloat(style[property])||0;const vertical=numeric('paddingTop')+numeric('paddingBottom')+numeric('borderTopWidth')+numeric('borderBottomWidth')
  const minRows=Math.max(1,Number(config.minRows??props.rows)||1);const maxRows=Math.max(minRows,Number(config.maxRows??20)||20)
  textarea.style.height='auto';textarea.style.height=`${Math.min(Math.max(textarea.scrollHeight,line*minRows+vertical),line*maxRows+vertical)}px`;textarea.style.overflowY=textarea.scrollHeight>line*maxRows+vertical?'auto':'hidden'
}
function onInput(event){
  const next=event.target.value;draft.value=next
  if(composing.value||event.isComposing)return
  emit('update:modelValue',next);emit('input',next)
  nextTick(()=>{resize();updateContext()})
}
function onCompositionEnd(event){composing.value=false;draft.value=event.target.value;emit('update:modelValue',event.target.value);emit('input',event.target.value);nextTick(()=>{resize();updateContext()})}
function selectOption(option,index=activeIndex.value,source='option'){
  if(!option||option.disabled||!context.value)return false
  const current=value.value;const meta={trigger:context.value.trigger,query:context.value.query,start:context.value.start,end:context.value.end,index,source}
  const insertion=String(props.formatMention?props.formatMention(option,meta):`${meta.trigger}${option.value}${props.suffix}`)
  const next=current.slice(0,meta.start)+insertion+current.slice(meta.end);const caret=meta.start+insertion.length;draft.value=next
  committedValue.value=next;emit('update:modelValue',next);emit('input',next);emit('change',next,{source:'mention',option,trigger:meta.trigger,query:meta.query,start:meta.start,end:caret});emit('select',option,{...meta,value:insertion})
  context.value=null;setOpen(false)
  nextTick(()=>{textareaRef.value?.focus();textareaRef.value?.setSelectionRange(caret,caret);resize();updateCaretAnchor()})
  return true
}
function onKeydown(event){
  if(props.disabled||props.readonly||composing.value||event.isComposing||event.keyCode===229)return
  if((event.key==='ArrowDown'||event.key==='ArrowUp')&&open.value){event.preventDefault();activeIndex.value=enabledIndex(activeIndex.value,event.key==='ArrowDown'?1:-1)}
  else if(open.value&&event.key==='Home'&&event.ctrlKey){event.preventDefault();activeIndex.value=enabledIndex(-1,1)}
  else if(open.value&&event.key==='End'&&event.ctrlKey){event.preventDefault();activeIndex.value=enabledIndex(0,-1)}
  else if(open.value&&(event.key==='Enter'||event.key==='Tab')&&activeIndex.value>=0){event.preventDefault();selectOption(suggestions.value[activeIndex.value],activeIndex.value,event.key.toLocaleLowerCase())}
  else if(event.key==='Escape'&&open.value){event.preventDefault();close()}
  else nextTick(()=>updateContext({immediate:true}))
}
function onFocus(event){focused.value=true;committedValue.value=value.value;emit('focus',event);nextTick(()=>{resize();updateContext({immediate:true})})}
function onBlur(event){
  focused.value=false
  window.setTimeout(()=>{if(!rootRef.value?.contains(document.activeElement)&&!panelRef.value?.contains(document.activeElement))close()},0)
  if(value.value!==committedValue.value){committedValue.value=value.value;emit('change',value.value,{source:'blur'})}
  emit('blur',event)
}
function outside(event){if(rootRef.value?.contains(event.target)||panelRef.value?.contains(event.target))return;close()}
function focus(options){textareaRef.value?.focus(options)}
function blur(){textareaRef.value?.blur()}
function close(){clearDebounce();abortRequest();remoteOptions.value=[];remoteError.value=null;context.value=null;setOpen(false)}
function insert(option){const normalized=normalizeOption(option);return selectOption(normalized,-1,'api')}

watch(()=>props.modelValue,next=>{draft.value=String(next??'');nextTick(()=>{resize();if(focused.value&&!composing.value)updateContext()})})
watch(()=>[props.options,props.triggers],()=>{requestCache.clear();if(open.value)updateContext({immediate:true})},{deep:true})
watch(()=>props.fetchSuggestions,()=>{clearDebounce();abortRequest();requestCache.clear();remoteOptions.value=[];remoteError.value=null})
onMounted(()=>{document.addEventListener('pointerdown',outside);resize()})
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);clearDebounce();abortRequest()})
defineExpose({root:rootRef,textarea:textareaRef,focus,blur,close,insert,updatePosition})
</script>

<template>
  <div ref="rootRef" class="ui-mentions" :class="[`size-${resolvedSize}`,attrs.class,{open,focused,disabled,readonly,invalid:resolvedInvalid,loading}]" :style="attrs.style" role="combobox" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="open?listboxId:undefined" :aria-activedescendant="activeDescendant" :aria-label="attrs['aria-label']||undefined" :aria-labelledby="labelledby">
    <textarea
      v-bind="controlAttrs"
      :id="controlId"
      ref="textareaRef"
      class="ui-mentions-textarea"
      :value="value"
      :rows="rows"
      :placeholder="resolvedPlaceholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      aria-autocomplete="list"
      :aria-controls="open?listboxId:undefined"
      :aria-activedescendant="activeDescendant"
      :aria-labelledby="labelledby"
      :aria-describedby="describedby"
      :aria-invalid="resolvedInvalid||undefined"
      :aria-busy="loading||undefined"
      @input="onInput"
      @keydown="onKeydown"
      @keyup="updateContext"
      @click="updateContext({immediate:true})"
      @scroll="open&&updateCaretAnchor()"
      @focus="onFocus"
      @blur="onBlur"
      @compositionstart="composing=true"
      @compositionend="onCompositionEnd"
    />
    <span v-if="showCount&&maxlength" class="ui-mentions-count" aria-live="polite">{{ count }}/{{ maxlength }}</span>
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="mentions-menu">
        <div v-if="open" v-bind="portalThemeAttrs" class="ui-mentions-portal" :class="{teleported:appendToBody}" :style="portalThemeStyle" :role="appendToBody?'region':undefined" :aria-label="appendToBody?t('mentions.suggestions'):undefined">
          <div :id="listboxId" ref="panelRef" class="ui-mentions-menu" :class="{'ui-floating-panel':appendToBody}" :style="panelStyle" :data-placement="actualPlacement" role="listbox" :aria-labelledby="labelledby" :aria-label="labelledby?undefined:t('mentions.suggestions')">
            <div v-if="loading" class="ui-mentions-status" role="status"><slot name="loading"><span class="ui-mentions-spinner" aria-hidden="true"/><span>{{ resolvedLoadingText }}</span></slot></div>
            <div v-else-if="remoteError" class="ui-mentions-status error" role="alert"><slot name="error" :error="remoteError"><AppIcon name="alert" :size="16"/><span>{{ t('mentions.error') }}</span></slot></div>
            <template v-else-if="suggestions.length">
              <button v-for="(option,index) in suggestions" :id="optionId(index)" :key="optionKey(option,index)" type="button" class="ui-mentions-option" :class="{active:index===activeIndex}" role="option" tabindex="-1" :aria-selected="index===activeIndex" :disabled="option.disabled" @pointerdown.prevent @mouseenter="!option.disabled&&(activeIndex=index)" @click="selectOption(option,index)">
                <slot name="option" :option="option" :index="index" :active="index===activeIndex" :trigger="context?.trigger" :query="context?.query">
                  <span class="ui-mentions-option-avatar" aria-hidden="true">{{ option.label.slice(0,1).toLocaleUpperCase() }}</span>
                  <span class="ui-mentions-option-copy"><strong>{{ option.label }}</strong><small v-if="option.description">{{ option.description }}</small></span>
                  <span class="ui-mentions-option-value">{{ context?.trigger }}{{ option.value }}</span>
                </slot>
              </button>
            </template>
            <div v-else class="ui-mentions-status"><slot name="empty"><AppIcon name="search" :size="18"/><span>{{ resolvedEmptyText }}</span></slot></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

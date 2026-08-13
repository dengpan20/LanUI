<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { closeOverlay, isTopOverlay, openOverlay } from './overlayManager.js'
import { captureFocusOrigin, focusWithRetry, registerFocusOriginTracking } from './focusUtils.js'
import { isClient } from '../env.js'
import { useDirection, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({ inheritAttrs:false })

const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const props=defineProps({
  modelValue:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  query:{type:String,default:undefined},
  defaultQuery:{type:String,default:''},
  commands:{type:Array,default:()=>[]},
  fetchCommands:Function,
  debounce:{type:Number,default:180},
  minChars:{type:Number,default:0},
  cache:{type:Boolean,default:true},
  maxResults:{type:Number,default:50},
  title:{type:String,default:''},
  placeholder:{type:String,default:''},
  emptyText:{type:String,default:''},
  loadingText:{type:String,default:''},
  errorText:{type:String,default:''},
  hotkeys:{type:Array,default:()=>['Meta+K','Control+K']},
  globalShortcut:{type:Boolean,default:true},
  closeOnSelect:{type:Boolean,default:true},
  closeOnEsc:{type:Boolean,default:true},
  closeOnMask:{type:Boolean,default:true},
  clearOnClose:{type:Boolean,default:true},
  loop:{type:Boolean,default:true},
  disabled:Boolean,
  width:{type:[String,Number],default:640},
})
const emit=defineEmits(['update:modelValue','update:query','open','close','select','search','load-error','data-error'])
const attrs=useAttrs()
const {t}=useLocale()
const direction=useDirection()
const uid=useId()
const overlayId=`command-palette-${uid}`
const titleId=`ui-command-title-${uid}`
const inputId=`ui-command-input-${uid}`
const listboxId=`ui-command-list-${uid}`
const rootRef=ref(null)
const inputRef=ref(null)
const innerOpen=ref(props.defaultOpen)
const innerQuery=ref(props.defaultQuery)
const activeIndex=ref(-1)
const loading=ref(false)
const remoteError=ref(null)
const remoteCommands=ref([])
const composing=ref(false)
const overlayZ=ref(300)
let debounceTimer=null
let requestController=null
let requestSequence=0
let returnFocus=null
let stopFocusTracking=()=>{}
let pendingOpenChange=null
let openInitialized=false
const requestCache=new Map()

const open=computed(()=>props.modelValue===undefined?innerOpen.value:props.modelValue)
const currentQuery=computed(()=>props.query===undefined?innerQuery.value:props.query)
const resolvedTitle=computed(()=>props.title||t('command.title'))
const resolvedPlaceholder=computed(()=>props.placeholder||t('command.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('command.empty'))
const resolvedLoadingText=computed(()=>props.loadingText||t('command.loading'))
const resolvedErrorText=computed(()=>props.errorText||t('command.error'))
const dialogLabel=computed(()=>attrs['aria-label']||resolvedTitle.value)
const dialogAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style','aria-label'].includes(key))))
const widthStyle=computed(()=>typeof props.width==='number'?`${props.width}px`:props.width)
function displayHotkey(value){return String(value).replace(/Meta/gi,'⌘').replace(/Control/gi,'Ctrl').split('+').join(' + ')}
const hotkeyLabel=computed(()=>{
  const values=props.hotkeys.map(value=>String(value))
  const metaK=values.find(value=>/^Meta\+K$/i.test(value)),controlK=values.find(value=>/^Control\+K$/i.test(value))
  if(metaK&&controlK)return '⌘ / Ctrl + K'
  return values[0]?displayHotkey(values[0]):''
})
const hotkeyAria=computed(()=>props.hotkeys.map(value=>String(value).replaceAll('+','+')).join(' '))

function normalizedText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim()}
function normalizeCommand(command,index,source='local'){
  if(!command||typeof command!=='object')return {key:`__invalid-${source}-${index}`,label:'',disabled:true,hidden:true,source,raw:command,index}
  const key=command.key??command.value
  return {
    ...command,
    key,
    label:String(command.label??command.title??key??''),
    description:command.description==null?'':String(command.description),
    group:command.group==null?'':String(command.group),
    keywords:Array.isArray(command.keywords)?command.keywords.map(String):[],
    disabled:!!command.disabled,
    hidden:!!command.hidden,
    source,
    raw:command,
    index,
  }
}
function normalizedList(commands,source){return (Array.isArray(commands)?commands:[]).map((item,index)=>normalizeCommand(item,index,source))}
const localCommands=computed(()=>normalizedList(props.commands,'local'))
const combinedCommands=computed(()=>{
  const all=[...localCommands.value,...normalizedList(remoteCommands.value,'remote')]
  const seen=new Set()
  return all.filter(command=>{
    if(command.hidden||command.key===undefined||command.key===null||seen.has(command.key))return false
    seen.add(command.key)
    return true
  })
})
function fuzzyScore(command,query){
  const needle=normalizedText(query)
  if(!needle)return 1
  const label=normalizedText(command.label)
  const description=normalizedText(command.description)
  const keywords=command.keywords.map(normalizedText)
  if(label===needle)return 1000
  if(label.startsWith(needle))return 850-needle.length
  const direct=label.indexOf(needle)
  if(direct>=0)return 700-direct
  const keywordIndex=keywords.findIndex(value=>value.startsWith(needle))
  if(keywordIndex>=0)return 620-keywordIndex
  if(keywords.some(value=>value.includes(needle)))return 540
  if(description.includes(needle))return 360-description.indexOf(needle)
  const haystack=[label,...keywords,description].join(' ')
  let cursor=0,gap=0
  for(const character of needle){const found=haystack.indexOf(character,cursor);if(found<0)return 0;gap+=found-cursor;cursor=found+1}
  return Math.max(1,240-gap)
}
const filteredCommands=computed(()=>combinedCommands.value.map((command,index)=>({command,index,score:fuzzyScore(command,currentQuery.value)})).filter(item=>item.score>0).sort((left,right)=>right.score-left.score||left.index-right.index).slice(0,Math.max(1,props.maxResults)).map(item=>item.command))
const groups=computed(()=>{
  const records=[]
  for(const command of filteredCommands.value){
    const name=command.group||''
    let group=records.find(item=>item.name===name)
    if(!group){group={name,commands:[]};records.push(group)}
    group.commands.push(command)
  }
  return records
})
const optionId=index=>`ui-command-option-${uid}-${index}`
const groupId=index=>`ui-command-group-${uid}-${index}`
const activeCommand=computed(()=>filteredCommands.value[activeIndex.value])
const activeDescendant=computed(()=>open.value&&activeCommand.value?optionId(activeIndex.value):undefined)
const optionIndex=command=>filteredCommands.value.indexOf(command)
const optionKey=(command,index)=>`${typeof command.key}:${String(command.key)}:${index}`

function enabledIndex(start,delta){
  const length=filteredCommands.value.length
  if(!length)return -1
  let index=start
  for(let count=0;count<length;count+=1){
    index+=delta
    if(props.loop)index=(index+length)%length
    else if(index<0||index>=length)return Math.max(0,Math.min(length-1,start))
    if(!filteredCommands.value[index]?.disabled)return index
  }
  return -1
}
function resetActive(){activeIndex.value=enabledIndex(-1,1)}
function commitQuery(value){
  const text=String(value??'')
  if(props.query===undefined)innerQuery.value=text
  emit('update:query',text)
}
function setOpen(value,source='programmatic'){
  const next=props.disabled?false:!!value
  if(open.value===next)return
  pendingOpenChange={value:next,source}
  if(props.modelValue===undefined)innerOpen.value=next
  emit('update:modelValue',next)
}
function toggle(source='trigger'){setOpen(!open.value,source)}
function abortRequest(){requestController?.abort();requestController=null;loading.value=false}
function clearDebounce(){if(debounceTimer){clearTimeout(debounceTimer);debounceTimer=null}}
function normalizeRemoteResult(result){return Array.isArray(result)?result:[]}
async function loadCommands(query,{force=false}={}){
  if(!props.fetchCommands)return
  const text=String(query)
  emit('search',text)
  if(text.length<Math.max(0,props.minChars)){abortRequest();remoteCommands.value=[];remoteError.value=null;resetActive();return}
  if(!force&&props.cache&&requestCache.has(text)){abortRequest();remoteCommands.value=requestCache.get(text);remoteError.value=null;resetActive();return}
  abortRequest()
  const sequence=++requestSequence
  requestController=typeof AbortController==='undefined'?null:new AbortController()
  loading.value=true;remoteError.value=null
  try{
    const result=await props.fetchCommands(text,{signal:requestController?.signal})
    if(sequence!==requestSequence||requestController?.signal.aborted)return
    const normalized=normalizeRemoteResult(result)
    remoteCommands.value=normalized
    if(props.cache)requestCache.set(text,normalized)
    resetActive()
  }catch(error){
    if(sequence!==requestSequence||error?.name==='AbortError'||requestController?.signal.aborted)return
    remoteCommands.value=[];remoteError.value=error;emit('load-error',{error,query:text});resetActive()
  }finally{if(sequence===requestSequence){loading.value=false;requestController=null}}
}
function scheduleLoad(query,{immediate=false,force=false}={}){
  clearDebounce()
  if(!props.fetchCommands){emit('search',String(query));resetActive();return}
  const delay=immediate?0:Math.max(0,Number.isFinite(props.debounce)?props.debounce:180)
  if(!delay){void loadCommands(query,{force});return}
  debounceTimer=setTimeout(()=>{debounceTimer=null;void loadCommands(query,{force})},delay)
}
function retry(){scheduleLoad(currentQuery.value,{immediate:true,force:true})}
function onInput(event){
  commitQuery(event.target.value)
  if(composing.value||event.isComposing)return
  scheduleLoad(event.target.value)
}
function onCompositionEnd(event){composing.value=false;commitQuery(event.target.value);scheduleLoad(event.target.value)}
function selectCommand(command,source='pointer'){
  if(!command||command.disabled)return
  emit('select',command.raw??command,{source,query:currentQuery.value})
  if(props.closeOnSelect)setOpen(false,'select')
}
function move(delta){activeIndex.value=enabledIndex(activeIndex.value,delta);nextTick(()=>document.getElementById(activeDescendant.value)?.scrollIntoView?.({block:'nearest'}))}
function onInputKeydown(event){
  if(composing.value||event.isComposing||event.keyCode===229)return
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();event.stopPropagation();move(event.key==='ArrowDown'?1:-1)}
  else if(event.key==='PageDown'||event.key==='PageUp'){event.preventDefault();event.stopPropagation();for(let count=0;count<8;count+=1)move(event.key==='PageDown'?1:-1)}
  else if((event.key==='Home'||event.key==='End')&&(event.ctrlKey||event.metaKey)){event.preventDefault();event.stopPropagation();activeIndex.value=event.key==='Home'?enabledIndex(-1,1):enabledIndex(filteredCommands.value.length,-1)}
  else if(event.key==='Enter'&&activeCommand.value){event.preventDefault();event.stopPropagation();selectCommand(activeCommand.value,'keyboard')}
}
function focusable(){return [...(rootRef.value?.querySelectorAll('button:not(:disabled),input:not(:disabled),[href],[tabindex]:not([tabindex="-1"])')||[])]}
function onDialogKeydown(event){
  if(event.key==='Escape'&&props.closeOnEsc&&isTopOverlay(overlayId)){event.preventDefault();setOpen(false,'escape');return}
  if(event.key!=='Tab')return
  const items=focusable()
  if(!items.length){event.preventDefault();rootRef.value?.focus();return}
  const first=items[0],last=items.at(-1)
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
}
function parsedHotkey(value){
  const parts=String(value).toLocaleLowerCase().split('+').map(part=>part.trim()).filter(Boolean)
  const key=parts.at(-1)||''
  return {key,ctrl:parts.includes('control')||parts.includes('ctrl'),meta:parts.includes('meta')||parts.includes('cmd')||parts.includes('command'),alt:parts.includes('alt')||parts.includes('option'),shift:parts.includes('shift'),mod:parts.includes('mod')}
}
function hotkeyMatches(event,value){
  const expected=parsedHotkey(value)
  const modMatches=expected.mod?(event.ctrlKey||event.metaKey):true
  return normalizedText(event.key)===expected.key&&modMatches&&event.ctrlKey===(expected.ctrl||expected.mod&&event.ctrlKey)&&event.metaKey===(expected.meta||expected.mod&&event.metaKey)&&event.altKey===expected.alt&&event.shiftKey===expected.shift
}
function onGlobalKeydown(event){
  if(!props.globalShortcut||props.disabled||event.defaultPrevented||composing.value||!props.hotkeys.some(value=>hotkeyMatches(event,value)))return
  event.preventDefault();setOpen(!open.value,'shortcut')
}
function validateCommands(){
  const errors=[],seen=new Set()
  for(const [index,command] of props.commands.entries()){
    const key=command?.key??command?.value
    if(key===undefined||key===null)errors.push({code:'missing-key',index,command})
    else if(seen.has(key))errors.push({code:'duplicate-key',key,index,command})
    else seen.add(key)
  }
  if(errors.length)emit('data-error',{errors})
}

watch(open,async value=>{
  if(!isClient)return
  const initialized=openInitialized
  openInitialized=true
  const source=pendingOpenChange?.value===value?pendingOpenChange.source:'programmatic'
  pendingOpenChange=null
  if(value){
    returnFocus=captureFocusOrigin();overlayZ.value=openOverlay(overlayId);remoteError.value=null;resetActive();scheduleLoad(currentQuery.value,{immediate:true})
    await nextTick();inputRef.value?.focus();emit('open',{source})
  }else{
    clearDebounce();abortRequest();requestSequence+=1;closeOverlay(overlayId)
    if(props.clearOnClose){commitQuery('');remoteCommands.value=[];remoteError.value=null}
    if(initialized)emit('close',{source})
    await nextTick();focusWithRetry(returnFocus)
  }
},{immediate:true})
watch(currentQuery,()=>resetActive())
watch(()=>props.commands,()=>{validateCommands();resetActive()},{deep:true})
watch(()=>props.fetchCommands,()=>{clearDebounce();abortRequest();requestSequence+=1;requestCache.clear();remoteCommands.value=[];remoteError.value=null})
watch(()=>props.disabled,value=>{if(value&&open.value)setOpen(false,'programmatic')})
onMounted(()=>{stopFocusTracking=registerFocusOriginTracking();document.addEventListener('keydown',onGlobalKeydown);validateCommands()})
onBeforeUnmount(()=>{stopFocusTracking();document.removeEventListener('keydown',onGlobalKeydown);clearDebounce();abortRequest();requestSequence+=1;closeOverlay(overlayId)})
</script>

<template>
  <span class="ui-command-palette-trigger" :class="attrs.class" :style="attrs.style"><slot name="trigger" :open="()=>setOpen(true,'trigger')" :close="()=>setOpen(false,'trigger')" :toggle="toggle"/></span>
  <Teleport to="body">
    <Transition name="command-palette-fade">
      <div v-if="open" v-bind="portalThemeAttrs" class="ui-command-palette-overlay" :style="[portalThemeStyle,{zIndex:overlayZ}]" @mousedown.self="closeOnMask&&isTopOverlay(overlayId)&&setOpen(false,'mask')">
        <section v-bind="dialogAttrs" ref="rootRef" class="ui-command-palette" :dir="direction" role="dialog" aria-modal="true" :aria-label="dialogLabel" :style="{width:widthStyle}" tabindex="-1" @keydown="onDialogKeydown">
          <header class="ui-command-header"><slot name="header"><h2 :id="titleId">{{ resolvedTitle }}</h2><kbd v-if="hotkeyLabel">{{ hotkeyLabel }}</kbd></slot><button type="button" class="ui-command-close" :aria-label="t('command.close')" @click="setOpen(false,'close-button')"><AppIcon name="close" :size="15"/></button></header>
          <div class="ui-command-search"><AppIcon name="search" :size="18"/><input :id="inputId" ref="inputRef" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" :aria-label="t('command.label')" :aria-keyshortcuts="hotkeyAria||undefined" :aria-expanded="true" :aria-controls="listboxId" :aria-activedescendant="activeDescendant" :aria-busy="loading||undefined" :placeholder="resolvedPlaceholder" :value="currentQuery" @input="onInput" @keydown="onInputKeydown" @compositionstart="composing=true" @compositionend="onCompositionEnd"/><span v-if="loading" class="ui-command-spinner" aria-hidden="true"/><button v-else-if="currentQuery" type="button" class="ui-command-clear" :aria-label="t('common.clear')" @click="commitQuery('');scheduleLoad('',{immediate:true})"><AppIcon name="close" :size="13"/></button></div>
          <div :id="listboxId" class="ui-command-results" role="listbox" :aria-label="t('command.results')" aria-live="polite">
            <div v-if="loading&&!filteredCommands.length" class="ui-command-status" role="status"><slot name="loading"><span class="ui-command-spinner" aria-hidden="true"/><span>{{ resolvedLoadingText }}</span></slot></div>
            <div v-else-if="remoteError&&!filteredCommands.length" class="ui-command-status error" role="alert"><slot name="error" :error="remoteError" :retry="retry"><AppIcon name="alert" :size="18"/><span>{{ resolvedErrorText }}</span><button type="button" class="btn btn-outline btn-sm" @click="retry">{{ t('command.retry') }}</button></slot></div>
            <template v-else-if="filteredCommands.length">
              <div v-for="(group,groupIndex) in groups" :key="group.name||'default'" class="ui-command-group" role="group" :aria-labelledby="group.name?groupId(groupIndex):undefined">
                <div v-if="group.name" :id="groupId(groupIndex)" class="ui-command-group-label"><slot name="group" :group="group.name">{{ group.name }}</slot></div>
                <button v-for="(command,index) in group.commands" :id="optionId(optionIndex(command))" :key="optionKey(command,index)" type="button" class="ui-command-option" :class="{active:optionIndex(command)===activeIndex}" role="option" tabindex="-1" :aria-selected="optionIndex(command)===activeIndex" :aria-disabled="command.disabled||undefined" :disabled="command.disabled" @pointerdown.prevent @mouseenter="!command.disabled&&(activeIndex=optionIndex(command))" @click="selectCommand(command,'pointer')">
                  <slot name="command" :command="command.raw" :active="optionIndex(command)===activeIndex" :query="currentQuery"><span v-if="command.icon" class="ui-command-option-icon"><AppIcon :name="command.icon" :size="17"/></span><span class="ui-command-option-copy"><strong>{{ command.label }}</strong><small v-if="command.description">{{ command.description }}</small></span><span v-if="command.shortcut" class="ui-command-shortcut"><kbd v-for="part in (Array.isArray(command.shortcut)?command.shortcut:[command.shortcut])" :key="part">{{ part }}</kbd></span><AppIcon v-else name="chevronRight" :size="14"/></slot>
                </button>
              </div>
            </template>
            <div v-else class="ui-command-status"><slot name="empty" :query="currentQuery"><AppIcon name="search" :size="20"/><span>{{ resolvedEmptyText }}</span></slot></div>
          </div>
          <footer class="ui-command-footer"><slot name="footer"><span>{{ t('command.hint') }}</span><span><kbd>↑↓</kbd> {{ t('command.navigate') }} <kbd>Enter</kbd> {{ t('command.select') }}</span></slot></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, toRef, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig, useLocale } from '../config-runtime.js'
import { focusWithRetry } from './focusUtils.js'
import { useTeleportThemeScope } from '../theme-scope.js'

const triggerValues=['click','hover','focus','contextmenu','manual']
const props=defineProps({
  modelValue:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  items:{type:Array,default:()=>[]},
  trigger:{type:[String,Array],default:'click'},
  placement:{type:String,default:'bottom-end'},
  disabled:Boolean,
  loading:Boolean,
  offset:{type:Number,default:7},
  showDelay:{type:Number,default:0},
  hideDelay:{type:Number,default:0},
  closeOnSelect:{type:Boolean,default:true},
  closeOnOutside:{type:Boolean,default:true},
  closeOnEscape:{type:Boolean,default:true},
  loop:{type:Boolean,default:true},
  typeahead:{type:Boolean,default:true},
  typeaheadTimeout:{type:Number,default:500},
  focusOnOpen:{type:String,default:'keyboard',validator:value=>['keyboard','always','none'].includes(value)},
  returnFocus:{type:Boolean,default:true},
  appendToBody:{type:Boolean,default:true},
  teleportTo:{type:[String,Object],default:'body'},
  minWidth:{type:[String,Number],default:180},
  maxWidth:{type:[String,Number],default:'calc(100vw - 16px)'},
  menuId:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  zIndex:{type:Number,default:undefined},
  activeIndex:{type:Number,default:undefined},
  defaultActiveIndex:{type:Number,default:-1},
})
const emit=defineEmits(['update:modelValue','update:activeIndex','select','active-change','open-change','open','close'])
const slots=useSlots()
const config=useLanUiConfig()
const {t}=useLocale()
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const root=ref(null)
const triggerRef=ref(null)
const panel=ref(null)
const itemElements=ref([])
const internalOpen=ref(props.defaultOpen)
const internalActiveIndex=ref(props.defaultActiveIndex)
const generatedId=`ui-dropdown-${useId()}`
const id=computed(()=>props.menuId||generatedId)
const controlled=computed(()=>props.modelValue!==undefined)
const open=computed(()=>controlled.value?props.modelValue:internalOpen.value)
const visible=computed(()=>open.value&&!props.disabled)
const controlledActive=computed(()=>props.activeIndex!==undefined)
const currentActiveIndex=computed(()=>controlledActive.value?props.activeIndex:internalActiveIndex.value)
const triggerModes=computed(()=>{
  const raw=Array.isArray(props.trigger)?props.trigger:String(props.trigger||'').split(/[\s,]+/)
  const modes=raw.map(value=>String(value).trim().toLowerCase()).filter(value=>triggerValues.includes(value))
  return new Set(modes.length?modes:['manual'])
})
const normalizedItems=computed(()=>props.items.map((item,index)=>({
  ...item,
  _index:index,
  _key:item?.key??item?.value??item?.label??index,
  _kind:item?.divider||item?.type==='divider'?'divider':item?.heading||item?.type==='heading'?'heading':'item',
})))
const enabledIndices=computed(()=>normalizedItems.value.filter(item=>item._kind==='item'&&!item.disabled).map(item=>item._index))
const toSize=value=>typeof value==='number'?`${Math.max(0,value)}px`:value
const floatingZIndex=computed(()=>props.zIndex??config.value.zIndex+65)
const {floatingStyle,resolvedPlacement,update}=useFloatingPosition({
  triggerRef,
  panelRef:panel,
  open:visible,
  placement:toRef(props,'placement'),
  offset:toRef(props,'offset'),
  zIndex:floatingZIndex,
})

const activeReasons=new Set()
let showTimer=0
let hideTimer=0
let typeaheadTimer=0
let typeaheadBuffer=''
let pendingFocus='none'
let annotatedTrigger=null
let originalTriggerAttributes=null
let restoreFocusAfterClose=false

function supports(mode){return triggerModes.value.has(mode)}
function clearTimer(name){
  if(name==='show'&&showTimer){clearTimeout(showTimer);showTimer=0}
  if(name==='hide'&&hideTimer){clearTimeout(hideTimer);hideTimer=0}
  if(name==='typeahead'&&typeaheadTimer){clearTimeout(typeaheadTimer);typeaheadTimer=0}
}
function triggerElement(){return triggerRef.value?.querySelector('button,[href],input,select,textarea,summary,[role="button"],[tabindex]')||triggerRef.value}
function restoreAttribute(element,name,value){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value)}
function restoreTriggerAttributes(){
  if(!annotatedTrigger||!originalTriggerAttributes)return
  for(const [name,value] of Object.entries(originalTriggerAttributes))restoreAttribute(annotatedTrigger,name,value)
  annotatedTrigger=null
  originalTriggerAttributes=null
}
function syncTrigger(){
  if(typeof document==='undefined')return
  const element=triggerElement()
  if(!element)return
  if(annotatedTrigger&&annotatedTrigger!==element)restoreTriggerAttributes()
  if(!annotatedTrigger){
    annotatedTrigger=element
    originalTriggerAttributes=Object.fromEntries(['aria-expanded','aria-controls','aria-haspopup','aria-disabled'].map(name=>[name,element.getAttribute(name)]))
  }
  element.setAttribute('aria-expanded',String(visible.value))
  element.setAttribute('aria-controls',id.value)
  element.setAttribute('aria-haspopup','menu')
  restoreAttribute(element,'aria-disabled',props.disabled?'true':originalTriggerAttributes['aria-disabled'])
}
function openMeta(value,source,event){return {open:value,previous:open.value,source,placement:resolvedPlacement.value,event}}
function requestOpen(value,source='api',event,{returnFocus=false,focus='none'}={}){
  if(value&&props.disabled)return false
  if(value===open.value){if(value&&focus!=='none'){pendingFocus=focus;nextTick(afterOpen)};return false}
  const meta=openMeta(value,source,event)
  if(value)pendingFocus=focus
  if(!value&&returnFocus)restoreFocusAfterClose=true
  if(!controlled.value)internalOpen.value=value
  emit('update:modelValue',value)
  emit('open-change',value,meta)
  emit(value?'open':'close',meta)
  return true
}
function scheduleOpen(source,event,focus='none'){
  clearTimer('hide')
  if(focus!=='none')pendingFocus=focus
  if(open.value){if(focus!=='none')nextTick(afterOpen);return}
  clearTimer('show')
  const delay=Math.max(0,Number(props.showDelay)||0)
  if(!delay){requestOpen(true,source,event,{focus});return}
  showTimer=setTimeout(()=>{showTimer=0;requestOpen(true,source,event,{focus})},delay)
}
function scheduleClose(source,event,returnFocus=false){
  clearTimer('show')
  if(activeReasons.size)return
  clearTimer('hide')
  const delay=Math.max(0,Number(props.hideDelay)||0)
  if(!delay){requestOpen(false,source,event,{returnFocus});return}
  hideTimer=setTimeout(()=>{hideTimer=0;if(!activeReasons.size)requestOpen(false,source,event,{returnFocus})},delay)
}
function activate(source,event){
  if(!supports(source)||props.disabled)return
  activeReasons.add(source)
  scheduleOpen(source,event,props.focusOnOpen==='always'?'first':'none')
}
function deactivate(source,event){
  if(!supports(source))return
  activeReasons.delete(source)
  scheduleClose(source,event)
}
function show(source='api',event,focus=props.focusOnOpen==='always'?'first':'none'){
  if(props.disabled)return false
  activeReasons.add(source)
  scheduleOpen(source,event,focus)
  return true
}
function hide(source='api',event,returnFocus=props.returnFocus){
  activeReasons.clear()
  clearTimer('show')
  scheduleClose(source,event,returnFocus)
}
function toggle(source='api',event,focus='none'){if(open.value)hide(source,event,false);else show(source,event,focus)}
function focusForSource(event){return props.focusOnOpen==='always'||(props.focusOnOpen==='keyboard'&&event?.detail===0)?'first':'none'}
function onTriggerClick(event){
  if(!supports('click'))return
  if(props.disabled){event.preventDefault();return}
  const focus=focusForSource(event)
  if(activeReasons.has('click')||(open.value&&!activeReasons.has('hover')&&!activeReasons.has('focus'))){hide('click',event,false)}
  else{activeReasons.add('click');scheduleOpen('click',event,focus)}
}
function onTriggerContextmenu(event){
  if(!supports('contextmenu')||props.disabled)return
  event.preventDefault()
  activeReasons.add('contextmenu')
  scheduleOpen('contextmenu',event,props.focusOnOpen==='always'?'first':'none')
}
async function onTriggerKeydown(event){
  if(props.disabled)return
  if(['ArrowDown','ArrowUp'].includes(event.key)){
    event.preventDefault()
    const focus=event.key==='ArrowUp'?'last':'first'
    activeReasons.add('keyboard')
    scheduleOpen('keyboard',event,focus)
    return
  }
  if(!supports('click')||!['Enter',' '].includes(event.key))return
  const element=triggerElement()
  if(element?.matches('button,a[href],input,select,textarea,summary'))return
  event.preventDefault()
  onTriggerClick({...event,detail:0})
}
function onTriggerMouseleave(event){if(!panel.value?.contains(event.relatedTarget))deactivate('hover',event)}
function onTriggerFocusout(event){if(!panel.value?.contains(event.relatedTarget)&&!triggerRef.value?.contains(event.relatedTarget))deactivate('focus',event)}
function onPanelMouseleave(event){if(!triggerRef.value?.contains(event.relatedTarget))deactivate('hover',event)}
function onPanelFocusout(event){if(!panel.value?.contains(event.relatedTarget)&&!triggerRef.value?.contains(event.relatedTarget))deactivate('focus',event)}
function activeMeta(index,source,event){
  const item=normalizedItems.value[index]
  return {index,key:item?._key,item,source,event}
}
function requestActive(index,source='api',event,{focus=true}={}){
  const next=enabledIndices.value.includes(index)?index:-1
  if(next===currentActiveIndex.value){if(focus&&next>=0)nextTick(()=>itemElements.value[next]?.focus());return false}
  if(!controlledActive.value)internalActiveIndex.value=next
  const meta=activeMeta(next,source,event)
  emit('update:activeIndex',next)
  emit('active-change',meta)
  if(focus&&next>=0)nextTick(()=>itemElements.value[next]?.focus())
  return true
}
function focusBoundary(which='first',source='api',event){
  const indices=enabledIndices.value
  if(!indices.length)return false
  const index=which==='last'?indices.at(-1):indices[0]
  requestActive(index,source,event,{focus:true})
  return true
}
function moveActive(step,source,event){
  const indices=enabledIndices.value
  if(!indices.length)return
  let position=indices.indexOf(currentActiveIndex.value)
  if(position<0)position=step>0?-1:indices.length
  let next=position+step
  if(props.loop)next=(next+indices.length)%indices.length
  else next=Math.max(0,Math.min(indices.length-1,next))
  requestActive(indices[next],source,event,{focus:true})
}
function itemRole(item){return ['menuitem','menuitemcheckbox','menuitemradio'].includes(item.role)?item.role:'menuitem'}
function itemAriaChecked(item){const role=itemRole(item);return role==='menuitem'?undefined:String(Boolean(item.checked))}
function select(item,index,event,source='pointer'){
  if(item.disabled||item._kind!=='item')return false
  const meta={...activeMeta(index,source,event),value:item.value??item.key??item.label,checked:item.checked}
  emit('select',item,meta)
  if(props.closeOnSelect)hide('select',event,props.returnFocus)
  return true
}
function activateCurrent(event,source='keyboard'){
  const index=currentActiveIndex.value
  const item=normalizedItems.value[index]
  if(!item||item.disabled||item._kind!=='item')return
  select(item,index,event,source)
  if(item.href&&typeof window!=='undefined')window.location.assign(item.href)
}
function resetTypeahead(){typeaheadBuffer='';clearTimer('typeahead')}
function runTypeahead(event){
  if(!props.typeahead||event.ctrlKey||event.metaKey||event.altKey||event.key.length!==1)return false
  const character=event.key.toLocaleLowerCase(config.value.locale)
  typeaheadBuffer+=character
  clearTimer('typeahead')
  typeaheadTimer=setTimeout(resetTypeahead,Math.max(100,Number(props.typeaheadTimeout)||500))
  const search=[...typeaheadBuffer].every(value=>value===character)?character:typeaheadBuffer
  const indices=enabledIndices.value
  const current=indices.indexOf(currentActiveIndex.value)
  const ordered=[...indices.slice(current+1),...indices.slice(0,current+1)]
  const match=ordered.find(index=>String(normalizedItems.value[index]?.label??'').trim().toLocaleLowerCase(config.value.locale).startsWith(search))
  if(match===undefined)return false
  event.preventDefault()
  requestActive(match,'typeahead',event,{focus:true})
  return true
}
function isVisibleElement(element){
  if(!(element instanceof HTMLElement)||element.hidden||element.closest('[hidden],[aria-hidden="true"]'))return false
  const style=getComputedStyle(element)
  return style.display!=='none'&&style.visibility!=='hidden'
}
function focusAdjacentTrigger(direction=1){
  if(typeof document==='undefined')return false
  const selector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'
  const triggerNode=triggerElement()
  const candidates=[...document.querySelectorAll(selector)].filter(element=>isVisibleElement(element)&&!panel.value?.contains(element))
  const index=candidates.indexOf(triggerNode)
  return focusWithRetry(()=>candidates[index+direction]||triggerNode)
}
function onPanelKeydown(event){
  if(event.key==='Escape'&&props.closeOnEscape){event.preventDefault();event.stopPropagation();hide('escape',event,props.returnFocus);return}
  if(event.key==='Tab'){
    const direction=event.shiftKey?-1:1
    event.preventDefault()
    hide('tab',event,false)
    nextTick(()=>focusAdjacentTrigger(direction))
    return
  }
  if(event.key==='ArrowDown'){event.preventDefault();moveActive(1,'keyboard',event);return}
  if(event.key==='ArrowUp'){event.preventDefault();moveActive(-1,'keyboard',event);return}
  if(event.key==='Home'||event.key==='PageUp'){event.preventDefault();focusBoundary('first','keyboard',event);return}
  if(event.key==='End'||event.key==='PageDown'){event.preventDefault();focusBoundary('last','keyboard',event);return}
  if(['Enter',' '].includes(event.key)){event.preventDefault();activateCurrent(event);return}
  runTypeahead(event)
}
function onDocumentPointerDown(event){
  if(!visible.value||!props.closeOnOutside)return
  if(root.value?.contains(event.target)||panel.value?.contains(event.target))return
  hide('outside',event,false)
}
function onDocumentKeydown(event){
  if(event.defaultPrevented||event.key!=='Escape'||!visible.value||!props.closeOnEscape)return
  event.preventDefault()
  hide('escape',event,props.returnFocus)
}
function addDocumentListeners(){
  if(typeof document==='undefined')return
  document.addEventListener('pointerdown',onDocumentPointerDown,true)
  document.addEventListener('keydown',onDocumentKeydown)
}
function removeDocumentListeners(){
  if(typeof document==='undefined')return
  document.removeEventListener('pointerdown',onDocumentPointerDown,true)
  document.removeEventListener('keydown',onDocumentKeydown)
}
function focusTrigger(){return focusWithRetry(()=>triggerElement())}
function focusItem(index=currentActiveIndex.value){
  const target=enabledIndices.value.includes(index)?index:enabledIndices.value[0]
  if(target===undefined)return false
  requestActive(target,'api',undefined,{focus:true})
  return true
}
async function afterOpen(){
  await nextTick()
  update()
  const focus=pendingFocus!=='none'?pendingFocus:props.focusOnOpen==='always'?'first':'none'
  pendingFocus='none'
  if(focus==='first'||focus==='last')focusBoundary(focus,'open')
}

watch(visible,async(value,previous)=>{
  removeDocumentListeners()
  if(value)addDocumentListeners()
  await nextTick()
  syncTrigger()
  if(value&&!previous)afterOpen()
  if(!value&&previous){
    resetTypeahead()
    if(!controlledActive.value)internalActiveIndex.value=-1
    if(restoreFocusAfterClose){restoreFocusAfterClose=false;focusTrigger()}
  }
},{immediate:true})
watch(()=>[props.disabled,id.value,props.ariaLabel],()=>nextTick(syncTrigger))
watch(()=>props.disabled,value=>{if(value)hide('disabled',undefined,false)})
watch(open,value=>{if(!value)activeReasons.clear()})
watch(enabledIndices,indices=>{if(visible.value&&currentActiveIndex.value>=0&&!indices.includes(currentActiveIndex.value))requestActive(indices[0]??-1,'items',undefined,{focus:false})})
onBeforeUnmount(()=>{
  clearTimer('show');clearTimer('hide');resetTypeahead();removeDocumentListeners();restoreTriggerAttributes()
})
defineExpose({root,trigger:triggerRef,panel,show,hide,toggle,focusTrigger,focusItem,focusFirst:()=>focusBoundary('first'),focusLast:()=>focusBoundary('last'),select:(index,event)=>select(normalizedItems.value[index],index,event,'api'),updatePosition:update})
</script>

<template>
  <span ref="root" class="ui-dropdown" :class="{open:visible,disabled,loading}" :data-state="visible?'open':'closed'" :data-trigger="[...triggerModes].join(' ')">
    <span :id="`${id}-trigger`" ref="triggerRef" class="ui-dropdown-trigger" @click="onTriggerClick" @keydown="onTriggerKeydown" @contextmenu="onTriggerContextmenu" @mouseenter="activate('hover',$event)" @mouseleave="onTriggerMouseleave" @focusin="activate('focus',$event)" @focusout="onTriggerFocusout">
      <slot name="trigger" :open="visible" :show="show" :hide="hide" :toggle="toggle" :controls="id"/>
    </span>
    <Teleport :to="teleportTo" :disabled="!appendToBody">
      <Transition name="select-menu" @after-enter="afterOpen">
        <div v-if="visible" v-bind="portalThemeAttrs" :id="id" ref="panel" class="ui-dropdown-menu ui-floating-panel" :dir="config.direction" role="menu" :aria-label="ariaLabel||undefined" :aria-labelledby="ariaLabel?undefined:`${id}-trigger`" :aria-busy="loading?'true':undefined" :data-placement="resolvedPlacement" :style="[portalThemeStyle,floatingStyle,{minWidth:toSize(minWidth),maxWidth:toSize(maxWidth)}]" @mouseenter="activate('hover',$event)" @mouseleave="onPanelMouseleave" @focusin="activate('focus',$event)" @focusout="onPanelFocusout" @keydown="onPanelKeydown">
          <template v-for="item in normalizedItems" :key="item._key">
            <div v-if="item._kind==='divider'" class="ui-dropdown-divider" role="separator"/>
            <div v-else-if="item._kind==='heading'" class="ui-dropdown-heading" role="presentation">{{ item.label }}</div>
            <component :is="item.href?'a':'button'" v-else :ref="element=>itemElements[item._index]=element" class="ui-dropdown-item" :class="[{active:currentActiveIndex===item._index,danger:item.danger,checked:item.checked},item.class]" :type="item.href?undefined:'button'" :href="item.href" :target="item.target" :rel="item.target==='_blank'?'noopener noreferrer':undefined" :role="itemRole(item)" :aria-checked="itemAriaChecked(item)" :aria-disabled="item.disabled?'true':undefined" :disabled="item.href?undefined:item.disabled" :tabindex="currentActiveIndex===item._index?0:-1" @pointermove="!item.disabled&&requestActive(item._index,'pointer',$event,{focus:false})" @focus="!item.disabled&&requestActive(item._index,'focus',$event,{focus:false})" @click="item.disabled?$event.preventDefault():select(item,item._index,$event,'pointer')">
              <slot name="item" :item="item" :index="item._index" :active="currentActiveIndex===item._index" :select="event=>select(item,item._index,event,'slot')">
                <AppIcon v-if="item.icon" :name="item.icon" :size="14"/>
                <span class="ui-dropdown-item-content"><span>{{ item.label }}</span><small v-if="item.description">{{ item.description }}</small></span>
                <AppIcon v-if="item.checked" name="check" :size="14" class="ui-dropdown-check"/>
                <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
              </slot>
            </component>
          </template>
          <div v-if="!normalizedItems.length" class="ui-dropdown-empty" role="presentation"><slot name="empty">{{ t('empty.title') }}</slot></div>
          <slot :close="hide" :open="visible" :active-index="currentActiveIndex"/>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

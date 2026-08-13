<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { useLanUiConfig } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'
const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const props=defineProps({modelValue:Boolean,items:{type:Array,default:()=>[]},placement:{type:String,default:'bottom-right'},disabled:Boolean,offset:{type:Number,default:7}})
const emit=defineEmits(['update:modelValue','select','open-change'])
const root=ref(null)
const trigger=ref(null)
const panel=ref(null)
const buttons=ref([])
const menuId=`ui-dropdown-${useId()}`
let openByKeyboard=false
const config=useLanUiConfig();const {floatingStyle,resolvedPlacement}=useFloatingPosition({triggerRef:trigger,panelRef:panel,open:toRef(props,'modelValue'),placement:toRef(props,'placement'),offset:props.offset,zIndex:computed(()=>config.value.zIndex+65)})
const triggerElement=()=>trigger.value?.querySelector('button,[href],input,[role="button"],[tabindex]')
function syncTrigger(){const element=triggerElement();if(!element)return;element.setAttribute('aria-expanded',String(props.modelValue));element.setAttribute('aria-controls',menuId);element.setAttribute('aria-haspopup','menu')}
function setOpen(value){if(props.disabled)return;emit('update:modelValue',value);emit('open-change',value)}
function select(item){if(item.disabled||item.divider)return;emit('select',item);setOpen(false);nextTick(()=>triggerElement()?.focus())}
function outside(event){if(props.modelValue&&root.value&&!root.value.contains(event.target)&&panel.value&&!panel.value.contains(event.target))setOpen(false)}
async function keydown(event){
  if(event.key==='Escape'&&props.modelValue){event.preventDefault();setOpen(false);nextTick(()=>triggerElement()?.focus());return}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return
  event.preventDefault()
  if(!props.modelValue){openByKeyboard=true;setOpen(true);await nextTick();await nextTick()}
  const enabled=buttons.value.filter(Boolean).filter(button=>!button.disabled)
  if(!enabled.length)return
  const current=enabled.indexOf(document.activeElement)
  const next=event.key==='Home'?0:event.key==='End'?enabled.length-1:event.key==='ArrowDown'?(current+1+enabled.length)%enabled.length:(current-1+enabled.length)%enabled.length
  enabled[next]?.focus()
}
watch(()=>props.modelValue,async value=>{await nextTick();syncTrigger();if(value&&openByKeyboard){buttons.value.filter(Boolean).find(button=>!button.disabled)?.focus();openByKeyboard=false}})
onMounted(()=>{document.addEventListener('pointerdown',outside);syncTrigger()})
onBeforeUnmount(()=>document.removeEventListener('pointerdown',outside))
</script>
<template><span ref="root" class="ui-dropdown" :class="`placement-${placement}`" @keydown="keydown"><span ref="trigger" class="ui-dropdown-trigger" @click="openByKeyboard=false;setOpen(!modelValue)"><slot name="trigger"/></span><Teleport to="body"><Transition name="select-menu"><div v-if="modelValue" v-bind="portalThemeAttrs" :id="menuId" ref="panel" class="ui-dropdown-menu ui-floating-panel" :dir="config.direction" role="menu" :data-placement="resolvedPlacement" :style="[portalThemeStyle,floatingStyle]" @keydown="keydown"><template v-for="(item,index) in items" :key="item.key||item.label||index"><div v-if="item.divider" class="ui-dropdown-divider" role="separator"/><button v-else :ref="el=>buttons[index]=el" type="button" role="menuitem" :class="{danger:item.danger}" :disabled="item.disabled" @click="select(item)"><AppIcon v-if="item.icon" :name="item.icon" :size="14"/><span>{{ item.label }}</span><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd></button></template><slot/></div></Transition></Teleport></span></template>

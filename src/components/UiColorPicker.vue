<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloatingPosition } from './floatingPosition.js'
import { formatColor, getContrastRatio, hsvToRgb, parseColor, rgbToHsv } from '../color.js'
import { useComponentSize, useDirection, useLocale } from '../config-runtime.js'
import { useTeleportThemeScope } from '../theme-scope.js'

defineOptions({inheritAttrs:false})

const {portalThemeAttrs,portalThemeStyle}=useTeleportThemeScope()
const props=defineProps({
  modelValue:{type:String,default:''},
  open:{type:Boolean,default:undefined},
  defaultOpen:Boolean,
  format:{type:String,default:'hex',validator:value=>['hex','rgb','hsl'].includes(value)},
  alpha:Boolean,
  presets:{type:Array,default:()=>[]},
  fallbackColor:{type:String,default:'#1677FF'},
  size:{type:String,default:''},
  disabled:Boolean,
  readonly:Boolean,
  invalid:Boolean,
  clearable:{type:Boolean,default:true},
  showInput:{type:Boolean,default:true},
  showContrast:Boolean,
  contrastColor:{type:String,default:'#FFFFFF'},
  closeOnSelect:Boolean,
  placement:{type:String,default:'bottom-start',validator:value=>['top-start','top-end','bottom-start','bottom-end'].includes(value)},
  appendToBody:{type:Boolean,default:true},
})
const emit=defineEmits(['update:modelValue','update:open','input','change','clear','open-change','invalid','focus','blur'])
const attrs=useAttrs()
const formItem=inject('uiFormItemContext',null)
const uid=useId()
const rootRef=ref(null)
const triggerRef=ref(null)
const panelRef=ref(null)
const planeRef=ref(null)
const textInputRef=ref(null)
const internalOpen=ref(props.defaultOpen)
const dragging=ref(false)
const focused=ref(false)
const draft=ref('')
const lastValidValue=ref('')

const {t}=useLocale()
const direction=useDirection()
const resolvedSize=useComponentSize(toRef(props,'size'))
const panelId=`ui-color-panel-${uid}`
const controlId=computed(()=>attrs.id||formItem?.controlId?.value||`ui-color-picker-${uid}`)
const labelledby=computed(()=>attrs['aria-labelledby']||(attrs['aria-label']?undefined:formItem?.labelId?.value))
const describedby=computed(()=>attrs['aria-describedby']||formItem?.describedby?.value||undefined)
const resolvedInvalid=computed(()=>props.invalid||formItem?.invalid?.value||false)
const isControlledOpen=computed(()=>props.open!==undefined)
const opened=computed(()=>isControlledOpen.value?props.open:internalOpen.value)
const resolvedPlacement=computed(()=>{
  if(direction.value!=='rtl')return props.placement
  if(props.placement.endsWith('-start'))return props.placement.replace(/-start$/,'-end')
  return props.placement.replace(/-end$/,'-start')
})
const triggerAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['id','class','style','aria-labelledby','aria-describedby'].includes(key))))

function safeFallback(){return parseColor(props.fallbackColor)||parseColor('#1677FF')}
function stateFromValue(value){return rgbToHsv(parseColor(value)||safeFallback())}
const hsv=ref(stateFromValue(props.modelValue))
const rgb=computed(()=>hsvToRgb({...hsv.value,a:props.alpha?hsv.value.a:1}))
const formattedValue=computed(()=>props.modelValue?formatColor(rgb.value,props.format,props.alpha):'')
const opaqueHue=computed(()=>formatColor(hsvToRgb({h:hsv.value.h,s:100,v:100,a:1}),'hex',false))
const planeStyle=computed(()=>({backgroundColor:opaqueHue.value}))
const planePointerStyle=computed(()=>({insetInlineStart:`${hsv.value.s}%`,top:`${100-hsv.value.v}%`,background:formatColor(rgb.value,'hex',false)}))
const alphaGradient=computed(()=>`linear-gradient(to ${direction.value==='rtl'?'left':'right'}, transparent, ${formatColor(rgb.value,'hex',false)})`)
const contrastRatio=computed(()=>props.modelValue?getContrastRatio(rgb.value,props.contrastColor):null)
const contrastLevel=computed(()=>contrastRatio.value===null?'':contrastRatio.value>=7?'AAA':contrastRatio.value>=4.5?'AA':t('color.contrastFail'))
const normalizedPresets=computed(()=>props.presets.map((preset,index)=>{
  const item=typeof preset==='string'?{value:preset}:preset||{}
  const color=parseColor(item.value)
  return color?{value:formatColor(color,props.format,props.alpha),label:String(item.label||formatColor(color,'hex',props.alpha)),disabled:!!item.disabled,key:`${item.value}-${index}`} : null
}).filter(Boolean))

const {floatingStyle,resolvedPlacement:actualPlacement,update:updatePosition}=useFloatingPosition({
  triggerRef:rootRef,panelRef,open:computed(()=>opened.value&&props.appendToBody),placement:resolvedPlacement,offset:6,zIndex:345,
})
const panelStyle=computed(()=>props.appendToBody?{...floatingStyle.value,width:'280px'}:{width:'280px'})

function syncFromModel(value=props.modelValue){
  const parsed=parseColor(value)
  if(parsed){hsv.value=rgbToHsv(parsed);lastValidValue.value=value;draft.value=formatColor(parsed,props.format,props.alpha)}
  else if(!value){hsv.value=stateFromValue(props.fallbackColor);lastValidValue.value='';draft.value=''}
}
syncFromModel()

function setOpen(value,{restoreFocus=false}={}){
  if((props.disabled||props.readonly)&&value)return
  if(opened.value===value)return
  if(!isControlledOpen.value)internalOpen.value=value
  emit('update:open',value);emit('open-change',value)
  if(value){syncFromModel();nextTick(()=>{updatePosition();planeRef.value?.focus()})}
  else if(restoreFocus)nextTick(()=>triggerRef.value?.focus())
}
function toggle(){setOpen(!opened.value)}
function outputValue(){return formatColor(rgb.value,props.format,props.alpha)}
function emitColor(source,{change=false,previous=props.modelValue}={}){
  const value=outputValue();draft.value=value;lastValidValue.value=value
  if(value!==props.modelValue)emit('update:modelValue',value)
  emit('input',value,{source})
  if(change)emit('change',value,{source,previous})
}
function updateHsv(patch,source,{change=false,previous=props.modelValue}={}){
  hsv.value={...hsv.value,...patch,a:props.alpha?(patch.a??hsv.value.a):1}
  emitColor(source,{change,previous})
}
function setPlaneFromPointer(event,change=false){
  if(props.disabled||props.readonly)return
  const rect=planeRef.value?.getBoundingClientRect();if(!rect?.width||!rect?.height)return
  const inline=direction.value==='rtl'?rect.right-event.clientX:event.clientX-rect.left
  const saturation=Math.min(100,Math.max(0,inline/rect.width*100))
  const value=Math.min(100,Math.max(0,100-(event.clientY-rect.top)/rect.height*100))
  updateHsv({s:saturation,v:value},'plane',{change})
}
function onPlanePointerDown(event){
  if(props.disabled||props.readonly)return
  event.preventDefault();dragging.value=true;planeRef.value?.setPointerCapture?.(event.pointerId);setPlaneFromPointer(event)
}
function onPlanePointerMove(event){if(dragging.value)setPlaneFromPointer(event)}
function onPlanePointerUp(event){if(!dragging.value)return;dragging.value=false;setPlaneFromPointer(event,true)}
function onPlaneKeydown(event){
  if(props.disabled||props.readonly)return
  const step=event.shiftKey?10:1,patch={}
  if(event.key==='ArrowLeft')patch.s=Math.max(0,hsv.value.s-step)
  else if(event.key==='ArrowRight')patch.s=Math.min(100,hsv.value.s+step)
  else if(event.key==='ArrowUp')patch.v=Math.min(100,hsv.value.v+step)
  else if(event.key==='ArrowDown')patch.v=Math.max(0,hsv.value.v-step)
  else if(event.key==='Home')patch.s=0
  else if(event.key==='End')patch.s=100
  else if(event.key==='PageUp')patch.v=Math.min(100,hsv.value.v+10)
  else if(event.key==='PageDown')patch.v=Math.max(0,hsv.value.v-10)
  else return
  event.preventDefault();updateHsv(patch,'keyboard',{change:true})
}
function onHueInput(event,change=false){if(!props.disabled&&!props.readonly)updateHsv({h:Number(event.target.value)},'hue',{change})}
function onAlphaInput(event,change=false){if(!props.disabled&&!props.readonly)updateHsv({a:Number(event.target.value)/100},'alpha',{change})}
function commitDraft(source='input'){
  if(props.disabled||props.readonly)return false
  const parsed=parseColor(draft.value)
  if(!parsed){
    emit('invalid',{reason:'parse',input:draft.value});draft.value=lastValidValue.value?formatColor(lastValidValue.value,props.format,props.alpha):'';return false
  }
  const normalized=formatColor(parsed,props.format,props.alpha)
  if(normalized===outputValue()&&normalized===lastValidValue.value){draft.value=normalized;return true}
  const previous=props.modelValue;hsv.value=rgbToHsv(parsed);emitColor(source,{change:true,previous});return true
}
function onDraftKeydown(event){
  if(event.key==='Enter'){event.preventDefault();if(commitDraft('input'))planeRef.value?.focus()}
  else if(event.key==='Escape'){event.preventDefault();draft.value=formattedValue.value;planeRef.value?.focus()}
}
function selectPreset(preset){
  if(preset.disabled||props.disabled||props.readonly)return
  const previous=props.modelValue;hsv.value=rgbToHsv(parseColor(preset.value));emitColor('preset',{change:true,previous})
  if(props.closeOnSelect)setOpen(false,{restoreFocus:true})
}
function clear(){
  if(props.disabled||props.readonly)return
  const previous=props.modelValue;lastValidValue.value='';draft.value='';hsv.value=stateFromValue(props.fallbackColor)
  emit('update:modelValue','');emit('input','',{source:'clear'});emit('change','',{source:'clear',previous});emit('clear');setOpen(false,{restoreFocus:true})
}
function outside(event){if(opened.value&&!rootRef.value?.contains(event.target)&&!panelRef.value?.contains(event.target))setOpen(false)}
function documentKeydown(event){if(opened.value&&event.key==='Escape'){event.preventDefault();setOpen(false,{restoreFocus:true})}}
function onFocus(event){focused.value=true;emit('focus',event)}
function onBlur(event){focused.value=false;emit('blur',event)}

watch(()=>props.modelValue,value=>syncFromModel(value))
watch(()=>props.format,()=>{draft.value=props.modelValue?outputValue():''})
watch(()=>props.alpha,value=>{if(!value)hsv.value={...hsv.value,a:1};draft.value=props.modelValue?outputValue():''})
watch(()=>props.open,value=>{if(value)nextTick(()=>{updatePosition();planeRef.value?.focus()})})
onMounted(()=>{document.addEventListener('pointerdown',outside);document.addEventListener('keydown',documentKeydown)})
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',documentKeydown)})
</script>

<template>
  <span ref="rootRef" class="ui-color-picker" :class="[`size-${resolvedSize}`,attrs.class,{open:opened,disabled,readonly,invalid:resolvedInvalid,focused}]" :style="attrs.style">
    <slot name="trigger" :value="formattedValue" :open="()=>setOpen(true)" :close="()=>setOpen(false)" :toggle="toggle">
      <button v-bind="triggerAttrs" :id="controlId" ref="triggerRef" type="button" class="ui-color-trigger" :disabled="disabled" :aria-readonly="readonly||undefined" aria-haspopup="dialog" :aria-expanded="opened" :aria-controls="opened?panelId:undefined" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid||undefined" @click="toggle" @focus="onFocus" @blur="onBlur">
        <span class="ui-color-checker"><span class="ui-color-swatch" :style="{background:props.modelValue?formatColor(rgb,'rgb',props.alpha):'transparent'}"/></span>
        <span class="ui-color-trigger-value" :class="{empty:!props.modelValue}">{{ formattedValue||t('color.empty') }}</span>
        <AppIcon class="ui-color-arrow" name="chevronDown" :size="14" aria-hidden="true"/>
      </button>
    </slot>
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="color-picker-menu">
        <section v-if="opened" v-bind="portalThemeAttrs" :id="panelId" ref="panelRef" class="ui-color-panel" :class="{'ui-floating-panel':appendToBody}" :style="[portalThemeStyle,panelStyle]" :data-placement="actualPlacement" :dir="direction" role="dialog" :aria-label="t('color.panel')">
          <div ref="planeRef" class="ui-color-plane" :style="planeStyle" role="slider" tabindex="0" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(hsv.s)" :aria-valuetext="t('color.planeValue',{saturation:Math.round(hsv.s),brightness:Math.round(hsv.v)})" :aria-label="t('color.plane')" @pointerdown="onPlanePointerDown" @pointermove="onPlanePointerMove" @pointerup="onPlanePointerUp" @pointercancel="dragging=false" @keydown="onPlaneKeydown">
            <span class="ui-color-plane-white"/><span class="ui-color-plane-black"/><span class="ui-color-plane-pointer" :style="planePointerStyle"/>
          </div>
          <div class="ui-color-controls">
            <span class="ui-color-preview ui-color-checker"><span :style="{background:formatColor(rgb,'rgb',props.alpha)}"/></span>
            <div class="ui-color-sliders">
              <label class="ui-color-slider is-hue"><span class="sr-only">{{ t('color.hue') }}</span><input type="range" min="0" max="359" step="1" :value="Math.round(hsv.h)" :disabled="disabled||readonly" :aria-label="t('color.hue')" @input="onHueInput($event)" @change="onHueInput($event,true)"/></label>
              <label v-if="alpha" class="ui-color-slider is-alpha ui-color-checker"><span class="sr-only">{{ t('color.alpha') }}</span><span class="ui-color-alpha-gradient" :style="{background:alphaGradient}"/><input type="range" min="0" max="100" step="1" :value="Math.round(hsv.a*100)" :disabled="disabled||readonly" :aria-label="t('color.alpha')" @input="onAlphaInput($event)" @change="onAlphaInput($event,true)"/></label>
            </div>
          </div>
          <div v-if="showInput" class="ui-color-input-row">
            <input ref="textInputRef" v-model="draft" class="ui-color-text-input" type="text" autocomplete="off" spellcheck="false" :disabled="disabled" :readonly="readonly" :aria-label="t('color.input')" @keydown="onDraftKeydown" @blur="commitDraft('input')"/>
            <span class="ui-color-format" aria-hidden="true">{{ format.toUpperCase() }}</span>
          </div>
          <div v-if="normalizedPresets.length" class="ui-color-presets" role="group" :aria-label="t('color.presets')">
            <button v-for="preset in normalizedPresets" :key="preset.key" type="button" class="ui-color-preset ui-color-checker" :class="{selected:preset.value===formattedValue}" :title="preset.label" :aria-label="`${t('color.select')} ${preset.label}`" :aria-pressed="preset.value===formattedValue" :disabled="disabled||readonly||preset.disabled" @click="selectPreset(preset)"><span :style="{background:preset.value}"/></button>
          </div>
          <div v-if="showContrast&&contrastRatio!==null" class="ui-color-contrast" aria-live="polite"><span>{{ t('color.contrast') }}</span><strong>{{ contrastRatio.toFixed(2) }}:1</strong><span class="ui-color-contrast-level" :class="{pass:contrastRatio>=4.5}">{{ contrastLevel }}</span></div>
          <footer class="ui-color-footer"><small>{{ t('color.keyboardHint') }}</small><button v-if="clearable&&modelValue&&!disabled&&!readonly" type="button" class="ui-color-clear" @click="clear"><AppIcon name="close" :size="13"/>{{ t('color.clear') }}</button></footer>
        </section>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useDirection } from '../config-runtime.js'

const props=defineProps({
  panels:{type:Array,default:()=>[]},
  modelValue:{type:Array,default:undefined},
  direction:{type:String,default:'horizontal',validator:value=>['horizontal','vertical'].includes(value)},
  lazy:{type:Boolean,default:false},
  disabled:{type:Boolean,default:false},
  keyboardStep:{type:Number,default:10},
  separatorSize:{type:Number,default:6},
  ariaLabel:{type:String,default:'Resizable panels'},
})
const emit=defineEmits(['update:modelValue','resize-start','resize','resize-end','collapse','invalid'])
const textDirection=useDirection()
const uid=useId()
const rootRef=ref(null)
const ratios=ref([])
const pendingRatios=ref(null)
const dragging=ref(false)
const activeSeparator=ref(-1)
const availableSize=ref(0)
const collapsedKeys=ref(new Set())
const storedRatios=new Map()
const ghostStyle=ref({})
let observer=null,dragDocument=null,dragState=null
let lastConstraintSignature=''

const panelList=computed(()=>Array.isArray(props.panels)?props.panels:[])
const panelCount=computed(()=>panelList.value.length)
const separatorPixels=computed(()=>Math.max(2,Number.isFinite(props.separatorSize)?props.separatorSize:6))
const renderedRatios=computed(()=>props.lazy&&pendingRatios.value?pendingRatios.value:ratios.value)
const orientation=computed(()=>props.direction==='horizontal'?'vertical':'horizontal')
const isRtl=computed(()=>props.direction==='horizontal'&&textDirection.value==='rtl')

function round(value){return Number(value.toFixed(6))}
function sum(values){return values.reduce((total,value)=>total+value,0)}
function equal(left,right){return Array.isArray(left)&&Array.isArray(right)&&left.length===right.length&&left.every((value,index)=>Math.abs(value-right[index])<.0001)}
function normalize(values,count=panelCount.value){
  if(count<=0)return []
  if(!Array.isArray(values)||values.length!==count||values.some(value=>!Number.isFinite(Number(value))||Number(value)<0))return Array(count).fill(100/count).map(round)
  const total=sum(values.map(Number))
  if(total<=0)return Array(count).fill(100/count).map(round)
  const next=values.map(value=>round(Number(value)/total*100))
  next[next.length-1]=round(next[next.length-1]+100-sum(next))
  return next
}
function parseSize(value,total,fallback=0){
  if(value==null||value==='')return fallback
  if(typeof value==='number')return Number.isFinite(value)?Math.max(0,value):fallback
  const input=String(value).trim()
  if(input.endsWith('%')){const percent=Number.parseFloat(input);return Number.isFinite(percent)?Math.max(0,total*percent/100):fallback}
  const pixels=Number.parseFloat(input)
  return Number.isFinite(pixels)?Math.max(0,pixels):fallback
}
function measure(){
  const rect=rootRef.value?.getBoundingClientRect()
  const size=props.direction==='horizontal'?rect?.width:rect?.height
  availableSize.value=Math.max(1,(Number(size)||0)-Math.max(0,panelCount.value-1)*separatorPixels.value)
  return availableSize.value
}
function panelLimits(index,allowCollapsed=false){
  const panel=panelList.value[index]||{}
  const total=Math.max(1,availableSize.value)
  const min=allowCollapsed?parseSize(panel.collapsedSize,total,0):parseSize(panel.min,total,0)
  const rawMax=parseSize(panel.max,total,total)
  return {min:Math.min(total,min),max:Math.max(min,Math.min(total,rawMax))}
}
function validateConstraints(){
  const total=Math.max(1,availableSize.value)
  const limits=panelList.value.map((_,index)=>panelLimits(index,collapsedKeys.value.has(panelList.value[index]?.key)))
  const minimum=sum(limits.map(item=>item.min)),maximum=sum(limits.map(item=>item.max))
  const invalid=minimum>total+.01||maximum<total-.01
  const signature=invalid?`${round(minimum)}:${round(maximum)}:${round(total)}`:''
  if(signature&&signature!==lastConstraintSignature)emit('invalid',{reason:'constraints',value:{minimum:round(minimum),maximum:round(maximum),available:round(total)}})
  lastConstraintSignature=signature
  return !invalid
}
function fitPixels(values){
  const total=Math.max(1,availableSize.value)
  const next=values.map((value,index)=>{
    const {min,max}=panelLimits(index,collapsedKeys.value.has(panelList.value[index]?.key))
    return Math.min(max,Math.max(min,Number(value)||0))
  })
  for(let pass=0;pass<panelCount.value*2;pass+=1){
    const difference=total-sum(next)
    if(Math.abs(difference)<.01)break
    const candidates=next.map((value,index)=>({index,room:difference>0?panelLimits(index).max-value:value-panelLimits(index).min})).filter(item=>item.room>.01)
    if(!candidates.length)break
    const share=difference/candidates.length
    for(const candidate of candidates){const delta=Math.sign(difference)*Math.min(candidate.room,Math.abs(share));next[candidate.index]+=delta}
  }
  return next
}
function ratiosFromPixels(values){return normalize(values.map(value=>value/Math.max(1,availableSize.value)*100))}
function pixelsFromRatios(values=ratios.value){return normalize(values).map(value=>value/100*Math.max(1,availableSize.value))}
function initialRatios(preferModel=true){
  const count=panelCount.value
  if(!count)return []
  const controlled=props.modelValue
  if(preferModel&&Array.isArray(controlled)&&controlled.length===count)return normalize(controlled)
  const total=Math.max(1,availableSize.value)
  const pixels=Array(count).fill(null)
  let assigned=0,open=0
  panelList.value.forEach((panel,index)=>{
    const declared=panel.size??panel.defaultSize
    if(declared==null){open+=1;return}
    pixels[index]=parseSize(declared,total,0);assigned+=pixels[index]
  })
  const share=Math.max(0,total-assigned)/Math.max(1,open)
  for(let index=0;index<count;index+=1)if(pixels[index]==null)pixels[index]=share
  return ratiosFromPixels(fitPixels(pixels))
}
function meta(index,source,sizes=ratios.value){return {index,source,direction:props.direction,sizes:normalize(sizes)}}
function publish(next,index,source,eventName='resize'){
  const normalized=normalize(next)
  ratios.value=normalized
  if(!equal(props.modelValue,normalized))emit('update:modelValue',normalized)
  emit(eventName,meta(index,source,normalized))
  return normalized
}
function pairResize(index,delta,start=ratios.value){
  if(index<0||index>=panelCount.value-1)return normalize(start)
  const pixels=pixelsFromRatios(start)
  const combined=pixels[index]+pixels[index+1]
  const first=panelLimits(index),second=panelLimits(index+1)
  const lower=Math.max(first.min,combined-second.max)
  const upper=Math.min(first.max,combined-second.min)
  const nextFirst=Math.min(upper,Math.max(lower,pixels[index]+delta))
  pixels[index]=nextFirst;pixels[index+1]=combined-nextFirst
  return ratiosFromPixels(pixels)
}
function canResize(index){return !props.disabled&&index>=0&&index<panelCount.value-1&&panelList.value[index]?.resizable!==false&&panelList.value[index+1]?.resizable!==false}
function cumulative(index,values=renderedRatios.value){return sum(normalize(values).slice(0,index+1))}
function separatorBounds(index){
  const values=pixelsFromRatios(renderedRatios.value)
  const combined=values[index]+values[index+1]
  const first=panelLimits(index),second=panelLimits(index+1)
  return {min:Math.max(first.min,combined-second.max),max:Math.min(first.max,combined-second.min),total:Math.max(1,availableSize.value)}
}
function separatorAria(index,edge){
  const bounds=separatorBounds(index),prefix=sum(pixelsFromRatios(renderedRatios.value).slice(0,index))
  return round((prefix+bounds[edge])/bounds.total*100)
}
function removePointerListeners(){
  dragDocument?.removeEventListener('pointermove',onPointerMove)
  dragDocument?.removeEventListener('pointerup',onPointerUp)
  dragDocument?.removeEventListener('pointercancel',onPointerUp)
  dragDocument=null
}
function pointerCoordinate(event){return props.direction==='horizontal'?event.clientX:event.clientY}
function updateGhost(event,index,next){
  if(!props.lazy||!rootRef.value)return
  const rect=rootRef.value.getBoundingClientRect()
  const position=props.direction==='horizontal'?event.clientX-rect.left:event.clientY-rect.top
  ghostStyle.value=props.direction==='horizontal'?{left:`${Math.min(rect.width,Math.max(0,position))}px`}:{top:`${Math.min(rect.height,Math.max(0,position))}px`}
  pendingRatios.value=next
  emit('resize',meta(index,'pointer',next))
}
function onPointerDown(event,index){
  if(event.button!==0||!canResize(index))return
  event.preventDefault()
  measure();dragging.value=true;activeSeparator.value=index
  const start=normalize(ratios.value)
  dragState={index,start,startCoordinate:pointerCoordinate(event)}
  dragDocument=event.currentTarget?.ownerDocument||document
  dragDocument.addEventListener('pointermove',onPointerMove,{passive:false})
  dragDocument.addEventListener('pointerup',onPointerUp)
  dragDocument.addEventListener('pointercancel',onPointerUp)
  emit('resize-start',meta(index,'pointer',start))
}
function onPointerMove(event){
  if(!dragState)return
  event.preventDefault()
  let delta=pointerCoordinate(event)-dragState.startCoordinate
  if(isRtl.value)delta=-delta
  const next=pairResize(dragState.index,delta,dragState.start)
  if(props.lazy)updateGhost(event,dragState.index,next)
  else publish(next,dragState.index,'pointer')
}
function onPointerUp(){
  if(!dragState)return
  const {index}=dragState
  if(props.lazy&&pendingRatios.value)publish(pendingRatios.value,index,'pointer')
  emit('resize-end',meta(index,'pointer',ratios.value))
  dragging.value=false;activeSeparator.value=-1;pendingRatios.value=null;ghostStyle.value={};dragState=null
  removePointerListeners()
}
function keyboardDelta(key){
  const step=Math.max(1,Number.isFinite(props.keyboardStep)?props.keyboardStep:10)
  if(props.direction==='vertical')return key==='ArrowDown'?step:key==='ArrowUp'?-step:0
  const visual=key==='ArrowRight'?step:key==='ArrowLeft'?-step:0
  return isRtl.value?-visual:visual
}
function resizeToBoundary(index,end){
  measure()
  const pixels=pixelsFromRatios()
  const bounds=separatorBounds(index)
  const delta=(end?bounds.max:bounds.min)-pixels[index]
  publish(pairResize(index,delta),index,'keyboard')
  emit('resize-end',meta(index,'keyboard'))
}
function onKeydown(event,index){
  if(!canResize(index))return
  if(event.key==='Home'||event.key==='End'){event.preventDefault();emit('resize-start',meta(index,'keyboard'));resizeToBoundary(index,event.key==='End');return}
  if(event.key==='Enter'){
    const target=panelList.value[index]?.collapsible?index:panelList.value[index+1]?.collapsible?index+1:-1
    if(target>=0){event.preventDefault();toggleCollapse(target,'keyboard')}
    return
  }
  const delta=keyboardDelta(event.key)
  if(!delta)return
  event.preventDefault();measure();emit('resize-start',meta(index,'keyboard'))
  publish(pairResize(index,delta),index,'keyboard')
  emit('resize-end',meta(index,'keyboard'))
}
function setPanelSize(index,target,source='api',collapsed=false){
  if(index<0||index>=panelCount.value)return ratios.value
  const neighbor=index<panelCount.value-1?index+1:index-1
  if(neighbor<0)return ratios.value
  measure()
  const pixels=pixelsFromRatios()
  const combined=pixels[index]+pixels[neighbor]
  const targetLimits=collapsed?panelLimits(index,true):panelLimits(index)
  const neighborLimits=panelLimits(neighbor)
  const lower=Math.max(targetLimits.min,combined-neighborLimits.max)
  const upper=Math.min(targetLimits.max,combined-neighborLimits.min)
  const value=Math.min(upper,Math.max(lower,target))
  pixels[index]=value;pixels[neighbor]=combined-value
  const separator=Math.min(index,neighbor)
  emit('resize-start',meta(separator,source))
  const next=publish(ratiosFromPixels(pixels),separator,source)
  emit('resize-end',meta(separator,source,next))
  return next
}
function collapse(index,source='api'){
  const panel=panelList.value[index]
  if(!panel?.collapsible||collapsedKeys.value.has(panel.key))return ratios.value
  storedRatios.set(panel.key,ratios.value[index]||0)
  const next=setPanelSize(index,parseSize(panel.collapsedSize,Math.max(1,availableSize.value),0),source,true)
  const keys=new Set(collapsedKeys.value);keys.add(panel.key);collapsedKeys.value=keys
  emit('collapse',{index,collapsed:true,source,sizes:normalize(next)})
  return next
}
function expand(index,source='api'){
  const panel=panelList.value[index]
  if(!panel||!collapsedKeys.value.has(panel.key))return ratios.value
  const remembered=storedRatios.get(panel.key)
  const target=Number.isFinite(remembered)?remembered/100*Math.max(1,availableSize.value):parseSize(panel.defaultSize??panel.size,Math.max(1,availableSize.value),Math.max(1,availableSize.value)/panelCount.value)
  const keys=new Set(collapsedKeys.value);keys.delete(panel.key);collapsedKeys.value=keys
  const next=setPanelSize(index,target,source,false)
  emit('collapse',{index,collapsed:false,source,sizes:normalize(next)})
  return next
}
function toggleCollapse(index,source='api'){return collapsedKeys.value.has(panelList.value[index]?.key)?expand(index,source):collapse(index,source)}
function onDoubleClick(index){
  const target=panelList.value[index]?.collapsible?index:panelList.value[index+1]?.collapsible?index+1:-1
  if(target>=0)toggleCollapse(target,'pointer')
}
function setSizes(values,source='api'){
  if(!Array.isArray(values)||values.length!==panelCount.value||values.some(value=>!Number.isFinite(Number(value))||Number(value)<0)){
    emit('invalid',{reason:'size',value:values});return ratios.value
  }
  measure();return publish(ratiosFromPixels(fitPixels(normalize(values).map(value=>value/100*availableSize.value))),-1,source)
}
function reset(){
  measure();collapsedKeys.value=new Set();storedRatios.clear()
  const next=initialRatios(false);ratios.value=next
  if(!equal(props.modelValue,next))emit('update:modelValue',next)
  emit('resize-end',meta(-1,'reset',next));return next
}
function refreshLayout(){
  measure()
  validateConstraints()
  if(ratios.value.length!==panelCount.value){ratios.value=initialRatios();return ratios.value}
  ratios.value=ratiosFromPixels(fitPixels(normalize(ratios.value).map(value=>value/100*availableSize.value)))
  return ratios.value
}
function panelStyle(index){return {flexGrow:String(renderedRatios.value[index]??0),flexBasis:'0px'}}
function panelId(index){return `ui-splitter-${uid}-panel-${index}`}
function separatorId(index){return `ui-splitter-${uid}-separator-${index}`}

watch(()=>props.modelValue,value=>{if(!dragging.value&&Array.isArray(value)&&value.length===panelCount.value)ratios.value=normalize(value)},{deep:true})
watch(()=>[props.direction,props.separatorSize,panelCount.value],()=>nextTick(refreshLayout))
watch(panelList,items=>{
  const keys=items.map(item=>item?.key)
  if(keys.some(key=>key==null)||new Set(keys).size!==keys.length)emit('invalid',{reason:'panels',value:items})
  nextTick(refreshLayout)
},{deep:true})
onMounted(()=>nextTick(()=>{
  measure();validateConstraints();ratios.value=initialRatios()
  if(typeof ResizeObserver==='function'){
    observer=new ResizeObserver(refreshLayout)
    if(rootRef.value)observer.observe(rootRef.value)
  }
}))
onBeforeUnmount(()=>{observer?.disconnect();removePointerListeners()})
ratios.value=initialRatios()
defineExpose({reset,setSizes,collapse,expand,toggleCollapse,sizes:ratios})
</script>

<template>
  <div ref="rootRef" class="ui-splitter" :class="[`direction-${direction}`,{dragging,disabled}]" :dir="textDirection" :style="{'--ui-splitter-separator-size':`${separatorPixels}px`}" role="group" :aria-label="ariaLabel" :data-ui-splitter="direction" :data-lazy="lazy?'true':'false'">
    <template v-if="panelCount">
      <template v-for="(panel,index) in panelList" :key="panel.key">
        <section :id="panelId(index)" class="ui-splitter-panel" :class="{collapsed:collapsedKeys.has(panel.key)}" :style="panelStyle(index)" :aria-label="panel.label||String(panel.key)" :aria-hidden="collapsedKeys.has(panel.key)?'true':undefined" :inert="collapsedKeys.has(panel.key)">
          <slot name="panel" :panel="panel" :index="index" :size="renderedRatios[index]||0" :collapsed="collapsedKeys.has(panel.key)"><div class="ui-splitter-panel-content">{{ panel.label || panel.key }}</div></slot>
        </section>
        <div v-if="index<panelCount-1" :id="separatorId(index)" class="ui-splitter-separator" :class="{active:activeSeparator===index}" role="separator" :tabindex="canResize(index)?0:-1" :aria-orientation="orientation" :aria-controls="`${panelId(index)} ${panelId(index+1)}`" :aria-valuemin="separatorAria(index,'min')" :aria-valuenow="round(cumulative(index))" :aria-valuemax="separatorAria(index,'max')" :aria-disabled="canResize(index)?undefined:'true'" @pointerdown="onPointerDown($event,index)" @keydown="onKeydown($event,index)" @dblclick="onDoubleClick(index)">
          <span class="ui-splitter-handle" aria-hidden="true"><slot name="separator" :index="index" :active="activeSeparator===index"/></span>
        </div>
      </template>
      <div v-if="lazy&&dragging" class="ui-splitter-ghost" :style="ghostStyle" aria-hidden="true"/>
    </template>
    <slot v-else name="empty"/>
  </div>
</template>

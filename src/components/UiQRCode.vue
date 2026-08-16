<script setup>
import { computed, useId, watch } from 'vue'
import qrcode from 'qrcode-generator'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'

const props=defineProps({
  value:{type:String,default:''},
  size:{type:Number,default:160},
  level:{type:String,default:'M'},
  color:{type:String,default:'#111827'},
  background:{type:String,default:'#ffffff'},
  margin:{type:Number,default:4},
  status:{type:String,default:'active'},
  icon:{type:String,default:''},
  iconSize:{type:Number,default:36},
  bordered:{type:Boolean,default:true},
  downloadable:{type:Boolean,default:false},
  downloadName:{type:String,default:'qr-code.svg'},
  label:{type:String,default:''},
  caption:{type:String,default:''},
})
const emit=defineEmits(['refresh','download','error'])
const {t}=useLocale()
const titleId=`qr-code-title-${useId()}`
const levels=new Set(['L','M','Q','H'])
const statuses=new Set(['active','loading','expired','scanned'])
const normalizedLevel=computed(()=>levels.has(props.level)?props.level:'M')
const normalizedStatus=computed(()=>statuses.has(props.status)?props.status:'active')
const normalizedSize=computed(()=>Math.min(1024,Math.max(64,Number(props.size)||160)))
const normalizedMargin=computed(()=>Math.min(16,Math.max(0,Math.round(Number(props.margin)||0))))
const accessibleLabel=computed(()=>props.label||t('qrCode.label'))
const matrix=computed(()=>{
  try{
    const code=qrcode(0,normalizedLevel.value)
    code.addData(String(props.value||''),'Byte')
    code.make()
    const count=code.getModuleCount()
    let path=''
    for(let row=0;row<count;row+=1){
      for(let column=0;column<count;column+=1){
        if(code.isDark(row,column))path+=`M${column} ${row}h1v1h-1z`
      }
    }
    return {count,path,error:null}
  }catch(error){return {count:0,path:'',error:error instanceof Error?error:new Error(String(error))}}
})
const viewSize=computed(()=>matrix.value.count+normalizedMargin.value*2)
const pathTransform=computed(()=>`translate(${normalizedMargin.value} ${normalizedMargin.value})`)
const iconGeometry=computed(()=>{
  if(!props.icon||!matrix.value.count)return null
  const requested=Math.min(normalizedSize.value*.3,Math.max(16,Number(props.iconSize)||36))
  const units=requested/normalizedSize.value*viewSize.value
  const plate=units+2
  return {x:(viewSize.value-units)/2,y:(viewSize.value-units)/2,size:units,plateX:(viewSize.value-plate)/2,plateY:(viewSize.value-plate)/2,plate}
})
const effectiveStatus=computed(()=>matrix.value.error?'invalid':normalizedStatus.value)
const statusText=computed(()=>t(`qrCode.status.${effectiveStatus.value}`))
const rootStyle=computed(()=>({'--ui-qr-size':`${normalizedSize.value}px`,'--ui-qr-color':props.color,'--ui-qr-background':props.background}))
let emittedError=null
watch(()=>matrix.value.error,error=>{
  if(error&&error!==emittedError){emittedError=error;emit('error',error)}
  if(!error)emittedError=null
},{immediate:true})

function svgSource(){
  if(matrix.value.error)return ''
  const escape=value=>String(value).replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[character]))
  const icon=iconGeometry.value
  const image=icon?`<rect x="${icon.plateX}" y="${icon.plateY}" width="${icon.plate}" height="${icon.plate}" rx="1" fill="${escape(props.background)}"/><image href="${escape(props.icon)}" x="${icon.x}" y="${icon.y}" width="${icon.size}" height="${icon.size}" preserveAspectRatio="xMidYMid meet"/>`:''
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escape(accessibleLabel.value)}" viewBox="0 0 ${viewSize.value} ${viewSize.value}" width="${normalizedSize.value}" height="${normalizedSize.value}"><rect width="100%" height="100%" fill="${escape(props.background)}"/><path d="${matrix.value.path}" transform="${pathTransform.value}" fill="${escape(props.color)}"/>${image}</svg>`
}
function refresh(){emit('refresh',{value:props.value});return true}
function download(){
  const svg=svgSource()
  if(!isClient||!svg)return false
  const filename=(props.downloadName||'qr-code.svg').endsWith('.svg')?(props.downloadName||'qr-code.svg'):`${props.downloadName}.svg`
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.hidden=true
  document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),0)
  emit('download',{value:props.value,filename,svg})
  return true
}
defineExpose({refresh,download,toSvg:svgSource})
</script>

<template>
  <figure class="ui-qr-code" :class="[{bordered},`status-${effectiveStatus}`]" :style="rootStyle" :data-status="effectiveStatus" :data-level="normalizedLevel">
    <div class="ui-qr-code-frame" :aria-busy="effectiveStatus==='loading'?'true':undefined">
      <svg v-if="!matrix.error" class="ui-qr-code-symbol" :width="normalizedSize" :height="normalizedSize" :viewBox="`0 0 ${viewSize} ${viewSize}`" role="img" :aria-labelledby="titleId" shape-rendering="crispEdges">
        <title :id="titleId">{{ accessibleLabel }}</title>
        <rect width="100%" height="100%" :fill="background"/>
        <path :d="matrix.path" :transform="pathTransform" :fill="color"/>
        <template v-if="iconGeometry">
          <rect :x="iconGeometry.plateX" :y="iconGeometry.plateY" :width="iconGeometry.plate" :height="iconGeometry.plate" rx="1" :fill="background"/>
          <image :href="icon" :x="iconGeometry.x" :y="iconGeometry.y" :width="iconGeometry.size" :height="iconGeometry.size" preserveAspectRatio="xMidYMid meet"/>
        </template>
      </svg>
      <div v-if="effectiveStatus!=='active'" class="ui-qr-code-overlay" :class="`status-${effectiveStatus}`" :role="effectiveStatus==='invalid'?'alert':'status'" aria-live="polite">
        <slot name="overlay" :status="effectiveStatus" :text="statusText" :refresh="refresh">
          <span v-if="effectiveStatus==='loading'" class="ui-qr-code-spinner" aria-hidden="true"/>
          <AppIcon v-else-if="effectiveStatus==='scanned'" name="checkCircle" :size="24" aria-hidden="true"/>
          <AppIcon v-else name="alert" :size="24" aria-hidden="true"/>
          <span>{{ statusText }}</span>
          <button v-if="effectiveStatus==='expired'" type="button" class="ui-qr-code-action" @click="refresh"><AppIcon name="refresh" :size="14" aria-hidden="true"/>{{ t('qrCode.refresh') }}</button>
        </slot>
      </div>
    </div>
    <figcaption v-if="caption||downloadable||$slots.caption||$slots.actions" class="ui-qr-code-caption">
      <slot name="caption" :value="value" :status="effectiveStatus"><span v-if="caption">{{ caption }}</span></slot>
      <slot name="actions" :download="download" :refresh="refresh" :status="effectiveStatus">
        <button v-if="downloadable" type="button" class="ui-qr-code-action" :disabled="Boolean(matrix.error)" @click="download"><AppIcon name="download" :size="14" aria-hidden="true"/>{{ t('qrCode.download') }}</button>
      </slot>
    </figcaption>
  </figure>
</template>

<script setup>
import { computed, useId, watch } from 'vue'
import JsBarcode from 'jsbarcode'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'

const props=defineProps({
  value:{type:String,default:''},
  format:{type:String,default:'CODE128'},
  width:{type:Number,default:2},
  height:{type:Number,default:80},
  margin:{type:Number,default:10},
  displayValue:{type:Boolean,default:true},
  text:{type:String,default:''},
  fontSize:{type:Number,default:16},
  textMargin:{type:Number,default:6},
  color:{type:String,default:'#111827'},
  background:{type:String,default:'#ffffff'},
  status:{type:String,default:'active'},
  bordered:{type:Boolean,default:true},
  downloadable:{type:Boolean,default:false},
  downloadName:{type:String,default:'barcode.svg'},
  label:{type:String,default:''},
  caption:{type:String,default:''},
})
const emit=defineEmits(['refresh','download','error'])
const {t}=useLocale()
const titleId=`barcode-title-${useId()}`
const formats=new Map([
  ['AUTO','AUTO'],['CODE128','CODE128'],['CODE128A','CODE128A'],['CODE128B','CODE128B'],['CODE128C','CODE128C'],
  ['CODE39','CODE39'],['EAN13','EAN13'],['EAN8','EAN8'],['EAN5','EAN5'],['EAN2','EAN2'],['UPC','UPC'],['UPCE','UPCE'],
  ['ITF14','ITF14'],['ITF','ITF'],['MSI','MSI'],['MSI10','MSI10'],['MSI11','MSI11'],['MSI1010','MSI1010'],['MSI1110','MSI1110'],
  ['PHARMACODE','pharmacode'],['CODABAR','codabar'],
])
const statuses=new Set(['active','loading','expired','scanned'])
const normalizedFormat=computed(()=>formats.get(String(props.format||'CODE128').toUpperCase())||null)
const normalizedStatus=computed(()=>statuses.has(props.status)?props.status:'active')
const normalizedWidth=computed(()=>Math.min(8,Math.max(.5,Math.round((Number(props.width)||2)*2)/2)))
const normalizedHeight=computed(()=>Math.min(512,Math.max(24,Math.round(Number(props.height)||80))))
const normalizedMargin=computed(()=>Math.min(64,Math.max(0,Math.round(Number(props.margin)||0))))
const normalizedFontSize=computed(()=>Math.min(48,Math.max(10,Math.round(Number(props.fontSize)||16))))
const normalizedTextMargin=computed(()=>Math.min(32,Math.max(0,Math.round(Number(props.textMargin)||0))))
const displayText=computed(()=>props.text||String(props.value||''))
const accessibleLabel=computed(()=>props.label||t('barcode.label'))
const encoding=computed(()=>{
  try{
    if(!normalizedFormat.value)throw new Error(`Unsupported barcode format: ${props.format}`)
    const target={}
    const options={displayValue:false,margin:0}
    if(normalizedFormat.value!=='AUTO')options.format=normalizedFormat.value
    JsBarcode(target,String(props.value||''),options)
    const segments=Array.isArray(target.encodings)?target.encodings:[]
    const bits=segments.map(segment=>segment.data||'').join('')
    if(!bits||!/^[01]+$/.test(bits))throw new Error('Barcode encoder returned no binary modules')
    let path=''
    for(let index=0;index<bits.length;){
      if(bits[index]==='0'){index+=1;continue}
      let end=index+1
      while(bits[end]==='1')end+=1
      const x=normalizedMargin.value+index*normalizedWidth.value
      const run=(end-index)*normalizedWidth.value
      path+=`M${x} ${normalizedMargin.value}h${run}v${normalizedHeight.value}h-${run}z`
      index=end
    }
    const width=bits.length*normalizedWidth.value+normalizedMargin.value*2
    const textHeight=props.displayValue?normalizedTextMargin.value+normalizedFontSize.value*1.25:0
    const height=normalizedMargin.value*2+normalizedHeight.value+textHeight
    return {bits,path,width,height,modules:bits.length,segments:segments.length,error:null}
  }catch(error){return {bits:'',path:'',width:0,height:0,modules:0,segments:0,error:error instanceof Error?error:new Error(String(error))}}
})
const effectiveStatus=computed(()=>encoding.value.error?'invalid':normalizedStatus.value)
const statusText=computed(()=>t(`barcode.status.${effectiveStatus.value}`))
const rootStyle=computed(()=>({'--ui-barcode-width':`${encoding.value.width||240}px`,'--ui-barcode-color':props.color,'--ui-barcode-background':props.background}))
let emittedError=null
watch(()=>encoding.value.error,error=>{
  if(error&&error!==emittedError){emittedError=error;emit('error',error)}
  if(!error)emittedError=null
},{immediate:true})

function escapeXml(value){return String(value).replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[character]))}
function svgSource(){
  if(encoding.value.error)return ''
  const text=props.displayValue?`<text x="${encoding.value.width/2}" y="${normalizedMargin.value+normalizedHeight.value+normalizedTextMargin.value+normalizedFontSize.value}" text-anchor="middle" font-family="Inter,ui-sans-serif,system-ui,sans-serif" font-size="${normalizedFontSize.value}" fill="${escapeXml(props.color)}">${escapeXml(displayText.value)}</text>`:''
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(accessibleLabel.value)}" viewBox="0 0 ${encoding.value.width} ${encoding.value.height}" width="${encoding.value.width}" height="${encoding.value.height}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${escapeXml(props.background)}"/><path d="${encoding.value.path}" fill="${escapeXml(props.color)}"/>${text}</svg>`
}
function getEncoding(){return encoding.value.error?null:{format:normalizedFormat.value,bits:encoding.value.bits,modules:encoding.value.modules,segments:encoding.value.segments}}
function refresh(){emit('refresh',{value:props.value,format:normalizedFormat.value||'AUTO'});return true}
function download(){
  const svg=svgSource()
  if(!isClient||!svg)return false
  const filename=(props.downloadName||'barcode.svg').endsWith('.svg')?(props.downloadName||'barcode.svg'):`${props.downloadName}.svg`
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.hidden=true
  document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),0)
  emit('download',{value:props.value,format:normalizedFormat.value,filename,svg})
  return true
}
defineExpose({refresh,download,toSvg:svgSource,getEncoding})
</script>

<template>
  <figure class="ui-barcode" :class="[{bordered},`status-${effectiveStatus}`]" :style="rootStyle" :data-status="effectiveStatus" :data-format="normalizedFormat||format">
    <div class="ui-barcode-frame" :aria-busy="effectiveStatus==='loading'?'true':undefined">
      <svg v-if="!encoding.error" class="ui-barcode-symbol" :width="encoding.width" :height="encoding.height" :viewBox="`0 0 ${encoding.width} ${encoding.height}`" role="img" :aria-labelledby="titleId" shape-rendering="crispEdges">
        <title :id="titleId">{{ accessibleLabel }}</title>
        <rect width="100%" height="100%" :fill="background"/>
        <path :d="encoding.path" :fill="color"/>
        <text v-if="displayValue" :x="encoding.width/2" :y="normalizedMargin+normalizedHeight+normalizedTextMargin+normalizedFontSize" text-anchor="middle" font-family="Inter,ui-sans-serif,system-ui,sans-serif" :font-size="normalizedFontSize" :fill="color">{{ displayText }}</text>
      </svg>
      <div v-if="effectiveStatus!=='active'" class="ui-barcode-overlay" :class="`status-${effectiveStatus}`" :role="effectiveStatus==='invalid'?'alert':'status'" aria-live="polite">
        <slot name="overlay" :status="effectiveStatus" :text="statusText" :refresh="refresh">
          <span v-if="effectiveStatus==='loading'" class="ui-barcode-spinner" aria-hidden="true"/>
          <AppIcon v-else-if="effectiveStatus==='scanned'" name="checkCircle" :size="24" aria-hidden="true"/>
          <AppIcon v-else name="alert" :size="24" aria-hidden="true"/>
          <span>{{ statusText }}</span>
          <button v-if="effectiveStatus==='expired'" type="button" class="ui-barcode-action" @click="refresh"><AppIcon name="refresh" :size="14" aria-hidden="true"/>{{ t('barcode.refresh') }}</button>
        </slot>
      </div>
    </div>
    <figcaption v-if="caption||downloadable||$slots.caption||$slots.actions" class="ui-barcode-caption">
      <slot name="caption" :value="value" :format="normalizedFormat" :status="effectiveStatus"><span v-if="caption">{{ caption }}</span></slot>
      <slot name="actions" :download="download" :refresh="refresh" :status="effectiveStatus">
        <button v-if="downloadable" type="button" class="ui-barcode-action" :disabled="Boolean(encoding.error)" @click="download"><AppIcon name="download" :size="14" aria-hidden="true"/>{{ t('barcode.download') }}</button>
      </slot>
    </figcaption>
  </figure>
</template>

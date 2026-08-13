<script setup>
import { computed, useAttrs, useId, useSlots } from 'vue'
import { useLocale } from '../config-runtime.js'

defineOptions({ inheritAttrs:false })

const props=defineProps({
  value:{type:[Number,String],default:null},
  title:{type:String,default:''},
  precision:{type:Number,default:null,validator:value=>value===null||(Number.isInteger(value)&&value>=0&&value<=20)},
  formatOptions:{type:Object,default:()=>({})},
  formatter:Function,
  prefix:{type:String,default:''},
  suffix:{type:String,default:''},
  placeholder:{type:String,default:''},
  trend:{type:Number,default:null},
  trendSuffix:{type:String,default:'%'},
  trendFormatOptions:{type:Object,default:()=>({maximumFractionDigits:2})},
  trendFormatter:Function,
  positiveDirection:{type:String,default:'up',validator:value=>['up','down','none'].includes(value)},
  status:{type:String,default:'default',validator:value=>['default','success','warning','danger'].includes(value)},
  size:{type:String,default:'md',validator:value=>['sm','md','lg'].includes(value)},
  loading:Boolean,
  loadingText:{type:String,default:''},
  ariaLabel:{type:String,default:''},
  ariaValueText:{type:String,default:''},
  live:{type:String,default:'off',validator:value=>['off','polite','assertive'].includes(value)},
})
const attrs=useAttrs()
const slots=useSlots()
const uid=useId()
const {t,formatNumber}=useLocale()

const titleId=computed(()=>`ui-statistic-title-${uid}`)
const hasTitle=computed(()=>Boolean(props.title||slots.title))
const numericValue=computed(()=>typeof props.value==='number'&&Number.isFinite(props.value)?props.value:null)
const resolvedFormatOptions=computed(()=>{
  const options={...props.formatOptions}
  if(props.precision!==null&&Number.isInteger(props.precision)){
    options.minimumFractionDigits=props.precision
    options.maximumFractionDigits=props.precision
  }
  return options
})
function safeFormat(callback,fallback){
  try{
    const result=callback?.()
    return result===null||result===undefined||result===''?fallback:String(result)
  }catch{return fallback}
}
const defaultValue=computed(()=>{
  if(numericValue.value!==null){
    try{return formatNumber(numericValue.value,resolvedFormatOptions.value)}catch{return String(numericValue.value)}
  }
  if(typeof props.value==='string'&&props.value!=='')return props.value
  return props.placeholder||t('statistic.empty')
})
const formattedValue=computed(()=>safeFormat(
  props.formatter?()=>props.formatter(props.value,{numericValue:numericValue.value,localeOptions:resolvedFormatOptions.value}):null,
  defaultValue.value,
))
const direction=computed(()=>{
  if(!Number.isFinite(props.trend)||Object.is(props.trend,0))return 'flat'
  return props.trend>0?'up':'down'
})
const tone=computed(()=>{
  if(props.positiveDirection==='none'||direction.value==='flat')return 'neutral'
  return direction.value===props.positiveDirection?'positive':'negative'
})
const defaultTrendValue=computed(()=>{
  if(!Number.isFinite(props.trend))return ''
  try{return formatNumber(Math.abs(props.trend),props.trendFormatOptions)}catch{return String(Math.abs(props.trend))}
})
const formattedTrendValue=computed(()=>safeFormat(
  props.trendFormatter?()=>props.trendFormatter(props.trend,{direction:direction.value,tone:tone.value}):null,
  defaultTrendValue.value,
))
const trendText=computed(()=>{
  if(!Number.isFinite(props.trend))return ''
  const label=t(`statistic.trend.${direction.value}`)
  return `${label} ${formattedTrendValue.value}${props.trendSuffix}`.trim()
})
const accessibleValue=computed(()=>`${props.prefix}${formattedValue.value}${props.suffix}`.trim())
const resolvedValueText=computed(()=>props.ariaValueText||accessibleValue.value)
const rootLabel=computed(()=>props.ariaLabel||(hasTitle.value?undefined:t('statistic.label')))
const loadingLabel=computed(()=>props.loadingText||t('statistic.loading'))
const rootAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter(([key])=>!['class','style','aria-label','aria-labelledby'].includes(key))))
</script>

<template>
  <section
    v-bind="rootAttrs"
    class="ui-statistic"
    :class="[`size-${size}`,`status-${status}`,attrs.class,{loading}]"
    :style="attrs.style"
    role="group"
    :aria-label="attrs['aria-label']||rootLabel"
    :aria-labelledby="attrs['aria-labelledby']||(hasTitle?titleId:undefined)"
    :aria-busy="loading||undefined"
  >
    <component :is="hasTitle?'div':'span'" v-if="hasTitle" :id="titleId" class="ui-statistic-title">
      <slot name="title" :title="title">{{ title }}</slot>
    </component>
    <output class="ui-statistic-output" :aria-live="live" :aria-atomic="live!=='off'||undefined" :aria-label="loading?loadingLabel:resolvedValueText">
      <template v-if="loading">
        <span class="ui-statistic-skeleton" aria-hidden="true"/>
        <span class="sr-only">{{ loadingLabel }}</span>
      </template>
      <span v-else class="ui-statistic-value-row" aria-hidden="true">
        <span v-if="prefix||slots.prefix" class="ui-statistic-prefix" aria-hidden="true"><slot name="prefix" :value="value" :formatted-value="formattedValue">{{ prefix }}</slot></span>
        <span class="ui-statistic-value"><slot name="value" :value="value" :formatted-value="formattedValue">{{ formattedValue }}</slot></span>
        <span v-if="suffix||slots.suffix" class="ui-statistic-suffix" aria-hidden="true"><slot name="suffix" :value="value" :formatted-value="formattedValue">{{ suffix }}</slot></span>
      </span>
    </output>
    <span v-if="!loading&&Number.isFinite(trend)" class="ui-statistic-trend" :class="[`direction-${direction}`,`tone-${tone}`]" :aria-label="trendText">
      <span class="ui-statistic-trend-icon" aria-hidden="true"/>
      <slot name="trend" :value="trend" :direction="direction" :tone="tone" :text="trendText">{{ formattedTrendValue }}{{ trendSuffix }}</slot>
    </span>
    <div v-if="slots.extra" class="ui-statistic-extra"><slot name="extra"/></div>
  </section>
</template>

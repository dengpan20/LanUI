<script setup>
import { useLocale } from '../config.js'
defineProps({items:{type:Array,default:()=>[]},title:{type:String,default:''},columns:{type:Number,default:3},bordered:Boolean,size:{type:String,default:'md'}})
const {t}=useLocale()
</script>
<template><section class="ui-descriptions" :class="[`size-${size}`,{bordered}]" :aria-label="title||t('descriptions.label')">
  <header v-if="title||$slots.extra"><strong>{{ title }}</strong><slot name="extra"/></header>
  <dl :style="{'--description-columns':columns}"><div v-for="(item,index) in items" :key="item.key??index" :style="{'--description-span':Math.min(columns,item.span||1)}"><dt>{{ item.label }}</dt><dd><slot :name="`item-${item.key??index}`" :item="item">{{ item.value??'—' }}</slot></dd></div></dl>
</section></template>

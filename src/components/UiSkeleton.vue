<script setup>
defineProps({rows:{type:Number,default:3},avatar:Boolean,animated:{type:Boolean,default:true},width:{type:[String,Number],default:'100%'}})
</script>
<template><div class="ui-skeleton" :class="{animated}" aria-hidden="true"><span v-if="avatar" class="ui-skeleton-avatar"/><div class="ui-skeleton-content"><span v-for="row in rows" :key="row" class="ui-skeleton-line" :style="{width:row===rows&&rows>1?'72%':typeof width==='number'?`${width}px`:width}"/></div></div></template>

<script setup>
defineProps({ tag:{type:String,default:'section'}, direction:{type:String,default:'vertical'}, gap:{type:[String,Number],default:0}, contained:Boolean })
</script>
<template><component :is="tag" class="ui-layout" :class="[`direction-${direction}`,{contained}]" :style="{'--layout-gap':typeof gap==='number'?`${gap}px`:gap}"><slot/></component></template>

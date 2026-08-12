<script setup>
defineProps({ size:{type:[String,Number],default:8}, direction:{type:String,default:'horizontal'}, align:{type:String,default:'center'}, wrap:{type:Boolean,default:true} })
</script>
<template><div class="ui-space" :class="`direction-${direction}`" :style="{gap:typeof size==='number'?`${size}px`:size,alignItems:align,flexWrap:wrap?'wrap':'nowrap'}"><slot/></div></template>

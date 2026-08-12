<script setup>
defineProps({ columns:{type:[Number,String],default:12}, gap:{type:[Number,String],default:16}, min:{type:[Number,String],default:0}, align:{type:String,default:'stretch'} })
</script>
<template><div class="ui-grid" :class="{responsive:!!min}" :style="{'--grid-columns':columns,'--grid-gap':typeof gap==='number'?`${gap}px`:gap,'--grid-min':typeof min==='number'?`${min}px`:min,alignItems:align}"><slot/></div></template>

<script setup>
defineProps({ span:{type:Number,default:12}, offset:{type:Number,default:0}, order:{type:Number,default:0} })
</script>
<template><div class="ui-col" :style="{'--col-span':span,'--col-offset':offset,order}"><slot/></div></template>

<script setup>
defineProps({ vertical:Boolean, dashed:Boolean, label:{type:String,default:''} })
</script>
<template><div class="ui-divider" :class="{vertical,dashed,'has-label':label}" role="separator" :aria-orientation="vertical?'vertical':'horizontal'"><span v-if="label">{{ label }}</span></div></template>

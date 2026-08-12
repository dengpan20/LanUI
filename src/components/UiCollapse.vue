<script setup>
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'
const props=defineProps({items:{type:Array,default:()=>[]},modelValue:{type:[Array,String,Number],default:()=>[]},accordion:Boolean,bordered:{type:Boolean,default:true},disabled:Boolean})
const emit=defineEmits(['update:modelValue','change'])
const uid=useId()
const values=computed(()=>Array.isArray(props.modelValue)?props.modelValue:(props.modelValue===''||props.modelValue==null?[]:[props.modelValue]))
function isOpen(key){return values.value.includes(key)}
function toggle(item){
  if(props.disabled||item.disabled)return
  const next=props.accordion?(isOpen(item.key)?'':item.key):(isOpen(item.key)?values.value.filter(key=>key!==item.key):[...values.value,item.key])
  emit('update:modelValue',next);emit('change',next)
}
</script>
<template><div class="ui-collapse" :class="{bordered}" role="presentation">
  <section v-for="item in items" :key="item.key" class="ui-collapse-item" :class="{open:isOpen(item.key),disabled:disabled||item.disabled}">
    <h3><button type="button" :id="`${uid}-${item.key}-trigger`" :aria-expanded="isOpen(item.key)" :aria-controls="`${uid}-${item.key}-panel`" :disabled="disabled||item.disabled" @click="toggle(item)"><AppIcon class="ui-directional-icon" name="chevronRight" :size="15"/><span>{{ item.label }}</span><small v-if="item.extra">{{ item.extra }}</small></button></h3>
    <div v-show="isOpen(item.key)" :id="`${uid}-${item.key}-panel`" class="ui-collapse-panel" role="region" :aria-labelledby="`${uid}-${item.key}-trigger`"><slot :name="`item-${item.key}`" :item="item">{{ item.content }}</slot></div>
  </section>
</div></template>

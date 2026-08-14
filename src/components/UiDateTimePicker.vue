<script setup>
import UiDatePicker from './UiDatePicker.vue'

defineOptions({inheritAttrs:false})
defineProps({
  modelValue:{type:[String,Date,Number],default:''},
  valueType:{type:String,default:'auto'},
  timeZone:{type:String,default:'local'},
  disambiguation:{type:String,default:'compatible'},
  precision:{type:String,default:'minute'},
  step:{type:[String,Number],default:undefined},
  referenceDate:{type:[String,Date,Number],default:undefined},
  placeholder:{type:String,default:''},
  min:{type:[String,Date,Number],default:''},
  max:{type:[String,Date,Number],default:''},
  size:{type:String,default:''},
  clearable:{type:Boolean,default:true},
  invalid:Boolean,
  disabled:Boolean,
})
const emit=defineEmits(['update:modelValue','change','clear','invalid','focus','blur'])
</script>

<template>
  <UiDatePicker v-bind="$attrs" class="ui-date-time-picker" mode="datetime" icon="calendar" :model-value="modelValue" :value-type="valueType" :time-zone="timeZone" :disambiguation="disambiguation" :precision="precision" :step="step" :reference-date="referenceDate" :placeholder="placeholder" :min="min" :max="max" :size="size" :clearable="clearable" :invalid="invalid" :disabled="disabled" @update:model-value="emit('update:modelValue',$event)" @change="emit('change',$event)" @clear="emit('clear')" @invalid="emit('invalid',$event)" @focus="emit('focus',$event)" @blur="emit('blur',$event)"/>
</template>

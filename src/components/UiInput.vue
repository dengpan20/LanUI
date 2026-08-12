<script setup>
import { computed, inject, ref, toRef, useAttrs } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config.js'
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  placeholder: String,
  icon: String,
  size: { type: String, default: '' },
  clearable: Boolean,
  passwordToggle: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
  loading: Boolean,
  maxlength: [String, Number],
})
const emit = defineEmits(['update:modelValue', 'input', 'clear', 'focus', 'blur'])
const attrs = useAttrs()
const formItem = inject('uiFormItemContext', null)
const focused = ref(false)
const showPassword = ref(false)
const actualType = computed(() => props.passwordToggle && showPassword.value ? 'text' : props.type)
const hasValue = computed(() => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined)
const controlId = computed(() => attrs.id || formItem?.controlId?.value)
const labelledby = computed(() => attrs['aria-labelledby'] || (attrs['aria-label'] ? undefined : formItem?.labelId?.value))
const describedby = computed(() => attrs['aria-describedby'] || formItem?.describedby?.value || undefined)
const resolvedInvalid = computed(() => props.invalid || formItem?.invalid?.value || false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
function update(event) { emit('update:modelValue', event.target.value); emit('input', event.target.value) }
function clear() { emit('update:modelValue', ''); emit('clear') }
</script>

<template>
  <span class="ui-input" :class="[`size-${resolvedSize}`,{ focused, invalid:resolvedInvalid, disabled, readonly, 'has-prefix':icon, 'has-actions':clearable||passwordToggle||loading }]">
    <AppIcon v-if="icon" class="ui-input-prefix" :name="icon" :size="16" />
    <input v-bind="attrs" :id="controlId" class="ui-input-native" :value="modelValue" :type="actualType" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" :aria-busy="loading || undefined" @input="update" @focus="focused=true;emit('focus',$event)" @blur="focused=false;emit('blur',$event)" />
    <span class="ui-input-actions">
      <span v-if="loading" class="spinner ui-input-spinner" />
      <button v-else-if="passwordToggle && hasValue" type="button" class="ui-input-action" :aria-label="t(showPassword?'input.hidePassword':'input.showPassword')" @click="showPassword=!showPassword"><AppIcon name="eye" :size="15"/></button>
      <button v-else-if="clearable && hasValue && !disabled && !readonly" type="button" class="ui-input-action clear-action" :aria-label="t('input.clear')" @mousedown.prevent @click="clear"><AppIcon name="close" :size="13"/></button>
    </span>
  </span>
</template>

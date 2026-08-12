<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  accept: { type: String, default: '' },
  multiple: Boolean,
  disabled: Boolean,
  maxSize: { type: Number, default: 10 },
  maxCount: { type: Number, default: 5 },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change', 'error'])
const inputRef = ref(null)
const dragging = ref(false)
const {t,formatNumber}=useLocale()

function readableSize(bytes) {
  const options={minimumFractionDigits:bytes>=1024?1:0,maximumFractionDigits:1}
  if (bytes < 1024) return `${formatNumber(bytes,options)} B`
  if (bytes < 1024 * 1024) return `${formatNumber(bytes/1024,options)} KB`
  return `${formatNumber(bytes/1024/1024,options)} MB`
}
function accepts(file) {
  if (!props.accept) return true
  return props.accept.split(',').some(rule => {
    const value = rule.trim().toLowerCase()
    return value.startsWith('.') ? file.name.toLowerCase().endsWith(value) : file.type.toLowerCase().startsWith(value.replace('*', ''))
  })
}
function process(fileList) {
  if (props.disabled) return
  const next = [...props.modelValue]
  for (const file of [...fileList]) {
    if (next.length >= props.maxCount) { emit('error', t('upload.maxCount',{count:formatNumber(props.maxCount)})); break }
    if (!accepts(file)) { emit('error', t('upload.typeInvalid',{name:file.name})); continue }
    if (file.size > props.maxSize * 1024 * 1024) { emit('error', t('upload.sizeInvalid',{name:file.name,size:formatNumber(props.maxSize)})); continue }
    next.push({ id: `${Date.now()}-${file.name}-${next.length}`, name: file.name, size: file.size, sizeText: readableSize(file.size), type: file.type, status: 'success' })
  }
  emit('update:modelValue', next)
  emit('change', next)
  if (inputRef.value) inputRef.value.value = ''
}
function remove(id) {
  const next = props.modelValue.filter(file => file.id !== id)
  emit('update:modelValue', next)
  emit('change', next)
}
function drop(event) {
  dragging.value = false
  process(event.dataTransfer.files)
}
</script>

<template>
  <div class="ui-upload" :class="{dragging,disabled}">
    <input ref="inputRef" class="ui-upload-input" type="file" :aria-label="t('upload.input')" tabindex="-1" :accept="accept || undefined" :multiple="multiple" :disabled="disabled" @change="process($event.target.files)"/>
    <button type="button" class="ui-upload-dropzone" :disabled="disabled" @click="inputRef?.click()" @dragenter.prevent="dragging=true" @dragover.prevent="dragging=true" @dragleave.prevent="dragging=false" @drop.prevent="drop">
      <span class="ui-upload-mark"><AppIcon name="upload" :size="22"/></span>
      <span><strong>{{ dragging ? t('upload.dragging') : (hint||t('upload.hint')) }}</strong><small>{{ t('upload.limit',{size:formatNumber(maxSize),count:formatNumber(maxCount)}) }}</small></span>
    </button>
    <ul v-if="modelValue.length" class="ui-upload-list">
      <li v-for="file in modelValue" :key="file.id" class="ui-upload-file">
        <span class="ui-upload-file-icon"><AppIcon name="file" :size="15"/></span>
        <span class="ui-upload-file-copy"><strong>{{ file.name }}</strong><small>{{ file.sizeText || readableSize(file.size || 0) }}</small></span>
        <span class="ui-upload-status"><AppIcon name="checkCircle" :size="15"/></span>
        <button type="button" class="icon-btn" :aria-label="t('upload.remove',{name:file.name})" @click="remove(file.id)"><AppIcon name="close" :size="13"/></button>
      </li>
    </ul>
  </div>
</template>

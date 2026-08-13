<script setup>
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../config-runtime.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  accept: { type: String, default: '' },
  multiple: Boolean,
  disabled: Boolean,
  maxSize: { type: Number, default: 10 },
  maxCount: { type: Number, default: 5 },
  hint: { type: String, default: '' },
  autoUpload: { type: Boolean, default: true },
  request: { type: Function, default: null },
  beforeUpload: { type: Function, default: null },
  beforeRemove: { type: Function, default: null },
  concurrency: { type: Number, default: 2 },
  showFileList: { type: Boolean, default: true },
  directory: Boolean,
  capture: { type: [String, Boolean], default: undefined },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits([
  'update:modelValue', 'change', 'error', 'select', 'reject', 'exceed',
  'start', 'progress', 'success', 'upload-error', 'abort', 'retry', 'remove',
])
const inputRef = ref(null)
const files = ref(props.modelValue.slice())
const dragging = ref(false)
const selecting = ref(false)
const activeCount = ref(0)
const prefix = useId()
const controllers = new Map()
const runs = new Map()
const activeTokens = new Set()
const pending = []
let serial = 0
let dragDepth = 0
const { t, formatNumber } = useLocale()

watch(() => props.modelValue, next => {
  files.value = Array.isArray(next) ? next.slice() : []
  const current = new Set(files.value.map(file => String(file.id)))
  for (const [id, controller] of controllers) {
    if (!current.has(id)) { const token = runs.get(id); runs.delete(id); releaseToken(token, false); controller.abort(); controllers.delete(id) }
  }
  for (let index = pending.length - 1; index >= 0; index -= 1) if (!current.has(pending[index])) pending.splice(index, 1)
  pump()
})

const maximum = computed(() => Math.max(0, Math.trunc(Number.isFinite(props.maxCount) ? props.maxCount : 5)))
const maxBytes = computed(() => Math.max(0, Number.isFinite(props.maxSize) ? props.maxSize : 10) * 1024 * 1024)
const parallel = computed(() => Math.max(1, Math.trunc(Number.isFinite(props.concurrency) ? props.concurrency : 2)))
const remaining = computed(() => Math.max(0, maximum.value - files.value.length))
const busy = computed(() => selecting.value || activeCount.value > 0)
const captureValue = computed(() => props.capture === true ? '' : (props.capture || undefined))

function readableSize(bytes) {
  const value = Math.max(0, Number(bytes) || 0)
  const options = { minimumFractionDigits: value >= 1024 ? 1 : 0, maximumFractionDigits: 1 }
  if (value < 1024) return `${formatNumber(value, options)} B`
  if (value < 1024 * 1024) return `${formatNumber(value / 1024, options)} KB`
  return `${formatNumber(value / 1024 / 1024, options)} MB`
}
function statusText(file) { return t(`upload.status.${file.status || 'ready'}`) }
function accepts(file) {
  if (!props.accept) return true
  const name = String(file.name || '').toLowerCase()
  const type = String(file.type || '').toLowerCase()
  return props.accept.split(',').some(rule => {
    const value = rule.trim().toLowerCase()
    if (!value) return false
    if (value.startsWith('.')) return name.endsWith(value)
    if (value.endsWith('/*')) return type.startsWith(value.slice(0, -1))
    return type === value
  })
}
function nextId() { return `${prefix}-file-${++serial}` }
function find(id) { return files.value.find(file => String(file.id) === String(id)) || null }
function commit(next, reason, detail = {}) {
  const previous = files.value.slice()
  files.value = next
  const meta = { reason, previous, ...detail }
  emit('update:modelValue', next)
  emit('change', next, meta)
  return meta
}
function update(id, patch, reason) {
  const index = files.value.findIndex(file => String(file.id) === String(id))
  if (index < 0) return null
  const next = files.value.slice()
  next[index] = { ...next[index], ...patch }
  commit(next, reason, { file: next[index] })
  return next[index]
}
function releaseToken(token, schedule = true) {
  if (token && activeTokens.delete(token)) activeCount.value = activeTokens.size
  if (schedule) pump()
}
function reject(file, reason, message, error) {
  const payload = { file, reason, message, error }
  emit('reject', payload)
  emit('error', message)
  return payload
}
async function process(fileList, source = 'input') {
  if (props.disabled || selecting.value) return []
  selecting.value = true
  const selected = [...(fileList || [])]
  const candidates = props.multiple ? selected : selected.slice(0, 1)
  const accepted = []
  try {
    if (candidates.length > remaining.value) {
      const message = t('upload.maxCount', { count: formatNumber(maximum.value) })
      emit('exceed', { files: candidates, maxCount: maximum.value, remaining: remaining.value, message })
      emit('error', message)
    }
    for (const original of candidates) {
      if (accepted.length >= remaining.value) break
      let file = original
      if (!accepts(file)) { reject(file, 'type', t('upload.typeInvalid', { name: file.name })); continue }
      if (file.size > maxBytes.value) { reject(file, 'size', t('upload.sizeInvalid', { name: file.name, size: formatNumber(props.maxSize) })); continue }
      if (props.beforeUpload) {
        try {
          const result = await props.beforeUpload(file, { files: files.value.slice(), source })
          if (result === false) { reject(file, 'before-upload', t('upload.beforeRejected', { name: file.name })); continue }
          if (result && typeof result === 'object' && 'name' in result && 'size' in result) file = result
        } catch (error) {
          reject(file, 'before-upload', error instanceof Error && error.message ? error.message : t('upload.beforeRejected', { name: file.name }), error)
          continue
        }
      }
      if (!accepts(file)) { reject(file, 'type', t('upload.typeInvalid', { name: file.name })); continue }
      if (file.size > maxBytes.value) { reject(file, 'size', t('upload.sizeInvalid', { name: file.name, size: formatNumber(props.maxSize) })); continue }
      accepted.push({
        id: nextId(), name: file.name, size: file.size, sizeText: readableSize(file.size), type: file.type,
        lastModified: file.lastModified, status: props.request ? 'ready' : 'success', percent: props.request ? 0 : 100, raw: file,
      })
    }
    if (accepted.length) {
      commit([...files.value, ...accepted], 'select', { files: accepted, source })
      emit('select', { files: accepted, source })
      if (props.request && props.autoUpload) upload(accepted.map(file => file.id))
      else if (!props.request) for (const file of accepted) emit('success', { file, response: undefined })
    }
    return accepted
  } finally {
    selecting.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}
function onProgress(id, percent) {
  if (!runs.has(String(id))) return
  const normalized = Math.max(0, Math.min(100, Number(percent) || 0))
  const file = update(id, { status: 'uploading', percent: normalized }, 'progress')
  if (file) emit('progress', { file, percent: normalized })
}
async function perform(id) {
  const key = String(id)
  const current = find(key)
  if (!current || !props.request || current.status === 'uploading') return
  const controller = new AbortController()
  const token = Symbol(key)
  controllers.set(key, controller)
  runs.set(key, token)
  activeTokens.add(token)
  activeCount.value = activeTokens.size
  const started = update(key, { status: 'uploading', percent: Math.max(0, current.percent || 0), error: undefined }, 'start')
  if (started) emit('start', { file: started })
  try {
    const response = await props.request({
      file: started?.raw || current.raw, item: started || current, signal: controller.signal,
      onProgress: percent => onProgress(key, percent),
    })
    if (runs.get(key) !== token || controller.signal.aborted || !find(key)) return
    const completed = update(key, { status: 'success', percent: 100, response, error: undefined }, 'success')
    if (completed) emit('success', { file: completed, response })
  } catch (error) {
    if (runs.get(key) !== token || !find(key)) return
    if (controller.signal.aborted || error?.name === 'AbortError') {
      const canceled = update(key, { status: 'canceled' }, 'abort')
      if (canceled) emit('abort', { file: canceled, reason: 'request' })
    } else {
      const failed = update(key, { status: 'error', error: error instanceof Error ? error.message : String(error) }, 'upload-error')
      if (failed) emit('upload-error', { file: failed, error })
    }
  } finally {
    if (controllers.get(key) === controller) controllers.delete(key)
    if (runs.get(key) === token) runs.delete(key)
    releaseToken(token)
  }
}
function pump() {
  while (props.request && activeCount.value < parallel.value && pending.length) {
    const id = pending.shift()
    const file = find(id)
    if (file && ['ready', 'error', 'canceled'].includes(file.status || 'ready')) perform(id)
  }
}
function upload(target) {
  const ids = target == null ? files.value.map(file => String(file.id)) : (Array.isArray(target) ? target : [target]).map(String)
  const eligible = ids.filter(id => {
    const file = find(id)
    return file && ['ready', 'error', 'canceled'].includes(file.status || 'ready') && !pending.includes(id) && !controllers.has(id)
  })
  if (!props.request) {
    for (const id of eligible) {
      const file = update(id, { status: 'success', percent: 100, error: undefined }, 'success')
      if (file) emit('success', { file, response: undefined })
    }
    return eligible.length
  }
  pending.push(...eligible)
  pump()
  return eligible.length
}
function abort(target) {
  const ids = target == null ? files.value.map(file => String(file.id)) : (Array.isArray(target) ? target : [target]).map(String)
  let count = 0
  for (const id of ids) {
    const pendingIndex = pending.indexOf(id)
    if (pendingIndex >= 0) pending.splice(pendingIndex, 1)
    const controller = controllers.get(id)
    if (!controller && pendingIndex < 0) continue
    const token = runs.get(id)
    runs.delete(id)
    releaseToken(token, false)
    controller?.abort()
    controllers.delete(id)
    const file = update(id, { status: 'canceled' }, 'abort')
    if (file) { emit('abort', { file, reason: 'user' }); count += 1 }
  }
  pump()
  return count
}
function retry(id) {
  const file = find(id)
  if (!file || !['error', 'canceled'].includes(file.status)) return false
  const ready = update(id, { status: 'ready', percent: 0, error: undefined }, 'retry')
  if (!ready) return false
  emit('retry', { file: ready })
  upload(id)
  return true
}
async function remove(id) {
  const file = find(id)
  if (!file || props.disabled) return false
  if (props.beforeRemove) {
    try { if (await props.beforeRemove(file, files.value.slice()) === false) return false }
    catch (error) { emit('upload-error', { file, error, stage: 'before-remove' }); return false }
  }
  const key = String(id)
  const pendingIndex = pending.indexOf(key)
  if (pendingIndex >= 0) pending.splice(pendingIndex, 1)
  const token = runs.get(key)
  runs.delete(key)
  releaseToken(token, false)
  controllers.get(key)?.abort()
  controllers.delete(key)
  const next = files.value.filter(item => String(item.id) !== key)
  commit(next, 'remove', { file })
  emit('remove', { file, files: next })
  pump()
  return true
}
async function clear() {
  let count = 0
  for (const file of files.value.slice()) if (await remove(file.id)) count += 1
  return count
}
function open() { if (!props.disabled && remaining.value > 0) inputRef.value?.click() }
function dragenter() { if (!props.disabled) { dragDepth += 1; dragging.value = true } }
function dragleave() { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dragging.value = false }
function drop(event) { dragDepth = 0; dragging.value = false; process(event.dataTransfer?.files, 'drop') }

onBeforeUnmount(() => { for (const controller of controllers.values()) controller.abort(); controllers.clear(); runs.clear(); activeTokens.clear(); activeCount.value = 0; pending.length = 0 })
defineExpose({ open, select: process, upload, abort, retry, remove, clear, files, inputRef, busy, remaining })
</script>

<template>
  <div class="ui-upload" :class="{dragging,disabled,busy}" role="group" :aria-label="ariaLabel || t('upload.region')" :aria-busy="busy || undefined">
    <input
      ref="inputRef" class="ui-upload-input" type="file" :aria-label="t('upload.input')" tabindex="-1"
      :accept="accept || undefined" :multiple="multiple" :disabled="disabled" :capture="captureValue"
      :webkitdirectory="directory ? '' : undefined" :directory="directory ? '' : undefined" @change="process($event.target.files,'input')"
    />
    <button
      type="button" class="ui-upload-dropzone" :disabled="disabled || remaining===0" @click="open"
      @dragenter.prevent="dragenter" @dragover.prevent @dragleave.prevent="dragleave" @drop.prevent="drop"
    >
      <slot name="trigger" :open="open" :dragging="dragging" :busy="busy" :remaining="remaining">
        <span class="ui-upload-mark"><AppIcon name="upload" :size="22"/></span>
        <span><strong>{{ dragging ? t('upload.dragging') : (hint||t('upload.hint')) }}</strong><small>{{ t('upload.limit',{size:formatNumber(maxSize),count:formatNumber(maxCount)}) }}</small></span>
      </slot>
    </button>
    <slot name="tip" :remaining="remaining" :busy="busy" />
    <ul v-if="showFileList && files.length" class="ui-upload-list" :aria-label="t('upload.list')">
      <li v-for="(file,index) in files" :key="file.id" class="ui-upload-file" :class="`status-${file.status||'ready'}`" :aria-busy="file.status==='uploading' || undefined">
        <slot name="file" :file="file" :index="index" :upload="upload" :retry="retry" :abort="abort" :remove="remove">
          <span class="ui-upload-file-icon"><AppIcon name="file" :size="15"/></span>
          <span class="ui-upload-file-copy">
            <strong>{{ file.name }}</strong>
            <small>{{ file.sizeText || readableSize(file.size || 0) }} · {{ statusText(file) }}<template v-if="file.status==='uploading'"> · {{ Math.round(file.percent||0) }}%</template></small>
            <progress v-if="file.status==='uploading'" class="ui-upload-progress" max="100" :value="file.percent||0" :aria-label="t('upload.progress',{name:file.name})" />
            <span v-if="file.status==='error' && file.error" class="ui-upload-file-error" role="alert">{{ file.error }}</span>
          </span>
          <span class="ui-upload-status" aria-hidden="true">
            <AppIcon v-if="file.status==='success'" name="checkCircle" :size="15"/>
            <AppIcon v-else-if="file.status==='error'" name="alert" :size="15"/>
            <AppIcon v-else-if="file.status==='uploading'" name="refresh" class="is-spinning" :size="15"/>
            <AppIcon v-else name="upload" :size="15"/>
          </span>
          <button v-if="request && ['ready','canceled'].includes(file.status||'ready')" type="button" class="icon-btn ui-upload-action" :disabled="disabled || !file.raw" :aria-label="t('upload.start',{name:file.name})" @click="upload(file.id)"><AppIcon name="upload" :size="13"/></button>
          <button v-if="file.status==='uploading'" type="button" class="icon-btn ui-upload-action" :aria-label="t('upload.abort',{name:file.name})" @click="abort(file.id)"><AppIcon name="close" :size="13"/></button>
          <button v-if="request && file.status==='error'" type="button" class="icon-btn ui-upload-action" :disabled="disabled || !file.raw" :aria-label="t('upload.retry',{name:file.name})" @click="retry(file.id)"><AppIcon name="refresh" :size="13"/></button>
          <button type="button" class="icon-btn ui-upload-remove" :disabled="disabled" :aria-label="t('upload.remove',{name:file.name})" @click="remove(file.id)"><AppIcon name="close" :size="13"/></button>
        </slot>
      </li>
    </ul>
  </div>
</template>

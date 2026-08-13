<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, useSlots, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'
import { captureFocusOrigin, focusWithRetry } from './focusUtils.js'
import { closeOverlay, isTopOverlay, openOverlay } from './overlayManager.js'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallback: { type: String, default: '' },
  width: { type: [String, Number], default: undefined },
  height: { type: [String, Number], default: undefined },
  aspectRatio: { type: [String, Number], default: undefined },
  fit: { type: String, default: 'cover' },
  position: { type: String, default: 'center' },
  radius: { type: [String, Number], default: undefined },
  loading: { type: String, default: 'lazy' },
  decoding: { type: String, default: 'async' },
  crossorigin: { type: String, default: undefined },
  referrerpolicy: { type: String, default: undefined },
  preview: { type: Boolean, default: false },
  previewOpen: { type: Boolean, default: undefined },
  previewSrc: { type: String, default: '' },
  previewList: { type: Array, default: () => [] },
  previewIndex: { type: Number, default: 0 },
  loop: { type: Boolean, default: true },
  minScale: { type: Number, default: 0.5 },
  maxScale: { type: Number, default: 4 },
  scaleStep: { type: Number, default: 0.25 },
  zoomOnWheel: { type: Boolean, default: true },
  closeOnMask: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  toolbar: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  teleportTo: { type: [String, Object], default: 'body' },
  previewZIndex: { type: Number, default: 300 },
})

const emit = defineEmits([
  'load', 'error', 'fallback', 'retry',
  'update:previewOpen', 'update:previewIndex',
  'preview-open', 'preview-close', 'preview-change', 'preview-load', 'preview-error', 'transform',
])

const slots = useSlots()
const direction = useDirection()
const { t } = useLocale()
const uid = useId()
const overlayId = `image-preview-${uid}`
const titleId = `image-preview-title-${uid}`
const dialogRef = ref(null)
const inlineState = ref('loading')
const currentSrc = ref('')
const triedFallback = ref(false)
const inlineKey = ref(0)
const internalOpen = ref(false)
const internalIndex = ref(0)
const overlayZ = ref(props.previewZIndex)
const scale = ref(1)
const rotation = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)
const previewLoading = ref(false)
const previewFailed = ref(false)
const previewKey = ref(0)
let returnFocus = null
let dragState = null

const cssSize = value => {
  if (typeof value === 'number') return `${value}px`
  const normalized = String(value ?? '').trim()
  return /^-?\d+(?:\.\d+)?$/.test(normalized) ? `${normalized}px` : normalized
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const normalizedMinScale = computed(() => Math.max(0.1, Number(props.minScale) || 0.5))
const normalizedMaxScale = computed(() => Math.max(normalizedMinScale.value, Number(props.maxScale) || 4))
const normalizedScaleStep = computed(() => Math.max(0.05, Number(props.scaleStep) || 0.25))
const rootStyle = computed(() => ({
  '--ui-image-width': cssSize(props.width),
  '--ui-image-height': cssSize(props.height),
  '--ui-image-ratio': props.aspectRatio || undefined,
  '--ui-image-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(props.fit) ? props.fit : 'cover',
  '--ui-image-position': props.position || 'center',
  '--ui-image-radius': cssSize(props.radius),
}))

const previewSources = computed(() => {
  const supplied = Array.isArray(props.previewList)
    ? props.previewList.map(value => String(value || '').trim()).filter(Boolean)
    : []
  if (supplied.length) return supplied
  const source = String(props.previewSrc || currentSrc.value || props.src || '').trim()
  return source ? [source] : []
})
const boundedIndex = computed(() => clamp(internalIndex.value, 0, Math.max(0, previewSources.value.length - 1)))
const activePreviewSrc = computed(() => previewSources.value[boundedIndex.value] || '')
const previewVisible = computed(() => props.previewOpen === undefined ? internalOpen.value : props.previewOpen)
const previewable = computed(() => props.preview && !props.disabled && previewSources.value.length > 0 && inlineState.value === 'loaded')
const canPrevious = computed(() => previewSources.value.length > 1 && (props.loop || boundedIndex.value > 0))
const canNext = computed(() => previewSources.value.length > 1 && (props.loop || boundedIndex.value < previewSources.value.length - 1))
const previewTransform = computed(() => `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) rotate(${rotation.value}deg) scale(${scale.value})`)
const previewButtonLabel = computed(() => props.alt ? `${t('image.preview')}: ${props.alt}` : t('image.preview'))
const focusable = () => [...(dialogRef.value?.querySelectorAll('button:not(:disabled),[href],[tabindex]:not([tabindex="-1"])') || [])]

function resetInline() {
  currentSrc.value = String(props.src || props.fallback || '').trim()
  triedFallback.value = !props.src && Boolean(props.fallback)
  inlineState.value = currentSrc.value ? 'loading' : 'error'
}

function handleLoad(event) {
  inlineState.value = 'loaded'
  emit('load', event, { src: currentSrc.value, fallback: triedFallback.value })
}

function handleError(event) {
  if (props.fallback && currentSrc.value !== props.fallback && !triedFallback.value) {
    triedFallback.value = true
    currentSrc.value = props.fallback
    inlineState.value = 'loading'
    inlineKey.value += 1
    emit('fallback', { failedSrc: props.src, fallbackSrc: props.fallback, event })
    return
  }
  inlineState.value = 'error'
  emit('error', event, { src: currentSrc.value, fallback: triedFallback.value })
}

function retryInline() {
  inlineKey.value += 1
  resetInline()
  emit('retry', { src: currentSrc.value })
}

function setPreviewOpen(open, source = 'programmatic') {
  const wasOpen = previewVisible.value
  if (props.previewOpen === undefined) internalOpen.value = open
  emit('update:previewOpen', open)
  if (!open) resetTransform('close')
  if (!open && wasOpen) emit('preview-close', { source, index: boundedIndex.value, src: activePreviewSrc.value })
}

function openPreview() {
  if (!previewable.value) return
  internalIndex.value = clamp(Number(props.previewIndex) || 0, 0, previewSources.value.length - 1)
  setPreviewOpen(true, 'trigger')
}

function closePreview(source = 'close-button') {
  setPreviewOpen(false, source)
}

function setIndex(next, source = 'programmatic') {
  const length = previewSources.value.length
  if (!length) return
  let target = Number(next) || 0
  if (props.loop && length > 1) target = ((target % length) + length) % length
  else target = clamp(target, 0, length - 1)
  if (target === boundedIndex.value) return
  internalIndex.value = target
  emit('update:previewIndex', target)
  emit('preview-change', { index: target, src: previewSources.value[target], source })
}

function navigate(delta, source) {
  if ((delta < 0 && !canPrevious.value) || (delta > 0 && !canNext.value)) return
  setIndex(boundedIndex.value + delta, source)
}

function emitTransform(source) {
  emit('transform', {
    scale: scale.value,
    rotation: rotation.value,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    source,
  })
}

function setScale(next, source = 'programmatic') {
  const value = Math.round(clamp(next, normalizedMinScale.value, normalizedMaxScale.value) * 1000) / 1000
  if (value === scale.value) return
  scale.value = value
  if (value <= 1) { offsetX.value = 0; offsetY.value = 0; dragState = null; dragging.value = false }
  emitTransform(source)
}

function zoomIn(source = 'control') { setScale(scale.value + normalizedScaleStep.value, source) }
function zoomOut(source = 'control') { setScale(scale.value - normalizedScaleStep.value, source) }
function rotate(delta, source = 'control') {
  rotation.value = ((rotation.value + delta) % 360 + 360) % 360
  emitTransform(source)
}
function resetTransform(source = 'reset') {
  const changed = scale.value !== 1 || rotation.value !== 0 || offsetX.value !== 0 || offsetY.value !== 0
  scale.value = 1; rotation.value = 0; offsetX.value = 0; offsetY.value = 0
  dragState = null; dragging.value = false
  if (changed) emitTransform(source)
}

function handleWheel(event) {
  if (!props.zoomOnWheel || !previewVisible.value || !isTopOverlay(overlayId)) return
  event.preventDefault()
  if (event.deltaY < 0) zoomIn('wheel')
  else if (event.deltaY > 0) zoomOut('wheel')
}

function handleDoubleClick() {
  setScale(scale.value > 1 ? 1 : Math.min(2, normalizedMaxScale.value), 'double-click')
}

function startPan(event) {
  if (scale.value <= 1 || event.button !== 0) return
  event.preventDefault()
  dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, startX: offsetX.value, startY: offsetY.value }
  dragging.value = true
  event.currentTarget?.setPointerCapture?.(event.pointerId)
}

function movePan(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return
  const rect = event.currentTarget.getBoundingClientRect()
  const maxX = rect.width * Math.max(0, scale.value - 1) / 2
  const maxY = rect.height * Math.max(0, scale.value - 1) / 2
  offsetX.value = clamp(dragState.startX + event.clientX - dragState.x, -maxX, maxX)
  offsetY.value = clamp(dragState.startY + event.clientY - dragState.y, -maxY, maxY)
}

function endPan(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return
  dragState = null
  dragging.value = false
  event.currentTarget?.releasePointerCapture?.(event.pointerId)
  emitTransform('pointer')
}

function retryPreview() {
  previewFailed.value = false
  previewLoading.value = !slots.preview
  previewKey.value += 1
}

function handlePreviewLoad(event) {
  previewLoading.value = false
  previewFailed.value = false
  emit('preview-load', event, { index: boundedIndex.value, src: activePreviewSrc.value })
}

function handlePreviewError(event) {
  previewLoading.value = false
  previewFailed.value = true
  emit('preview-error', event, { index: boundedIndex.value, src: activePreviewSrc.value })
}

function preloadAdjacent() {
  if (!isClient || typeof Image === 'undefined' || previewSources.value.length < 2) return
  const indexes = [boundedIndex.value - 1, boundedIndex.value + 1]
  for (const index of indexes) {
    const normalized = props.loop ? ((index % previewSources.value.length) + previewSources.value.length) % previewSources.value.length : index
    const source = previewSources.value[normalized]
    if (source) { const image = new Image(); image.src = source }
  }
}

function handleKeydown(event) {
  if (!previewVisible.value || !isTopOverlay(overlayId)) return
  if (event.key === 'Escape' && props.closeOnEsc) { event.preventDefault(); closePreview('escape'); return }
  if (event.key === 'Tab') {
    const items = focusable()
    if (!items.length) { event.preventDefault(); dialogRef.value?.focus(); return }
    const first = items[0], last = items.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    return
  }
  const rtl = direction.value === 'rtl'
  if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(rtl ? 1 : -1, 'keyboard') }
  else if (event.key === 'ArrowRight') { event.preventDefault(); navigate(rtl ? -1 : 1, 'keyboard') }
  else if (event.key === 'Home' && previewSources.value.length > 1) { event.preventDefault(); setIndex(0, 'keyboard') }
  else if (event.key === 'End' && previewSources.value.length > 1) { event.preventDefault(); setIndex(previewSources.value.length - 1, 'keyboard') }
  else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomIn('keyboard') }
  else if (event.key === '-') { event.preventDefault(); zoomOut('keyboard') }
  else if (event.key === '0') { event.preventDefault(); resetTransform('keyboard') }
  else if (event.key.toLowerCase() === 'r') { event.preventDefault(); rotate(event.shiftKey ? -90 : 90, 'keyboard') }
}

watch(() => [props.src, props.fallback], resetInline, { immediate: true })
watch(() => props.previewIndex, value => { internalIndex.value = clamp(Number(value) || 0, 0, Math.max(0, previewSources.value.length - 1)) }, { immediate: true })
watch(previewSources, sources => {
  if (!sources.length) { internalIndex.value = 0; if (previewVisible.value) closePreview('source-empty') }
  else internalIndex.value = clamp(internalIndex.value, 0, sources.length - 1)
})
watch([boundedIndex, activePreviewSrc], () => {
  resetTransform('image-change')
  previewLoading.value = !slots.preview
  previewFailed.value = false
  previewKey.value += 1
  preloadAdjacent()
})
watch(previewVisible, async open => {
  if (!isClient) return
  if (open) {
    returnFocus = captureFocusOrigin()
    overlayZ.value = openOverlay(overlayId, props.previewZIndex)
    document.addEventListener('keydown', handleKeydown)
    previewLoading.value = !slots.preview
    previewFailed.value = false
    await nextTick()
    ;(focusable()[0] || dialogRef.value)?.focus()
    preloadAdjacent()
    emit('preview-open', { index: boundedIndex.value, src: activePreviewSrc.value })
  } else {
    document.removeEventListener('keydown', handleKeydown)
    closeOverlay(overlayId)
    await nextTick()
    focusWithRetry(returnFocus)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (!isClient) return
  document.removeEventListener('keydown', handleKeydown)
  closeOverlay(overlayId)
})
</script>

<template>
  <figure
    class="ui-image"
    :class="[`is-${inlineState}`, { 'is-previewable': previewable, 'is-disabled': disabled }]"
    :style="rootStyle"
    :aria-busy="inlineState === 'loading' ? 'true' : undefined"
  >
    <img
      v-if="currentSrc"
      :key="inlineKey"
      class="ui-image-media"
      :src="currentSrc"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :crossorigin="crossorigin"
      :referrerpolicy="referrerpolicy"
      draggable="false"
      @load="handleLoad"
      @error="handleError"
    >
    <div v-if="inlineState === 'loading'" class="ui-image-placeholder" role="status" :aria-label="t('image.loading')">
      <slot name="placeholder"><span class="ui-image-skeleton" aria-hidden="true"/></slot>
    </div>
    <div v-else-if="inlineState === 'error'" class="ui-image-error" role="alert">
      <slot name="error" :retry="retryInline">
        <AppIcon name="file" :size="24"/>
        <span>{{ t('image.error') }}</span>
        <button v-if="src || fallback" type="button" class="ui-image-retry" @click="retryInline">{{ t('image.retry') }}</button>
      </slot>
    </div>
    <button v-if="previewable" type="button" class="ui-image-open" :aria-label="previewButtonLabel" @click="openPreview">
      <span class="ui-image-open-icon" aria-hidden="true"><AppIcon name="search" :size="20"/></span>
    </button>
    <slot name="overlay" :state="inlineState" :open="openPreview"/>
  </figure>

  <Teleport :to="teleportTo">
    <Transition name="overlay-fade">
      <div
        v-if="previewVisible"
        class="overlay ui-image-preview-overlay"
        :style="{ zIndex: overlayZ }"
        @mousedown.self="closeOnMask && isTopOverlay(overlayId) && closePreview('mask')"
      >
        <section
          ref="dialogRef"
          class="ui-image-preview"
          :dir="direction"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-busy="previewLoading ? 'true' : undefined"
          tabindex="-1"
        >
          <h2 :id="titleId" class="sr-only">{{ alt || t('image.dialog') }}</h2>
          <div
            class="ui-image-preview-canvas"
            :class="{ 'is-zoomed': scale > 1, 'is-dragging': dragging }"
            @wheel="handleWheel"
            @dblclick="handleDoubleClick"
            @pointerdown="startPan"
            @pointermove="movePan"
            @pointerup="endPan"
            @pointercancel="endPan"
          >
            <slot name="preview" :src="activePreviewSrc" :index="boundedIndex" :scale="scale" :rotation="rotation">
              <img
                v-if="!previewFailed"
                :key="`${previewKey}-${activePreviewSrc}`"
                class="ui-image-preview-media"
                :src="activePreviewSrc"
                :alt="alt"
                :style="{ transform: previewTransform }"
                draggable="false"
                decoding="async"
                @load="handlePreviewLoad"
                @error="handlePreviewError"
              >
            </slot>
            <div v-if="previewLoading" class="ui-image-preview-loading" role="status">{{ t('image.loading') }}</div>
            <div v-if="previewFailed" class="ui-image-preview-error" role="alert">
              <AppIcon name="alert" :size="28"/>
              <span>{{ t('image.error') }}</span>
              <button type="button" @click="retryPreview">{{ t('image.retry') }}</button>
            </div>
          </div>

          <button type="button" class="ui-image-preview-close" :aria-label="t('image.close')" @click="closePreview('close-button')"><AppIcon name="close"/></button>
          <button v-if="previewSources.length > 1" type="button" class="ui-image-preview-nav is-previous" :disabled="!canPrevious" :aria-label="t('image.previous')" @click="navigate(-1, 'control')"><AppIcon name="chevronRight"/></button>
          <button v-if="previewSources.length > 1" type="button" class="ui-image-preview-nav is-next" :disabled="!canNext" :aria-label="t('image.next')" @click="navigate(1, 'control')"><AppIcon name="chevronRight"/></button>

          <div class="ui-image-preview-meta" aria-live="polite">
            <slot name="caption" :index="boundedIndex" :src="activePreviewSrc"/>
            <span v-if="previewSources.length > 1">{{ t('image.counter', { current: boundedIndex + 1, total: previewSources.length }) }}</span>
          </div>

          <div v-if="toolbar" class="ui-image-preview-toolbar" role="toolbar" :aria-label="t('image.toolbar')">
            <slot name="toolbar" :zoom-in="zoomIn" :zoom-out="zoomOut" :rotate="rotate" :reset="resetTransform" :scale="scale" :rotation="rotation">
              <button type="button" :disabled="scale <= normalizedMinScale" :aria-label="t('image.zoomOut')" @click="zoomOut('control')">−</button>
              <button type="button" class="ui-image-preview-scale" :aria-label="t('image.reset')" @click="resetTransform('control')">{{ Math.round(scale * 100) }}%</button>
              <button type="button" :disabled="scale >= normalizedMaxScale" :aria-label="t('image.zoomIn')" @click="zoomIn('control')">＋</button>
              <span class="ui-image-preview-toolbar-divider" aria-hidden="true"/>
              <button type="button" :aria-label="t('image.rotateLeft')" @click="rotate(-90, 'control')"><AppIcon name="refresh"/></button>
              <button type="button" class="is-rotate-right" :aria-label="t('image.rotateRight')" @click="rotate(90, 'control')"><AppIcon name="refresh"/></button>
            </slot>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

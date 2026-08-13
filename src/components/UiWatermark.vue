<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { isClient } from '../env.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  content: { type: [String, Array], default: '' },
  image: { type: String, default: '' },
  width: { type: Number, default: 120, validator: value => Number.isFinite(value) && value > 0 },
  height: { type: Number, default: 64, validator: value => Number.isFinite(value) && value > 0 },
  rotate: { type: Number, default: -22 },
  zIndex: { type: Number, default: 9 },
  gap: { type: Array, default: () => [100, 100] },
  offset: { type: Array, default: undefined },
  font: { type: Object, default: () => ({}) },
  imageCrossOrigin: {
    type: String,
    default: 'anonymous',
    validator: value => ['', 'anonymous', 'use-credentials'].includes(value),
  },
  observe: { type: Boolean, default: true },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['render', 'remove', 'image-load', 'image-error'])
const attrs = useAttrs()
const rootRef = ref(null)
const layerRef = ref(null)
const patternUrl = ref('')
const renderMode = ref('empty')
let observer = null
let activeImage = null
let renderRevision = 0

const finite = (value, fallback, minimum = -Infinity) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(minimum, number) : fallback
}
const tuple = (value, fallback, minimum = 0) => Array.isArray(value)
  ? [finite(value[0], fallback[0], minimum), finite(value[1], fallback[1], minimum)]
  : fallback
const normalizedGap = computed(() => tuple(props.gap, [100, 100]))
const normalizedOffset = computed(() => Array.isArray(props.offset)
  ? tuple(props.offset, [0, 0], -Infinity)
  : [normalizedGap.value[0] / 2, normalizedGap.value[1] / 2])
const tileSize = computed(() => [
  finite(props.width, 120, 1) + normalizedGap.value[0],
  finite(props.height, 64, 1) + normalizedGap.value[1],
])
const contentLines = computed(() => {
  const input = Array.isArray(props.content) ? props.content : [props.content]
  return input.map(value => String(value ?? '').trim()).filter(Boolean)
})
const normalizedFont = computed(() => ({
  color: String(props.font?.color || 'rgba(71, 85, 105, 0.16)'),
  fontSize: finite(props.font?.fontSize, 16, 1),
  fontWeight: props.font?.fontWeight ?? 500,
  fontFamily: String(props.font?.fontFamily || 'Inter, "Noto Sans SC", sans-serif'),
  fontStyle: ['normal', 'italic', 'oblique'].includes(props.font?.fontStyle) ? props.font.fontStyle : 'normal',
  textAlign: ['left', 'center', 'right'].includes(props.font?.textAlign) ? props.font.textAlign : 'center',
  textBaseline: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'].includes(props.font?.textBaseline)
    ? props.font.textBaseline
    : 'middle',
  lineHeight: finite(props.font?.lineHeight, finite(props.font?.fontSize, 16, 1) * 1.35, 1),
}))
const signature = computed(() => JSON.stringify({
  patternUrl: patternUrl.value,
  tile: tileSize.value,
  offset: normalizedOffset.value,
  zIndex: props.zIndex,
  mode: renderMode.value,
}))
const layerStyle = computed(() => ({
  position: 'absolute',
  inset: '0px',
  zIndex: String(finite(props.zIndex, 9)),
  pointerEvents: 'none',
  userSelect: 'none',
  backgroundImage: patternUrl.value ? `url("${patternUrl.value}")` : 'none',
  backgroundRepeat: 'repeat',
  backgroundSize: `${tileSize.value[0]}px ${tileSize.value[1]}px`,
  backgroundPosition: `${normalizedOffset.value[0] - normalizedGap.value[0] / 2}px ${normalizedOffset.value[1] - normalizedGap.value[1] / 2}px`,
}))

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])
}

function buildSvgFallback() {
  if (!contentLines.value.length) return ''
  const [tileWidth, tileHeight] = tileSize.value
  const width = finite(props.width, 120, 1)
  const height = finite(props.height, 64, 1)
  const font = normalizedFont.value
  const anchor = font.textAlign === 'left' ? 'start' : font.textAlign === 'right' ? 'end' : 'middle'
  const x = font.textAlign === 'left' ? -width / 2 : font.textAlign === 'right' ? width / 2 : 0
  const firstY = -((contentLines.value.length - 1) * font.lineHeight) / 2
  const text = contentLines.value.map((line, index) => `<text x="${x}" y="${firstY + index * font.lineHeight}" dominant-baseline="middle" text-anchor="${anchor}">${xmlEscape(line)}</text>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}" viewBox="0 0 ${tileWidth} ${tileHeight}"><g transform="translate(${width / 2} ${height / 2}) rotate(${finite(props.rotate, -22)})" fill="${xmlEscape(font.color)}" font-family="${xmlEscape(font.fontFamily)}" font-size="${font.fontSize}" font-style="${font.fontStyle}" font-weight="${xmlEscape(font.fontWeight)}">${text}</g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function drawPattern(image = null) {
  if (!isClient) return image ? '' : buildSvgFallback()
  const canvas = document.createElement('canvas')
  const [tileWidth, tileHeight] = tileSize.value
  const width = finite(props.width, 120, 1)
  const height = finite(props.height, 64, 1)
  const ratio = Math.min(4, Math.max(1, window.devicePixelRatio || 1))
  canvas.width = Math.ceil(tileWidth * ratio)
  canvas.height = Math.ceil(tileHeight * ratio)
  const context = canvas.getContext?.('2d')
  if (!context) return image ? '' : buildSvgFallback()
  context.scale(ratio, ratio)
  context.translate(width / 2, height / 2)
  context.rotate((finite(props.rotate, -22) * Math.PI) / 180)
  if (image) {
    context.drawImage(image, -width / 2, -height / 2, width, height)
  } else {
    const font = normalizedFont.value
    context.fillStyle = font.color
    context.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`
    context.textAlign = font.textAlign
    context.textBaseline = font.textBaseline
    const x = font.textAlign === 'left' ? -width / 2 : font.textAlign === 'right' ? width / 2 : 0
    const firstY = -((contentLines.value.length - 1) * font.lineHeight) / 2
    contentLines.value.forEach((line, index) => context.fillText(line, x, firstY + index * font.lineHeight, width))
  }
  return canvas.toDataURL('image/png')
}

function commitPattern(url, mode, source = '') {
  patternUrl.value = url
  renderMode.value = url ? mode : 'empty'
  nextTick(() => {
    emit('render', { mode: renderMode.value, source, width: tileSize.value[0], height: tileSize.value[1] })
  })
}

function renderText(source = 'content') {
  try {
    commitPattern(contentLines.value.length ? drawPattern() : '', contentLines.value.length ? 'text' : 'empty', source)
  } catch (error) {
    commitPattern(buildSvgFallback(), contentLines.value.length ? 'text' : 'empty', source)
    emit('image-error', { src: props.image, error, stage: 'render' })
  }
}

function renderWatermark(source = 'props') {
  const revision = ++renderRevision
  if (activeImage) {
    activeImage.onload = null
    activeImage.onerror = null
    activeImage = null
  }
  const imageSource = String(props.image || '').trim()
  if (!imageSource || !isClient || typeof Image !== 'function') {
    renderText(source)
    return
  }
  const image = new Image()
  activeImage = image
  if (props.imageCrossOrigin) image.crossOrigin = props.imageCrossOrigin
  image.onload = event => {
    if (revision !== renderRevision) return
    try {
      const url = drawPattern(image)
      if (!url) throw new Error('Canvas image rendering is unavailable')
      commitPattern(url, 'image', imageSource)
      emit('image-load', { src: imageSource, event })
    } catch (error) {
      renderText('image-fallback')
      emit('image-error', { src: imageSource, error, stage: 'render' })
    }
  }
  image.onerror = event => {
    if (revision !== renderRevision) return
    renderText('image-fallback')
    emit('image-error', { src: imageSource, event, stage: 'load' })
  }
  image.src = imageSource
}

function layerIsIntact() {
  const root = rootRef.value
  const layer = layerRef.value
  const expected = layerStyle.value
  return Boolean(root && layer && root.contains(layer)
    && layer.classList.contains('ui-watermark-layer')
    && layer.dataset.uiWatermarkSignature === signature.value
    && layer.style.position === expected.position
    && layer.style.inset === expected.inset
    && layer.style.zIndex === expected.zIndex
    && layer.style.pointerEvents === expected.pointerEvents
    && layer.style.backgroundImage === expected.backgroundImage
    && layer.style.backgroundSize === expected.backgroundSize
    && layer.style.backgroundPosition === expected.backgroundPosition)
}

function stopObserver() {
  observer?.disconnect()
  observer = null
}

function startObserver() {
  stopObserver()
  if (!props.observe || !isClient || typeof MutationObserver !== 'function' || !rootRef.value) return
  observer = new MutationObserver(() => {
    if (layerIsIntact()) return
    const reason = layerRef.value && rootRef.value?.contains(layerRef.value) ? 'modified' : 'removed'
    stopObserver()
    emit('remove', { reason })
    const root = rootRef.value
    const layer = layerRef.value
    if (root && layer) {
      layer.className = 'ui-watermark-layer'
      layer.dataset.uiWatermarkLayer = ''
      layer.dataset.uiWatermarkMode = renderMode.value
      layer.dataset.uiWatermarkSignature = signature.value
      Object.assign(layer.style, layerStyle.value)
      if (props.ariaLabel) {
        layer.setAttribute('role', 'img')
        layer.setAttribute('aria-label', props.ariaLabel)
        layer.removeAttribute('aria-hidden')
      } else {
        layer.removeAttribute('role')
        layer.removeAttribute('aria-label')
        layer.setAttribute('aria-hidden', 'true')
      }
      if (!root.contains(layer)) root.appendChild(layer)
    }
    nextTick(startObserver)
  })
  observer.observe(rootRef.value, { attributes: true, attributeFilter: ['class', 'style', 'data-ui-watermark-signature'], childList: true, subtree: true })
}

watch(() => [props.content, props.image, props.width, props.height, props.rotate, props.gap, props.offset, props.font, props.imageCrossOrigin], () => renderWatermark(), { deep: true })
watch(() => props.observe, () => nextTick(startObserver))
watch([patternUrl, tileSize, normalizedOffset, () => props.zIndex], () => nextTick(startObserver), { deep: true })

onMounted(() => {
  renderWatermark('mount')
  nextTick(startObserver)
})
onBeforeUnmount(() => {
  renderRevision += 1
  if (activeImage) {
    activeImage.onload = null
    activeImage.onerror = null
  }
  stopObserver()
})

defineExpose({ update: renderWatermark, patternUrl, mode: renderMode })
</script>

<template>
  <div ref="rootRef" v-bind="attrs" class="ui-watermark">
    <slot />
    <div
      ref="layerRef"
      class="ui-watermark-layer"
      data-ui-watermark-layer
      :data-ui-watermark-mode="renderMode"
      :data-ui-watermark-signature="signature"
      :style="layerStyle"
      :role="ariaLabel ? 'img' : undefined"
      :aria-label="ariaLabel || undefined"
      :aria-hidden="ariaLabel ? undefined : 'true'"
    />
  </div>
</template>

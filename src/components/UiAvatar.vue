<script setup>
import { computed, ref, watch } from 'vue'
import { safeLength } from '../layout.js'
import { useLocale } from '../config-runtime.js'

const PRESET_SIZES = ['sm', 'md', 'lg']

const props = defineProps({
  src: { type: String, default: '' }, alt: { type: String, default: '' }, name: { type: String, default: '' },
  size: { type: [Number, String], default: 'md' }, color: { type: String, default: 'blue' }, square: { type: Boolean, default: false },
  shape: { type: String, default: 'circle', validator: value => /^(?:circle|square)$/.test(value) }, initials: { type: String, default: '' },
  fallbackSrc: { type: String, default: '' }, fit: { type: String, default: 'cover', validator: value => /^(?:fill|contain|cover|none|scale-down)$/.test(value) },
  loading: { type: String, default: 'eager', validator: value => /^(?:eager|lazy)$/.test(value) }, decoding: { type: String, default: 'async', validator: value => /^(?:sync|async|auto)$/.test(value) },
  crossorigin: { type: String, default: undefined, validator: value => /^(?:|anonymous|use-credentials)$/.test(value) }, referrerpolicy: { type: String, default: undefined, validator: value => /^(?:|no-referrer|no-referrer-when-downgrade|origin|origin-when-cross-origin|same-origin|strict-origin|strict-origin-when-cross-origin|unsafe-url)$/.test(value) },
  draggable: { type: Boolean, default: false }, ariaLabel: { type: String, default: '' }, decorative: { type: Boolean, default: false },
})
const emit = defineEmits(['load', 'error', 'fallback', 'retry'])
const { t } = useLocale()
const root = ref(null), image = ref(null), phase = ref('idle'), activeSrc = ref(''), usingFallback = ref(false), imageKey = ref(0)

function finiteLength(value, fallback) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback
  const input = String(value ?? '').trim()
  return input && !/^\d+(?:\.\d*)?$/.test(input) ? safeLength(input, fallback) : fallback
}
function safeColor(value) {
  const input = String(value || '').trim()
  if (/^(?:blue|green|orange|purple|gray)$/.test(input)) return { preset: input, custom: '' }
  if (!input || /[;{}<>"'`\\]|url\s*\(|expression\s*\(/i.test(input)) return { preset: 'blue', custom: '' }
  if (/^#[0-9a-f]{3,8}$/i.test(input) || /^var\(--[a-z0-9_-]+\)$/i.test(input) || /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^()]*\)$/i.test(input) || /^[a-z][a-z0-9-]*$/i.test(input)) return { preset: '', custom: input }
  return { preset: 'blue', custom: '' }
}
function firstGraphemes(value, limit) {
  const input = String(value || '').trim(); if (!input) return []
  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
  return segmenter ? Array.from(segmenter.segment(input), item => item.segment).slice(0, limit) : Array.from(input).slice(0, limit)
}

const normalizedSource = computed(() => String(props.src || '').trim()), normalizedFallback = computed(() => String(props.fallbackSrc || '').trim())
const presetSize = computed(() => typeof props.size === 'string' && PRESET_SIZES.includes(props.size) ? props.size : null)
const fit = computed(() => /^(?:fill|contain|cover|none|scale-down)$/.test(props.fit) ? props.fit : 'cover')
const loadingMode = computed(() => /^(?:eager|lazy)$/.test(props.loading) ? props.loading : 'eager')
const decodingMode = computed(() => /^(?:sync|async|auto)$/.test(props.decoding) ? props.decoding : 'async')
const crossoriginMode = computed(() => /^(?:|anonymous|use-credentials)$/.test(props.crossorigin) ? props.crossorigin || undefined : undefined)
const referrerPolicyMode = computed(() => /^(?:|no-referrer|no-referrer-when-downgrade|origin|origin-when-cross-origin|same-origin|strict-origin|strict-origin-when-cross-origin|unsafe-url)$/.test(props.referrerpolicy) ? props.referrerpolicy || undefined : undefined)
const customSize = computed(() => presetSize.value ? '' : finiteLength(props.size, '32px'))
const fontSize = computed(() => { if (presetSize.value) return undefined; const n = typeof props.size === 'number' ? props.size : /^\d+(?:\.\d+)?px$/.test(customSize.value) ? Number.parseFloat(customSize.value) : null; return n === null ? undefined : `${Math.max(10, n * 0.36)}px` })
const color = computed(() => safeColor(props.color))
const computedInitials = computed(() => { const explicit = firstGraphemes(props.initials, 2); if (explicit.length) return explicit.join('').toUpperCase(); const words = String(props.name || '').trim().split(/\s+/).filter(Boolean); const parts = words.length > 1 ? words.slice(0, 2).flatMap(word => firstGraphemes(word, 1)) : firstGraphemes(words[0] || '', 1); return (parts.join('') || '?').toUpperCase() })
const status = computed(() => phase.value), label = computed(() => String(props.ariaLabel || props.alt || props.name || t('avatar.label')).trim() || t('avatar.label'))
const rootStyle = computed(() => { const style = { '--ui-a-fit': fit.value }; if (typeof props.size === 'number' || (typeof props.size === 'string' && !presetSize.value)) { style['--ui-a-s'] = customSize.value; if (fontSize.value) style['--ui-a-f'] = fontSize.value }; if (color.value.custom) style['--ui-a-c'] = color.value.custom; return style })
const rootClasses = computed(() => [presetSize.value ? `size-${presetSize.value}` : 'size-custom', color.value.preset ? `color-${color.value.preset}` : 'color-custom', { square: props.square || props.shape === 'square', 'is-loading': status.value === 'loading', 'is-error': status.value === 'error' }])
const hasImage = computed(() => Boolean(activeSrc.value) && status.value !== 'error')

function resetState() { imageKey.value += 1; usingFallback.value = false; activeSrc.value = normalizedSource.value; phase.value = normalizedSource.value ? 'loading' : 'idle' }
function handleLoad(event) { if (event.currentTarget !== image.value || !activeSrc.value) return; phase.value = 'loaded'; emit('load', event, { src: activeSrc.value, fallback: usingFallback.value, failedSrc: usingFallback.value ? normalizedSource.value : undefined }) }
function handleError(event) { if (event.currentTarget !== image.value || !activeSrc.value) return; const failedSrc = activeSrc.value, fallback = normalizedFallback.value, wasFallback = usingFallback.value; emit('error', event, { src: failedSrc, fallback: wasFallback, failedSrc }); if (!wasFallback && fallback && fallback !== failedSrc) { usingFallback.value = true; activeSrc.value = fallback; phase.value = 'loading'; imageKey.value += 1; emit('fallback', { failedSrc, fallbackSrc: fallback, source: 'error' }); return } phase.value = 'error' }
function retry() { if (!normalizedSource.value) return false; imageKey.value += 1; usingFallback.value = false; activeSrc.value = normalizedSource.value; phase.value = 'loading'; emit('retry', { src: activeSrc.value, fallbackSrc: normalizedFallback.value, usingFallback: false }); return true }
function getElement() { return root.value }
function getImage() { return image.value }
function getState() { return Object.freeze({ initials: computedInitials.value, status: phase.value, label: label.value, usingFallback: usingFallback.value, src: activeSrc.value, loading: phase.value === 'loading' }) }
defineExpose({ getElement, getImage, getState, retry })
watch(() => [normalizedSource.value, normalizedFallback.value], resetState, { immediate: true })
</script>

<template>
  <span ref="root" class="ui-avatar" :class="rootClasses" :style="rootStyle" :role="decorative ? undefined : 'img'" :aria-label="decorative ? undefined : label" :aria-hidden="decorative ? 'true' : undefined" :aria-busy="!decorative && status === 'loading' ? 'true' : undefined">
    <img v-if="hasImage" ref="image" :key="imageKey" class="ui-avatar-image" :src="activeSrc" alt="" :loading="loadingMode" :decoding="decodingMode" :crossorigin="crossoriginMode" :referrerpolicy="referrerPolicyMode" :draggable="props.draggable" @load="handleLoad" @error="handleError">
    <span v-if="status === 'loading'" class="ui-avatar-placeholder" aria-hidden="true"><slot name="placeholder" :initials="computedInitials" :status="status" :label="label" :using-fallback="usingFallback" :retry="retry"><span class="ui-avatar-placeholder-dot"/></slot></span>
    <span v-else-if="!hasImage" class="ui-avatar-fallback" aria-hidden="true"><slot name="fallback" :initials="computedInitials" :status="status" :label="label" :using-fallback="usingFallback" :retry="retry"><slot :initials="computedInitials" :status="status" :label="label" :using-fallback="usingFallback" :retry="retry">{{ computedInitials }}</slot></slot></span>
  </span>
</template>

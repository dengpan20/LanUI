<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config-runtime.js'
import { isClient } from '../env.js'
import { useReducedMotion } from '../motion.js'

defineOptions({ name: 'UiCarousel' })

const props = defineProps({
  modelValue: { type: Number, default: undefined },
  defaultIndex: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
  itemKey: { type: [String, Function], default: 'key' },
  height: { type: [String, Number], default: 280 },
  direction: { type: String, default: 'horizontal' },
  effect: { type: String, default: 'slide' },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: false },
  interval: { type: Number, default: 5000 },
  pauseOnHover: { type: Boolean, default: true },
  pauseOnFocus: { type: Boolean, default: true },
  pauseOnVisibility: { type: Boolean, default: true },
  showPlayControl: { type: Boolean, default: true },
  arrows: { type: String, default: 'hover' },
  indicators: { type: String, default: 'dots' },
  indicatorPosition: { type: String, default: 'inside' },
  keyboard: { type: Boolean, default: true },
  swipe: { type: Boolean, default: true },
  swipeThreshold: { type: Number, default: 48 },
  lazy: { type: Boolean, default: true },
  transitionDuration: { type: Number, default: 360 },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits([
  'update:modelValue', 'change', 'play', 'pause',
  'reach-start', 'reach-end', 'drag-start', 'drag-end',
])

const root = ref(null)
const internalIndex = ref(Math.max(0, Math.trunc(Number(props.defaultIndex) || 0)))
const userPlaying = ref(Boolean(props.autoplay))
const pauseReasons = ref(new Set())
const dragging = ref(false)
const visited = ref(new Set())
const directionContext = useDirection()
const reducedMotion = useReducedMotion()
const { t } = useLocale()
const uid = useId()
let timer = null
let pointer = null

const count = computed(() => props.items.length)
const vertical = computed(() => props.direction === 'vertical')
const fade = computed(() => props.effect === 'fade')
const duration = computed(() => Math.max(0, Number(props.transitionDuration) || 0))
const delay = computed(() => Math.max(100, Number(props.interval) || 5000))
const controlled = computed(() => Number.isFinite(props.modelValue))
const bounded = value => count.value ? Math.min(count.value - 1, Math.max(0, Math.trunc(Number(value) || 0))) : 0
const activeIndex = computed(() => bounded(controlled.value ? props.modelValue : internalIndex.value))
const canPrevious = computed(() => count.value > 1 && (props.loop || activeIndex.value > 0))
const canNext = computed(() => count.value > 1 && (props.loop || activeIndex.value < count.value - 1))
const effectivelyPlaying = computed(() => userPlaying.value && !reducedMotion.value && count.value > 1 && pauseReasons.value.size === 0)
const rootLabel = computed(() => props.ariaLabel || t('carousel.label'))
const rootStyle = computed(() => ({
  '--ui-carousel-height': typeof props.height === 'number' ? `${props.height}px` : String(props.height || '280px'),
  '--ui-carousel-duration': `${duration.value}ms`,
  '--ui-carousel-index': activeIndex.value,
  '--ui-carousel-text-direction': directionContext.value,
}))
const trackStyle = computed(() => {
  if (fade.value) return undefined
  const offset = `calc(var(--ui-carousel-index) * -100%)`
  return { transform: vertical.value ? `translate3d(0, ${offset}, 0)` : `translate3d(${offset}, 0, 0)` }
})
const liveCopy = computed(() => count.value
  ? t('carousel.slideStatus', { index: activeIndex.value + 1, total: count.value, label: itemLabel(props.items[activeIndex.value], activeIndex.value) })
  : t('carousel.empty'))

function itemKey(item, index) {
  if (typeof props.itemKey === 'function') return props.itemKey(item, index)
  const key = item && typeof item === 'object' ? item[props.itemKey] ?? item.key ?? item.value ?? item.id : undefined
  return key ?? index
}

function itemLabel(item, index) {
  if (item && typeof item === 'object') return String(item.ariaLabel ?? item.label ?? item.title ?? item.alt ?? t('carousel.slideName', { index: index + 1 }))
  return String(item ?? t('carousel.slideName', { index: index + 1 }))
}

function itemSource(item) {
  return item && typeof item === 'object' ? item.src : undefined
}

function normalizedTarget(value, wrap = false) {
  if (!count.value) return 0
  const numeric = Math.trunc(Number(value) || 0)
  if (wrap && props.loop) return ((numeric % count.value) + count.value) % count.value
  return bounded(numeric)
}

function visit(index) {
  if (visited.value.has(index)) return
  const next = new Set(visited.value)
  next.add(index)
  visited.value = next
}

function shouldRender(index) { return !props.lazy || visited.value.has(index) || index === activeIndex.value }

function to(index, source = 'programmatic', movement = undefined) {
  const previousIndex = activeIndex.value
  const nextIndex = normalizedTarget(index, source !== 'indicator' && source !== 'keyboard-home' && source !== 'keyboard-end')
  if (nextIndex === previousIndex || count.value < 2) return false
  internalIndex.value = nextIndex
  visit(nextIndex)
  const meta = {
    index: nextIndex,
    previousIndex,
    item: props.items[nextIndex],
    previousItem: props.items[previousIndex],
    source,
    direction: movement || (nextIndex > previousIndex ? 'next' : 'previous'),
  }
  emit('update:modelValue', nextIndex)
  emit('change', meta)
  if (!props.loop && nextIndex === 0) emit('reach-start', meta)
  if (!props.loop && nextIndex === count.value - 1) emit('reach-end', meta)
  replacePauseReason('endpoint', false)
  schedule()
  return meta
}

function previous(source = 'control') { return canPrevious.value ? to(activeIndex.value - 1, source, 'previous') : false }
function next(source = 'control') { return canNext.value ? to(activeIndex.value + 1, source, 'next') : false }

function replacePauseReason(reason, paused) {
  const nextReasons = new Set(pauseReasons.value)
  if (paused) nextReasons.add(reason)
  else nextReasons.delete(reason)
  pauseReasons.value = nextReasons
}

function pause(source = 'manual') {
  if (source === 'manual') userPlaying.value = false
  else replacePauseReason(source, true)
  clearTimer()
  return getState(source)
}

function play(source = 'manual') {
  if (source === 'manual') userPlaying.value = true
  replacePauseReason(source, false)
  schedule()
  return getState(source)
}

function togglePlayback() { return userPlaying.value ? pause('manual') : play('manual') }

function clearTimer() { if (timer) clearTimeout(timer); timer = null }
function schedule() {
  clearTimer()
  if (!isClient || !effectivelyPlaying.value) return
  timer = setTimeout(() => {
    timer = null
    if (!next('autoplay') && !props.loop) pause('endpoint')
  }, delay.value)
}

function getState(source = 'read') {
  return {
    index: activeIndex.value,
    count: count.value,
    playing: effectivelyPlaying.value,
    requestedPlaying: userPlaying.value,
    pausedBy: [...pauseReasons.value],
    source,
  }
}

function onMouseEnter() { if (props.pauseOnHover) pause('hover') }
function onMouseLeave() { if (props.pauseOnHover) play('hover') }
function onFocusIn() { if (props.pauseOnFocus) pause('focus') }
async function onFocusOut() {
  if (!props.pauseOnFocus) return
  await nextTick()
  if (!root.value?.contains(document.activeElement)) play('focus')
}

function onVisibilityChange() {
  if (!props.pauseOnVisibility) return
  if (document.hidden) pause('visibility')
  else play('visibility')
}

function onKeydown(event) {
  if (!props.keyboard || event.currentTarget !== event.target || count.value < 2) return
  const rtl = directionContext.value === 'rtl'
  if (vertical.value && event.key === 'ArrowUp') { event.preventDefault(); previous('keyboard') }
  else if (vertical.value && event.key === 'ArrowDown') { event.preventDefault(); next('keyboard') }
  else if (!vertical.value && event.key === 'ArrowLeft') { event.preventDefault(); (rtl ? next : previous)('keyboard') }
  else if (!vertical.value && event.key === 'ArrowRight') { event.preventDefault(); (rtl ? previous : next)('keyboard') }
  else if (event.key === 'Home') { event.preventDefault(); to(0, 'keyboard-home') }
  else if (event.key === 'End') { event.preventDefault(); to(count.value - 1, 'keyboard-end') }
}

function pointerCoordinate(event) { return vertical.value ? event.clientY : event.clientX }
function onPointerDown(event) {
  if (!props.swipe || count.value < 2 || event.button !== 0) return
  pointer = { id: event.pointerId, start: pointerCoordinate(event), current: pointerCoordinate(event), time: Date.now() }
  dragging.value = true
  pause('drag')
  try { event.currentTarget?.setPointerCapture?.(event.pointerId) } catch { /* synthetic and canceled pointers may not be capturable */ }
  emit('drag-start', { index: activeIndex.value, coordinate: pointer.start })
}

function onPointerMove(event) {
  if (!pointer || pointer.id !== event.pointerId) return
  pointer.current = pointerCoordinate(event)
}

function finishPointer(event, canceled = false) {
  if (!pointer || pointer.id !== event.pointerId) return
  const data = pointer
  pointer = null
  dragging.value = false
  try {
    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  } catch { /* capture may already have been released by the browser */ }
  const delta = data.current - data.start
  const elapsed = Date.now() - data.time
  let changed = false
  let resultIndex = activeIndex.value
  if (!canceled && Math.abs(delta) >= Math.max(12, Number(props.swipeThreshold) || 48) && elapsed < 1400) {
    const forward = vertical.value ? delta < 0 : directionContext.value === 'rtl' ? delta > 0 : delta < 0
    const result = forward ? next('swipe') : previous('swipe')
    changed = Boolean(result)
    if (result) resultIndex = result.index
  }
  play('drag')
  emit('drag-end', { index: resultIndex, delta, elapsed, changed, canceled })
}

watch(activeIndex, index => { visit(index); schedule() }, { immediate: true })
watch(count, () => {
  const nextIndex = bounded(activeIndex.value)
  internalIndex.value = nextIndex
  visited.value = new Set([...visited.value].filter(index => index < count.value).concat(nextIndex))
  schedule()
})
watch(() => props.autoplay, value => { userPlaying.value = Boolean(value); schedule() })
watch([effectivelyPlaying, delay], ([playing], [wasPlaying]) => {
  if (playing) schedule()
  else clearTimer()
  if (playing !== wasPlaying) emit(playing ? 'play' : 'pause', getState(playing ? 'resume' : 'suspend'))
})

onMounted(() => {
  if (props.pauseOnVisibility) document.addEventListener('visibilitychange', onVisibilityChange)
  if (props.pauseOnVisibility && document.hidden) pause('visibility')
  schedule()
})

onBeforeUnmount(() => {
  clearTimer()
  if (isClient) document.removeEventListener('visibilitychange', onVisibilityChange)
})

defineExpose({ root, activeIndex, isPlaying: effectivelyPlaying, previous, next, to, play, pause, getState })
</script>

<template>
  <section
    ref="root"
    class="ui-carousel"
    :class="[`direction-${vertical?'vertical':'horizontal'}`,`effect-${fade?'fade':'slide'}`,`arrows-${arrows}`,`indicators-${indicators}`,`indicator-${indicatorPosition}`,{ 'is-dragging':dragging,'is-playing':effectivelyPlaying,'is-reduced':reducedMotion,'is-empty':!count }]"
    :style="rootStyle"
    :dir="directionContext"
    :data-active-index="activeIndex"
    :data-slide-count="count"
    role="region"
    aria-roledescription="carousel"
    :aria-label="rootLabel"
    :tabindex="keyboard&&count>1?0:undefined"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <div
      v-if="count"
      :id="`ui-carousel-track-${uid}`"
      class="ui-carousel-viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="finishPointer($event)"
      @pointercancel="finishPointer($event,true)"
    >
      <div class="ui-carousel-track" :style="trackStyle" :aria-live="effectivelyPlaying?'off':'polite'">
        <div
          v-for="(item,index) in items"
          :id="`ui-carousel-slide-${uid}-${index}`"
          :key="itemKey(item,index)"
          class="ui-carousel-slide"
          :class="{active:index===activeIndex,visited:visited.has(index)}"
          role="group"
          aria-roledescription="slide"
          :aria-label="t('carousel.slideStatus',{index:index+1,total:count,label:itemLabel(item,index)})"
          :aria-hidden="index===activeIndex?undefined:'true'"
          :inert="index===activeIndex?undefined:''"
        >
          <template v-if="shouldRender(index)">
            <slot name="item" :item="item" :index="index" :active="index===activeIndex" :previous="previous" :next="next" :to="to">
              <img v-if="itemSource(item)" class="ui-carousel-media" :src="itemSource(item)" :alt="item?.alt??itemLabel(item,index)" :loading="index===activeIndex?'eager':'lazy'" draggable="false">
              <div v-else class="ui-carousel-content">{{ item?.content ?? item }}</div>
            </slot>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="ui-carousel-empty"><slot name="empty">{{ t('carousel.empty') }}</slot></div>

    <button v-if="count>1&&arrows!=='never'" type="button" class="ui-carousel-arrow previous" :disabled="!canPrevious" :aria-label="t('carousel.previous')" :aria-controls="`ui-carousel-track-${uid}`" @click="previous('control')"><slot name="previous-icon"><AppIcon name="chevronRight" :size="18"/></slot></button>
    <button v-if="count>1&&arrows!=='never'" type="button" class="ui-carousel-arrow next" :disabled="!canNext" :aria-label="t('carousel.next')" :aria-controls="`ui-carousel-track-${uid}`" @click="next('control')"><slot name="next-icon"><AppIcon name="chevronRight" :size="18"/></slot></button>

    <div v-if="count>1&&indicators!=='none'" class="ui-carousel-indicators" role="group" :aria-label="t('carousel.indicators')">
      <button v-for="(item,index) in items" :key="`indicator-${itemKey(item,index)}`" type="button" class="ui-carousel-indicator" :class="{active:index===activeIndex}" :aria-current="index===activeIndex?'true':undefined" :aria-label="t('carousel.goTo',{index:index+1,total:count,label:itemLabel(item,index)})" :aria-controls="`ui-carousel-slide-${uid}-${index}`" @click="to(index,'indicator')"><slot name="indicator" :item="item" :index="index" :active="index===activeIndex"><span>{{ indicators==='numbers'?index+1:'' }}</span></slot></button>
    </div>

    <button v-if="count>1&&showPlayControl" type="button" class="ui-carousel-play" :aria-label="userPlaying?t('carousel.pause'):t('carousel.play')" :aria-pressed="userPlaying?'true':'false'" @click="togglePlayback"><span aria-hidden="true">{{ userPlaying?'Ⅱ':'▶' }}</span></button>
    <span class="sr-only ui-carousel-live" aria-live="polite" aria-atomic="true">{{ liveCopy }}</span>
  </section>
</template>

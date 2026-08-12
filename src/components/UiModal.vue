<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { closeOverlay, isTopOverlay, openOverlay } from './overlayManager.js'
import { isClient } from '../env.js'
import { useDirection, useLocale } from '../config.js'
import { captureFocusOrigin, focusWithRetry, registerFocusOriginTracking } from './focusUtils.js'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  width: { type: [String, Number], default: 520 },
  closeOnMask: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  destroyOnClose: Boolean,
})
const emit = defineEmits(['update:modelValue','open','close'])
const root = ref(null)
const overlayZ = ref(300)
const uid = useId()
const titleId = `ui-modal-${uid}`
const overlayId = `modal-${uid}`
const direction = useDirection()
const { t } = useLocale()
let returnFocus = null
let stopFocusOriginTracking = () => {}

const focusable = () => [...(root.value?.querySelectorAll('button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])') || [])]
function close() { emit('update:modelValue', false); emit('close') }
function keydown(event) {
  if (!props.modelValue) return
  if (event.key === 'Escape' && props.closeOnEsc && isTopOverlay(overlayId)) { event.preventDefault(); close(); return }
  if (event.key !== 'Tab') return
  const items = focusable()
  if (!items.length) { event.preventDefault(); root.value?.focus(); return }
  const first = items[0], last = items.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
watch(() => props.modelValue, async open => {
  if (!isClient) return
  if (open) {
    returnFocus = captureFocusOrigin()
    overlayZ.value = openOverlay(overlayId)
    document.addEventListener('keydown', keydown)
    await nextTick()
    const target = root.value?.querySelector('[autofocus]') || focusable()[0] || root.value
    target?.focus()
    emit('open')
  } else {
    document.removeEventListener('keydown', keydown)
    closeOverlay(overlayId)
    await nextTick()
    focusWithRetry(returnFocus)
  }
}, { immediate: true })
onMounted(() => { stopFocusOriginTracking = registerFocusOriginTracking() })
onBeforeUnmount(() => { if (!isClient) return; stopFocusOriginTracking(); document.removeEventListener('keydown', keydown); closeOverlay(overlayId) })
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="modelValue || !destroyOnClose" v-show="modelValue" class="overlay ui-modal-overlay" :style="{zIndex:overlayZ}" @mousedown.self="closeOnMask&&isTopOverlay(overlayId)&&close()">
        <section ref="root" class="modal ui-modal" :dir="direction" role="dialog" aria-modal="true" :aria-labelledby="titleId" :style="{width:typeof width==='number'?`${width}px`:width}" tabindex="-1">
          <header class="modal-header"><slot name="header"><h3 :id="titleId">{{ title }}</h3></slot><button class="icon-btn" :aria-label="t('modal.close')" @click="close"><AppIcon name="close"/></button></header>
          <div class="modal-body"><slot/></div>
          <footer v-if="$slots.footer" class="modal-footer"><slot name="footer" :close="close"/></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

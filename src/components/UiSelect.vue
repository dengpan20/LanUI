<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, useAttrs, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useComponentSize, useLocale } from '../config.js'
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: [String, Number], options: { type: Array, default: () => [] }, placeholder: { type: String, default: '' },
  size: { type: String, default: '' }, disabled: Boolean, invalid: Boolean, clearable: Boolean, searchable: Boolean,
  emptyText: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change', 'clear', 'open-change'])
const attrs = useAttrs()
const formItem = inject('uiFormItemContext', null)
const uid = useId()
const root = ref(null)
const searchInput = ref(null)
const open = ref(false)
const dropUp = ref(false)
const activeIndex = ref(-1)
const query = ref('')
const listboxId = `ui-select-list-${uid}`
const normalized = computed(() => props.options.map(option => typeof option === 'object' ? option : { label: option, value: option }))
const filtered = computed(() => normalized.value.filter(option => !query.value || String(option.label).toLowerCase().includes(query.value.toLowerCase())))
const selected = computed(() => normalized.value.find(option => option.value === props.modelValue))
const controlId = computed(() => attrs.id || formItem?.controlId?.value)
const labelledby = computed(() => attrs['aria-labelledby'] || (attrs['aria-label'] ? undefined : formItem?.labelId?.value))
const describedby = computed(() => attrs['aria-describedby'] || formItem?.describedby?.value || undefined)
const resolvedInvalid = computed(() => props.invalid || formItem?.invalid?.value || false)
const resolvedSize=useComponentSize(toRef(props,'size'))
const {t}=useLocale()
const resolvedPlaceholder=computed(()=>props.placeholder||t('select.placeholder'))
const resolvedEmptyText=computed(()=>props.emptyText||t('select.empty'))
const controlAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => !['class','style'].includes(key))))
const optionId = index => `ui-select-option-${uid}-${index}`
const activeDescendant = computed(() => open.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined)

function enabledIndex(start, delta) {
  if (!filtered.value.length) return -1
  let index = start
  for (let count = 0; count < filtered.value.length; count += 1) {
    index = (index + delta + filtered.value.length) % filtered.value.length
    if (!filtered.value[index]?.disabled) return index
  }
  return -1
}
function setOpen(value) {
  if (props.disabled) return
  open.value = value
  emit('open-change', value)
  if (value) {
    const rect = root.value?.getBoundingClientRect()
    dropUp.value = !!rect && innerHeight - rect.bottom < 240 && rect.top > 240
    const selectedIndex = filtered.value.findIndex(option => option.value === props.modelValue && !option.disabled)
    activeIndex.value = selectedIndex >= 0 ? selectedIndex : enabledIndex(-1, 1)
    if (props.searchable) nextTick(() => searchInput.value?.focus())
  } else query.value = ''
}
function toggle() { setOpen(!open.value) }
function select(option) {
  if (!option || option.disabled) return
  emit('update:modelValue', option.value); emit('change', option.value); setOpen(false)
}
function clear(event) { event?.stopPropagation(); emit('update:modelValue', ''); emit('clear'); query.value = '' }
function onKeydown(event) {
  if (props.disabled) return
  if (!open.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); setOpen(true); return }
  if (!open.value) return
  if (event.key === 'Escape' || event.key === 'Tab') { setOpen(false); return }
  if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex.value = enabledIndex(activeIndex.value, 1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex.value = enabledIndex(activeIndex.value, -1) }
  else if (event.key === 'Home') { event.preventDefault(); activeIndex.value = enabledIndex(-1, 1) }
  else if (event.key === 'End') { event.preventDefault(); activeIndex.value = enabledIndex(0, -1) }
  else if (event.key === 'Enter' && filtered.value[activeIndex.value]) { event.preventDefault(); select(filtered.value[activeIndex.value]) }
}
function closeOutside(event) { if (root.value && !root.value.contains(event.target)) setOpen(false) }
watch(filtered, list => { if (activeIndex.value >= list.length || list[activeIndex.value]?.disabled) activeIndex.value = enabledIndex(-1, 1) })
onMounted(() => document.addEventListener('pointerdown', closeOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside))
</script>

<template>
  <div ref="root" class="ui-select" :class="[`size-${resolvedSize}`,attrs.class,{open,'drop-up':dropUp,disabled,invalid:resolvedInvalid,clearable}]" :style="attrs.style" @keydown="onKeydown">
    <button v-bind="controlAttrs" :id="controlId" type="button" class="ui-select-trigger" :disabled="disabled" role="combobox" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="open?listboxId:undefined" :aria-activedescendant="activeDescendant" :aria-labelledby="labelledby" :aria-describedby="describedby" :aria-invalid="resolvedInvalid || undefined" @click="toggle">
      <span class="ui-select-value" :class="{placeholder:!selected}">{{ selected?.label || resolvedPlaceholder }}</span>
      <span class="ui-select-arrow" aria-hidden="true"><AppIcon name="chevronDown" :size="15" /></span>
    </button>
    <button v-if="clearable && selected && !disabled" type="button" class="ui-select-clear" :aria-label="t('select.clear')" :aria-controls="controlId" @click="clear"><AppIcon name="close" :size="12" /></button>
    <Transition name="select-menu">
      <div v-if="open" :id="listboxId" class="ui-select-menu" role="listbox" :aria-labelledby="labelledby">
        <div v-if="searchable" class="ui-select-search"><AppIcon name="search" :size="14"/><input ref="searchInput" v-model="query" :placeholder="t('select.search')" :aria-label="t('select.search')" :aria-controls="listboxId" :aria-activedescendant="activeDescendant" @keydown.stop="onKeydown"/></div>
        <div class="ui-select-options">
          <button v-for="(option,index) in filtered" :id="optionId(index)" :key="option.value" type="button" class="ui-select-option" :class="{selected:option.value===modelValue,active:index===activeIndex}" role="option" :aria-selected="option.value===modelValue" :disabled="option.disabled" @mouseenter="!option.disabled&&(activeIndex=index)" @click="select(option)">
            <span>{{ option.label }}</span><AppIcon v-if="option.value===modelValue" name="check" :size="14" />
          </button>
          <div v-if="!filtered.length" class="ui-select-empty"><AppIcon name="search" :size="18"/><span>{{ resolvedEmptyText }}</span></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

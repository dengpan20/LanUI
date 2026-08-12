<script setup>
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import UiButton from './UiButton.vue'
import { useDirection, useLocale } from '../config.js'

const props = defineProps({
  status: {
    type: String,
    default: '404',
    validator: value => ['403', '404', '500'].includes(value),
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  embedded: Boolean,
})

const emit = defineEmits(['home', 'back', 'retry'])
const { t } = useLocale()
const direction = useDirection()
const titleId = `ui-status-page-title-${useId()}`

const defaultIcon = computed(() => ({
  403: 'lock',
  404: 'file',
  500: 'alert',
}[props.status] || 'info'))
const resolvedTitle = computed(() => props.title || t(`statusPage.${props.status}.title`))
const resolvedDescription = computed(() => props.description || t(`statusPage.${props.status}.description`))
</script>

<template>
  <div
    class="ui-status-page"
    :class="[`status-${status}`, { embedded }]"
    :dir="direction"
  >
    <section
      class="ui-status-page-panel"
      :role="status === '500' ? 'alert' : 'region'"
      :aria-labelledby="titleId"
      :data-status="status"
    >
      <div class="ui-status-page-visual" aria-hidden="true">
        <span class="ui-status-page-orbit orbit-one"></span>
        <span class="ui-status-page-orbit orbit-two"></span>
        <span class="ui-status-page-symbol">
          <slot name="illustration" :status="status" :icon="icon || defaultIcon">
            <AppIcon :name="icon || defaultIcon" :size="38" />
          </slot>
        </span>
        <strong class="ui-status-page-code">{{ status }}</strong>
      </div>

      <div class="ui-status-page-copy">
        <h1 :id="titleId">{{ resolvedTitle }}</h1>
        <slot :status="status" :title="resolvedTitle" :description="resolvedDescription">
          <p>{{ resolvedDescription }}</p>
        </slot>
      </div>

      <div class="ui-status-page-actions">
        <slot
          name="actions"
          :status="status"
          :home="() => emit('home')"
          :back="() => emit('back')"
          :retry="() => emit('retry')"
        >
          <template v-if="status === '500'">
            <UiButton variant="outline" icon="home" @click="emit('home')">
              {{ t('statusPage.home') }}
            </UiButton>
            <UiButton icon="refresh" @click="emit('retry')">
              {{ t('statusPage.retry') }}
            </UiButton>
          </template>
          <template v-else>
            <UiButton variant="outline" @click="emit('back')">
              {{ t('statusPage.back') }}
            </UiButton>
            <UiButton icon="home" @click="emit('home')">
              {{ t('statusPage.home') }}
            </UiButton>
          </template>
        </slot>
      </div>

      <div v-if="$slots.extra" class="ui-status-page-extra">
        <slot name="extra"></slot>
      </div>
    </section>
  </div>
</template>

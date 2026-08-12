<script setup>
defineProps({ title: String, titleTag: { type: String, default: 'h3' }, mark: { type: Boolean, default: true }, bodyClass: String })
</script>

<template>
  <section class="card">
    <header v-if="title || $slots.header || $slots.action" class="card-header">
      <slot name="header">
        <component :is="titleTag" class="card-title"><span v-if="mark" class="card-title-mark" />{{ title }}</component>
      </slot>
      <slot name="action" />
    </header>
    <div class="card-body" :class="bodyClass"><slot /></div>
  </section>
</template>

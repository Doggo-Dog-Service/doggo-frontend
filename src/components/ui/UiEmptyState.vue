<script setup>
import UiIcon from './UiIcon.vue'

defineProps({
  icon: { type: [Object, Function, String], default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-10 text-center">
    <span
      v-if="icon"
      class="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"
    >
      <UiIcon :icon="icon" :size="28" />
    </span>
    <p class="text-subtitle text-fg">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-body text-fg-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2"><slot name="action" /></div>
  </div>
</template>

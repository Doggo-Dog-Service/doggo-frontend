<script setup>
import UiIcon from '@/components/ui/UiIcon.vue'

const props = defineProps({
  // Componente Lucide.
  icon: {
    type: [Object, Function],
    default: null,
  },
  info: {
    type: [String, Number],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    class="flex w-full flex-col items-center justify-center gap-0.5 rounded-card border border-line bg-surface p-3 text-center shadow-card"
  >
    <div class="flex items-center justify-center gap-2 text-title text-primary">
      <UiIcon v-if="props.icon" :icon="props.icon" :size="20" />
      <p>{{ props.info }}</p>
    </div>
    <p class="text-caption text-fg-muted">{{ props.description }}</p>
  </div>
</template>

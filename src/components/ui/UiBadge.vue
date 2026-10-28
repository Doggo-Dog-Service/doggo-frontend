<script setup>
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'

const props = defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'brand', 'success', 'warning', 'danger', 'info'].includes(v),
  },
  icon: { type: [Object, Function], default: null },
})

const TONES = {
  neutral: 'bg-surface-muted text-fg-muted',
  brand: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}
const toneClass = computed(() => TONES[props.tone])
</script>

<template>
  <span
    :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold', toneClass]"
  >
    <UiIcon v-if="icon" :icon="icon" :size="14" />
    <slot />
  </span>
</template>

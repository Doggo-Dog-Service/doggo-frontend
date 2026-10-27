<script setup>
import { computed } from 'vue'

const emits = defineEmits(['click'])
const props = defineProps({
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  interactive: { type: Boolean, default: false },
})

const PADDING = { sm: 'p-3', md: 'p-4', lg: 'p-6' }
const paddingClass = computed(() => PADDING[props.padding])

function onKeydown(event) {
  if (!props.interactive) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emits('click', event)
  }
}
</script>

<template>
  <div
    :class="[
      'bg-surface border border-line rounded-card shadow-card',
      paddingClass,
      interactive &&
        'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
    ]"
    :tabindex="interactive ? 0 : undefined"
    :role="interactive ? 'button' : undefined"
    @click="interactive && emits('click', $event)"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

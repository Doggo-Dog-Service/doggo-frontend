<script setup>
import { ref } from 'vue'
import UiIcon from './UiIcon.vue'

const model = defineModel()
const props = defineProps({
  options: { type: Array, required: true },
  label: { type: String, default: '' },
})

const buttons = ref([])

function move(index, step) {
  const next = (index + step + props.options.length) % props.options.length
  model.value = props.options[next].value
  buttons.value[next]?.focus()
}

function onKeydown(event, index) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    move(index, 1)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(index, -1)
  }
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label || undefined"
    class="inline-flex w-full gap-1 rounded-control bg-surface-muted p-1"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(el) => (buttons[index] = el)"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      :class="[
        'flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control px-3 text-body font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary',
        model === option.value ? 'bg-surface text-primary shadow-card' : 'text-fg-muted hover:text-fg',
      ]"
      @click="model = option.value"
      @keydown="onKeydown($event, index)"
    >
      <UiIcon v-if="option.icon" :icon="option.icon" :size="18" />
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['select'])
const props = defineProps({
  time: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    type="button"
    :class="[
      'min-h-11 min-w-20 rounded-control border px-4 py-2 text-body font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      props.disabled && 'cursor-not-allowed border-line bg-surface-muted text-fg-subtle',
      !props.disabled && props.selected && 'cursor-pointer border-primary bg-primary text-primary-fg',
      !props.disabled &&
        !props.selected &&
        'cursor-pointer border-line bg-surface text-fg hover:bg-surface-muted active:scale-98',
    ]"
    :disabled="props.disabled"
    :aria-pressed="props.selected"
    @click="emit('select')"
  >
    {{ props.time }}
  </button>
</template>

<script setup>
const emits = defineEmits(['select'])
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  subText: {
    type: String,
    required: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :class="[
      'w-full min-h-11 px-3 py-2 text-center border rounded-control cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      props.selected
        ? 'bg-primary text-primary-fg border-primary'
        : 'bg-surface text-fg border-line hover:bg-surface-muted',
    ]"
    :aria-pressed="props.selected"
    @click="emits('select')"
    type="button"
  >
    <p class="text-body font-semibold">{{ props.text }}</p>
    <p v-if="props.subText" :class="['text-caption', props.selected ? 'opacity-80' : 'text-fg-muted']">
      {{ props.subText }}
    </p>
  </button>
</template>

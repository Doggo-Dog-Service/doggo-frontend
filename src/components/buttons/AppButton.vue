<script setup>
const emits = defineEmits(['event'])
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default'].includes(value),
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
      'text-center px-4 py-2 rounded-full border-2 transition-all duration-200 active:bg-doggo-green active:text-white cursor-pointer',
      props.mode === 'default'
        ? props.selected
          ? 'bg-doggo-green text-white border-doggo-green'
          : 'border-doggo-gray bg-white text-zinc-400'
        : '',
    ]"
    @click="emits('event')"
  >
    {{ props.text }}
  </button>
</template>

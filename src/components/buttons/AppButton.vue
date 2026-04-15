<script setup>
const emits = defineEmits(['event'])
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  text: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline'].includes(value),
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
    :disabled="props.disabled"
    :type="props.type"
    :class="[
      'text-center px-4 py-3 rounded-full border-2 transition-all duration-200 cursor-pointer w-full',
      props.mode === 'default' && 'border-doggo-gray bg-white text-zinc-400 active:bg-doggo-green active:text-white ',
      props.mode === 'outline' && 'border-doggo-green bg-doggo-green text-white active:scale-98 active:opacity-80',
      props.disabled && 'opacity-70'
    ]"
    @click="emits('event')"
  >
    {{ props.text }}
  </button>
</template>

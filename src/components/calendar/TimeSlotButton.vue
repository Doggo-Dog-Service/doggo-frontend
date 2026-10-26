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
    :class="[
      'px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer text-sm font-semibold min-w-20',
      props.disabled && 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed',
      !props.disabled && props.selected && 'bg-doggo-green border-doggo-green text-white shadow-sm',
      !props.disabled && !props.selected && 'bg-white border-doggo-gray text-doggo-black hover:border-doggo-green hover:text-doggo-green active:scale-98',
    ]"
    :disabled="props.disabled"
    @click="emit('select')"
  >
    {{ props.time }}
  </button>
</template>

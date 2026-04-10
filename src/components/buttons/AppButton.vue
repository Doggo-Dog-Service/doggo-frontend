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
    validator: (value) => ['default', 'outline'].includes(value),
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button :disabled="props.disabled"
    :class="[
      'text-center px-4 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer w-full',
      props.mode === 'default'
        ? props.selected
          ? 'bg-doggo-green text-white border-doggo-green '
          : 'border-doggo-gray bg-white text-zinc-400 active:bg-doggo-green active:text-white '
        : '',
      props.mode === 'outline'
        ? props.selected
          ? 'bg-white border-doggo-green text-doggo-green'
          : 'border-doggo-green bg-doggo-green text-white active:scale-98 active:opacity-80'
        : ''
    ]"
    @click.stop.prevent="emits('event')"
  >
    {{ props.text }}
  </button>
</template>

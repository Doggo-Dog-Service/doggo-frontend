<script setup>
const emits = defineEmits(['event'])
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'red'].includes(value),
  },
  tooltip: {
    type: String,
    required: false
  }
})
</script>

<template>
  <button
    :class="[
      'rounded-full h-15 w-15 transition-all duration-200 cursor-pointer hover:scale-98 hover:opacity-60 active:scale-98 active:opacity-60',
      props.mode == 'default' && 'bg-doggo-green text-white',
      props.mode == 'red' && 'bg-red-400 text-white'
    ]"
    :type="props.type"
    :title="props.tooltip"
    @click="emits('event')"
  >
    <span :class="props.icon" class="text-3xl"></span>
  </button>
</template>

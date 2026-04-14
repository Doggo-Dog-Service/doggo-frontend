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
  tooltip: {
    type: String,
    required: false
  }
})
</script>

<template>
  <button
    class="bg-doggo-green text-white hover:bg-white rounded-full h-15 w-15 transition-all duration-300 cursor-pointer hover:text-doggo-green active:bg-white active:text-doggo-green"
    :type="props.type"
    :title="props.tooltip"
    @click="emits('event')"
  >
    <span :class="props.icon" class="text-3xl"></span>
  </button>
</template>

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
      'w-full text-center p-2 border rounded-2xl cursor-pointer transition-all duration-300',
      props.selected ? 'bg-doggo-green border-doggo-green' : 'bg-white border-doggo-gray',
    ]"
    @click="emits('select')"
  >
    <p :class="['font-semibold text-doggo-black', props.selected && 'text-white']">
      {{ props.text }}
    </p>
    <p :class="props.selected ? 'text-white/70' : 'text-doggo-black/70'">{{ props.subText }}</p>
  </button>
</template>

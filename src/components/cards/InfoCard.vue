<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  info: {
    type: [String, Number],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-full p-2 bg-white border border-doggo-gray rounded-2xl active:scale-98 transition-all duration-200 ease-in-out"
  >
    <div class="flex justify-center gap-2 text-2xl text-doggo-green font-bold">
      <span v-if="props.icon" :class="props.icon"></span>
      <p>{{ props.info }}</p>
    </div>
    <p class="text-doggo-black/50">{{ props.description }}</p>
  </div>
</template>

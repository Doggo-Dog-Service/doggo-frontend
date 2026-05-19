<script setup>
const emits = defineEmits(['logout'])
const props = defineProps({
  icon: {
    type: [Object, Function],
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <button class="flex text-red-400 items-center w-full gap-4 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-red-400/20" @click="emits('logout')">
    <component v-if="props.icon" :is="props.icon" class="w-5 h-5 stroke-2"/>
    <p class="text-base font-semibold">{{ props.text }}</p>
  </button>
</template>

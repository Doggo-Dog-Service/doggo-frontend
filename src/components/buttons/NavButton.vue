<script setup>
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
  <RouterLink class="flex gap-2 items-center w-full rounded-lg px-4 py-2">
    <component v-if="props.icon" :is="props.icon" class="w-6 h-6"/>
    <p class="text-lg">{{ props.text }}</p>
  </RouterLink>
</template>

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
  <button
    class="flex min-h-11 w-full items-center gap-4 rounded-control px-4 py-2 text-danger transition-colors duration-200 cursor-pointer hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-primary"
    @click="emits('logout')"
  >
    <component v-if="props.icon" :is="props.icon" class="w-5 h-5 stroke-2" aria-hidden="true" />
    <p class="text-body font-semibold">{{ props.text }}</p>
  </button>
</template>

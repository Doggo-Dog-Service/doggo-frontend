<script setup>
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <RouterLink
    :class="[
      'flex flex-col items-center w-fit rounded-2xl px-4 py-2 transition-colors duration-200 md:flex-row md:gap-4 md:w-full md:rounded-lg hover:bg-doggo-green/20 hover:text-doggo-green relative',
      props.active ? 'bg-doggo-green/20 text-doggo-green' : 'text-gray-400',
    ]"
    :to="props.to"
  >
    <div v-if="active" class="absolute w-1 h-6 rounded-r-sm bg-doggo-green left-0 hidden md:block"></div>
    <component v-if="props.icon" :is="props.icon" class="w-6 h-6 stroke-2" />
    <p class="text-base font-semibold md:text-lg">{{ props.text }}</p>
  </RouterLink>
</template>

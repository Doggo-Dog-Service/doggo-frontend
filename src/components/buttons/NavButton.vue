<script setup>
import { computed } from 'vue';
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['mdi', 'hero'].includes(value)
  },
  icon: {
    type: [Object, Function, String],
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

const isHero = computed(() => props.type == 'hero')
const isMdi = computed(() => props.type == 'mdi')
</script>

<template>
  <RouterLink
    :class="[
      'flex flex-col items-center rounded-2xl px-4 min-h-12 justify-center transition-colors duration-200 md:flex-row md:gap-4 md:rounded-lg md:justify-start hover:bg-doggo-green/20 hover:text-doggo-green relative',
      props.active ? 'bg-doggo-green/20 text-doggo-green' : 'text-gray-400',
    ]"
    :to="props.to"
  >
    <div v-if="active" class="absolute w-1 h-6 rounded-r-sm bg-doggo-green left-0 hidden md:block"></div>
    <component v-if="props.icon && isHero" :is="props.icon" class="w-5 h-5 stroke-2" />
    <span v-if="props.icon && isMdi" :class="[props.icon, 'text-xl']"></span>
    <p class="hidden md:block text-base font-semibold">{{ props.text }}</p>
  </RouterLink>
</template>

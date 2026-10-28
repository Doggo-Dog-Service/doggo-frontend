<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  price: {
    type: [String, Number],
    required: true,
  },
  to: {
    type: [String, Object],
    required: true,
  },
})
</script>
<template>
  <RouterLink
    :to="props.to"
    class="flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-subtitle text-primary-fg text-center shadow-card transition-all duration-200 cursor-pointer active:scale-98 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
  >
    Agendar com {{ props.text.split(' ')[0] }} · R${{ props.price }}/h
  </RouterLink>
</template>

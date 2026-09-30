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
    class="block w-full bg-doggo-green text-white py-4 rounded-2xl font-semibold text-center shadow-md transition-all duration-200 cursor-pointer active:scale-98 active:opacity-70 hover:scale-99"
  >
    Agendar com {{ props.text.split(' ')[0] }} · R${{ props.price }}/h
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  }
})
</script>
<template>
  <div class="">
    <button class="w-full bg-doggo-green text-white py-4 rounded-2xl font-semibold shadow-md">
      Agendar com {{ props.text.split(' ')[0] }} · R${{ props.price }}/h
    </button>
  </div>
</template>

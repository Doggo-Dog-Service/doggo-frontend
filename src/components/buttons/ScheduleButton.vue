<script setup>
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
    <button class="">
      Agendar com {{ props.text }} · R${{ props.price }}/h
    </button>
  </div>
</template>

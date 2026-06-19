<script setup>
const props = defineProps({
  description: {
    type: String,
    required: false
  }
});
</script>
<template>
  <div class="mx-2">
    <h1 class="text-xl">
      Sobre
    </h1>
    <div class="mt-4 border border-doggo-gray bg-white px-6 py-6 rounded-2xl">
      <p v-if="!props.description">
      Esse usuário não tem uma descrição ainda.
      </p>
      <p v-else class="wrap-break-word whitespace-pre-wrap">
        {{ props.description }}
      </p>
    </div>
  </div>
</template>

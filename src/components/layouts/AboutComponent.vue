<script setup>
const props = defineProps({
  description: {
    type: String,
    required: true
  }
});
</script>
<template>
  <div class="mx-2 my-8">
    <h1 class="text-xl font-bold  ">
      Sobre
    </h1>
    <div class="mt-4 text-sm border border-doggo-gray px-6 py-6 h-40 max-h-40 rounded-2xl">
      <p v-if="!props.description" class="wrap-break-word">
      Esse usuário não tem uma descrição ainda.
      </p>
      <p v-else class="wrap-break-word">
        {{ props.description }}
      </p>
      <img src="./public" alt="">
    </div>
  </div>
</template>

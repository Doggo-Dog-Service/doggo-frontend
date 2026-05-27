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
    <h1 class="text-xl">
      Sobre
    </h1>
    <div class="mt-4 border border-doggo-gray px-6 py-6 rounded-2xl">
      <p v-if="props.description == null">
      Esse usuário não tem uma descrição ainda.
      </p>
      <p v-else>
        {{ props.description }}
      </p>
    </div>
  </div>

</template>

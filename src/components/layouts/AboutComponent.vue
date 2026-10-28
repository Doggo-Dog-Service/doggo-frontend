<script setup>
const props = defineProps({
  description: {
    type: String,
    required: false,
  },
})
</script>
<template>
  <section>
    <h2 class="text-title text-fg">Sobre</h2>
    <div class="mt-3 rounded-card border border-line bg-surface p-5 shadow-card">
      <p v-if="!props.description" class="text-body text-fg-muted">
        Esse usuário não tem uma descrição ainda.
      </p>
      <p v-else class="text-body text-fg wrap-break-word whitespace-pre-wrap">
        {{ props.description }}
      </p>
    </div>
  </section>
</template>

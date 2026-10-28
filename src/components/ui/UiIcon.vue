<script setup>
// Renderiza um componente de ícone Lucide.
defineProps({
  icon: { type: [Object, Function], default: null },
  size: { type: Number, default: 20 },
})
</script>

<template>
  <component :is="icon" v-if="icon" :size="size" :stroke-width="2" aria-hidden="true" />
</template>

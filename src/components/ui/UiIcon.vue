<script setup>
// Aceita componente Lucide ou, até a migração das telas (Tasks 7-9), classe MDI legada (string).
defineProps({
  icon: { type: [Object, Function, String], default: null },
  size: { type: Number, default: 20 },
})
</script>

<template>
  <span v-if="typeof icon === 'string'" :class="icon" aria-hidden="true"></span>
  <component :is="icon" v-else-if="icon" :size="size" :stroke-width="2" aria-hidden="true" />
</template>

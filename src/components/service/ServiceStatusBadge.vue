<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: Number,
    required: true,
  },
})

const STATUS_LABELS = {
  1: 'Em análise',
  2: 'Confirmado',
  3: 'Em andamento',
  4: 'Concluído',
  5: 'Cancelado',
  6: 'Recusado',
}

const STATUS_CLASSES = {
  1: 'bg-doggo-yellow/30 text-doggo-yellow-text',
  2: 'bg-doggo-light-green text-doggo-green',
  3: 'bg-doggo-light-green text-doggo-green',
  4: 'bg-doggo-green text-white',
  5: 'bg-red-100 text-red-700',
  6: 'bg-red-100 text-red-700',
}

const label = computed(() => STATUS_LABELS[props.status] ?? 'Desconhecido')
const classes = computed(() => STATUS_CLASSES[props.status] ?? 'bg-doggo-gray text-doggo-black/60')
</script>

<template>
  <span
    :class="['inline-flex items-center gap-1 text-sm font-semibold rounded-full px-3 py-1', classes]"
  >
    <span class="mdi mdi-circle text-[10px]"></span>
    {{ label }}
  </span>
</template>
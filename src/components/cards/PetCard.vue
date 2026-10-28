<script setup>
import { computed } from 'vue'
import { Dog, PawPrint } from 'lucide-vue-next'

const emits = defineEmits(['click'])

const SIZE_LABELS = { p: 'Pequeno', m: 'Médio', g: 'Grande' }

const props = defineProps({
  pet_picture: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: '',
  },
  weight: {
    type: [String, Number],
    default: null,
  },
})

const details = computed(() => {
  const parts = []
  if (SIZE_LABELS[props.size]) parts.push(SIZE_LABELS[props.size])
  const weight = Number(props.weight)
  if (props.weight != null && props.weight !== '' && weight > 0) {
    parts.push(`${weight.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`)
  }
  return parts.join(' · ')
})
</script>

<template>
  <button
    type="button"
    class="flex w-full cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-surface text-left shadow-card transition-colors duration-200 hover:bg-surface-muted active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    @click="emits('click')"
  >
    <img
      v-if="props.pet_picture"
      :src="props.pet_picture"
      :alt="`Foto de ${props.name}`"
      class="aspect-square w-full object-cover"
    />
    <div v-else class="flex aspect-square items-center justify-center bg-primary-soft text-primary">
      <Dog :size="48" :stroke-width="2" aria-hidden="true" />
    </div>
    <div class="flex flex-col gap-1 p-3 md:p-4">
      <p class="text-subtitle text-fg wrap-break-word">{{ props.name }}</p>
      <p class="flex items-center gap-1.5 text-caption text-fg-muted">
        <PawPrint :size="14" :stroke-width="2" aria-hidden="true" />
        {{ props.breed }}
      </p>
      <p v-if="details" class="text-caption text-fg-muted">{{ details }}</p>
    </div>
  </button>
</template>

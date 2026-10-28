<script setup>
import { Dog, PawPrint } from 'lucide-vue-next'

const emits = defineEmits(['click'])

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
      class="aspect-[4/3] w-full object-cover"
    />
    <div v-else class="flex aspect-[4/3] items-center justify-center bg-primary-soft text-primary">
      <Dog :size="40" :stroke-width="2" aria-hidden="true" />
    </div>
    <div class="flex flex-col gap-1 p-3 md:p-4">
      <p class="text-subtitle text-fg">{{ props.name }}</p>
      <p class="flex items-center gap-1.5 text-caption text-fg-muted">
        <PawPrint :size="14" :stroke-width="2" aria-hidden="true" />
        {{ props.breed }}
      </p>
    </div>
  </button>
</template>

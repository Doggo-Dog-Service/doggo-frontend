<script setup>
import { CheckCircle2, Dog, PawPrint } from 'lucide-vue-next'

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
  selected: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :class="[
      'relative flex w-full cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left shadow-card transition-colors duration-200 active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      props.selected ? 'border-primary ring-2 ring-primary' : 'border-line hover:bg-surface-muted',
    ]"
    type="button"
    :aria-pressed="props.selected"
    @click="emits('click')"
  >
    <div class="relative">
      <img
        v-if="props.pet_picture"
        :src="props.pet_picture"
        :alt="`Foto de ${props.name}`"
        class="aspect-[4/3] w-full object-cover"
      />
      <div v-else class="flex aspect-[4/3] items-center justify-center bg-primary-soft text-primary">
        <Dog :size="40" :stroke-width="2" aria-hidden="true" />
      </div>
      <span
        v-if="props.selected"
        class="pointer-events-none absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-fg"
      >
        <CheckCircle2 :size="20" :stroke-width="2" aria-hidden="true" />
      </span>
    </div>
    <div class="flex flex-col gap-1 p-3 md:p-4">
      <p class="text-subtitle text-fg">{{ props.name }}</p>
      <p class="flex items-center gap-1.5 text-caption text-fg-muted">
        <PawPrint :size="14" :stroke-width="2" aria-hidden="true" />
        {{ props.breed }}
        <span v-if="props.selected" class="sr-only">(selecionado)</span>
      </p>
    </div>
  </button>
</template>

<script setup>
import { Dog, SquarePen, Trash2 } from 'lucide-vue-next'
import InfoCard from '@/components/cards/InfoCard.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { petSizeConverter } from '@/utils/petSize.js'

const emits = defineEmits(['edit', 'delete'])

const props = defineProps({
  pet: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col items-center gap-4">
      <img
        v-if="props.pet.pet_picture?.url"
        :src="props.pet.pet_picture?.url"
        :alt="`Foto de ${props.pet.name}`"
        class="size-48 rounded-card object-cover"
      />
      <div
        v-else
        class="flex size-48 items-center justify-center rounded-card bg-primary-soft text-primary"
      >
        <Dog :size="48" :stroke-width="2" aria-hidden="true" />
      </div>
      <h3 class="text-center text-title text-fg">{{ props.pet.name }}</h3>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <InfoCard
        v-if="props.pet.size"
        description="Porte"
        :info="petSizeConverter(props.pet.size)"
      />
      <InfoCard
        v-if="props.pet.weight"
        description="Peso"
        :info="`${Number(props.pet.weight)} kg`"
      />
      <InfoCard
        v-if="props.pet.breed"
        description="Raça"
        :info="props.pet.breed"
        class="col-span-2"
      />
      <div
        v-if="props.pet.notes"
        class="col-span-2 flex flex-col gap-1 rounded-card border border-line bg-surface p-4"
      >
        <h4 class="text-caption font-semibold text-fg-muted">Anotações</h4>
        <p class="text-body text-fg">{{ props.pet.notes }}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <AppButton text="Editar" variant="primary" :icon="SquarePen" @event="emits('edit')" />
      <AppButton text="Deletar" variant="danger" :icon="Trash2" @event="emits('delete')" />
    </div>
  </div>
</template>

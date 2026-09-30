<script setup>
import { computed } from 'vue'

import ChoseButton from '@/components/buttons/ChoseButton.vue'
import { petSizeConverter } from '@/utils/petSize'

const props = defineProps({
  pets: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const selectedPets = defineModel({ type: Array, default: () => [] })

const options = computed(() =>
  props.pets.map((pet) => ({
    ...pet,
    subText: [pet.breed, petSizeConverter(pet.size)].filter(Boolean).join(' · '),
  })),
)

function toggle(petId) {
  selectedPets.value = selectedPets.value.includes(petId)
    ? selectedPets.value.filter((id) => id !== petId)
    : [...selectedPets.value, petId]
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-bold">Para quem é o serviço?</h2>

    <div v-if="props.loading" class="flex justify-center py-6">
      <div class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"></div>
    </div>

    <p v-else-if="props.error" class="text-red-700 text-sm font-semibold">
      {{ props.error }}
    </p>

    <div v-else-if="options.length === 0" class="flex flex-col gap-2">
      <p class="text-doggo-black/50 text-sm">
        Você ainda não possui pets cadastrados. Cadastre um pet para fazer o agendamento.
      </p>
      <RouterLink
        to="/pets/"
        class="text-doggo-green font-semibold text-sm flex items-center gap-1 self-start"
      >
        <span class="mdi mdi-paw"></span>
        Cadastrar pet
      </RouterLink>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
        <ChoseButton
          v-for="pet in options"
          :key="pet.id"
          :text="pet.name"
          :sub-text="pet.subText"
          :selected="selectedPets.includes(pet.id)"
          @select="toggle(pet.id)"
        />
      </div>

      <p v-if="selectedPets.length === 0" class="text-doggo-black/50 text-sm">
        Selecione ao menos um pet para continuar.
      </p>
    </template>
  </section>
</template>

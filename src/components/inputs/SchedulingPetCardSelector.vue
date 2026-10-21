<script setup>
import SelectablePetCard from '@/components/cards/SelectablePetCard.vue'

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

    <div v-else-if="props.pets.length === 0" class="flex flex-col gap-2">
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
      <div class="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SelectablePetCard
          v-for="pet in props.pets"
          :key="pet.id"
          :name="pet.name"
          :breed="pet.breed"
          :pet_picture="pet.pet_picture"
          :selected="selectedPets.includes(pet.id)"
          @click="toggle(pet.id)"
        />
      </div>

      <p v-if="selectedPets.length === 0" class="text-doggo-black/50 text-sm">
        Selecione ao menos um pet para continuar.
      </p>
    </template>
  </section>
</template>

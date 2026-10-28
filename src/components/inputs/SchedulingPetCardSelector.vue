<script setup>
import { PawPrint } from 'lucide-vue-next'
import SelectablePetCard from '@/components/cards/SelectablePetCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

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
    <h2 class="text-subtitle text-fg">Para quem é o serviço?</h2>

    <div v-if="props.loading" role="status" aria-label="Carregando" class="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <div v-for="n in 2" :key="n" class="h-48 animate-pulse rounded-card bg-surface-muted"></div>
    </div>

    <p v-else-if="props.error" role="alert" class="text-caption font-semibold text-danger">
      {{ props.error }}
    </p>

    <UiEmptyState
      v-else-if="props.pets.length === 0"
      :icon="PawPrint"
      title="Nenhum pet cadastrado"
      description="Você ainda não possui pets cadastrados. Cadastre um pet para fazer o agendamento."
    >
      <template #action>
        <RouterLink
          to="/pets/"
          class="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-body font-semibold text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PawPrint :size="20" :stroke-width="2" aria-hidden="true" />
          Cadastrar pet
        </RouterLink>
      </template>
    </UiEmptyState>

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

      <p v-if="selectedPets.length === 0" class="text-caption text-fg-muted">
        Selecione ao menos um pet para continuar.
      </p>
    </template>
  </section>
</template>

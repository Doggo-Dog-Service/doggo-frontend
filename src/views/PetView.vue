<script setup>
import { PawPrint, Plus } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import PetCard from '@/components/cards/PetCard.vue'
import PetModal from '@/components/pet/PetModal.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { onMounted, ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()

const modalOpen = ref(false)
const modalMode = ref('view')
const modalPetId = ref(0)

const openModal = () => (modalOpen.value = true)
const closeModal = () => {
  const ownerId = authStore.user.client_profile.id
  petStore.getPets({
    owner: ownerId,
  })
  modalOpen.value = false
}

function changeModalMode(mode) {
  if (!['view', 'add', 'edit', 'delete'].includes(mode)) return
  modalMode.value = mode
}

async function petDetail(petId) {
  modalPetId.value = petId
  changeModalMode('view')
  openModal()
}

function openAddPet() {
  changeModalMode('add')
  openModal()
}

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.isClient) {
    const ownerId = authStore.user.client_profile.id
    await petStore.getPets({
      owner: ownerId,
    })
  } else {
    router.push('/')
  }
})
</script>

<template>
  <div class="relative flex flex-col gap-4 p-4 md:p-6">
    <PetModal
      v-if="modalOpen"
      :mode="modalMode"
      :petId="modalPetId"
      @close="closeModal"
      @change-mode="changeModalMode"
    />
    <h1 class="flex items-center gap-2 text-display text-fg">
      Meus Pets <PawPrint :size="28" :stroke-width="2" class="text-primary" aria-hidden="true" />
    </h1>
    <ul
      v-if="petStore.pets.length > 0"
      class="grid w-full grid-cols-2 gap-4 pb-40 md:pb-20 lg:grid-cols-3 xl:grid-cols-5"
    >
      <li v-for="pet in petStore.pets" :key="pet.id">
        <PetCard
          :name="pet.name"
          :breed="pet.breed"
          @click="petDetail(pet.id)"
          :pet_picture="pet.pet_picture"
        />
      </li>
    </ul>
    <UiEmptyState
      v-else
      :icon="PawPrint"
      title="Você ainda não possui nenhum pet cadastrado"
      description="Cadastre seu pet para agendar passeios e outros serviços."
    />
    <div
      class="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 md:inset-x-auto md:right-6 md:bottom-6 md:w-56"
    >
      <AppButton text="Adicionar pet" variant="primary" :icon="Plus" @event="openAddPet" />
    </div>
  </div>
</template>

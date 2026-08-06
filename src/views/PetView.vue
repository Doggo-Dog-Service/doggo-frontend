<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import PetCard from '@/components/cards/PetCard.vue'
import PetModal from '@/components/modals/PetModal.vue'
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
  if (!['view', 'add', 'edit'].includes(mode)) return
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
  <div class="relative h-screen flex flex-col gap-4 p-6">
    <PetModal
      v-if="modalOpen"
      :mode="modalMode"
      :pet_id="modalPetId"
      @close="closeModal"
      @change-mode="changeModalMode"
    />
    <h1 class="w-full font-semibold text-2xl">
      Meus Pets <span class="mdi mdi-paw text-doggo-green"></span>
    </h1>
    <ul class="w-full grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <li v-for="pet in petStore.pets" :key="pet.id">
        <PetCard
          :name="pet.name"
          :breed="pet.breed"
          @click="petDetail(pet.id)"
          :pet_picture="pet.pet_picture"
        />
      </li>
    </ul>
    <div class="fixed w-full bottom-22 right-0 px-4 md:w-50 md:bottom-6">
      <AppButton text="+ Adicionar pet" mode="outline" @event="openAddPet"/>
    </div>
  </div>
</template>

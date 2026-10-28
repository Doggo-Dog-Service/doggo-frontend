<script setup>
import { AlertTriangle, PawPrint, Plus } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import PetCard from '@/components/cards/PetCard.vue'
import PetModal from '@/components/pet/PetModal.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()

const loaded = ref(false)
const loadFailed = ref(false)
const modalOpen = ref(false)
const modalMode = ref('view')
const modalPetId = ref(0)

const showSkeleton = computed(
  () => !loaded.value || (petStore.loading && petStore.pets.length === 0),
)
const showError = computed(() => !showSkeleton.value && (loadFailed.value || !!petStore.error))

const openModal = () => (modalOpen.value = true)

function loadPets() {
  return petStore.getPets({ owner: authStore.user.client_profile.id })
}

const closeModal = () => {
  loadPets()
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

async function init() {
  loadFailed.value = false
  try {
    await authStore.fetchUser()
    if (authStore.isClient) {
      await loadPets()
      loaded.value = true
    } else {
      router.push('/')
    }
  } catch {
    loadFailed.value = true
    loaded.value = true
  }
}

const retry = () => (loadFailed.value ? init() : loadPets())

onMounted(init)
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
      v-if="showSkeleton"
      aria-busy="true"
      aria-label="Carregando pets"
      class="grid w-full grid-cols-2 gap-4 pb-40 md:pb-20 lg:grid-cols-3 xl:grid-cols-4"
    >
      <li v-for="n in 4" :key="n" class="flex flex-col gap-3">
        <div class="aspect-square w-full animate-pulse rounded-card bg-surface-muted"></div>
        <UiSkeleton :lines="2" />
      </li>
    </ul>
    <UiEmptyState
      v-else-if="showError"
      :icon="AlertTriangle"
      title="Não foi possível carregar seus pets"
      description="Verifique sua conexão e tente novamente."
    >
      <template #action>
        <AppButton text="Tentar novamente" variant="secondary" :block="false" @event="retry" />
      </template>
    </UiEmptyState>
    <ul
      v-else-if="petStore.pets.length > 0"
      class="grid w-full grid-cols-2 gap-4 pb-40 md:pb-20 lg:grid-cols-3 xl:grid-cols-4"
    >
      <li v-for="pet in petStore.pets" :key="pet.id">
        <PetCard
          :name="pet.name"
          :breed="pet.breed"
          :size="pet.size"
          :weight="pet.weight"
          :pet_picture="pet.pet_picture"
          @click="petDetail(pet.id)"
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

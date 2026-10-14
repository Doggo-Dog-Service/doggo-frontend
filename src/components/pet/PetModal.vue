<script setup>
import PetViewModal from '@/components/pet/PetViewModal.vue'
import PetEditModal from '@/components/pet/PetEditModal.vue'
import PetAddModal from '@/components/pet/PetAddModal.vue'
import PetDeleteModal from '@/components/pet/PetDeleteModal.vue'
import { usePetModal } from '@/composables/usePetModal'

const props = defineProps({
  mode: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'add', 'edit', 'delete'].includes(value),
  },
  petId: {
    type: Number,
  },
})

const emits = defineEmits(['close', 'changeMode'])

const {
  currentPet,
  isLoading,
  editData,
  registerData,
  editPicture,
  editPreview,
  registerPicture,
  updatePet,
  createPet,
  deletePet,
  cancelEdit,
} = usePetModal({
  petId: () => props.petId,
  mode: () => props.mode,
  onClose: () => emits('close'),
  onChangeMode: (mode) => emits('changeMode', mode),
})
</script>

<template>
  <div
    class="fixed bg-black/60 w-screen h-screen top-0 right-0 px-6 py-10 md:px-40 md:py-6 z-100"
    @click="emits('close')"
  >
    <div
      class="relative bg-background-light rounded-xl w-full h-full p-6 overflow-y-auto lg:px-20"
      @click.stop
    >
      <div class="w-full text-end mb-5">
        <button
          class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 cursor-pointer"
          @click="emits('close')"
        >
          <span class="mdi mdi-close"></span>
        </button>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center gap-4 pt-75">
        <span class="mdi mdi-loading animate-spin text-5xl text-doggo-green"></span>
        <p>Aguarde um momento</p>
      </div>

      <PetViewModal
        v-else-if="props.mode == 'view'"
        :pet="currentPet"
        @edit="emits('changeMode', 'edit')"
        @delete="emits('changeMode', 'delete')"
      />

      <PetEditModal
        v-else-if="props.mode == 'edit'"
        v-model="editData"
        v-model:picture="editPicture"
        :preview="editPreview"
        :loading="isLoading"
        @submit="updatePet"
        @cancel="cancelEdit"
      />

      <PetAddModal
        v-else-if="props.mode == 'add'"
        v-model="registerData"
        v-model:picture="registerPicture"
        :loading="isLoading"
        @submit="createPet"
      />

      <PetDeleteModal
        v-else-if="props.mode == 'delete'"
        :loading="isLoading"
        @confirm="deletePet"
        @cancel="emits('changeMode', 'view')"
      />
    </div>
  </div>
</template>

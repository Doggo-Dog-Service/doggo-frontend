<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import UiSheet from '@/components/ui/UiSheet.vue'
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

const TITLES = {
  view: 'Detalhes do pet',
  add: 'Novo pet',
  edit: 'Editar pet',
  delete: 'Excluir pet',
}
const title = computed(() => TITLES[props.mode])

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
  <UiSheet :open="true" :title="title" @update:open="(value) => !value && emits('close')">
    <div v-if="isLoading" role="status" class="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 :size="40" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
      <p class="text-body text-fg-muted">Aguarde um momento</p>
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
  </UiSheet>
</template>

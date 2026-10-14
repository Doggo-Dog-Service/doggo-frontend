import { computed, onMounted, reactive, ref, toValue } from 'vue'
import { storeToRefs } from 'pinia'
import { usePetStore } from '@/stores/pet'
import { useMedia } from '@/composables/useMedia'

export function usePetModal({ petId, mode, onClose, onChangeMode }) {
  const petStore = usePetStore()
  const { postImage, loading: mediaLoading } = useMedia()
  const { currentPet, loading: storeLoading } = storeToRefs(petStore)

  const isLoading = computed(() => storeLoading.value || mediaLoading.value)

  const editData = reactive({
    name: '',
    breed: '',
    size: '',
    weight: 0,
    notes: '',
  })
  const registerData = reactive({
    name: '',
    breed: '',
    size: 'p',
    weight: 0,
    notes: '',
  })

  const editPicture = ref(null)
  const editPreview = ref('')
  const registerPicture = ref(null)

  function resetEditData() {
    editData.name = currentPet.value.name
    editData.breed = currentPet.value.breed
    editData.size = currentPet.value.size
    editData.weight = currentPet.value.weight
    editData.notes = currentPet.value.notes
    editPreview.value = currentPet.value.pet_picture?.url
  }

  async function uploadPicture(file, description) {
    const newImage = await postImage({ file, description })
    return newImage?.attachment_key ?? null
  }

  async function updatePet() {
    if (editPicture.value) {
      const attachmentKey = await uploadPicture(editPicture.value, editData.name)
      if (!attachmentKey) return
      editData.pet_picture = attachmentKey
    }

    await petStore.updatePet(toValue(petId), editData)
    onChangeMode('view')
    petStore.getPet(toValue(petId))
  }

  async function createPet() {
    if (registerPicture.value) {
      const attachmentKey = await uploadPicture(registerPicture.value, registerData.name)
      if (!attachmentKey) return
      registerData.pet_picture = attachmentKey
    }

    await petStore.createPet(registerData)
    onClose()
  }

  async function deletePet() {
    await petStore.deletePet(toValue(petId))
    onClose()
  }

  function cancelEdit() {
    resetEditData()
    onChangeMode('view')
  }

  onMounted(async () => {
    if (['view', 'edit'].includes(toValue(mode))) {
      await petStore.getPet(toValue(petId))
      resetEditData()
    }
  })

  return {
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
  }
}

import { defineStore } from 'pinia'
import * as petService from '@/services/pet'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'

export const usePetStore = defineStore('petStore', () => {
  const $toast = useToast()

  const loading = ref(false)
  const error = ref('')
  const pets = ref([])
  const currentPet = ref({})

  const getPets = async (params = {}) => {
    try {
      loading.value = true
      const data = await petService.getPets(params)
      pets.value = data.results
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getPet = async (id) => {
    try {
      loading.value = true
      const data = await petService.getPet(id)
      currentPet.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createPet = async (payload) => {
    try {
      loading.value = true
      const data = await petService.createPet(payload)
      $toast.success(`${data.name} adicionado!`, {
        type: 'success',
        position: 'top-right',
        duration: 3000
      })
    } catch(error) {
      $toast.error()
    }
  }

  const updatePet = async (id, payload) => {
    try {
      loading.value = true
      const data = await petService.updatePet(id, payload)
      $toast.success('Pet alterado com sucesso!', {
        type: 'success',
        duration: 3000,
        position: 'top-right',
      })
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const deletePet = async (id) => {
    try {
      loading.value = true
      const data = await petService.deletePet(id)
      $toast.success('Pet deletado com sucesso!', {
        type: 'success',
        duration: 3000,
        position: 'top-right',
      })
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    pets,
    currentPet,
    getPets,
    getPet,
    createPet,
    updatePet,
    deletePet
  }
})

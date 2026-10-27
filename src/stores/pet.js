import { defineStore } from 'pinia'
import * as petService from '@/services/pet'
import { ref } from 'vue'
import notify from '@/utils/notify'

export const usePetStore = defineStore('petStore', () => {

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
      notify.success(`${data.name} adicionado!`)
    } catch(error) {
      notify.error()
    }
  }

  const updatePet = async (id, payload) => {
    try {
      loading.value = true
      const data = await petService.updatePet(id, payload)
      notify.success('Pet alterado com sucesso!')
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
      notify.success('Pet deletado com sucesso!')
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

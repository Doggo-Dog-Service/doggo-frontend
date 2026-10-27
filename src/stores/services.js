import { defineStore } from 'pinia'
import { ref } from 'vue'
import notify from '@/utils/notify'
import * as serviceService from '@/services/service'

export const useServiceStore = defineStore('serviceStore', () => {

  const loading = ref(false)
  const serviceError = ref('')
  const serivces = ref([])

  async function getServices(params) {
    try {
      loading.value = true
      const data  = await serviceService.getServices(params)
      serivces.value = data.results ?? []
    } catch (error) {
      serviceError.value = error.message
      console.error(error.message)
    } finally {
      loading.value = false
    }
  }

  async function getService(id) {
    try {
      loading.value = true
      const { data } = await serviceService.getService(id)
      return data
    } catch (error) {
      serviceError.value = error.message
      console.error(error.message)
    } finally {
      loading.value = false
    }
  }

  async function updateService(id, payload) {
    try {
      loading.value = true
      await serviceService.updateService(id, payload)
      await getServices()
      notify.success('Serviço atualizado com sucesso!')
    } catch (error) {
      notify.error(error.message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    serivces,
    getServices,
    getService,
    updateService,
  }
})

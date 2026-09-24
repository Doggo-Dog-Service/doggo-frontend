import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import * as serviceService from '@/services/service'

export const useServiceStore = defineStore('serviceStore', () => {
  const $toast = useToast()

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
      $toast.success('Serviço atualizado com sucesso!', {
        duration: 3000,
        type: 'success',
        position: 'top-left',
      })
    } catch (error) {
      $toast.error(error.message, {
        duration: 3000,
        type: 'error',
        position: 'top-left',
      })
    } finally {
      loading.value = false
    }
  }

  async function deleteSerivce(id) {
    try {
      loading.value = true
      await serviceService.deleteService(id)
      await getServices()
      $toast.success('Serviço deletado com sucesso', {
        duration: 3000,
        type: 'success',
        position: 'top-left',
      })
    } catch (error) {
      $toast.success(error.message, {
        duration: 3000,
        type: 'error',
        position: 'top-left',
      })
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
    deleteSerivce
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import notify from '@/utils/notify'
import { useAuthStore } from '@/stores/auth'
import * as serviceService from '@/services/service'

export const useServiceStore = defineStore('serviceStore', () => {

  const loading = ref(false)
  const serviceError = ref('')
  const serivces = ref([])
  const pendingCount = ref(0)

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

  // Contador de pedidos em análise (status 1) para a navegação; não altera a lista exibida.
  async function fetchPendingCount() {
    try {
      const data = await serviceService.getServices({ status: 1 })
      pendingCount.value = data.count ?? data.results?.length ?? 0
    } catch {
      pendingCount.value = 0
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
      if (useAuthStore().mode === 'provider') await fetchPendingCount()
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
    pendingCount,
    getServices,
    fetchPendingCount,
    getService,
    updateService,
  }
})

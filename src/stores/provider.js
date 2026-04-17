import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import * as providerService from '@/services/providerService'
import { toFloat } from '@/utils/toFloat'

export const useProviderStore = defineStore('providerStore', () => {
  const $toast = useToast()

  const providers = ref([])
  const totalProviders = ref(0)
  const currentService = ref(0)
  const loading = ref(false)

  const countProviders = async () =>{
    const response = await providerService.fetchProviders()
    totalProviders.value = response.count
  }

  const fetchProviders = async (params) => {
    try {
      loading.value = true
      const response = await providerService.fetchProviders(params)
      const fetchedProviders = response.results?.map(p => ({
        ...p,
        fixed_latitude: toFloat(p.fixed_latitude),
        fixed_longitude: toFloat(p.fixed_longitude),
        last_latitude: toFloat(p.last_latitude),
        last_longitude: toFloat(p.last_longitude),
        price_per_hour: toFloat(p.price_per_hour),
        price_per_day: toFloat(p.price_per_day),
      }))
      providers.value = fetchedProviders
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      loading.value = false
    }
  }

  const fetchProvider = async (id) => {
    try {
      loading.value = true
      const response = await providerService.fetchProvider(id)
      const provider = {
        ...response,
        fixed_latitude: toFloat(response.fixed_latitude),
        fixed_longitude: toFloat(response.fixed_longitude),
        last_latitude: toFloat(response.last_latitude),
        last_longitude: toFloat(response.last_longitude),
        price_per_hour: toFloat(response.price_per_hour),
        price_per_day: toFloat(response.price_per_day),
      }
      return provider
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      loading.value = false
    }
  }

  const updateProvider = async (id, data) => {
    try {
      loading.value = true
      const updatedProvider = await providerService.updateProvider(id, data)
      const index = providers.value.findIndex((provider) => provider.id === updatedProvider.id)
      if(index !== -1) {
        providers.value[index] = updatedProvider
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const createProvider = async (data) => {
    try {
      loading.value = true
      const newProvider = await providerService.createProvider(data)
      if (newProvider) {
        $toast.success(`Perfil de provedor criado! Bem-vindo ${newProvider.user?.full_name}`, {
          type: 'success',
          duration: 3000,
          position: 'top-right',
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const deleteProvider = async (id) => {
    try {
      loading.value = true
      await providerService.deleteProvider(id)
      $toast.success('Perfil deletado com sucesso!', {
        type: 'success',
        duration: 3000,
        position: 'top-right',
      })
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    providers,
    totalProviders,
    currentService,
    countProviders,
    fetchProviders,
    fetchProvider,
    createProvider,
    updateProvider,
    deleteProvider,
  }
})

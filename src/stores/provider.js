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
      const fetchedProviders = response.results
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
      const provider = response
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
        return true
      }
    } catch (error) {
      console.log(error)
      return false
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

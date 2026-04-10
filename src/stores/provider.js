import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import * as providerService from '@/services/providerService'

export const useProviderStore = defineStore('providerStore', () => {
  const $toast = useToast()

  const providers = ref([])
  const currentService = ref(0)
  const loading = ref(false)

  const fetchProviders = async (params) => {
    try {
      loading.value = true
      const response = await providerService.fetchProviders(params)
      providers.value = response.results
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
      const provider = await providerService.fetchProvider(id)
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
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })
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
    currentService,
    fetchProviders,
    fetchProvider,
    createProvider,
    deleteProvider,
  }
})

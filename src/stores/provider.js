import { ref } from 'vue'
import { defineStore } from 'pinia'
import notify from '@/utils/notify'
import { parseDjangoErrors } from '@/utils/errors'
import * as providerService from '@/services/providerService'

export const useProviderStore = defineStore('providerStore', () => {

  const providers = ref([])
  const currentProvider = ref(null)
  const totalProviders = ref(0)
  const currentService = ref(0)
  const loading = ref(false)
  const error = ref('')

  const countProviders = async () =>{
    const response = await providerService.fetchProviders()
    totalProviders.value = response.count
  }

  const fetchProviders = async (params) => {
    try {
      loading.value = true
      error.value = ''
      const response = await providerService.fetchProviders(params)
      const fetchedProviders = response.results
      providers.value = fetchedProviders
    } catch (e) {
      error.value = e.message
      notify.error(e.message)
    } finally {
      loading.value = false
    }
  }

  const fetchProvider =async (id) => {
    try {
      loading.value = true
      const response = await providerService.fetchProvider(id)
      currentProvider.value = response
      return response
    } catch (error) {
      notify.error(error.message)
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

  // onError (opcional) recebe o erro bruto no lugar do toast, para o chamador mapear campos.
  const createProvider = async (data, { onError } = {}) => {
    try {
      loading.value = true
      const newProvider = await providerService.createProvider(data)
      return !!newProvider
    } catch (error) {
      if (onError) onError(error)
      else notify.error(parseDjangoErrors(error))
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteProvider = async (id) => {
    try {
      loading.value = true
      await providerService.deleteProvider(id)
      notify.success('Perfil deletado com sucesso!')
    } catch (error) {
      notify.error(error.message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    providers,
    totalProviders,
    currentService,
    currentProvider,
    countProviders,
    fetchProviders,
    fetchProvider,
    createProvider,
    updateProvider,
    deleteProvider,
  }
})

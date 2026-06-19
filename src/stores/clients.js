import * as clientService from '@/services/clientService'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'

export const useClientStore = defineStore('clientStore', () => {
  const $toast = useToast()

  const clients = ref([])
  const totalClients = ref(0) 
  const loading = ref(false)

  const countClients = async () => {
    const response = await clientService.fetchClients()
    totalClients.value = response.count
  }

  const fetchClients = async (params) => {
    try {
      loading.value = true
      const response = await clientService.fetchClients(params)
      clients.value = response.results
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

  const fetchClient = async (id) => {
    try {
      loading.value = true
      const client = await clientService.fetchClient(id)
      return client
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

  const createClient = async (data) => {
    try {
      loading.value = true
      const newClient = await clientService.createClient(data)
      if (newClient) {
        $toast.success(`Perfil de cliente criado! Bem-vindo ${newClient.user?.full_name}`, {
          type: 'success',
          duration: 3000,
          position: 'top-right',
        })
        return true
      }
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })
      return false
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (id, data) => {
    try {
      loading.value = true
      const updatedClient = await clientService.updateClient(id, data)
      const index = clients.value.findIndex((client) => client.id === updatedClient.id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id) => {
    try {
      loading.value = true
      await clientService.deleteClient(id)
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
    clients,
    totalClients,
    countClients,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
  }
})

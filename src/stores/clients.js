import * as clientService from '@/services/clientService'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import notify from '@/utils/notify'

export const useClientStore = defineStore('clientStore', () => {

  const clients = ref([])
  const loading = ref(false)

  const fetchClients = async (params) => {
    try {
      loading.value = true
      const response = await clientService.fetchClients(params)
      clients.value = response.results
    } catch (error) {
      notify.error(error.message)
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
      notify.error(error.message)
    } finally {
      loading.value = false
    }
  }

  const createClient = async (data) => {
    try {
      loading.value = true
      const newClient = await clientService.createClient(data)
      if (newClient) {
        notify.success(`Perfil de cliente criado! Bem-vindo ${newClient.user?.full_name}`)
        return true
      }
    } catch (error) {
      notify.error(error.message)
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
      notify.success('Perfil deletado com sucesso!')
    } catch (error) {
      notify.error(error.message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    clients,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
  }
})

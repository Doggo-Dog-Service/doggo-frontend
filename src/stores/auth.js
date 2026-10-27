import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notify from '@/utils/notify'
import * as authService from '@/services/authService'
import { removeAccessToken } from '@/utils/token'

export const useAuthStore = defineStore('authStore', () => {

  const user = ref(null)
  const inicialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isProvider = computed(() => user.value?.provider_profile ?? false)
  const isClient = computed(() => user.value?.client_profile ?? false)

  const login = async (credentials) => {
    try {
      loading.value = true

      await authService.login(credentials)
      user.value = await authService.getMe()
      notify.success(`Bem vindo ${user.value.full_name}`)
      return true
    } catch (error) {
      notify.error(error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async () => {
    try {
      loading.value = true
      user.value = await authService.getMe()
    } catch (error) {
      user.value = null
      removeAccessToken()
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    user.value = null
    notify.success('Logout realizado!')
  }

  const createUser = async (data) => {
    try {
      loading.value = true
      const userData = await authService.createBaseUser(data)
      return userData
    } catch (error) {
      notify.error(error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, data) => {
    try {
      loading.value = true
      return await authService.updateUser(id, data)
    } catch (error) {
      notify.error(error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    try {
      loading.value = true
      authService.deleteUserById(id)
      notify.success('Usuário deletado com sucesso!')
    } catch (error) {
      notify.error(error.message)
    }
  }

  const inicialize = async () => {
    if (inicialized.value) return

    await fetchUser()
    inicialized.value = true
  }

  return {
    user,
    loading,
    isAuthenticated,
    isClient,
    isProvider,
    login,
    fetchUser,
    createUser,
    updateUser,
    logout,
    deleteUser,
    inicialize,
  }
})

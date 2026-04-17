import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useRouter } from 'vue-router'
import * as authService from '@/services/authService'
import { removeAccessToken } from '@/utils/token'

export const useAuthStore = defineStore('authStore', () => {
  const $toast = useToast()
  const router = useRouter()

  const user = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isProvider = computed(() => user.value.provider_profile)
  const isClient = computed(() => user.value.client_profile)

  const login = async (credentials) => {
    try {
      loading.value = true

      await authService.login(credentials)
      user.value = await authService.getMe()
      $toast.success(`Bem vindo ${user.value.full_name}`, {
        type: 'success',
        duration: 3000,
        position: 'top-right'
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

  const fetchUser = async () => {
    try {
      loading.value = true
      user.value = await authService.getMe()
      console.log(user.value)
    } catch (error) {
      user.value = null
      router.push('/login')
      removeAccessToken()
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    user.value = null
    $toast.error('Logout realizado!', {
      type: 'error',
      duration: 3000,
      position: 'top-right',
    })
  }

  const createUser = async (data) => {
    try {
      loading.value = true
      const userData = await authService.createBaseUser(data)
      return userData
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        duration: 3000,
        position: 'top-right'
      })
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    try {
      loading.value = true
      authService.deleteUserById(id)
      $toast.success('Usuário deletado com sucesso!', {
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
    }
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
    logout,
    deleteUser
  }
})

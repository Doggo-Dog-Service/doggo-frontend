import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import notify from '@/utils/notify'
import * as authService from '@/services/authService'
import { removeAccessToken } from '@/utils/token'

const MODE_KEY = 'doggo-mode'
const MODES = ['client', 'provider']

function readSavedMode() {
  try {
    const value = localStorage.getItem(MODE_KEY)
    return MODES.includes(value) ? value : null
  } catch {
    return null
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // armazenamento bloqueado: segue sem persistir
  }
}

export const useAuthStore = defineStore('authStore', () => {

  const user = ref(null)
  const inicialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isProvider = computed(() => user.value?.provider_profile ?? false)
  const isClient = computed(() => user.value?.client_profile ?? false)

  const hasBothProfiles = computed(() => !!(user.value?.provider_profile && user.value?.client_profile))
  const mode = ref(null)

  const resolveMode = () => {
    const hasProvider = !!user.value?.provider_profile
    const hasClient = !!user.value?.client_profile
    if (hasProvider && hasClient) {
      mode.value = readSavedMode() ?? 'client'
    } else if (hasProvider) {
      mode.value = 'provider'
    } else if (hasClient) {
      mode.value = 'client'
    } else {
      mode.value = null
    }
  }
  watch(user, resolveMode, { flush: 'sync' })

  // Só troca para um modo que o usuário possui. A navegação fica com quem chama.
  const setMode = (next) => {
    if (!MODES.includes(next)) return
    if (next === 'provider' && !isProvider.value) return
    if (next === 'client' && !isClient.value) return
    mode.value = next
    if (hasBothProfiles.value) saveMode(next)
  }

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

  const clearSession = () => {
    user.value = null
  }

  // onError (opcional) recebe o erro bruto no lugar do toast, para o chamador mapear campos.
  const createUser = async (data, { onError } = {}) => {
    try {
      loading.value = true
      const userData = await authService.createBaseUser(data)
      return userData
    } catch (error) {
      if (onError) onError(error)
      else notify.error(error.message)
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

  // Atualiza nome e telefone do usuário logado. O telefone é write-only na API, então só o nome volta.
  const updateProfile = async ({ full_name, phone }) => {
    if (!user.value) return false
    try {
      loading.value = true
      const payload = phone ? { full_name, phone } : { full_name }
      const data = await authService.updateUser(user.value.id, payload)
      user.value = { ...user.value, full_name: data?.full_name ?? full_name }
      return true
    } catch (error) {
      notify.error(error.message)
      return false
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
    mode,
    hasBothProfiles,
    setMode,
    login,
    fetchUser,
    createUser,
    updateUser,
    updateProfile,
    logout,
    clearSession,
    deleteUser,
    inicialize,
  }
})

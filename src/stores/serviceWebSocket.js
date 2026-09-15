import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import * as serviceService from '@/services/service'

export const useServiceWebSocketStore = defineStore('serviceWebSocket', () => {
  const service = ref(null)

  const connected = ref(false)
  const tracking = ref(false)

  const currentLocation = ref(null)
  const currentDistance = ref(null)
  const route = ref([])

  const error = ref(null)
  const loading = ref(false)

  const hasLocation = computed(() => currentLocation.value !== null)

  const status = computed(() => service.value?.status ?? null)
  const providerId = computed(() => service.value?.provider_id ?? null)
  const providerName = computed(() => service.value?.provider_name ?? null)
  const serviceType = computed(() => service.value?.service_type ?? null)
  const pets = computed(() => service.value?.pets ?? [])

  async function getService(serviceId) {
    loading.value = true
    error.value = null

    try {
      const data = await serviceService.getService(serviceId)

      service.value = data

      return data
    } catch (err) {
      error.value = err.message || 'Erro ao carregar o serviço.'

      throw err
    } finally {
      loading.value = false
    }
  }

  async function startService() {
    if (!service.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await serviceService.startService(service.value.id)

      service.value = data

      return data
    } catch (err) {
      error.value = err.message || 'Não foi possível iniciar o passeio.'

      throw err
    } finally {
      loading.value = false
    }
  }

  function setService(data) {
    service.value = data
  }

  function setConnected(value) {
    connected.value = value
  }

  function setTracking(value) {
    tracking.value = value
  }

  function setStatus(value) {
    if (!service.value) {
      return
    }

    service.value.status = value
  }

  function updateLocation(location, distance) {
    currentLocation.value = location
    currentDistance.value = distance
    route.value.push(location)
  }

  function setError(message) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  function reset() {
    service.value = null
    connected.value = false
    tracking.value = false
    currentLocation.value = null
    route.value = []
    error.value = null
    loading.value = false
  }

  return {
    service,
    connected,
    tracking,
    status,
    providerId,
    providerName,
    serviceType,
    pets,
    currentLocation,
    currentDistance,
    route,
    error,
    loading,
    hasLocation,
    getService,
    startService,
    setService,
    setConnected,
    setTracking,
    setStatus,
    updateLocation,
    setError,
    clearError,
    reset,
  }
})

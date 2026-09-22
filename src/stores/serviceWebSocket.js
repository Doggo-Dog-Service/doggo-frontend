import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'

import * as serviceService from '@/services/service'

export const useServiceWebSocketStore = defineStore('serviceWebSocket', () => {
  const $toast = useToast()

  const service = ref(null)

  const connected = ref(false)
  const tracking = ref(false)

  const currentLocation = ref(null)
  const currentDistance = ref(null)
  const route = ref([])

  const routePoints = ref([])
  const totalDistance = ref(null)

  const routeLoading = ref(false)
  const error = ref(null)
  const loading = ref(false)

  const hasLocation = computed(() => currentLocation.value !== null)

  const status = computed(() => service.value?.status ?? null)
  const isReview = computed(() => status.value === 1)
  const isWaiting = computed(() => status.value === 2)
  const inProgress = computed(() => status.value === 3)
  const isFinished = computed(() => status.value === 4)
  const isCancelled = computed(() => status.value === 5)
  const isRejected = computed(() => status.value === 6)
  const isTerminal = computed(() => isFinished.value || isCancelled.value || isRejected.value)

  const providerId = computed(() => service.value?.provider_id ?? null)
  const providerName = computed(() => service.value?.provider_name ?? null)
  const providerPicture = computed(() => service.value?.provider_picture ?? null)
  const providerLocation = computed(() => {
    if (service.value?.provider_latitude == null || service.value?.provider_longitude == null) {
      return null
    }

    return {
      latitude: service.value.provider_latitude,
      longitude: service.value.provider_longitude,
    }
  })
  const clientId = computed(() => service.value?.client_id ?? null)
  const clientName = computed(() => service.value?.client_name ?? null)
  const clientPicture = computed(() => service.value?.client_picture ?? null)
  const serviceType = computed(() => service.value?.service_type ?? null)
  const price = computed(() => service.value?.price ?? null)
  const startDatetime = computed(() => service.value?.start_datetime ?? null)
  const endDatetime = computed(() => service.value?.end_datetime ?? null)
  const pets = computed(() => service.value?.pets ?? [])

  const formattedDistance = computed(() => {
    if (currentDistance.value == null) return '0 m'

    if (currentDistance.value < 1000) {
      return `${Math.round(currentDistance.value)} m`
    }

    return `${(currentDistance.value / 1000).toFixed(2)} km`
  })

  const walkDuration = computed(() => {
    if (!startDatetime.value || !endDatetime.value) return null

    const start = new Date(startDatetime.value).getTime()
    const end = new Date(endDatetime.value).getTime()

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null

    return Math.floor((end - start) / 1000)
  })

  async function getService(serviceId) {
    loading.value = true
    error.value = null

    try {
      const data = await serviceService.getService(serviceId)

      if (service.value?.id !== data.id) {
        resetLocationState()
      }

      service.value = data

      return data
    } catch (err) {
      error.value = err.message || 'Erro ao carregar o serviço.'

      throw err
    } finally {
      loading.value = false
    }
  }

  async function getRoute() {
    if (!service.value) {
      return
    }

    routeLoading.value = true
    error.value = null

    try {
      const data = await serviceService.getServiceRoute(service.value.id)

      routePoints.value = data.points
      totalDistance.value = data.total_distance

      return data
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar a rota do passeio.'

      throw err
    } finally {
      routeLoading.value = false
    }
  }

  async function runServiceAction(action, successMessage) {
    if (!service.value) {
      return null
    }

    loading.value = true
    error.value = null

    try {
      const data = await action(service.value.id)

      service.value = data

      if (successMessage) {
        $toast.success(successMessage, {
          type: 'success',
          duration: 3000,
          position: 'top-right',
        })
      }

      return data
    } catch (err) {
      error.value = err.message || 'Não foi possível atualizar o serviço.'

      $toast.error(error.value, {
        type: 'error',
        duration: 3000,
        position: 'top-right',
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  const startService = () =>
    runServiceAction(serviceService.startService, 'Passeio iniciado!')
  const confirmService = () =>
    runServiceAction(serviceService.confirmService, 'Passeio confirmado!')
  const rejectService = () =>
    runServiceAction(serviceService.rejectService, 'Passeio recusado.')
  const completeService = () =>
    runServiceAction(serviceService.completeService, 'Passeio concluído!')
  const cancelService = () =>
    runServiceAction(serviceService.cancelService, 'Passeio cancelado.')

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

  function setRoutePoints(points) {
    routePoints.value = points
  }

  function setTotalDistance(distance) {
    totalDistance.value = distance
  }

  function setError(message) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  function resetLocationState() {
    currentLocation.value = null
    currentDistance.value = null
    route.value = []
    routePoints.value = []
    totalDistance.value = null
    connected.value = false
    tracking.value = false
  }

  function reset() {
    service.value = null
    resetLocationState()
    error.value = null
    loading.value = false
  }

  return {
    service,
    connected,
    tracking,
    status,
    isReview,
    isWaiting,
    inProgress,
    isFinished,
    isCancelled,
    isRejected,
    isTerminal,
    providerId,
    providerName,
    providerPicture,
    providerLocation,
    clientId,
    clientName,
    clientPicture,
    serviceType,
    price,
    startDatetime,
    endDatetime,
    pets,
    currentLocation,
    currentDistance,
    route,
    routePoints,
    totalDistance,
    routeLoading,
    error,
    loading,
    hasLocation,
    formattedDistance,
    walkDuration,
    getService,
    getRoute,
    startService,
    confirmService,
    rejectService,
    completeService,
    cancelService,
    setService,
    setConnected,
    setTracking,
    setStatus,
    updateLocation,
    setRoutePoints,
    setTotalDistance,
    setError,
    clearError,
    resetLocationState,
    reset,
  }
})
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import notify from '@/utils/notify'
import { useMedia } from '@/composables/useMedia'

import * as serviceService from '@/services/service'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'

export const useServiceWebSocketStore = defineStore('serviceWebSocket', () => {

  const service = ref(null)

  const connected = ref(false)
  const tracking = ref(false)

  const currentLocation = ref(null)
  const currentDistance = ref(null)
  const lastLocationAt = ref(null)
  const route = ref([])

  const routePoints = ref([])
  const totalDistance = ref(null)

  const events = ref([])
  const eventSending = ref(false)

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

  const providerNote = computed(() => service.value?.provider_note ?? '')
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
  const isRating = computed(() => service.value?.is_rating ?? false)

  const formattedDistance = computed(() => {
    if (currentDistance.value == null) return '0 m'

    if (currentDistance.value < 1000) {
      return `${Math.round(currentDistance.value)} m`
    }

    return `${(currentDistance.value / 1000).toFixed(2)} km`
  })

  const walkDuration = computed(() => service.value?.duration ?? null)

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

  async function rateService({ rating, comment }) {
    if(!service.value) return

    loading.value = true
    error.value = null

    try {
      const data = await serviceService.rateService(service.value.id, { rating, comment })

      notify.success('Agradecemos pelo feedback!')

      return data
    } catch (err) {
      error.value = err.message || 'Erro ao avaliar o serviço.'

      notify.error(error.value)

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
      totalDistance.value = data.distance_meters

      return data
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar a rota do passeio.'

      throw err
    } finally {
      routeLoading.value = false
    }
  }

  function pushEvent(event) {
    if (!event || events.value.some((item) => item.id === event.id)) {
      return
    }

    events.value.push(event)
  }

  function handleWalkEvent(message) {
    if (!service.value || message?.service_id !== service.value.id) {
      return
    }

    pushEvent(message.event)
  }

  async function loadEvents() {
    if (!service.value) {
      return
    }

    const serviceId = service.value.id

    try {
      const data = await serviceService.getServiceEvents(serviceId)

      // Eventos do WS que chegaram antes do GET ficam; o dedupe é por id.
      if (service.value?.id === serviceId) {
        data.forEach(pushEvent)
      }
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar os marcadores.'
    }
  }

  async function addEvent(kind, file = null) {
    if (!service.value || eventSending.value) {
      return null
    }

    eventSending.value = true

    try {
      const payload = { kind }

      if (currentLocation.value) {
        payload.latitude = currentLocation.value.latitude
        payload.longitude = currentLocation.value.longitude
      }

      if (file) {
        const uploaded = await useMedia().postImage({ file, description: 'Foto do passeio' })

        if (!uploaded?.attachment_key) {
          return null
        }

        payload.image_attachment_key = uploaded.attachment_key
      }

      const event = await serviceService.postServiceEvent(service.value.id, payload)

      pushEvent(event)

      return event
    } catch (err) {
      notify.error(err.message || 'Não foi possível salvar o marcador.')

      return null
    } finally {
      eventSending.value = false
    }
  }

  async function saveNote(note) {
    if (!service.value) {
      return null
    }

    const data = await serviceService.patchServiceNote(service.value.id, { provider_note: note })

    service.value = data

    return data
  }

  async function runServiceAction(action, successMessage, { refreshPending = false } = {}) {
    if (!service.value) {
      return null
    }

    loading.value = true
    error.value = null

    try {
      const data = await action(service.value.id)

      service.value = data

      // O contador de "Pedidos" (status 1) muda quando um pedido é confirmado, recusado ou cancelado.
      if (refreshPending && useAuthStore().mode === 'provider') {
        useServiceStore().fetchPendingCount()
      }

      if (successMessage) {
        notify.success(successMessage)
      }

      return data
    } catch (err) {
      error.value = err.message || 'Não foi possível atualizar o serviço.'

      notify.error(error.value)

      throw err
    } finally {
      loading.value = false
    }
  }

  const startService = () =>
    runServiceAction(serviceService.startService, 'Passeio iniciado!')
  const confirmService = () =>
    runServiceAction(serviceService.confirmService, 'Passeio confirmado!', { refreshPending: true })
  const rejectService = () =>
    runServiceAction(serviceService.rejectService, 'Passeio recusado.', { refreshPending: true })
  const completeService = () =>
    runServiceAction(serviceService.completeService, 'Passeio concluído!')
  const cancelService = () =>
    runServiceAction(serviceService.cancelService, 'Passeio cancelado.', { refreshPending: true })

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
    lastLocationAt.value = Date.now()
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
    lastLocationAt.value = null
    route.value = []
    events.value = []
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
    providerNote,
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
    isRating,
    currentLocation,
    currentDistance,
    lastLocationAt,
    route,
    routePoints,
    totalDistance,
    events,
    eventSending,
    routeLoading,
    error,
    loading,
    hasLocation,
    formattedDistance,
    walkDuration,
    getService,
    getRoute,
    loadEvents,
    addEvent,
    saveNote,
    handleWalkEvent,
    startService,
    confirmService,
    rejectService,
    completeService,
    cancelService,
    rateService,
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
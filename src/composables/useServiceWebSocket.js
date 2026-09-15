import { onUnmounted, ref } from 'vue'

import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { useGeolocation } from '@/composables/useGeolocation'
import { WebSocketService } from '@/services/serviceWebSocket'
import { getAccessToken } from '@/utils/token'

const LOCATION_INTERVAL = 2000

export const useServiceWebSocket = (serviceId, handlers = {}) => {
  const serviceWebSocketStore = useServiceWebSocketStore()

  const {
    latitude,
    longitude,
    accuracy,
    error: geolocationError,
    watchPosition,
    stopWatching,
  } = useGeolocation()

  const websocket = ref(null)

  let locationInterval = null

  function connect() {
    if (websocket.value) {
      return
    }

    const token = getAccessToken()

    if (!token) {
      serviceWebSocketStore.setError(
        'Usuário não autenticado.'
      )

      return
    }

    websocket.value = new WebSocketService(
      serviceId,
      token,
      {
        onOpen: handleOpen,
        onMessage: handleMessage,
        onError: handleError,
        onClose: handleClose,
      }
    )

    websocket.value.connect()
  }

  function disconnect() {
    stopSendingLocation()
    stopWatching()

    websocket.value?.disconnect()
    websocket.value = null

    serviceWebSocketStore.setConnected(false)
    serviceWebSocketStore.setTracking(false)
  }

  function handleOpen() {
    serviceWebSocketStore.setConnected(true)
    serviceWebSocketStore.clearError()

    if (serviceWebSocketStore.tracking) {
      startSendingLocation()
    }
  }

  function handleMessage(message) {
    switch (message.type) {
      case 'location':
        handleLocation(message)
        break

      case 'walk_started':
        handleWalkStarted(message)
        break

      case 'walk_completed':
        handleWalkCompleted(message)
        break

      case 'walk_cancelled':
        handleWalkCancelled(message)
        break

      case 'error':
        handleServerError(message)
        break

      default:
        console.warn(
          'Tipo de mensagem WebSocket desconhecido:',
          message.type
        )
    }
  }

  function handleLocation(message) {
    if (!message.location) {
      return
    }

    serviceWebSocketStore.updateLocation(
      message.location,
      message.distance
    )

    handlers.onLocation?.(
      message.location
    )
  }

  function handleWalkStarted(message) {
    serviceWebSocketStore.setStatus(
      message.status
    )

    serviceWebSocketStore.clearError()
  }

  function handleWalkCompleted(message) {
    serviceWebSocketStore.setStatus(
      message.status
    )

    stopSendingLocation()
    stopWatching()

    serviceWebSocketStore.setTracking(false)
  }

  function handleWalkCancelled(message) {
    serviceWebSocketStore.setStatus(
      message.status
    )

    stopSendingLocation()
    stopWatching()

    serviceWebSocketStore.setTracking(false)
  }

  function handleServerError(message) {
    serviceWebSocketStore.setError(
      message.message
    )
  }

  function handleError(error) {
    console.error(
      'Erro WebSocket:',
      error
    )

    serviceWebSocketStore.setError(
      'Erro na conexão com o servidor.'
    )
  }

  function handleClose() {
    serviceWebSocketStore.setConnected(false)
  }

  function sendLocation() {
    if (!websocket.value?.isConnected()) {
      return false
    }

    if (
      latitude.value === null ||
      longitude.value === null
    ) {
      return false
    }

    return websocket.value.sendMessage({
      type: 'location',
      latitude: latitude.value,
      longitude: longitude.value,
    })
  }

  function startSendingLocation() {
    if (locationInterval) {
      return
    }

    sendLocation()

    locationInterval = setInterval(() => {
      sendLocation()
    }, LOCATION_INTERVAL)
  }

  function stopSendingLocation() {
    if (!locationInterval) {
      return
    }

    clearInterval(locationInterval)

    locationInterval = null
  }

  function startTracking() {
    if (serviceWebSocketStore.tracking) {
      return
    }

    serviceWebSocketStore.setTracking(true)
    startSendingLocation()
    watchPosition()

    connect()
  }

  function stopTracking() {
    stopSendingLocation()
    stopWatching()

    serviceWebSocketStore.setTracking(false)
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    websocket,

    latitude,
    longitude,
    accuracy,
    geolocationError,

    connect,
    disconnect,

    startTracking,
    stopTracking,

    sendLocation,
  }
}
export class WebSocketService {
  constructor(serviceId, token, handlers = {}, options = {}) {
    this.serviceId = serviceId
    this.token = token
    this.handlers = handlers
    this.socket = null
    this.manuallyClosed = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 20
    this.reconnectDelay = options.reconnectDelay ?? 3000
    this.maxReconnectDelay = options.maxReconnectDelay ?? 30000
    this.reconnectTimer = null
  }

  connect() {
    if (this.socket) {
      return
    }

    this.manuallyClosed = false

    const url = this.buildUrl()
    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.handlers.onOpen?.()
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handlers.onMessage?.(message)
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error)
      }
    }

    this.socket.onerror = (error) => {
      this.handlers.onError?.(error)
    }

    this.socket.onclose = (event) => {
      this.socket = null
      this.handlers.onClose?.(event)

      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (this.manuallyClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts += 1

    const delay = Math.min(
      this.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
      this.maxReconnectDelay,
    )

    this.reconnectTimer = setTimeout(() => {
      if (!this.manuallyClosed) {
        this.connect()
      }
    }, delay)
  }

  disconnect() {
    this.manuallyClosed = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (!this.socket) {
      return false
    }

    this.socket.close()
    this.socket = null

    return true
  }

  stopReconnecting() {
    this.manuallyClosed = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  sendMessage(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket não está conectado.')
      return
    }

    this.socket.send(JSON.stringify(message))

    return true
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  buildUrl() {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL

    const url = new URL(`/ws/services/${this.serviceId}/`, baseUrl)

    url.searchParams.set('token', this.token)

    return url.toString()
  }
}
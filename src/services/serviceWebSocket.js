export class WebSocketService {
  constructor(serviceId, token, handlers = {}) {
    this.serviceId = serviceId
    this.token = token
    this.handlers = handlers
    this.socket = null
  }

  connect() {
    if (this.socket) {
      return
    }

    const url = this.buildUrl()
    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
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
    }
  }

  disconnect() {
    if (!this.socket) {
      return false
    }

    this.socket.close()
    this.socket = null
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

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/service', () => ({
  confirmService: vi.fn(),
  rejectService: vi.fn(),
  cancelService: vi.fn(),
  startService: vi.fn(),
}))
vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import * as serviceService from '@/services/service'
import { useServiceWebSocketStore } from '../serviceWebSocket'
import { useServiceStore } from '../services'
import { useAuthStore } from '../auth'

function setup(providerMode = true) {
  const auth = useAuthStore()
  auth.user = providerMode
    ? { client_profile: null, provider_profile: { id: 1 } }
    : { client_profile: { id: 1 }, provider_profile: null }
  const services = useServiceStore()
  services.fetchPendingCount = vi.fn()
  const ws = useServiceWebSocketStore()
  ws.setService({ id: 9, status: 1 })
  return { ws, services }
}

describe('contador de pedidos pendentes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it.each([
    ['confirmService', 'confirmService'],
    ['rejectService', 'rejectService'],
    ['cancelService', 'cancelService'],
  ])('%s atualiza o contador no modo passeador', async (action, fn) => {
    const { ws, services } = setup(true)
    serviceService[fn].mockResolvedValue({ id: 9, status: 2 })
    await ws[action]()
    expect(services.fetchPendingCount).toHaveBeenCalledTimes(1)
  })

  it('nao atualiza no modo tutor', async () => {
    const { ws, services } = setup(false)
    serviceService.cancelService.mockResolvedValue({ id: 9, status: 5 })
    await ws.cancelService()
    expect(services.fetchPendingCount).not.toHaveBeenCalled()
  })

  it('nao atualiza quando a acao falha', async () => {
    const { ws, services } = setup(true)
    serviceService.confirmService.mockRejectedValue({ message: 'x' })
    await expect(ws.confirmService()).rejects.toBeTruthy()
    expect(services.fetchPendingCount).not.toHaveBeenCalled()
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/service', () => ({
  getServices: vi.fn(),
  getService: vi.fn(),
  updateService: vi.fn(),
}))
vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import * as serviceService from '@/services/service'
import { useServiceStore } from '../services'

describe('services store (erro de carregamento)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setActivePinia(createPinia())
  })

  it('expõe serviceError quando getServices falha', async () => {
    serviceService.getServices.mockRejectedValue(new Error('falhou'))
    const s = useServiceStore()
    await s.getServices()
    expect(s.serviceError).toBe('falhou')
  })

  it('limpa serviceError ao carregar com sucesso', async () => {
    serviceService.getServices.mockRejectedValueOnce(new Error('falhou'))
    serviceService.getServices.mockResolvedValueOnce({ results: [{ id: 1 }] })
    const s = useServiceStore()
    await s.getServices()
    await s.getServices()
    expect(s.serviceError).toBe('')
    expect(s.serivces).toEqual([{ id: 1 }])
  })
})

import { useAuthStore } from '../auth'

describe('services store (contador de pedidos)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('fetchPendingCount escopa por status 1 e prestador e usa count', async () => {
    useAuthStore().user = { provider_profile: { id: 7 } }
    serviceService.getServices.mockResolvedValue({ count: 12, results: [{}] })
    const s = useServiceStore()
    await s.fetchPendingCount()
    expect(serviceService.getServices).toHaveBeenCalledWith({ status: 1, provider: 7 })
    expect(s.pendingCount).toBe(12)
  })

  it('sem perfil de prestador nao consulta e zera', async () => {
    useAuthStore().user = { client_profile: { id: 3 } }
    const s = useServiceStore()
    await s.fetchPendingCount()
    expect(serviceService.getServices).not.toHaveBeenCalled()
    expect(s.pendingCount).toBe(0)
  })
})

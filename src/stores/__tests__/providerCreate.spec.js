import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/providerService', () => ({ createProvider: vi.fn() }))
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import * as providerService from '@/services/providerService'
import notify from '@/utils/notify'
import { useProviderStore } from '../provider'

describe('provider createProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('falha mostra o erro da API e devolve false', async () => {
    providerService.createProvider.mockRejectedValue({
      response: { status: 400, data: { price_per_hour: ['A valid number is required.'] } },
    })
    expect(await useProviderStore().createProvider({})).toBe(false)
    expect(notify.error).toHaveBeenCalledWith(expect.stringContaining('Informe um número válido.'))
  })

  it('com onError entrega o erro bruto sem toast', async () => {
    const error = { response: { status: 400, data: {} } }
    providerService.createProvider.mockRejectedValue(error)
    const onError = vi.fn()
    expect(await useProviderStore().createProvider({}, { onError })).toBe(false)
    expect(onError).toHaveBeenCalledWith(error)
    expect(notify.error).not.toHaveBeenCalled()
  })

  it('sucesso devolve true sem toast proprio', async () => {
    providerService.createProvider.mockResolvedValue({ id: 3 })
    expect(await useProviderStore().createProvider({})).toBe(true)
    expect(notify.success).not.toHaveBeenCalled()
  })
})

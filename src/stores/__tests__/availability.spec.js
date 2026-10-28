import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/availabilityService', () => ({
  getAvailabilitySlots: vi.fn(),
  getMyAvailability: vi.fn(),
  createAvailability: vi.fn(),
  removeAvailability: vi.fn(),
}))
vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import * as service from '@/services/availabilityService'
import notify from '@/utils/notify'
import { useAvailabilityStore } from '../availability'

const interval = { id: 1, weekday: 0, start_time: '08:00', end_time: '12:00' }

describe('availability store (agenda)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('fetchMine carrega os intervalos', async () => {
    service.getMyAvailability.mockResolvedValue([interval])
    const s = useAvailabilityStore()
    await s.fetchMine()
    expect(s.intervals).toEqual([interval])
    expect(s.intervalsLoading).toBe(false)
  })

  it('fetchMine com erro guarda mensagem', async () => {
    service.getMyAvailability.mockRejectedValue({ message: 'Falhou' })
    const s = useAvailabilityStore()
    await s.fetchMine()
    expect(s.intervalsError).toBe('Falhou')
    expect(s.intervals).toEqual([])
  })

  it('create adiciona na lista', async () => {
    service.createAvailability.mockResolvedValue(interval)
    const s = useAvailabilityStore()
    const payload = { weekday: 0, start_time: '08:00', end_time: '12:00' }
    await s.create(payload)
    expect(service.createAvailability).toHaveBeenCalledWith(payload)
    expect(s.intervals).toEqual([interval])
  })

  it('create com erro notifica com a mensagem da API e relanca', async () => {
    service.createAvailability.mockRejectedValue({ message: 'Horário sobreposto.' })
    const s = useAvailabilityStore()
    await expect(s.create({ weekday: 0, start_time: '08:00', end_time: '12:00' })).rejects.toBeTruthy()
    expect(notify.error).toHaveBeenCalledWith('Horário sobreposto.')
    expect(s.intervals).toEqual([])
  })

  it('remove tira da lista', async () => {
    service.getMyAvailability.mockResolvedValue([interval])
    service.removeAvailability.mockResolvedValue()
    const s = useAvailabilityStore()
    await s.fetchMine()
    await s.remove(1)
    expect(service.removeAvailability).toHaveBeenCalledWith(1)
    expect(s.intervals).toEqual([])
  })

  it('remove com erro notifica, relanca e mantem a lista', async () => {
    service.getMyAvailability.mockResolvedValue([interval])
    service.removeAvailability.mockRejectedValue({ message: 'Não encontrado.' })
    const s = useAvailabilityStore()
    await s.fetchMine()
    await expect(s.remove(1)).rejects.toBeTruthy()
    expect(notify.error).toHaveBeenCalledWith('Não encontrado.')
    expect(s.intervals).toEqual([interval])
  })
})

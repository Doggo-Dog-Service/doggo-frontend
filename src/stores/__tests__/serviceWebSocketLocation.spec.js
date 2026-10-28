import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/service', () => ({}))
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import { useServiceWebSocketStore } from '../serviceWebSocket'

describe('serviceWebSocket lastLocationAt', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts null, is set by updateLocation and cleared by reset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
    const store = useServiceWebSocketStore()
    expect(store.lastLocationAt).toBeNull()
    store.updateLocation({ latitude: 1, longitude: 2 }, 10)
    expect(store.lastLocationAt).toBe(new Date('2026-10-28T12:00:00Z').getTime())
    store.resetLocationState()
    expect(store.lastLocationAt).toBeNull()
    vi.useRealTimers()
  })
})

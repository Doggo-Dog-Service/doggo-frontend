import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

const client = { id: 1, client_profile: { id: 1 }, provider_profile: null }
const provider = { id: 2, client_profile: null, provider_profile: { id: 2 } }
const both = { id: 3, client_profile: { id: 3 }, provider_profile: { id: 3 } }

describe('auth mode', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('only client -> client, no switch', () => {
    const s = useAuthStore()
    s.user = client
    expect(s.mode).toBe('client')
    expect(s.hasBothProfiles).toBe(false)
  })

  it('only provider -> provider', () => {
    const s = useAuthStore()
    s.user = provider
    expect(s.mode).toBe('provider')
  })

  it('both with saved provider -> provider', () => {
    localStorage.setItem('doggo-mode', 'provider')
    const s = useAuthStore()
    s.user = both
    expect(s.hasBothProfiles).toBe(true)
    expect(s.mode).toBe('provider')
  })

  it('both without saved -> client', () => {
    const s = useAuthStore()
    s.user = both
    expect(s.mode).toBe('client')
  })

  it('no profile -> null', () => {
    const s = useAuthStore()
    s.user = { id: 4, client_profile: null, provider_profile: null }
    expect(s.mode).toBeNull()
  })

  it('setMode persists and changes mode when both profiles', () => {
    const s = useAuthStore()
    s.user = both
    s.setMode('provider')
    expect(s.mode).toBe('provider')
    expect(localStorage.getItem('doggo-mode')).toBe('provider')
  })

  it('setMode ignores a mode the user does not have', () => {
    const s = useAuthStore()
    s.user = client
    s.setMode('provider')
    expect(s.mode).toBe('client')
  })

  it('blocked localStorage does not break', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const s = useAuthStore()
    s.user = both
    expect(s.mode).toBe('client')
    expect(() => s.setMode('provider')).not.toThrow()
    expect(s.mode).toBe('provider')
  })
})

describe('auth logout', () => {
  it('limpa a pendencia de cadastro', () => {
    localStorage.setItem('doggo-signup-pending', JSON.stringify({ provider: true, userId: 1 }))
    setActivePinia(createPinia())
    useAuthStore().logout()
    expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
  })
})

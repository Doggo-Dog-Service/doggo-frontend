import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/authService', () => ({ updateUser: vi.fn() }))
vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import * as authService from '@/services/authService'
import notify from '@/utils/notify'
import { useAuthStore } from '../auth'

describe('auth updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('envia full_name e phone ao usuário logado e atualiza o nome', async () => {
    authService.updateUser.mockResolvedValue({ id: 7, full_name: 'Ana Souza' })
    const s = useAuthStore()
    s.user = { id: 7, full_name: 'Ana', client_profile: { id: 1 }, provider_profile: null }
    const ok = await s.updateProfile({ full_name: 'Ana Souza', phone: '11999999999' })
    expect(authService.updateUser).toHaveBeenCalledWith(7, { full_name: 'Ana Souza', phone: '11999999999' })
    expect(ok).toBe(true)
    expect(s.user.full_name).toBe('Ana Souza')
    expect(s.mode).toBe('client')
  })

  it('erro notifica e devolve false sem alterar o usuário', async () => {
    authService.updateUser.mockRejectedValue({ message: 'Telefone: inválido.' })
    const s = useAuthStore()
    s.user = { id: 7, full_name: 'Ana', client_profile: { id: 1 }, provider_profile: null }
    const ok = await s.updateProfile({ full_name: 'X', phone: '1' })
    expect(ok).toBe(false)
    expect(notify.error).toHaveBeenCalledWith('Telefone: inválido.')
    expect(s.user.full_name).toBe('Ana')
  })
})

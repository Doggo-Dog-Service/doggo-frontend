import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/token', () => ({ getAccessToken: vi.fn() }))

import { getAccessToken } from '@/utils/token'
import router, { createGuard } from '../index'

const routeOf = (name) => {
  const r = router.resolve({ name })
  return { name: r.name, meta: r.meta, fullPath: r.fullPath }
}

describe('router guard', () => {
  let auth
  beforeEach(() => {
    getAccessToken.mockReturnValue('token')
    auth = { mode: 'client' }
  })

  it('protected route without token -> login with redirect', () => {
    getAccessToken.mockReturnValue(null)
    const to = { meta: { requiresAuth: true }, fullPath: '/pets/' }
    expect(createGuard(auth)(to)).toEqual({ name: 'login-view', query: { redirect: '/pets/' } })
  })

  it('client mode opening provider route -> home-view', () => {
    expect(createGuard(auth)(routeOf('provider-today-view'))).toEqual({ name: 'home-view' })
  })

  it('provider mode opening client route -> provider-today-view', () => {
    auth.mode = 'provider'
    expect(createGuard(auth)(routeOf('pets-view'))).toEqual({ name: 'provider-today-view' })
  })

  it('route without meta.mode passes in any mode', () => {
    const to = routeOf('services-view')
    expect(createGuard(auth)(to)).toBeUndefined()
    auth.mode = 'provider'
    expect(createGuard(auth)(to)).toBeUndefined()
  })

  it('redirect target passes the guard (no loop)', () => {
    for (const mode of ['client', 'provider']) {
      for (const name of ['home-view', 'provider-today-view', 'pets-view', 'agenda-view']) {
        auth.mode = mode
        const dest = createGuard(auth)(routeOf(name))
        if (dest) expect(createGuard(auth)(routeOf(dest.name))).toBeUndefined()
      }
    }
  })
})

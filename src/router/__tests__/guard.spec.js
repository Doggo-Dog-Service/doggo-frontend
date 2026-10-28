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

const signupRoute = (etapa) => ({
  name: 'signup-view',
  meta: {},
  query: etapa === undefined ? {} : { etapa },
  fullPath: '/auth/cadastro' + (etapa === undefined ? '' : '?etapa=' + etapa),
})

describe('router guard (usuário logado em telas de auth)', () => {
  beforeEach(() => getAccessToken.mockReturnValue('token'))

  it('login-view e signup-view redirecionam para a home do modo', () => {
    expect(createGuard({ mode: 'client' })(routeOf('login-view'))).toEqual({ name: 'home-view' })
    expect(createGuard({ mode: 'provider' })(signupRoute('2'))).toEqual({ name: 'provider-today-view' })
  })

  it('sem token, login-view passa', () => {
    getAccessToken.mockReturnValue(null)
    expect(createGuard({ mode: null })(routeOf('login-view'))).toBeUndefined()
  })
})

describe('router guard (retomada do cadastro)', () => {
  beforeEach(() => getAccessToken.mockReturnValue('token'))

  it('autenticado sem perfil em rota protegida -> signup etapa 3', () => {
    expect(createGuard({ mode: null })(routeOf('home-view'))).toEqual({
      name: 'signup-view',
      query: { etapa: '3' },
    })
  })

  it('autenticado sem perfil em signup-view passa (sem loop)', () => {
    expect(createGuard({ mode: null })(signupRoute('3'))).toBeUndefined()
  })

  it('rota protegida sem modo especifico tambem retoma', () => {
    expect(createGuard({ mode: null })(routeOf('services-view'))).toEqual({
      name: 'signup-view',
      query: { etapa: '3' },
    })
  })

  it('visitante em signup etapa 1 e 2 passa', () => {
    getAccessToken.mockReturnValue(null)
    expect(createGuard({ mode: null })(signupRoute('1'))).toBeUndefined()
    expect(createGuard({ mode: null })(signupRoute('2'))).toBeUndefined()
    expect(createGuard({ mode: null })(signupRoute(undefined))).toBeUndefined()
  })

  it('visitante em signup etapa >= 3 -> etapa 1', () => {
    getAccessToken.mockReturnValue(null)
    for (const etapa of ['3', '4', '5']) {
      expect(createGuard({ mode: null })(signupRoute(etapa))).toEqual({
        name: 'signup-view',
        query: { etapa: '1' },
      })
    }
  })

  it('etapa invalida e tratada como 1', () => {
    getAccessToken.mockReturnValue(null)
    expect(createGuard({ mode: null })(signupRoute('abc'))).toBeUndefined()
  })

  it('redirects antigos de cadastro apontam para signup-view', () => {
    expect(router.resolve('/auth/register').matched.at(-1).redirect).toEqual({ name: 'signup-view' })
    expect(router.resolve('/auth/register/location/2').matched.at(-1).redirect).toEqual({ name: 'signup-view' })
  })
})

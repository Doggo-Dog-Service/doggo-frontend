import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosError } from 'axios'
import api, { setUnauthorizedHandler } from '../axios'
import { getAccessToken, setAccessToken, setRefreshToken, getRefreshToken } from '@/utils/token'

let calls
let responder

const reply = (config, status, data = {}) => {
  const response = { data, status, statusText: '', headers: {}, config }
  if (status >= 200 && status < 300) return Promise.resolve(response)
  return Promise.reject(new AxiosError('fail', 'ERR', config, null, response))
}

beforeEach(() => {
  localStorage.clear()
  calls = []
  setAccessToken('old')
  setRefreshToken('ref')
  setUnauthorizedHandler(null)
  api.defaults.adapter = (config) => {
    calls.push({ url: config.url, auth: config.headers.Authorization, data: config.data })
    return responder(config)
  }
})

describe('interceptor de refresh', () => {
  it('401 renova token e repete a requisição com o novo', async () => {
    responder = (config) => {
      if (config.url === '/token/refresh/') return reply(config, 200, { access: 'new' })
      return config.headers.Authorization === 'Bearer new'
        ? reply(config, 200, { ok: true })
        : reply(config, 401)
    }
    const res = await api.get('/profile/')
    expect(res.data).toEqual({ ok: true })
    expect(getAccessToken()).toBe('new')
    expect(calls.map((c) => c.url)).toEqual(['/profile/', '/token/refresh/', '/profile/'])
    expect(JSON.parse(calls[1].data)).toEqual({ refresh: 'ref' })
  })

  it('3 requisições 401 simultâneas geram 1 refresh', async () => {
    responder = (config) => {
      if (config.url === '/token/refresh/') return reply(config, 200, { access: 'new' })
      return config.headers.Authorization === 'Bearer new' ? reply(config, 200) : reply(config, 401)
    }
    await Promise.all([api.get('/a/'), api.get('/b/'), api.get('/c/')])
    expect(calls.filter((c) => c.url === '/token/refresh/')).toHaveLength(1)
  })

  it('refresh 401 limpa tokens, chama handler e não repete', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    responder = (config) => reply(config, 401)
    await expect(api.get('/profile/')).rejects.toBeTruthy()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(calls.map((c) => c.url)).toEqual(['/profile/', '/token/refresh/'])
  })

  it('sem refresh token limpa e chama handler sem chamar refresh', async () => {
    localStorage.clear()
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    responder = (config) => reply(config, 401)
    await expect(api.get('/profile/')).rejects.toBeTruthy()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(calls.map((c) => c.url)).toEqual(['/profile/'])
  })

  it.each(['/token/', '/token/refresh/'])('401 em %s não dispara refresh', async (url) => {
    responder = (config) => reply(config, 401)
    await expect(api.post(url, {})).rejects.toBeTruthy()
    expect(calls).toHaveLength(1)
    expect(getAccessToken()).toBe('old')
  })

  it('requisição repetida que volta 401 não repete de novo', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    responder = (config) => {
      if (config.url === '/token/refresh/') return reply(config, 200, { access: 'new' })
      return reply(config, 401)
    }
    await expect(api.get('/profile/')).rejects.toBeTruthy()
    expect(calls.map((c) => c.url)).toEqual(['/profile/', '/token/refresh/', '/profile/'])
  })

  it('erro não-401 passa direto', async () => {
    responder = (config) => reply(config, 500)
    await expect(api.get('/x/')).rejects.toBeTruthy()
    expect(calls).toHaveLength(1)
  })
})

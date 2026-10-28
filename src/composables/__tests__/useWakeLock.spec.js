import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useWakeLock } from '../useWakeLock'

function mountHost() {
  let api
  const Host = defineComponent({
    setup() {
      api = useWakeLock()
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { api, wrapper }
}

function makeSentinel() {
  const listeners = {}
  return {
    released: false,
    release: vi.fn(async function () { this.released = true; listeners.release?.() }),
    addEventListener: (ev, fn) => { listeners[ev] = fn },
    fireRelease() { this.released = true; listeners.release?.() },
  }
}

function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useWakeLock', () => {
  let request
  let sentinels

  beforeEach(() => {
    sentinels = []
    request = vi.fn(async () => {
      const s = makeSentinel()
      sentinels.push(s)
      return s
    })
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true })
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  })

  afterEach(() => {
    delete navigator.wakeLock
  })

  it('sem suporte: supported=false e request não lança', async () => {
    delete navigator.wakeLock
    const { api } = mountHost()
    expect(api.supported).toBe(false)
    await expect(api.request()).resolves.toBeUndefined()
    expect(api.active.value).toBe(false)
  })

  it('request chama wakeLock.request("screen") e ativa', async () => {
    const { api } = mountHost()
    expect(api.supported).toBe(true)
    await api.request()
    expect(request).toHaveBeenCalledWith('screen')
    expect(api.active.value).toBe(true)
  })

  it('pede de novo ao voltar a ficar visível após liberação pelo SO', async () => {
    const { api } = mountHost()
    await api.request()
    sentinels[0].fireRelease()
    expect(api.active.value).toBe(false)
    setVisibility('visible')
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    await vi.waitFor(() => expect(api.active.value).toBe(true))
  })

  it('release libera e não reativa ao voltar a ficar visível', async () => {
    const { api } = mountHost()
    await api.request()
    await api.release()
    expect(sentinels[0].release).toHaveBeenCalled()
    expect(api.active.value).toBe(false)
    setVisibility('visible')
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('unmount libera', async () => {
    const { api, wrapper } = mountHost()
    await api.request()
    wrapper.unmount()
    expect(sentinels[0].release).toHaveBeenCalled()
  })

  it('falha do request não lança', async () => {
    request.mockRejectedValueOnce(new Error('NotAllowed'))
    const { api } = mountHost()
    await expect(api.request()).resolves.toBeUndefined()
    expect(api.active.value).toBe(false)
  })
})

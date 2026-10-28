import { beforeEach, describe, expect, it, vi } from 'vitest'

function mockMatchMedia(matches) {
  const listeners = new Set()
  const mql = {
    matches,
    addEventListener: (_, cb) => listeners.add(cb),
    removeEventListener: (_, cb) => listeners.delete(cb),
  }
  window.matchMedia = vi.fn(() => mql)
  return {
    change(next) {
      mql.matches = next
      listeners.forEach((cb) => cb({ matches: next }))
    },
  }
}

async function load() {
  vi.resetModules()
  return (await import('../useTheme.js')).useTheme()
}

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.head.innerHTML = '<meta name="theme-color" content="#F7F8FA">'
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('setPreference("dark") adiciona .dark e grava doggo-theme', async () => {
    mockMatchMedia(false)
    const theme = await load()
    theme.setPreference('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('doggo-theme')).toBe('dark')
    expect(theme.resolved.value).toBe('dark')
  })

  it('setPreference("light") remove .dark', async () => {
    mockMatchMedia(true)
    const theme = await load()
    theme.setPreference('dark')
    theme.setPreference('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(theme.resolved.value).toBe('light')
  })

  it('"system" segue matchMedia e reage a mudancas', async () => {
    const media = mockMatchMedia(true)
    const theme = await load()
    theme.setPreference('system')
    expect(theme.resolved.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    media.change(false)
    expect(theme.resolved.value).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('localStorage lancando excecao nao quebra e usa system', async () => {
    mockMatchMedia(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const theme = await load()
    expect(theme.preference.value).toBe('system')
    expect(() => theme.setPreference('dark')).not.toThrow()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('meta theme-color vira #0D1117 no escuro e #F7F8FA no claro', async () => {
    mockMatchMedia(false)
    const theme = await load()
    const meta = () => document.querySelector('meta[name=theme-color]').content
    theme.setPreference('dark')
    expect(meta()).toBe('#0D1117')
    theme.setPreference('light')
    expect(meta()).toBe('#F7F8FA')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LiveWalkSignal from '../LiveWalkSignal.vue'

const T0 = new Date('2026-10-28T12:00:00Z').getTime()

describe('LiveWalkSignal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
  })
  afterEach(() => vi.useRealTimers())

  it('none: waits for first location', () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: null } })
    expect(w.text()).toContain('Aguardando a primeira localização')
  })

  it('live: Ao vivo', () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: T0 - 5000 } })
    expect(w.text()).toContain('Ao vivo')
  })

  it('stale: Atualizando…', () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: T0 - 45000 } })
    expect(w.text()).toContain('Atualizando…')
  })

  it('lost: Sinal perdido há X min', () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: T0 - 125000 } })
    expect(w.text()).toContain('Sinal perdido há 2 min')
  })

  it('updates every 10 s without new props', async () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: T0 } })
    expect(w.text()).toContain('Ao vivo')
    vi.advanceTimersByTime(40000)
    await w.vm.$nextTick()
    expect(w.text()).toContain('Atualizando…')
    vi.advanceTimersByTime(30000)
    await w.vm.$nextTick()
    expect(w.text()).toContain('Sinal perdido há 1 min')
  })

  it('clears timer on unmount', () => {
    const w = mount(LiveWalkSignal, { props: { lastAt: T0 } })
    w.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

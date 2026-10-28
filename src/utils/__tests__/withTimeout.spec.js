import { afterEach, describe, expect, it, vi } from 'vitest'
import { withTimeout } from '../withTimeout'

describe('withTimeout', () => {
  afterEach(() => vi.useRealTimers())

  it('resolve com o valor quando a promessa responde a tempo', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 1000)).resolves.toBe('ok')
  })

  it('rejeita com timeout quando a promessa nunca responde', async () => {
    vi.useFakeTimers()
    const result = withTimeout(new Promise(() => {}), 5000)
    const assertion = expect(result).rejects.toThrow('timeout')
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
  })

  it('propaga a rejeicao original e limpa o timer', async () => {
    vi.useFakeTimers()
    await expect(withTimeout(Promise.reject(new Error('negado')), 5000)).rejects.toThrow('negado')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('aceita valor que nao e promessa', async () => {
    await expect(withTimeout(undefined, 1000)).resolves.toBeUndefined()
  })
})

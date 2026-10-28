import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue3-toastify', () => {
  const toast = vi.fn()
  toast.success = vi.fn()
  toast.error = vi.fn()
  toast.info = vi.fn()
  toast.promise = vi.fn()
  return { toast }
})

import { toast } from 'vue3-toastify'
import notify from '../notify.js'

describe('notify', () => {
  beforeEach(() => vi.clearAllMocks())

  it('success chama toast.success com a mensagem', () => {
    notify.success('ok')
    expect(toast.success).toHaveBeenCalledWith('ok')
  })

  it('error chama toast.error com a mensagem', () => {
    notify.error('falhou')
    expect(toast.error).toHaveBeenCalledWith('falhou')
  })

  it('info chama toast.info com a mensagem', () => {
    notify.info('aviso')
    expect(toast.info).toHaveBeenCalledWith('aviso')
  })

  it('promise repassa a promise e os textos pending/success/error', () => {
    const p = Promise.resolve(1)
    notify.promise(p, { pending: 'a', success: 'b', error: 'c' })
    expect(toast.promise).toHaveBeenCalledWith(p, { pending: 'a', success: 'b', error: 'c' })
  })

  it('error usa .message de objetos Error', () => {
    notify.error(new Error('boom'))
    expect(toast.error).toHaveBeenCalledWith('boom')
  })

  it('error sem mensagem usa o texto padrão', () => {
    notify.error()
    notify.error('')
    notify.error(null)
    expect(toast.error).toHaveBeenCalledTimes(3)
    for (const call of toast.error.mock.calls) {
      expect(call).toEqual(['Ocorreu um erro. Tente novamente.'])
    }
  })

  it('success e info nunca mostram toast vazio', () => {
    notify.success('')
    notify.info(undefined)
    expect(toast.success).toHaveBeenCalledWith('Operação concluída.')
    expect(toast.info).toHaveBeenCalledWith('Atenção.')
  })
})

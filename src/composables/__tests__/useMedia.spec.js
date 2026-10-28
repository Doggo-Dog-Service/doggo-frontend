import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  postImage: vi.fn(),
  postDocument: vi.fn(),
  error: vi.fn(),
}))
vi.mock('@/services/mediaService', () => ({ postImage: mocks.postImage, postDocument: mocks.postDocument }))
vi.mock('@/utils/notify', () => ({ default: { error: mocks.error, success: vi.fn() } }))

import { useMedia } from '../useMedia'

const axiosError = (data) => ({ message: 'Request failed with status code 400', response: { status: 400, data } })

describe('useMedia', () => {
  beforeEach(() => vi.clearAllMocks())

  it('postImage mostra a mensagem do backend, não o texto genérico do axios', async () => {
    mocks.postImage.mockRejectedValue(axiosError({ detail: 'A imagem deve ter no máximo 5 MB.' }))
    const { postImage, loading } = useMedia()
    await postImage({ file: {}, description: 'x' })
    expect(mocks.error).toHaveBeenCalledWith('A imagem deve ter no máximo 5 MB.')
    expect(loading.value).toBe(false)
  })

  it('postImage lê erro por campo', async () => {
    mocks.postImage.mockRejectedValue(axiosError({ file: ['A imagem deve ter no máximo 5 MB.'] }))
    const { postImage } = useMedia()
    await postImage({ file: {}, description: 'x' })
    expect(mocks.error.mock.calls[0][0]).toContain('A imagem deve ter no máximo 5 MB.')
  })

  it('postDocument mostra a mensagem do backend', async () => {
    mocks.postDocument.mockRejectedValue(axiosError({ file: ['Arquivo inválido.'] }))
    const { postDocument } = useMedia()
    await postDocument({ file: {}, description: 'x' })
    expect(mocks.error.mock.calls[0][0]).toContain('Arquivo inválido.')
  })
})

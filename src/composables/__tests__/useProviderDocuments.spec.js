import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  postDocument: vi.fn(),
  fetchMyDocuments: vi.fn(),
  saveMyDocument: vi.fn(),
  notify: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/composables/useMedia', () => ({ useMedia: () => ({ postDocument: mocks.postDocument }) }))
vi.mock('@/services/providerService', () => ({
  fetchMyDocuments: mocks.fetchMyDocuments,
  saveMyDocument: mocks.saveMyDocument,
}))
vi.mock('@/utils/notify', () => ({ default: mocks.notify }))

import { useProviderDocuments } from '../useProviderDocuments'

describe('useProviderDocuments', () => {
  let docs
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.postDocument.mockResolvedValue({ attachment_key: 'k1' })
    mocks.saveMyDocument.mockResolvedValue({})
    mocks.fetchMyDocuments.mockResolvedValue([{ kind: 'doc_front', url: 'u', created_at: 'd' }])
    docs = useProviderDocuments()
  })

  it('load preenche a lista', async () => {
    await docs.load()
    expect(docs.documents.value).toHaveLength(1)
  })

  it('load com erro deixa lista vazia', async () => {
    mocks.fetchMyDocuments.mockRejectedValue(new Error('x'))
    await docs.load()
    expect(docs.documents.value).toEqual([])
  })

  it('sendDocument envia arquivo e grava com a chave', async () => {
    const file = new File(['x'], 'a.pdf')
    expect(await docs.sendDocument('doc_front', file)).toBe(true)
    expect(mocks.postDocument).toHaveBeenCalledWith({ file, description: 'doc_front' })
    expect(mocks.saveMyDocument).toHaveBeenCalledWith({ kind: 'doc_front', document_attachment_key: 'k1' })
  })

  it('upload sem chave nao grava', async () => {
    mocks.postDocument.mockResolvedValue(undefined)
    expect(await docs.sendDocument('doc_back', new File(['x'], 'a.pdf'))).toBe(false)
    expect(mocks.saveMyDocument).not.toHaveBeenCalled()
  })

  it('falha ao gravar avisa e devolve false', async () => {
    mocks.saveMyDocument.mockRejectedValue({ message: 'ruim' })
    expect(await docs.sendDocument('doc_back', new File(['x'], 'a.pdf'))).toBe(false)
    expect(mocks.notify.error).toHaveBeenCalled()
  })
})

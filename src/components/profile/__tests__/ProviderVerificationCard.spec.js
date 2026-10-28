import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  fetchMyDocuments: vi.fn(),
  saveMyDocument: vi.fn(),
  postDocument: vi.fn(),
  notify: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/services/providerService', () => ({
  fetchMyDocuments: mocks.fetchMyDocuments,
  saveMyDocument: mocks.saveMyDocument,
}))
vi.mock('@/composables/useMedia', () => ({ useMedia: () => ({ postDocument: mocks.postDocument }) }))
vi.mock('@/utils/notify', () => ({ default: mocks.notify }))

import ProviderVerificationCard from '../ProviderVerificationCard.vue'
import { useAuthStore } from '@/stores/auth'

let auth

function setup(profile) {
  setActivePinia(createPinia())
  auth = useAuthStore()
  auth.user = { id: 1, provider_profile: { id: 2, ...profile } }
  auth.fetchUser = vi.fn().mockResolvedValue()
  return mount(ProviderVerificationCard)
}

function pickFile(w, index, name = 'doc.png') {
  const input = w.findAll('input[type="file"]')[index]
  Object.defineProperty(input.element, 'files', { value: [new File(['x'], name)], configurable: true })
  return input.trigger('change')
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.fetchMyDocuments.mockResolvedValue([])
  mocks.postDocument.mockResolvedValue({ attachment_key: 'k1' })
  mocks.saveMyDocument.mockResolvedValue({})
})

describe('ProviderVerificationCard', () => {
  it.each([
    ['pending', 'Em análise'],
    ['approved', 'Aprovado'],
    ['rejected', 'Recusado'],
  ])('mostra o status %s', async (status, text) => {
    const w = setup({ verification_status: status })
    await flushPromises()
    expect(w.text()).toContain(text)
  })

  it('recusado mostra o motivo; em análise não', async () => {
    const rejected = setup({ verification_status: 'rejected', verification_note: 'Foto ilegível' })
    await flushPromises()
    expect(rejected.text()).toContain('Foto ilegível')
    const pending = setup({ verification_status: 'pending', verification_note: 'Foto ilegível' })
    await flushPromises()
    expect(pending.text()).not.toContain('Foto ilegível')
  })

  it('lista os documentos já enviados com link', async () => {
    mocks.fetchMyDocuments.mockResolvedValue([{ kind: 'doc_front', url: 'http://x/f.png', created_at: '2026-10-01T10:00:00Z' }])
    const w = setup({ verification_status: 'pending' })
    await flushPromises()
    const link = w.find('a[href="http://x/f.png"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('rel')).toContain('noopener')
  })

  it('envia o arquivo, recarrega a lista e o usuário', async () => {
    const w = setup({ verification_status: 'rejected', verification_note: 'x' })
    await flushPromises()
    await pickFile(w, 0)
    await w.find('button').trigger('click')
    await flushPromises()
    expect(mocks.saveMyDocument).toHaveBeenCalledWith({ kind: 'doc_front', document_attachment_key: 'k1' })
    expect(mocks.saveMyDocument).toHaveBeenCalledTimes(1)
    expect(mocks.fetchMyDocuments).toHaveBeenCalledTimes(2)
    expect(auth.fetchUser).toHaveBeenCalled()
    expect(mocks.notify.success).toHaveBeenCalled()
  })

  it('botão de enviar fica desabilitado sem arquivo', async () => {
    const w = setup({ verification_status: 'pending' })
    await flushPromises()
    expect(w.find('button').attributes('disabled')).toBeDefined()
  })

  it('falha no envio não recarrega o usuário', async () => {
    mocks.postDocument.mockResolvedValue(undefined)
    const w = setup({ verification_status: 'pending' })
    await flushPromises()
    await pickFile(w, 1)
    await w.find('button').trigger('click')
    await flushPromises()
    expect(auth.fetchUser).not.toHaveBeenCalled()
  })
})

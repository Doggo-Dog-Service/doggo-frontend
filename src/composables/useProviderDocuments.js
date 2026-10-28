import { ref } from 'vue'
import { useMedia } from '@/composables/useMedia'
import * as providerService from '@/services/providerService'
import notify from '@/utils/notify'

export const DOCUMENT_KINDS = [
  { kind: 'doc_front', label: 'Frente do documento' },
  { kind: 'doc_back', label: 'Verso do documento' },
]

// Documentos de verificação do passeador logado: lista, envio e regravação.
export function useProviderDocuments() {
  const { postDocument } = useMedia()
  const documents = ref([])
  const sending = ref(false)

  async function load() {
    try {
      documents.value = (await providerService.fetchMyDocuments()) ?? []
    } catch {
      documents.value = []
    }
  }

  // Sobe o arquivo e vincula ao tipo. Devolve true só se os dois passos funcionaram.
  async function sendDocument(kind, file) {
    sending.value = true
    try {
      const uploaded = await postDocument({ file, description: kind })
      if (!uploaded?.attachment_key) return false
      await providerService.saveMyDocument({ kind, document_attachment_key: uploaded.attachment_key })
      return true
    } catch (error) {
      notify.error(error?.message || 'Não foi possível salvar o documento.')
      return false
    } finally {
      sending.value = false
    }
  }

  return { documents, sending, load, sendDocument }
}

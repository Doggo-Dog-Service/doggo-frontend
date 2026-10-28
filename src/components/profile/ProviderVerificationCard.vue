<script setup>
import { computed, onMounted, reactive } from 'vue'
import { ExternalLink, Upload } from 'lucide-vue-next'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import DocumentInput from '@/components/inputs/DocumentInput.vue'
import { DOCUMENT_KINDS, useProviderDocuments } from '@/composables/useProviderDocuments'
import { useAuthStore } from '@/stores/auth'
import notify from '@/utils/notify'

const STATUS = {
  pending: { tone: 'warning', text: 'Em análise' },
  approved: { tone: 'success', text: 'Aprovado' },
  rejected: { tone: 'danger', text: 'Recusado' },
}

const authStore = useAuthStore()
const { documents, sending, load, sendDocument } = useProviderDocuments()
const files = reactive({ doc_front: null, doc_back: null })

const profile = computed(() => authStore.user?.provider_profile)
const status = computed(() => STATUS[profile.value?.verification_status] ?? STATUS.pending)
const isRejected = computed(() => profile.value?.verification_status === 'rejected')
const hasFiles = computed(() => DOCUMENT_KINDS.some(({ kind }) => files[kind]))
const sentByKind = computed(() => Object.fromEntries(documents.value.map((doc) => [doc.kind, doc])))

const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR')

async function send() {
  let ok = true
  for (const { kind } of DOCUMENT_KINDS) {
    if (!files[kind]) continue
    if (await sendDocument(kind, files[kind])) files[kind] = null
    else ok = false
  }
  await load()
  if (!ok) return
  try {
    await authStore.fetchUser()
  } catch {
    // os documentos já foram salvos; o status atualiza na próxima carga
  }
  notify.success('Documentos enviados')
}

onMounted(load)
</script>

<template>
  <UiCard padding="lg" class="flex flex-col gap-4" data-testid="verification-card">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-subtitle text-fg">Verificação</h2>
      <UiBadge :tone="status.tone">{{ status.text }}</UiBadge>
    </div>

    <p v-if="isRejected" role="alert" class="text-body text-danger">
      Seu perfil foi recusado.
      <template v-if="profile.verification_note">Motivo: {{ profile.verification_note }}</template>
      Envie os documentos novamente para uma nova análise.
    </p>
    <p v-else-if="profile?.verification_status !== 'approved'" class="text-body text-fg-muted">
      Seu perfil só aparece na busca depois de aprovado. Envie um documento com foto para agilizar.
    </p>

    <ul v-if="documents.length" class="flex flex-col gap-2" aria-label="Documentos enviados">
      <li v-for="{ kind, label } in DOCUMENT_KINDS.filter((k) => sentByKind[k.kind])" :key="kind" class="flex items-center justify-between gap-3 text-body text-fg">
        <span class="min-w-0">
          {{ label }}
          <span class="text-caption text-fg-muted">enviado em {{ formatDate(sentByKind[kind].created_at) }}</span>
        </span>
        <a
          :href="sentByKind[kind].url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-11 shrink-0 items-center gap-1 text-body font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver <ExternalLink :size="16" aria-hidden="true" />
        </a>
      </li>
    </ul>

    <DocumentInput
      v-for="{ kind, label } in DOCUMENT_KINDS"
      :key="kind"
      v-model="files[kind]"
      :label="sentByKind[kind] ? `Reenviar: ${label.toLowerCase()}` : label"
    />
    <AppButton
      text="Enviar documentos"
      variant="secondary"
      :icon="Upload"
      :disabled="!hasFiles"
      :loading="sending"
      @event="send"
    />
  </UiCard>
</template>

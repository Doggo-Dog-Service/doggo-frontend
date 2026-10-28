<script setup>
import { useSignupWizard } from '@/composables/useSignupWizard'
import DocumentInput from '@/components/inputs/DocumentInput.vue'

const { documents } = useSignupWizard()
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-body text-fg-muted">
      Envie um documento com foto (RG ou CNH) para verificarmos seu perfil. Você só aparece na busca depois da
      aprovação. Se preferir, envie depois pelo Perfil.
    </p>
    <DocumentInput v-model="documents.doc_front" label="Frente do documento" />
    <DocumentInput v-model="documents.doc_back" label="Verso do documento" />
  </div>
</template>

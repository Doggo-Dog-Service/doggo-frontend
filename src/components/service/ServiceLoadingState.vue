<script setup>
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 p-8" role="status">
    <Loader2 :size="40" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
    <p class="text-body text-fg-muted">Carregando serviço...</p>
  </div>
</template>

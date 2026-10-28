<script setup>
import { CheckCircle2 } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

defineProps({
  providerName: { type: String, default: 'O passeador' },
})

const linkBase =
  'inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-body font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
</script>

<template>
  <section role="status" class="flex flex-col items-center gap-4 p-4">
    <UiEmptyState
      :icon="CheckCircle2"
      title="Pedido enviado!"
      :description="`${providerName} vai confirmar em breve.`"
    />
    <div class="flex w-full max-w-sm flex-col gap-3">
      <RouterLink :to="{ name: 'services-view' }" :class="[linkBase, 'bg-primary text-primary-fg']">
        Ver meus passeios
      </RouterLink>
      <RouterLink
        :to="{ name: 'home-view' }"
        :class="[linkBase, 'border border-line text-fg hover:bg-surface-muted']"
      >
        Voltar ao início
      </RouterLink>
    </div>
  </section>
</template>

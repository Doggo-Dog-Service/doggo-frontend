<script setup>
import { computed } from 'vue'
import { MessageCircle } from 'lucide-vue-next'

const props = defineProps({
  phone: { type: String, default: null },
  text: { type: String, default: 'Olá! Sobre o passeio no DOGGO.' },
})

import { whatsappLink } from '@/utils/whatsapp'

const href = computed(() => whatsappLink(props.phone, props.text))
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 text-body font-semibold text-fg transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
  >
    <MessageCircle :size="20" :stroke-width="2" class="text-primary" aria-hidden="true" />
    Falar no WhatsApp
  </a>
</template>

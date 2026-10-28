<script setup>
import { computed } from 'vue'

import ServiceDetailsPanel from '@/components/service/ServiceDetailsPanel.vue'
import ServiceStatusBadge from '@/components/service/ServiceStatusBadge.vue'
import WhatsAppButton from '@/components/service/WhatsAppButton.vue'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

defineProps({
  role: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const store = useServiceWebSocketStore()

// O backend só envia contact_phone nos status 2 e 3.
const contactPhone = computed(() => store.service?.contact_phone ?? null)
</script>

<template>
  <section data-summary class="w-full flex flex-col gap-4">
    <header class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-display text-fg">{{ title }}</h1>
      <ServiceStatusBadge :status="store.status" />
      <p v-if="subtitle" class="text-body text-fg-muted">{{ subtitle }}</p>
    </header>

    <ServiceDetailsPanel :role="role" />

    <WhatsAppButton :phone="contactPhone" />

    <slot />
  </section>
</template>

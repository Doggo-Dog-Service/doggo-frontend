<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

import UiBadge from '@/components/ui/UiBadge.vue'
import { minutesSince, signalState } from '@/utils/signal'

const props = defineProps({
  // Timestamp (ms) da última posição recebida; null se nenhuma ainda.
  lastAt: { type: [Number, Date, String], default: null },
})

const now = ref(Date.now())
const timer = setInterval(() => {
  now.value = Date.now()
}, 10000)
onBeforeUnmount(() => clearInterval(timer))

const state = computed(() => signalState(props.lastAt, now.value))

const view = computed(() => {
  switch (state.value) {
    case 'live':
      return { tone: 'success', text: 'Ao vivo', pulse: true }
    case 'stale':
      return { tone: 'info', text: 'Atualizando…', pulse: false }
    case 'lost':
      return {
        tone: 'warning',
        text: `Sinal perdido há ${minutesSince(props.lastAt, now.value)} min`,
        pulse: false,
      }
    default:
      return { tone: 'neutral', text: 'Aguardando a primeira localização', pulse: false }
  }
})
</script>

<template>
  <UiBadge :tone="view.tone" role="status" :data-signal="state">
    <span class="relative flex size-2" aria-hidden="true">
      <span
        v-if="view.pulse"
        class="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping"
      ></span>
      <span class="relative inline-flex size-2 rounded-full bg-current"></span>
    </span>
    {{ view.text }}
  </UiBadge>
</template>

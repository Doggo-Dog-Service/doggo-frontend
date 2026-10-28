<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CalendarClock, Clock, Footprints, PawPrint } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const props = defineProps({
  kind: {
    type: String,
    required: true,
    validator: (v) => ['live', 'next', 'pending', 'empty'].includes(v),
  },
  service: { type: Object, default: null },
})

// Relógio em minutos: o tempo decorrido do passeio ao vivo não precisa de precisão de segundos.
const now = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 60000)
})
onUnmounted(() => clearInterval(timer))

const petNames = computed(() => {
  const names = (props.service?.pets ?? []).map((p) => p.name).filter(Boolean)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
})

const elapsed = computed(() => {
  const start = new Date(props.service?.started_at).getTime()
  if (Number.isNaN(start)) return ''
  const minutes = Math.max(0, Math.floor((now.value - start) / 60000))
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`
})

const startLabel = computed(() => {
  const date = new Date(props.service?.start_datetime)
  if (Number.isNaN(date.getTime())) return ''
  const day = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
  return `${day}, ${time}`
})

const serviceRoute = computed(() => ({ name: 'service-view', params: { id: props.service?.id } }))

const BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-body font-semibold transition-all duration-200 active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const BUTTON_PRIMARY = `${BUTTON} border-primary bg-primary text-primary-fg hover:opacity-90`
</script>

<template>
  <section
    v-if="kind === 'live'"
    class="flex flex-col gap-4 rounded-card border border-primary/20 bg-primary-soft p-5"
    aria-label="Passeio em andamento"
  >
    <div class="flex items-center justify-between gap-3">
      <UiBadge tone="brand" :icon="Footprints">Passeio em andamento</UiBadge>
      <span class="flex items-center gap-1 text-caption font-semibold text-primary">
        <UiIcon :icon="Clock" :size="14" />
        {{ elapsed }}
      </span>
    </div>
    <div class="flex items-center gap-3">
      <UiAvatar :src="service.provider_picture" :name="service.provider_name" size="lg" />
      <div class="min-w-0">
        <p class="truncate text-subtitle text-fg">{{ service.provider_name }}</p>
        <p class="truncate text-body text-fg-muted">Passeando com {{ petNames }}</p>
      </div>
    </div>
    <RouterLink :to="serviceRoute" :class="[BUTTON_PRIMARY, 'w-full sm:w-auto sm:self-start']">
      Acompanhar ao vivo
    </RouterLink>
  </section>

  <section
    v-else-if="kind === 'next'"
    class="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card"
    aria-label="Próximo passeio"
  >
    <UiBadge tone="info" :icon="CalendarClock" class="self-start">Próximo passeio</UiBadge>
    <div class="flex items-center gap-3">
      <UiAvatar :src="service.provider_picture" :name="service.provider_name" size="lg" />
      <div class="min-w-0">
        <p class="text-subtitle capitalize text-fg">{{ startLabel }}</p>
        <p class="truncate text-body text-fg-muted">
          {{ service.provider_name }}<span v-if="petNames"> · {{ petNames }}</span>
        </p>
      </div>
    </div>
    <RouterLink
      :to="serviceRoute"
      :class="[BUTTON, 'w-full border-line bg-surface text-fg hover:bg-surface-muted sm:w-auto sm:self-start']"
    >
      Ver detalhes
    </RouterLink>
  </section>

  <section
    v-else-if="kind === 'pending'"
    class="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card"
    aria-label="Pedido em análise"
  >
    <UiBadge tone="warning" :icon="Clock" class="self-start">Em análise</UiBadge>
    <p class="text-subtitle text-fg">Aguardando confirmação de {{ service.provider_name }}</p>
    <RouterLink
      :to="{ name: 'services-view' }"
      class="self-start text-body font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary"
    >
      Ver passeios
    </RouterLink>
  </section>

  <section
    v-else
    class="flex flex-col items-center gap-4 rounded-card border border-line bg-surface p-6 text-center shadow-card"
    aria-label="Agendar passeio"
  >
    <span class="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
      <UiIcon :icon="PawPrint" :size="32" />
    </span>
    <div class="flex flex-col gap-1">
      <p class="text-title text-fg">Hora de passear?</p>
      <p class="text-body text-fg-muted">Escolha um passeador de confiança perto de você.</p>
    </div>
    <RouterLink :to="{ name: 'provider-list-view' }" :class="[BUTTON_PRIMARY, 'w-full sm:w-auto']">
      Agendar passeio
    </RouterLink>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CloudOff, History, MapPinOff, PawPrint } from 'lucide-vue-next'
import HomeHighlightCard from '@/components/home/HomeHighlightCard.vue'
import NearbyProviders from '@/components/home/NearbyProviders.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'
import { useProviderStore } from '@/stores/provider'
import { useGeolocation } from '@/composables/useGeolocation'
import { buildServiceParams } from '@/utils/serviceFilters'
import { pickHomeHighlight } from '@/utils/homeHighlight'
import { withTimeout } from '@/utils/withTimeout'

const MAX_PROVIDERS = 8
const GEO_TIMEOUT_MS = 5000

const authStore = useAuthStore()
const serviceStore = useServiceStore()
const providerStore = useProviderStore()
const { latitude, longitude, getCurrentPosition } = useGeolocation()

const firstName = computed(() => authStore.user?.full_name?.trim().split(/\s+/)[0] ?? '')
const today = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

const highlight = computed(() => pickHomeHighlight(serviceStore.serivces))
// Quem também é passeador não aparece na própria lista de sugestões.
const nearby = computed(() => {
  const ownId = authStore.user?.provider_profile?.id
  return (providerStore.providers ?? []).filter((p) => ownId == null || p.id !== ownId).slice(0, MAX_PROVIDERS)
})

const servicesLoaded = ref(false)
const providersLoaded = ref(false)

async function loadServices() {
  await serviceStore.getServices(buildServiceParams({ mode: 'client', user: authStore.user }))
  servicesLoaded.value = true
}

const isCoord = (v) => v != null && v !== '' && Number.isFinite(Number(v))

async function loadProviders() {
  const params = {}
  try {
    // Permissão ignorada não pode travar a lista: desiste da localização após o timeout.
    await withTimeout(getCurrentPosition(), GEO_TIMEOUT_MS)
    if (isCoord(latitude.value) && isCoord(longitude.value)) {
      params.lat = latitude.value
      params.lon = longitude.value
    }
  } catch {
    // Sem permissão ou sem resposta: lista padrão, sem distância.
  }
  await providerStore.fetchProviders(params)
  providersLoaded.value = true
}

const load = () => Promise.all([loadServices(), loadProviders()])

onMounted(load)

const SHORTCUTS = [
  { label: 'Meus pets', to: { name: 'pets-view' }, icon: PawPrint },
  { label: 'Histórico', to: { name: 'services-view' }, icon: History },
]
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-display text-fg">Olá, {{ firstName }}</h1>
      <p class="text-body capitalize text-fg-muted">{{ today }}</p>
    </header>

    <div v-if="!servicesLoaded" data-testid="home-skeleton">
      <UiSkeleton shape="rect" class="!h-40" />
    </div>
    <UiEmptyState
      v-else-if="serviceStore.serviceError"
      :icon="CloudOff"
      title="Não foi possível carregar seus passeios"
      description="Verifique sua conexão e tente novamente."
    >
      <template #action>
        <AppButton text="Tentar novamente" variant="primary" :block="false" @event="load" />
      </template>
    </UiEmptyState>
    <HomeHighlightCard v-else :kind="highlight.kind" :service="highlight.service" />

    <nav class="flex flex-wrap gap-2" aria-label="Atalhos">
      <RouterLink
        v-for="item in SHORTCUTS"
        :key="item.label"
        :to="item.to"
        class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-body font-semibold text-fg transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <UiIcon :icon="item.icon" :size="18" class="text-primary" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <section class="flex flex-col gap-3" aria-labelledby="nearby-title">
      <div class="flex items-center justify-between gap-3">
        <h2 id="nearby-title" class="text-title text-fg">Passeadores perto de você</h2>
        <RouterLink
          :to="{ name: 'provider-list-view' }"
          class="text-body font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver todos
        </RouterLink>
      </div>
      <div v-if="!providersLoaded" class="flex gap-3 overflow-hidden" role="status">
        <span class="sr-only">Carregando</span>
        <UiSkeleton v-for="n in 3" :key="n" shape="rect" class="!h-40 !w-44 shrink-0" />
      </div>
      <UiEmptyState
        v-else-if="providerStore.error && !nearby.length"
        :icon="CloudOff"
        title="Não foi possível carregar os passeadores"
      >
        <template #action>
          <AppButton text="Tentar novamente" variant="primary" :block="false" @event="load" />
        </template>
      </UiEmptyState>
      <NearbyProviders v-else-if="nearby.length" :providers="nearby" />
      <UiEmptyState v-else :icon="MapPinOff" title="Nenhum passeador perto de você ainda" />
    </section>
  </div>
</template>

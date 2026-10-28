<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { BatteryLow, Loader2, TriangleAlert } from 'lucide-vue-next'
import AppButton from '@/components/buttons/AppButton.vue'
import LiveWalkSheet from '@/components/service/LiveWalkSheet.vue'
import LiveWalkSignal from '@/components/service/LiveWalkSignal.vue'
import ServicePartyCard from '@/components/service/ServicePartyCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'
import WalkDimOverlay from '@/components/service/WalkDimOverlay.vue'
import WhatsAppButton from '@/components/service/WhatsAppButton.vue'
import UiSheet from '@/components/ui/UiSheet.vue'

import { useMap } from '@/composables/useMap'
import { useElapsedTime } from '@/composables/useElapsedTime'
import { useTheme } from '@/composables/useTheme'
import { useWakeLock } from '@/composables/useWakeLock'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { formatElapsed } from '@/utils/time'

const DIM_KEY = 'doggo-walk-dim'

const emit = defineEmits(['complete'])

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const store = useServiceWebSocketStore()
const { resolved } = useTheme()

const { createMap, addMarker, flyTo, setStyle, loaded } = useMap()
const wakeLock = useWakeLock()
const { elapsedSeconds } = useElapsedTime(
  () => store.startDatetime,
  () => store.inProgress,
)

const isProvider = computed(() => props.role === 'provider')

const providerMarker = ref(null)
const mapLoading = ref(true)
const centered = ref(false)
const sheetLevel = ref(0)
const confirmOpen = ref(false)

function readDim() {
  try {
    return sessionStorage.getItem(DIM_KEY) === '1'
  } catch {
    return false
  }
}

const dim = ref(isProvider.value && readDim())

const elapsedLabel = computed(() => formatElapsed(elapsedSeconds.value))
const contactPhone = computed(() => store.service?.contact_phone ?? null)

function updateProviderMarker() {
  const location = store.currentLocation

  if (!location) return

  const lat = Number(location.latitude)
  const lng = Number(location.longitude)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return

  if (!providerMarker.value) {
    providerMarker.value = addMarker(lng, lat)
  } else {
    providerMarker.value.setLngLat([lng, lat])
  }

  if (!centered.value) {
    flyTo(lng, lat)
    centered.value = true
  }
}

function applyMapStyle() {
  setStyle(dim.value ? 'dark' : resolved.value)
}

function toggleDim() {
  dim.value = !dim.value
  try {
    sessionStorage.setItem(DIM_KEY, dim.value ? '1' : '0')
  } catch {
    // armazenamento indisponível: o modo vale só enquanto a tela estiver aberta
  }
}

function confirmComplete() {
  confirmOpen.value = false
  emit('complete')
}

async function initializeMap() {
  const known = store.providerLocation
  const center = known ? [known.longitude, known.latitude] : [0, 0]

  await nextTick()
  createMap('service-active-map', center, known ? 15 : 2)

  updateProviderMarker()
}

watch(() => store.currentLocation, updateProviderMarker)

watch(loaded, (value) => {
  if (!value) return
  mapLoading.value = false
  if (dim.value) applyMapStyle()
})

watch([dim, resolved], () => {
  if (loaded.value) applyMapStyle()
})

onBeforeUnmount(() => wakeLock.release())

onMounted(() => {
  if (isProvider.value) wakeLock.request()
  initializeMap()
})
</script>

<template>
  <div
    class="relative -mx-4 -my-5 h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-hidden md:mx-0 md:my-0 md:h-[calc(100dvh-8rem)] md:rounded-card"
  >
    <!-- h-full/w-full e não absolute: .maplibregl-map força position:relative e anularia o inset-0. -->
    <div id="service-active-map" class="h-full w-full bg-surface-muted">
      <div
        v-if="mapLoading"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas"
        role="status"
      >
        <Loader2 :size="32" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
        <p class="text-body text-fg-muted">Carregando mapa...</p>
      </div>
    </div>

    <div
      v-if="isProvider"
      class="absolute inset-x-3 top-3 z-10 flex items-center gap-2 rounded-control border border-line bg-warning-soft px-3 py-2 text-caption font-semibold text-warning shadow-card md:left-auto md:right-4 md:top-4 md:max-w-sm"
      role="note"
    >
      <TriangleAlert :size="18" :stroke-width="2" class="shrink-0" aria-hidden="true" />
      Mantenha o app aberto durante o passeio
    </div>

    <LiveWalkSheet v-model:level="sheetLevel">
      <template #summary>
        <div class="flex flex-col gap-3">
          <LiveWalkSignal v-if="!isProvider" :last-at="store.lastLocationAt" />
          <h1 class="sr-only">Passeio em andamento</h1>
          <dl class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-caption text-fg-muted">Tempo</dt>
              <dd class="text-display tabular-nums text-fg">{{ elapsedLabel }}</dd>
            </div>
            <div>
              <dt class="text-caption text-fg-muted">Distância</dt>
              <dd class="text-display tabular-nums text-fg">{{ store.formattedDistance }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <ServicePartyCard :role="role" />
      <WhatsAppButton :phone="contactPhone" />
      <ServicePetsList />

      <template v-if="isProvider">
        <button
          type="button"
          data-dim-toggle
          :aria-pressed="dim"
          class="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 text-body font-semibold text-fg transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary"
          @click="toggleDim"
        >
          <BatteryLow :size="20" :stroke-width="2" aria-hidden="true" />
          Economizar bateria
        </button>
        <AppButton
          data-complete-open
          text="Concluir passeio"
          :disabled="store.loading"
          @event="confirmOpen = true"
        />
      </template>
    </LiveWalkSheet>

    <WalkDimOverlay v-if="dim" />

    <UiSheet v-model:open="confirmOpen" title="Concluir passeio?">
      <p class="text-body text-fg-muted">
        O acompanhamento será encerrado e o tutor poderá avaliar o passeio.
      </p>
      <div class="flex flex-col gap-2">
        <AppButton data-complete-confirm text="Sim, concluir" :disabled="store.loading" @event="confirmComplete" />
        <AppButton text="Continuar passeio" mode="outline" @event="confirmOpen = false" />
      </div>
    </UiSheet>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { Clock, Loader2, Map } from 'lucide-vue-next'
import InfoCard from '@/components/cards/InfoCard.vue'
import ServiceActions from '@/components/service/ServiceActions.vue'
import ServicePartyCard from '@/components/service/ServicePartyCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'

import { useMap } from '@/composables/useMap'
import { useElapsedTime } from '@/composables/useElapsedTime'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { formatElapsed } from '@/utils/time'

const emit = defineEmits(['complete', 'cancel'])

defineProps({
  role: {
    type: String,
    required: true,
  },
})

const store = useServiceWebSocketStore()

const { createMap, addMarker, flyTo, loaded } = useMap()
const { elapsedSeconds } = useElapsedTime(
  () => store.startDatetime,
  () => store.inProgress,
)

const providerMarker = ref(null)
const mapLoading = ref(true)
const centered = ref(false)

const elapsedLabel = computed(() => formatElapsed(elapsedSeconds.value))

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

async function initializeMap() {
  const center = store.providerLocation
    ? [store.providerLocation.longitude, store.providerLocation.latitude]
    : [0, 0]

  await nextTick()
  createMap('service-active-map', center, 15)

  updateProviderMarker()
}

watch(() => store.currentLocation, updateProviderMarker)

watch(loaded, (value) => {
  if (value) mapLoading.value = false
})

onMounted(initializeMap)
</script>

<template>
  <div class="relative flex flex-col w-full h-[calc(100vh-4.5rem)] md:flex-row md:overflow-hidden">
    <div
      id="service-active-map"
      class="relative w-full h-[45vh] min-h-87.5 overflow-hidden md:h-full md:min-h-0 md:w-2/3 md:shrink-0"
    >
      <div
        v-if="mapLoading"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas"
        role="status"
      >
        <Loader2 :size="32" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
        <p class="text-body text-fg-muted">Carregando mapa...</p>
      </div>
    </div>

    <div class="w-full min-h-0 grid grid-cols-2 gap-2 p-4 pb-30 md:w-1/3 md:h-full md:overflow-y-auto md:pb-4">
      <h1 class="col-span-2 w-full text-title text-fg">Passeio em andamento</h1>
      <ServicePartyCard class="col-span-2" :role="role" />
      <InfoCard :icon="Clock" description="Tempo" :info="elapsedLabel" />
      <InfoCard :icon="Map" description="Distância" :info="store.formattedDistance" />
      <ServicePetsList class="col-span-2" />
      <ServiceActions
        v-if="role === 'provider'"
        class="col-span-2"
        :role="role"
        :status="3"
        :busy="store.loading"
        @complete="emit('complete')"
        @cancel="emit('cancel')"
      />
    </div>
  </div>
</template>
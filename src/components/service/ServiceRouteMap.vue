<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import InfoCard from '@/components/cards/InfoCard.vue'
import ServicePartyCard from '@/components/service/ServicePartyCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'

import { useMap } from '@/composables/useMap'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { formatMeters } from '@/utils/distance'
import { formatCurrency } from '@/utils/currency'
import { formatElapsed } from '@/utils/time'

defineProps({
  role: {
    type: String,
    required: true,
  },
})

const store = useServiceWebSocketStore()

const { createMap, addMarker, loaded, drawRoute } = useMap()

const mapLoading = ref(true)

const distanceLabel = computed(() => formatMeters(store.totalDistance))
const durationLabel = computed(() => formatElapsed(store.walkDuration))
const priceLabel = computed(() => formatCurrency(store.price))

function toCoordinates(points) {
  return points.map((point) => [Number(point.longitude), Number(point.latitude)])
}

async function initializeMap() {
  const center = store.providerLocation
    ? [store.providerLocation.longitude, store.providerLocation.latitude]
    : [0, 0]

  await nextTick()
  createMap('service-route-map', center, 15)

  renderRouteOnMap()
}

function renderRouteOnMap() {
  if (!loaded.value || store.routePoints.length === 0) return

  const coordinates = toCoordinates(store.routePoints)

  if (coordinates.length >= 2) {
    drawRoute(store.routePoints)
  }

  const start = coordinates[0]
  const end = coordinates[coordinates.length - 1]

  if (start) {
    addMarker(start[0], start[1], { color: '#2E7D6B' })
  }

  if (end && end !== start) {
    addMarker(end[0], end[1], { color: '#EF4444' })
  }
}

onMounted(initializeMap)

watch([loaded, () => store.routePoints.length], renderRouteOnMap)

watch(loaded, (value) => {
  if (value) mapLoading.value = false
})
</script>

<template>
  <div class="relative flex flex-col w-full h-[calc(100vh-4.5rem)] md:flex-row md:overflow-hidden">
    <div
      id="service-route-map"
      class="relative w-full h-[45vh] min-h-87.5 overflow-hidden md:h-full md:min-h-0 md:w-2/3 md:shrink-0"
    >
      <div
        v-if="mapLoading || (store.routeLoading && store.routePoints.length === 0)"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background-light"
      >
        <div class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"></div>
        <p class="text-sm text-doggo-black/50 font-semibold">Carregando mapa...</p>
      </div>
      <div
        v-else-if="store.routePoints.length === 0"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background-light text-center p-6"
      >
        <span class="mdi mdi-map-marker-off text-4xl text-doggo-green"></span>
        <p class="text-sm text-doggo-black/50 font-semibold">
          Não há pontos de localização registrados para este passeio.
        </p>
      </div>
    </div>

    <div class="w-full min-h-0 grid grid-cols-2 gap-2 p-4 pb-30 md:w-1/3 md:h-full md:overflow-y-auto md:pb-4">
      <h1 class="w-full col-span-2 text-center font-semibold">Passeio concluído</h1>
      <ServicePartyCard class="col-span-2" :role="role" />
      <InfoCard icon="mdi mdi-map-marker-distance" description="Distância" :info="distanceLabel" />
      <InfoCard icon="mdi mdi-clock-outline" description="Duração" :info="durationLabel" />
      <InfoCard icon="mdi mdi-cash" description="Valor" :info="priceLabel" />
      <ServicePetsList class="col-span-2" />
    </div>
  </div>
</template>
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { getRouteCenter } from '@/utils/distance'

import InfoCard from '@/components/cards/InfoCard.vue'
import SearchCard from '../cards/SearchCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'
import ReviewModal from '../modals/ReviewModal.vue'

import { useMap } from '@/composables/useMap'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { useReviewStore } from '@/stores/review.js'
import { formatMeters } from '@/utils/distance'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
  isServiceRating: {
    type: Boolean,
    required: true,
  },
})

const serviceStore = useServiceWebSocketStore()
const reviewStore = useReviewStore()

const { createMap, addMarker, loaded, drawRoute } = useMap()

const mapLoading = ref(true)
const reviewOpen = ref(false)
const reviewComment = ref('')
const reviewRating = ref(0)

const distanceLabel = computed(() => formatMeters(serviceStore.totalDistance))
const durationLabel = computed(() => serviceStore.walkDuration)
const priceLabel = computed(() => formatCurrency(serviceStore.price))

function toCoordinates(points) {
  return points.map((point) => [Number(point.longitude), Number(point.latitude)])
}

async function initializeMap() {
  const center =
    getRouteCenter(serviceStore.routePoints) ??
    (serviceStore.providerLocation
      ? [serviceStore.providerLocation.longitude, serviceStore.providerLocation.latitude]
      : [0, 0])

  await nextTick()
  createMap('service-route-map', center, 15)

  renderRouteOnMap()
}

function renderRouteOnMap() {
  if (!loaded.value || serviceStore.routePoints.length === 0) return

  const coordinates = toCoordinates(serviceStore.routePoints)

  if (coordinates.length >= 2) {
    drawRoute(serviceStore.routePoints)
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

async function submitReview() {
  if(props.role !== 'client') return

  await serviceStore.rateService()
  await reviewStore.postReview({
    provider: serviceStore.providerId,
    rating: reviewRating.value,
    comment: reviewComment.value
  })

  reviewOpen.value = false
}

onMounted(() => {
  initializeMap()
  if(!props.isServiceRating && props.role === 'client') {
    reviewOpen.value = true
  }
})

watch([loaded, () => serviceStore.routePoints.length], renderRouteOnMap)

watch(loaded, (value) => {
  if (value) mapLoading.value = false
})
</script>

<template>
  <ReviewModal
    v-if="reviewOpen"
    :providerName="serviceStore.providerName"
    :loading="serviceStore.loading"
    v-model:rating="reviewRating"
    v-model:comment="reviewComment"
    @createReview="submitReview"
    @closeModal="reviewOpen = false"
  />
  <div class="relative flex flex-col w-full h-[calc(100vh-4.5rem)] md:flex-row md:overflow-hidden">
    <div
      id="service-route-map"
      class="relative w-full h-[45vh] min-h-87.5 overflow-hidden md:h-full md:min-h-0 md:w-2/3 md:shrink-0"
    >
      <div
        v-if="mapLoading || (serviceStore.routeLoading && serviceStore.routePoints.length === 0)"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background-light"
      >
        <div class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"></div>
        <p class="text-sm text-doggo-black/50 font-semibold">Carregando mapa...</p>
      </div>
      <div
        v-else-if="serviceStore.routePoints.length === 0"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background-light text-center p-6"
      >
        <span class="mdi mdi-map-marker-off text-4xl text-doggo-green"></span>
        <p class="text-sm text-doggo-black/50 font-semibold">
          Não há pontos de localização registrados para este passeio.
        </p>
      </div>
    </div>

    <div
      class="w-full min-h-0 grid grid-cols-2 gap-2 p-4 pb-30 md:w-1/3 md:h-full md:overflow-y-auto md:pb-4"
    >
      <h1 class="w-full col-span-2 text-center font-semibold">Passeio concluído</h1>
      <SearchCard
        class="col-span-2"
        link="/provider/"
        :full_name="serviceStore.providerName"
        :id="serviceStore.providerId"
        :profile_photo="serviceStore.providerPicture"
        :service="serviceStore.serviceType"
      />
      <InfoCard icon="mdi mdi-map-marker-distance" description="Distância" :info="distanceLabel" />
      <InfoCard icon="mdi mdi-clock-outline" description="Duração" :info="durationLabel" />
      <InfoCard icon="mdi mdi-cash" description="Valor" :info="priceLabel" />
      <ServicePetsList class="col-span-2" />
    </div>
  </div>
</template>

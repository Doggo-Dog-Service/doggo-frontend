<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { getRouteCenter } from '@/utils/distance'

import { Banknote, Clock, Loader2, MapPinOff, Route } from 'lucide-vue-next'
import InfoCard from '@/components/cards/InfoCard.vue'
import SearchCard from '../cards/SearchCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'
import ReviewModal from '../modals/ReviewModal.vue'
import UiSheet from '@/components/ui/UiSheet.vue'

import { useMap, getThemeColor } from '@/composables/useMap'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { formatMeters } from '@/utils/distance'
import { formatCurrency } from '@/utils/currency'
import { createWalkEventPin, walkEventMeta } from '@/utils/walkEvents'

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

const { createMap, addMarker, loaded, drawRoute } = useMap()

const mapLoading = ref(true)
const reviewOpen = ref(false)
const reviewComment = ref('')
const reviewRating = ref(0)
const photoOpen = ref(false)
const photoSelected = ref(null)
const eventMarkerIds = new Set()

const COUNT_KINDS = ['pee', 'poop', 'water']

const eventCounts = computed(() =>
  COUNT_KINDS.map((kind) => ({
    kind,
    label: walkEventMeta(kind).label,
    count: serviceStore.events.filter((event) => event.kind === kind).length,
  })),
)
const photos = computed(() => serviceStore.events.filter((event) => event.image_url))
const providerNote = computed(() => serviceStore.providerNote.trim())

function openPhoto(event) {
  photoSelected.value = event
  photoOpen.value = true
}

function syncEventMarkers() {
  if (!loaded.value) return

  for (const event of serviceStore.events) {
    if (eventMarkerIds.has(event.id)) continue

    const lat = Number(event.latitude)
    const lng = Number(event.longitude)

    if (event.latitude == null || event.longitude == null || Number.isNaN(lat) || Number.isNaN(lng)) continue

    if (addMarker(lng, lat, { element: createWalkEventPin(event.kind) })) eventMarkerIds.add(event.id)
  }
}

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
  syncEventMarkers()
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
    addMarker(start[0], start[1], { color: getThemeColor('--primary', '#2E7D6B') })
  }

  if (end && end !== start) {
    addMarker(end[0], end[1], { color: getThemeColor('--danger', '#DC2626') })
  }
}

async function submitReview() {
  if(props.role !== 'client') return

  try {
    await serviceStore.rateService({
      rating: reviewRating.value,
      comment: reviewComment.value,
    })
    reviewOpen.value = false
  } catch {
    // erro já tratado na store; o modal continua aberto para nova tentativa
  }
}

onMounted(() => {
  initializeMap()
  serviceStore.loadEvents()
  if(!props.isServiceRating && props.role === 'client') {
    reviewOpen.value = true
  }
})

watch([loaded, () => serviceStore.routePoints.length], renderRouteOnMap)
watch([loaded, () => serviceStore.events.length], syncEventMarkers)

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
  <div class="relative flex w-full flex-col md:h-[calc(100dvh-5rem)] md:flex-row md:overflow-hidden">
    <div
      id="service-route-map"
      class="relative w-full h-[45vh] min-h-87.5 overflow-hidden md:h-full md:min-h-0 md:w-2/3 md:shrink-0"
    >
      <div
        v-if="mapLoading || (serviceStore.routeLoading && serviceStore.routePoints.length === 0)"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas"
        role="status"
      >
        <Loader2 :size="32" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
        <p class="text-body text-fg-muted">Carregando mapa...</p>
      </div>
      <div
        v-else-if="serviceStore.routePoints.length === 0"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas p-6 text-center"
      >
        <MapPinOff :size="32" :stroke-width="2" class="text-primary" aria-hidden="true" />
        <p class="text-body text-fg-muted">
          Não há pontos de localização registrados para este passeio.
        </p>
      </div>
    </div>

    <div
      class="w-full min-h-0 grid grid-cols-2 gap-2 p-4 pb-30 md:w-1/3 md:h-full md:overflow-y-auto md:pb-4"
    >
      <h1 class="col-span-2 w-full text-center text-title text-fg">Passeio concluído</h1>
      <SearchCard
        class="col-span-2"
        link="/provider/"
        :full_name="serviceStore.providerName"
        :id="serviceStore.providerId"
        :profile_photo="serviceStore.providerPicture"
        :service="serviceStore.serviceType"
      />
      <InfoCard :icon="Route" description="Distância" :info="distanceLabel" />
      <InfoCard :icon="Clock" description="Duração" :info="durationLabel" />
      <InfoCard :icon="Banknote" description="Valor" :info="priceLabel" />
      <section class="col-span-2 flex flex-col gap-2" aria-label="Marcadores do passeio">
        <h2 class="text-subtitle text-fg">Marcadores do passeio</h2>
        <p data-event-counts class="text-body text-fg-muted">
          <template v-for="(item, index) in eventCounts" :key="item.kind">
            <span v-if="index > 0" aria-hidden="true"> · </span>{{ item.label }} {{ item.count }}
          </template>
        </p>
      </section>
      <section v-if="photos.length > 0" class="col-span-2 flex flex-col gap-2" aria-label="Fotos do passeio">
        <h2 class="text-subtitle text-fg">Fotos</h2>
        <ul class="grid grid-cols-3 gap-2">
          <li v-for="photo in photos" :key="photo.id">
            <button
              type="button"
              data-photo-thumb
              class="block aspect-square w-full cursor-pointer overflow-hidden rounded-control focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Ampliar foto do passeio"
              @click="openPhoto(photo)"
            >
              <img :src="photo.image_url" alt="Foto do passeio" class="size-full object-cover" loading="lazy" />
            </button>
          </li>
        </ul>
      </section>
      <section
        v-if="providerNote"
        data-provider-note
        class="col-span-2 flex flex-col gap-1 rounded-control border border-line bg-surface p-3"
      >
        <h2 class="text-subtitle text-fg">Nota do passeador</h2>
        <p class="whitespace-pre-line text-body text-fg-muted">{{ providerNote }}</p>
      </section>
      <ServicePetsList class="col-span-2" />
    </div>
  </div>

  <UiSheet v-model:open="photoOpen" title="Foto do passeio">
    <img
      v-if="photoSelected"
      data-photo-large
      :src="photoSelected.image_url"
      alt="Foto do passeio ampliada"
      class="max-h-[70dvh] w-full rounded-control object-contain"
    />
  </UiSheet>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import SearchBar from '@/components/inputs/SearchBar.vue'
import LocationCard from '@/components/cards/LocationCard.vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { useLocation } from '@/composables/useLocation'
import { useMap, getThemeColor } from '@/composables/useMap'
import { withTimeout } from '@/utils/withTimeout'

// v-model: { latitude, longitude } como números com 6 casas decimais.
const model = defineModel({ type: Object, default: () => ({ latitude: null, longitude: null }) })
const emit = defineEmits(['error'])

const HINT = 'Não foi possível obter sua localização. Busque o endereço ou toque no mapa.'
const SAO_PAULO = [-46.633309, -23.55052]
const GEO_TIMEOUT_MS = 5000

const { latitude, longitude, error: geoError, getCurrentPosition } = useGeolocation()
const { map, createMap, addMarker, flyTo } = useMap()
const { searchedData, searchLocation, loading } = useLocation()

const container = ref(null)
const searchText = ref('')
const listOpen = ref(false)
let marker = null
let searchTimeout
let active = true

// O marcador só existe depois de uma localização ou escolha: o centro padrão não é um local escolhido.
function ensureMarker(lng, lat) {
  if (marker) return
  marker = addMarker(lng, lat, { color: getThemeColor('--primary', '#2E7D6B'), draggable: true })
  marker.on('dragend', () => {
    const point = marker.getLngLat()
    selectPoint(point.lng, point.lat)
  })
}

function selectPoint(lng, lat) {
  if (marker) marker.setLngLat([lng, lat])
  else ensureMarker(lng, lat)
  model.value = { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
}

function handleLocationSelect({ lng, lat }) {
  flyTo(lng, lat)
  selectPoint(lng, lat)
  searchText.value = ''
  searchedData.value = []
  listOpen.value = false
}

onBeforeUnmount(() => {
  active = false
  clearTimeout(searchTimeout)
})

onMounted(async () => {
  const saved = model.value
  let center = SAO_PAULO
  let located = false
  let hasSaved = false
  if (saved?.latitude != null && saved?.longitude != null) {
    center = [Number(saved.longitude), Number(saved.latitude)]
    hasSaved = true
  } else {
    try {
      await withTimeout(getCurrentPosition(), GEO_TIMEOUT_MS)
      if (!active) return
      if (geoError.value) {
        emit('error', HINT)
      } else if (latitude.value != null && longitude.value != null) {
        center = [Number(longitude.value), Number(latitude.value)]
        located = true
      }
    } catch {
      if (!active) return
      emit('error', HINT)
    }
  }

  createMap(container.value, center, 15)

  map.value.on('click', (e) => selectPoint(e.lngLat.lng, e.lngLat.lat))

  if (hasSaved) ensureMarker(center[0], center[1])
  else if (located) selectPoint(center[0], center[1])
})

watch(searchText, (text) => {
  clearTimeout(searchTimeout)
  if (text.length < 3) {
    searchedData.value = []
    return
  }
  searchTimeout = setTimeout(() => searchLocation(text), 500)
})

defineExpose({ selectPoint })
</script>

<template>
  <div class="flex flex-col gap-3">
    <SearchBar
      v-model="searchText"
      placeholder="Busque seu endereço"
      @keydown.enter.prevent
      @focus="listOpen = true"
      @out="listOpen = false"
    >
      <template #list>
        <div
          v-if="listOpen && (loading || searchedData.length > 0)"
          class="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-card border border-line bg-surface shadow-card"
        >
          <div v-if="loading" class="flex items-center justify-center gap-2 p-4 text-body text-fg-muted" role="status">
            <Loader2 :size="18" :stroke-width="2" class="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <span>Buscando...</span>
          </div>
          <div class="max-h-60 overflow-y-auto">
            <LocationCard
              v-for="(feature, index) in searchedData"
              :key="feature.properties?.osm_id || feature.properties?.osm_type + index"
              :feature="feature"
              @select="handleLocationSelect"
            />
          </div>
        </div>
      </template>
    </SearchBar>
    <div
      ref="container"
      class="h-72 w-full overflow-hidden rounded-card border border-line md:h-96"
      role="application"
      aria-label="Mapa para marcar o local onde você atende"
    ></div>
    <p class="text-caption text-fg-muted">Toque no mapa ou arraste o marcador para ajustar o ponto.</p>
  </div>
</template>

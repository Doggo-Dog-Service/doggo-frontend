<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import ProviderCard from '@/components/cards/ProviderCard.vue'
import ProviderFilters from '@/components/filters/ProviderFilters.vue'
import { useProviderStore } from '@/stores/provider'
import { useServiceStore } from '@/stores/service'
import { useGeolocation } from '@/composables/useGeolocation'
import { haversine } from '@/utils/distance'
import { toFloat } from '@/utils/toFloat'

const providerStore = useProviderStore()
const serviceStore = useServiceStore()

const { latitude, longitude, getCurrentPosition } = useGeolocation()

const filtersOpen = ref(false)
const hasGeolocation = ref(false)

const filters = reactive({
  serviceType: null,
  minPrice: null,
  maxPrice: null,
  maxDistance: 50,
})

const loadProviders = async () => {
  await providerStore.fetchProviders({
    service_type: filters.serviceType,
    page_size: 100,
  })
}

watch(() => filters.serviceType, loadProviders)

const distanceFor = (provider) => {
  if (!hasGeolocation.value) return null
  return haversine(
    latitude.value,
    longitude.value,
    provider.fixed_latitude,
    provider.fixed_longitude,
  )
}

const filteredProviders = computed(() => {
  const minPrice = toFloat(filters.minPrice)
  const maxPrice = toFloat(filters.maxPrice)
  const maxDistance = toFloat(filters.maxDistance)
  const distanceFilterActive =
    hasGeolocation.value && maxDistance != null && maxDistance !== 50

  return providerStore.providers.filter((provider) => {
    const price = toFloat(provider.price_per_hour)

    if (minPrice != null && (price == null || price < minPrice)) return false
    if (maxPrice != null && (price == null || price > maxPrice)) return false

    if (distanceFilterActive) {
      const distance = distanceFor(provider)
      if (distance != null && distance > maxDistance) return false
    }

    return true
  })
})

const cardProviders = computed(() =>
  filteredProviders.value.map((provider) => ({
    id: provider.id,
    full_name: provider.full_name ?? provider.user?.full_name ?? 'Profissional',
    service_name:
      provider.service_type_name ?? provider.service_type_detail?.name ?? '',
    profile_photo:
      provider.profile_picture ?? provider.user?.profile_picture?.url ?? '',
    price_per_hour: provider.price_per_hour,
    price_per_day: provider.price_per_day,
    classification: provider.classification,
    is_active: provider.is_active,
    distance: distanceFor(provider),
  })),
)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.serviceType != null) count++
  if (toFloat(filters.minPrice) != null) count++
  if (toFloat(filters.maxPrice) != null) count++
  if (toFloat(filters.maxDistance) !== 50) count++
  return count
})

const applyFilters = () => {
  loadProviders()
}

const clearFilters = () => {
  filters.serviceType = null
  filters.minPrice = null
  filters.maxPrice = null
  filters.maxDistance = 50
}

onMounted(async () => {
  await Promise.all([loadProviders(), serviceStore.getServices()])

  try {
    await getCurrentPosition()
    hasGeolocation.value = true
  } catch {
    hasGeolocation.value = false
  }

})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 md:py-10 mb-19 md:mb-0">
    <div class="mt-8 flex items-center justify-between gap-4">
      <h1 class="text-3xl md:text-4xl font-bold text-doggo-black">Profissionais</h1>
      <button
        class="flex items-center gap-2 h-10 px-4 bg-white border border-doggo-gray rounded-lg text-sm font-semibold text-doggo-black/70 cursor-pointer transition-all duration-200 active:scale-98"
        @click="filtersOpen = !filtersOpen"
      >
        Filtrar
        <span class="mdi mdi-filter-variant text-doggo-green"></span>
        <span
          v-if="activeFilterCount > 0"
          class="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-doggo-green text-white text-[11px] font-bold"
        >
          {{ activeFilterCount }}
        </span>
      </button>
    </div>
    <div class="mt-8 flex flex-col md:flex-row md:gap-10">
      <div class="flex-1 min-w-0">
        <div v-if="providerStore.loading" class="flex flex-col gap-3">
          <div
            v-for="index in 4"
            :key="index"
            class="h-20 rounded-2xl bg-white border border-doggo-gray animate-pulse"
          ></div>
        </div>
        <div
          v-else-if="providerStore.error"
          class="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <span class="mdi mdi-alert-circle-outline text-5xl text-gray-300"></span>
          <p class="text-doggo-black/50 font-semibold">
            Não foi possível carregar os profissionais
          </p>
          <button
            class="px-5 py-2 rounded-full bg-doggo-green text-white text-sm font-semibold cursor-pointer"
            @click="loadProviders"
          >
            Tentar novamente
          </button>
        </div>
        <div
          v-else-if="filteredProviders.length === 0"
          class="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <span class="mdi mdi-paw-off text-5xl text-gray-300"></span>
          <p class="text-doggo-black/50 font-semibold">
            {{
              activeFilterCount > 0
                ? 'Nenhum profissional encontrado com os filtros selecionados'
                : 'Nenhum profissional cadastrado ainda'
            }}
          </p>
          <button
            v-if="activeFilterCount > 0"
            class="px-5 py-2 rounded-full bg-white border border-doggo-gray text-sm font-semibold text-gray-400 cursor-pointer"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
        </div>
        <div v-else class="flex flex-col gap-3">
          <ProviderCard
            v-for="provider in cardProviders"
            :key="provider.id"
            :id="provider.id"
            :full_name="provider.full_name"
            :service_name="provider.service_name"
            :profile_photo="provider.profile_photo"
            :price_per_hour="provider.price_per_hour"
            :price_per_day="provider.price_per_day"
            :classification="provider.classification"
            :is_active="provider.is_active"
            :distance="provider.distance"
          />
        </div>
      </div>
      <div class="shrink-0 md:w-80 mt-8 md:mt-0">
        <div class="md:sticky md:top-6">
          <ProviderFilters
            v-model:open="filtersOpen"
            v-model:filters="filters"
            :service-types="serviceStore.typeServices"
            :distance-enabled="hasGeolocation"
            @apply="applyFilters"
            @clear="clearFilters"
            @close="filtersOpen = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import UserCard from '@/components/cards/UserCard.vue'
import ProviderFilters from '@/components/filters/ProviderFilters.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import { AlertCircle, PawPrint, SlidersHorizontal } from 'lucide-vue-next'
import { useProviderStore } from '@/stores/provider'
import { useServiceTypeStore } from '@/stores/serviceType'
import { useGeolocation } from '@/composables/useGeolocation'
import { haversine } from '@/utils/distance'
import { toFloat } from '@/utils/toFloat'

const providerStore = useProviderStore()
const serviceTypeStore = useServiceTypeStore()

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
  const params = {
    service_type: filters.serviceType,
    page_size: 100,
  }

  if (toFloat(filters.minPrice) != null) {
    params.min_price = filters.minPrice
  }
  if (toFloat(filters.maxPrice) != null) {
    params.max_price = filters.maxPrice
  }

  if (hasGeolocation.value) {
    params.lat = latitude.value
    params.lon = longitude.value
    if (toFloat(filters.maxDistance) !== 50) {
      params.max_distance = filters.maxDistance
    }
  }

  await providerStore.fetchProviders(params)
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

const cardProviders = computed(() =>
  providerStore.providers.map((provider) => ({
    id: provider.id,
    full_name: provider.full_name ?? 'Profissional',
    service_name: provider.service_type_name ?? provider.service_type_detail?.name ?? '',
    profile_photo: provider.profile_picture ?? '',
    price_per_hour: provider.price_per_hour,
    price_per_day: provider.price_per_day,
    classification: provider.classification,
    is_active: provider.is_active,
    distance: provider.distance ?? distanceFor(provider),
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
  loadProviders()
}

onMounted(async () => {
  await Promise.all([loadProviders(), serviceTypeStore.getTypeServices()])

  try {
    await getCurrentPosition()
    hasGeolocation.value = true
  } catch {
    hasGeolocation.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4">
      <h1 class="hidden text-display text-fg md:block">Profissionais</h1>
      <button
        type="button"
        class="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-body font-semibold text-fg transition-colors duration-200 hover:bg-surface-muted active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        :aria-expanded="filtersOpen"
        @click="filtersOpen = !filtersOpen"
      >
        Filtrar
        <SlidersHorizontal :size="18" :stroke-width="2" class="text-primary" aria-hidden="true" />
        <span
          v-if="activeFilterCount > 0"
          class="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-caption font-bold text-primary-fg"
        >
          {{ activeFilterCount }}
        </span>
      </button>
    </div>
    <div class="flex flex-col md:flex-row md:gap-8">
      <div class="min-w-0 flex-1">
        <div v-if="providerStore.loading" class="flex flex-col gap-3">
          <UiSkeleton v-for="index in 4" :key="index" shape="rect" />
        </div>
        <UiEmptyState
          v-else-if="providerStore.error"
          :icon="AlertCircle"
          title="Não foi possível carregar os profissionais"
        >
          <template #action>
            <AppButton text="Tentar novamente" variant="primary" :block="false" @event="loadProviders" />
          </template>
        </UiEmptyState>
        <UiEmptyState
          v-else-if="providerStore.providers.length === 0"
          :icon="PawPrint"
          :title="
            activeFilterCount > 0
              ? 'Nenhum profissional encontrado com os filtros selecionados'
              : 'Nenhum profissional cadastrado ainda'
          "
        >
          <template v-if="activeFilterCount > 0" #action>
            <AppButton text="Limpar filtros" variant="secondary" :block="false" @event="clearFilters" />
          </template>
        </UiEmptyState>
        <div v-else class="flex flex-col gap-3">
          <UserCard
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
      <div class="mt-8 shrink-0 md:mt-0 md:w-80">
        <div class="md:sticky md:top-6">
          <ProviderFilters
            v-model:open="filtersOpen"
            v-model:filters="filters"
            :service-types="serviceTypeStore.typeServices"
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

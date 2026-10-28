<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'
import LocationCard from '@/components/cards/LocationCard.vue'
import { Calendar, Clock, Loader2, MapPin } from 'lucide-vue-next'
import { onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useRouter } from 'vue-router'
import { useGeolocation } from '@/composables/useGeolocation'
import { useLocation } from '@/composables/useLocation'
import { useMap, getThemeColor } from '@/composables/useMap'

const authStore = useAuthStore()
const providerStore = useProviderStore()
const router = useRouter()

const data = reactive({
  fixed_latitude: null,
  fixed_longitude: null,
  price_per_hour: null,
  price_per_day: null,
  service_type: router.currentRoute.value.params.serviceTypeId,
})

const handleRegister = async () => {
  const success = await providerStore.createProvider(data)
  if (success) {
    router.push('/')
  }
}

const { latitude, longitude, getCurrentPosition } = useGeolocation()
const { map, createMap, addMarker, flyTo } = useMap()
const { searchedData, searchLocation, loading } = useLocation()

const userMarker = ref(null)
const fixedMarker = ref(null)
const searchBarData = ref('')
const searchedList = ref(false)

function handleLocationSelect({ lng, lat }) {
  flyTo(lng, lat)
  fixedMarker.value?.setLngLat([lng, lat])
  data.fixed_latitude = lat?.toFixed(6)
  data.fixed_longitude = lng?.toFixed(6)
  searchBarData.value = ''
  searchedData.value = []
  searchedList.value = false
}

const userElement = document.createElement('img')
Object.assign(userElement.style, {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `solid 2px ${getThemeColor('--primary', '#2E7D6B')}`,
  backgroundColor: getThemeColor('--primary-soft', '#ECF7F3'),
})

onMounted(async () => {
  await getCurrentPosition()
  await authStore.fetchUser()

  createMap('map', [longitude.value, latitude.value], 15)

  if (authStore.user?.profile_picture?.file) {
    userElement.src = authStore.user.profile_picture.file
  } else {
    Object.assign(userElement.style, {
      width: '20px',
      height: '20px',
    })
  }

  userMarker.value = addMarker(longitude.value, latitude.value, {
    color: getThemeColor('--info', '#0284C7'),
    element: userElement,
  })

  fixedMarker.value = addMarker(longitude.value, latitude.value, {
    color: getThemeColor('--primary', '#2E7D6B'),
    draggable: true,
  })

  data.fixed_latitude = latitude.value
  data.fixed_longitude = longitude.value

  map.value.on('click', (e) => {
    const lng = e.lngLat.lng
    const lat = e.lngLat.lat

    fixedMarker.value.setLngLat([lng, lat])

    data.fixed_latitude = lat?.toFixed(6)
    data.fixed_longitude = lng?.toFixed(6)
  })

  fixedMarker.value.on('dragend', () => {
    const lngLat = fixedMarker.value.getLngLat()

    data.fixed_latitude = lngLat.lat?.toFixed(6)
    data.fixed_longitude = lngLat.lng?.toFixed(6)
  })
})

let searchTimeout

watch(searchBarData, (searchData) => {
  clearTimeout(searchTimeout)

  if (searchData.length < 3) {
    searchedData.value = []
    return
  }

  searchTimeout = setTimeout(() => {
    searchLocation(searchData)
  }, 500)
})
</script>

<template>
  <form @submit.prevent="handleRegister" class="relative h-[calc(100dvh-11rem)] min-h-136 w-full md:h-160">
    <div id="map" class="h-full w-full"></div>

    <div class="md:hidden">
      <div class="pointer-events-auto absolute inset-x-0 top-0 z-10 p-3 pb-1">
        <p class="mx-auto mb-2 flex w-fit items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-caption font-semibold text-fg shadow-card">
          <MapPin :size="14" :stroke-width="2" class="text-primary" aria-hidden="true" />
          Registre seu endereço e o preço de seu serviço
        </p>
        <SearchBar
          v-model="searchBarData"
          placeholder="Busque sua localização"
          @focus="searchedList = true"
          @blur="searchedList = false"
        >
          <template #list>
            <div
              v-if="loading && searchedList"
              class="absolute inset-x-0 top-full z-50 mt-2 rounded-card border border-line bg-surface shadow-card"
            >
              <div class="flex items-center justify-center gap-2 p-4 text-body text-fg-muted" role="status">
                <Loader2 :size="18" :stroke-width="2" class="animate-spin" aria-hidden="true" />
                <span>Buscando...</span>
              </div>
            </div>

            <transition
              enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="searchedData.length > 0 && searchedList"
                class="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <div class="max-h-60 overflow-y-auto">
                  <LocationCard
                    v-for="(feature, index) in searchedData"
                    :key="feature.properties?.osm_id || feature.properties?.osm_type + index"
                    :feature="feature"
                    @select="handleLocationSelect"
                  />
                </div>
              </div>
            </transition>
          </template>
        </SearchBar>
      </div>
      <div class="pointer-events-auto absolute inset-x-0 bottom-0 z-10 p-3 pt-1">
        <div class="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-caption font-semibold uppercase tracking-wider text-fg-muted">Precificação</p>
          <div class="flex gap-2">
            <AppInput
              :icon="Clock"
              label="Por hora"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_hour"
            />
            <AppInput
              :icon="Calendar"
              label="Por dia"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_day"
            />
          </div>
          <AppButton
            :text="providerStore.loading ? 'Salvando...' : 'Confirmar localização'"
            type="submit"
            variant="primary"
            :loading="providerStore.loading"
          />
        </div>
      </div>
    </div>

    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-105 flex-col md:flex">
      <div class="pointer-events-auto p-5 pb-3">
        <p class="mb-2 flex w-fit items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-caption font-semibold text-fg shadow-card">
          <MapPin :size="14" :stroke-width="2" class="text-primary" aria-hidden="true" />
          Registre seu endereço e o preço de seu serviço
        </p>
        <SearchBar
          v-model="searchBarData"
          placeholder="Busque sua localização"
          @focus="searchedList = true"
          @blur="searchedList = false"
        />
      </div>

      <div
        v-if="(searchedData.length > 0 || loading) && searchedList"
        class="pointer-events-auto min-h-0 flex-1 overflow-y-auto px-5"
      >
        <div class="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div
            v-if="loading"
            class="flex items-center justify-center gap-2 p-4 text-body text-fg-muted"
            role="status"
          >
            <Loader2 :size="18" :stroke-width="2" class="animate-spin" aria-hidden="true" />
            <span>Buscando...</span>
          </div>
          <LocationCard
            v-for="(feature, index) in searchedData"
            :key="feature.properties?.osm_id || feature.properties?.osm_type + index"
            :feature="feature"
            @select="handleLocationSelect"
          />
        </div>
      </div>
      <div v-else class="min-h-0 flex-1"></div>

      <div class="pointer-events-auto p-5 pt-3">
        <div class="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
          <p class="text-caption font-semibold uppercase tracking-wider text-fg-muted">Precificação</p>
          <div class="flex gap-3">
            <AppInput
              :icon="Clock"
              label="Por hora"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_hour"
            />
            <AppInput
              :icon="Calendar"
              label="Por dia"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_day"
            />
          </div>
          <AppButton
            :text="providerStore.loading ? 'Salvando...' : 'Confirmar localização'"
            type="submit"
            variant="primary"
            :loading="providerStore.loading"
          />
        </div>
      </div>
    </div>
  </form>
</template>

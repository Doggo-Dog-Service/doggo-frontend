<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'
import LocationCard from '@/components/cards/LocationCard.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useRouter } from 'vue-router'
import { useGeolocation } from '@/composables/useGeolocation'
import { useLocation } from '@/composables/useLocation'
import { useMap } from '@/composables/useMap'

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
  border: 'solid 2px #2E7D6B',
  backgroundColor: '#A7F3D0',
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
    color: '#3b82f6',
    element: userElement,
  })

  fixedMarker.value = addMarker(longitude.value, latitude.value, {
    color: '#2E7D6B',
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
  <form @submit.prevent="handleRegister" class="h-dvh w-screen relative md:overflow-hidden">
    <div id="map" class="w-full h-full"></div>

    <div class="md:hidden">
      <div class="absolute top-0 left-0 right-0 z-10 p-4 pb-1 pointer-events-auto">
        <p class="text-sm text-doggo-black tracking-wider mb-1.5 text-center">
          <span class="mdi mdi-map-marker-outline text-doggo-primary/60"></span>
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
              class="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-doggo-gray rounded-xl shadow-lg"
            >
              <div class="flex items-center justify-center gap-2 p-4 text-sm text-doggo-black/50">
                <span class="mdi mdi-loading mdi-spin"></span>
                <span>Buscando...</span>
              </div>
            </div>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="searchedData.length > 0 && searchedList"
                class="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-doggo-gray rounded-xl shadow-lg overflow-hidden"
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
      <div class="absolute bottom-0 left-0 right-0 z-10 p-4 pt-1 pointer-events-auto">
        <div
          class="bg-white rounded-2xl border border-doggo-gray p-4 shadow-lg flex flex-col gap-3"
        >
          <p class="text-[10px] font-semibold text-doggo-black/40 uppercase tracking-widest">
            Precificação
          </p>
          <div class="flex gap-2">
            <AppInput
              icon="mdi mdi-clock-outline"
              label="Por hora"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_hour"
            />
            <AppInput
              icon="mdi mdi-calendar-outline"
              label="Por dia"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_day"
            />
          </div>
          <AppButton
            :text="providerStore.loading ? 'Salvando...' : 'Confirmar localização'"
            type="submit"
            mode="outline"
            :disabled="providerStore.loading"
          />
        </div>
      </div>
    </div>

    <div class="hidden md:flex absolute inset-y-0 left-0 w-105 z-10 flex-col pointer-events-none">
      <div class="p-6 pb-3 pointer-events-auto">
        <p class="text-sm text-doggo-black tracking-wide mb-2 flex items-center gap-1.5">
          <span class="mdi mdi-map-marker-outline text-doggo-primary/60"></span>
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
        class="flex-1 min-h-0 overflow-y-auto px-6 pointer-events-auto"
      >
        <div class="bg-white border border-doggo-gray rounded-xl shadow-lg overflow-hidden">
          <div
            v-if="loading"
            class="flex items-center justify-center gap-2 p-4 text-sm text-doggo-black/50"
          >
            <span class="mdi mdi-loading mdi-spin"></span>
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
      <div v-else class="flex-1 min-h-0"></div>

      <div class="p-6 pt-3 pointer-events-auto">
        <div
          class="bg-white rounded-2xl border border-doggo-gray p-5 shadow-lg flex flex-col gap-4"
        >
          <p class="text-xs font-semibold text-doggo-black/40 uppercase tracking-widest">
            Precificação
          </p>
          <div class="flex gap-3">
            <AppInput
              icon="mdi mdi-clock-outline"
              label="Por hora"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_hour"
            />
            <AppInput
              icon="mdi mdi-calendar-outline"
              label="Por dia"
              placeholder="R$ 0,00"
              type="number"
              v-model="data.price_per_day"
            />
          </div>
          <AppButton
            :text="providerStore.loading ? 'Salvando...' : 'Confirmar localização'"
            type="submit"
            mode="outline"
            :disabled="providerStore.loading"
          />
        </div>
      </div>
    </div>
  </form>
</template>

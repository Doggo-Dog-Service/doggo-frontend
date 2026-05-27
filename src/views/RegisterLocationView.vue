<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useRouter } from 'vue-router'
import { useGeolocation } from '@/composables/useGeolocation'
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
const { map, createMap, addMarker } = useMap()

const userMarker = ref(null)
const fixedMarker = ref(null)

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
      with: '20px',
      height: '20px',
    })
  }

  userMarker.value = addMarker(longitude.value, latitude.value, {
    color: '#3b82f6',
    element: userElement,
  })

  fixedMarker.value = addMarker(longitude.value, latitude.value, {
    color: '#ef4444',
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
</script>

<template>
  <div class="h-screen w-screen">
    <form
      class="flex flex-col gap-3 w-full h-full relative overflow-hidden md:flex-row md:gap-0"
      @submit.prevent="handleRegister"
    >
      <div id="map" class="w-full h-2/3 z-0 md:h-full md:w-2/3"></div>
      <div class="absolute top-0 bg-black/40 w-60 rounded-br-xl p-2">
        <p class="text-white font-semibold">Configure a sua localização de partida dos serviços</p>
      </div>
      <div class="flex flex-col gap-3 p-6 md:w-1/3">
        <AppInput
          icon="mdi mdi-currency-brl"
          placeholder="Ex: 49.90"
          label="Preço por hora"
          type="number"
          v-model="data.price_per_hour"
          required
        />
        <AppButton
          mode="outline"
          :text="providerStore.loading ? 'Registrando seu perfil...' : 'Criar meu perfil'"
          type="submit"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import L from 'leaflet'
import { onMounted, reactive } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useRouter } from 'vue-router'

const providerStore = useProviderStore()
const router = useRouter()

const data = reactive({
  fixed_latitude: null,
  fixed_longitude: null,
  price_per_hour: null,
  price_per_day: null,
  service_type: null,
})

const mapTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
})

const satelliteTile = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri' },
)

const baseMaps = {
  Mapa: mapTile,
  Satélite: satelliteTile,
}

const userIcon = L.icon({
  iconUrl: '/markers/user-marker.svg',
  iconSize: [20, 20]
})

const selectedIcon = L.icon({
  iconUrl: '/markers/selected-marker.svg',
  iconSize: [30, 36],
  iconAnchor: [15, 36]
})

let map

onMounted(async () => {
  console.log(Number(router.currentRoute.value.params.serviceTypeId))

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))

        map = L.map('map', {
          zoomControl: false,
          layers: [mapTile],
        }).setView([lat, lng], 13)

        L.control.layers(baseMaps).addTo(map)

        L.marker([lat, lng], { icon: userIcon}).addTo(map).bindPopup('Você está aqui')
        
        const selectedMarker = L.marker([lat, lng], { icon: selectedIcon})
          .bindPopup('Localização selecionada')
          .addTo(map)

        data.fixed_latitude = lat
        data.fixed_longitude = lng
        data.service_type = Number(router.currentRoute.value.params.serviceTypeId)

        map.on('click', (event) => {
          const lat = Number(event.latlng.lat.toFixed(6))
          const lng = Number(event.latlng.lng.toFixed(6))

          data.fixed_latitude = lat
          data.fixed_longitude = lng
          data.service_type = Number(router.currentRoute.value.params.serviceTypeId)

          selectedMarker.setLatLng([lat, lng])
        })
      },
      (error) => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }
})

const handleRegister = async () => {
  await providerStore.createProvider(data)
  router.push('/')
}
</script>

<template>
  <form class="flex flex-col gap-3 w-full h-full pb-4 px-4 relative overflow-hidden" @submit.prevent="handleRegister">
    <div id="map" class="w-full h-1/2 rounded-xl z-0"></div>
    <div class="absolute top-0 bg-black/40 w-60 rounded-br-xl rounded-tl-xl p-2">
      <p class="text-white font-semibold">Configure a sua localização de partida dos serviços</p>
    </div>
    <AppInput icon="mdi mdi-currency-brl" placeholder="Ex: 49.90" label="Preço por hora" type="number" v-model="data.price_per_hour" required/>
    <AppButton mode="outline" :text="providerStore.loading ? '...' : 'Criar meu perfil'" type="submit"/>
  </form>
</template>

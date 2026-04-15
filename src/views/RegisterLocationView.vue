<script setup>
import IconButton from '@/components/buttons/IconButton.vue'
import L from 'leaflet'
import { onMounted, ref } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useRouter } from 'vue-router'

const providerStore = useProviderStore()
const router = useRouter()

const data = ref({
  fixed_latitude: 0,
  fixed_longitude: 0,
  service_type: 0,
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
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)

        map = L.map('map', {
          zoomControl: false,
          layers: [mapTile],
        }).setView([lat, lng], 13)

        L.control.layers(baseMaps).addTo(map)

        L.marker([lat, lng], { icon: userIcon}).addTo(map).bindPopup('Você está aqui').openPopup()
        
        const selectedMarker = L.marker([lat, lng], { icon: selectedIcon})
          .bindPopup('Localização selecionada')
          .addTo(map)

        map.on('click', (event) => {
          const lat = event.latlng.lat.toFixed(6)
          const lng = event.latlng.lng.toFixed(6)

          data.value = {
            fixed_latitude: lat,
            fixed_longitude: lng,
            service_type: 1
          }

          selectedMarker.setLatLng([lat, lng])

          console.log([lat, lng])
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
  await providerStore.createProvider(data.value)
  router.push('/')
}
</script>

<template>
  <div class="w-full h-full pb-4 px-4 relative overflow-hidden">
    <div id="map" class="w-full h-full rounded-xl z-0"></div>
    <IconButton
      class="absolute bottom-12 right-8"
      icon="mdi mdi-check"
      tooltip="Confirmar localização"
      @event="handleRegister"
    />
    <div class="absolute top-0 bg-black/40 w-60 rounded-br-xl rounded-tl-xl p-2">
      <p class="text-white font-semibold">Configure a sua localização de partida dos serviços</p>
    </div>
  </div>
</template>

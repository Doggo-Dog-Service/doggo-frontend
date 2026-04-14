<script setup>
import IconButton from '@/components/buttons/IconButton.vue'
import L from 'leaflet'
import { onMounted, ref } from 'vue'

const data = ref({
  fixed_latitude: 0,
  fixed_longitude: 0
})

const mapTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
})

const satelliteTile = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri',
  },
)

const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB',
})

const baseMaps = {
  Mapa: mapTile,
  Satélite: satelliteTile,
  DarkMode: darkTile,
}

let map 

onMounted(async () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        map = L.map('map', {
          zoomControl: false,
          layers: [mapTile]
        }).setView([lat, lng], 13)

        L.control.layers(baseMaps).addTo(map)

        L.marker([lat, lng]).addTo(map).bindPopup('Você está aqui').openPopup()

        map.addEventListener('click', (event) => {
          data.value.fixed_latitude = event.latlng.lat
          data.value.fixed_longitude = event.latlng.lng
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
</script>

<template>
  <div class="w-full h-full pb-4 px-4 relative overflow-hidden">
    <div id="map" class="w-full h-full rounded-xl z-0"></div>
    <IconButton
      class="absolute bottom-12 right-8"
      icon="mdi mdi-check"
      tooltip="Confirmar localização"
    />
    <div class="absolute top-0 bg-black/40 w-60 rounded-br-xl rounded-tl-xl p-2">
      <p class="text-white font-semibold">Configure a sua localização de partida dos serviços</p>
    </div>
  </div>
</template>

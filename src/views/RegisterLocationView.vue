<script setup>
import L from 'leaflet'
import { onMounted } from 'vue'

let map

onMounted(async() => {
  
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      
      const lat = position.coords.latitude;
      const lng = position.coords.longitude

      map = L.map('map').setView([lat, lng], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup('Você está aqui')
        .openPopup()
    }, (error) => console.log(error), {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
  }
})  
  
</script>

<template>
  <div id="map" style="height: calc(100vh / 1.2)"></div>
</template>

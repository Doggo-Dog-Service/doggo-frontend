<script setup>
import L from 'leaflet'
import { onMounted } from 'vue';

let map

onMounted(() => {
  map = L.map('map').setView([-26.3044, -48.8487], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  L.marker([-26.3044, -48.8487])
    .addTo(map)
    .bindPopup('Dog Walker aqui 🐶')
})


</script>

<template>
  <div id="map" style="height: calc(100vh/1.2);"></div>
</template>

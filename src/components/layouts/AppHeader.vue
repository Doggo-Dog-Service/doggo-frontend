<script setup>
import { ref } from 'vue'

const cityName = ref('')
const stateAbbr = ref('')
const loading = ref(false)
const error = ref('')

const stateAbbreviations = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
}

async function getLocation() {
  if (!navigator.geolocation) {
    error.value = 'Geolocalização não suportada pelo navegador.'
    return
  }

  loading.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
      )
      const data = await res.json()
      const { city, town, village, state } = data.address

      cityName.value = city || town || village
      stateAbbr.value = stateAbbreviations[state] || state
      loading.value = false
    },
    (err) => {
      error.value = `Não foi possível obter a localização: ${err.message}`
      loading.value = false
    }
  )
}

getLocation()
</script>

<template>
  <div class="flex justify-between items-center px-2.5 py-5">
    <div class="flex items-center">
      <RouterLink to="/">
        <img class="w-25 mr-3" src="/logo.png" alt="">
      </RouterLink>
      <div class="flex items-center" v-if="loading">
        <span class="text-doggo-green">
          <i class="mdi mdi-map-marker"></i>
        </span>
        <h1 class="text-doggo-black font-semibold text-sm">
          Obtendo localização...
        </h1>
      </div>
      <div v-else-if="error">
        <h1 class="text-doggo-black font-semibold text-sm">{{ error }}</h1>
      </div>
      <div v-else-if="cityName" class="flex gap-1 items-center">
        <span class="text-doggo-green">
          <span class="mdi mdi-map-marker"></span>
        </span>
        <h1 class="text-doggo-black font-semibold text-sm">{{ cityName }}</h1>
        <h1 class="text-gray-400 text-sm">,</h1>
        <h1 class="text-gray-400 text-sm">{{ stateAbbr }}</h1>
      </div>
    </div>

    <!-- <RouterLink to="/notificacoes">
      <span class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5">
        <span class="mdi mdi-bell-outline"></span>
      </span>
    </RouterLink> -->
  </div>
</template>

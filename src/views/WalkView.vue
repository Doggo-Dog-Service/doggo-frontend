<script setup>
import PetCard from '@/components/cards/PetCard.vue'
import InfoCard from '@/components/cards/InfoCard.vue'
import SearchCard from '@/components/cards/SearchCard.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

import { useMap } from '@/composables/useMap'
import { useServiceWebSocket } from '@/composables/useServiceWebSocket'

const route = useRoute()

const authStore = useAuthStore()
const serviceWebSocketStore = useServiceWebSocketStore()

const serviceId = computed(() => route.params.id)

const profile = computed(() => {
  if (authStore.isClient) {
    return 'client'
  }

  if (authStore.isProvider) {
    return 'provider'
  }

  return 'stranger'
})

const { createMap, addMarker, flyTo } = useMap()

const providerMarker = ref(null)

const { websocket, connect, disconnect, startTracking, stopTracking, latitude, longitude } =
  useServiceWebSocket(serviceId.value, {
    onLocation: updateProviderMarker,
  })

const loading = ref(true)
const error = ref(null)

const serviceStatus = computed(() => serviceWebSocketStore.status)
const serviceProviderId = computed(() => serviceWebSocketStore.providerId)
const serviceProviderName = computed(() => serviceWebSocketStore.providerName)
const serviceServiceType = computed(() => serviceWebSocketStore.serviceType)
const servicePets = computed(() => serviceWebSocketStore.pets)
const currentDistance = computed(() => {
  const distance = serviceWebSocketStore.currentDistance

  if (distance == null) {
    return '0 m'
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`
  }

  return `${(distance / 1000).toFixed(2)} km`
})

const isWaiting = computed(() => serviceStatus.value === 2)
const isStarted = computed(() => serviceStatus.value === 3)
const isFinished = computed(() => serviceStatus.value === 4)
const isCancelled = computed(() => serviceStatus.value === 5)

function updateProviderMarker(location) {
  if (!location) {
    return
  }

  const lat = Number(location.latitude)
  const lng = Number(location.longitude)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return
  }

  if (!providerMarker.value) {
    providerMarker.value = addMarker(lng, lat)

    flyTo(lng, lat)

    return
  }

  providerMarker.value.setLngLat([lng, lat])
}

async function initializeWalk() {
  loading.value = true
  error.value = null

  try {
    await serviceWebSocketStore.getService(serviceId.value)

    if(isStarted.value) {
      await nextTick()

      createMap('map', [-48.8456, -26.3045], 15)
    }

    if (profile.value === 'provider') {
      connect()
      startTracking()
    }

    if (profile.value === 'client') {
      connect()
    }
  } catch (err) {
    console.error('Erro ao inicializar passeio:', err)

    error.value = 'Não foi possível carregar o serviço.'
  } finally {
    loading.value = false
  }
}

async function handleStartWalk() {
  try {
    await serviceWebSocketStore.startService()
  } catch (err) {
    console.error('Erro ao iniciar passeios:', err)
  }
}

onMounted(() => {
  initializeWalk()
})
</script>

<template>
  <div class="relative flex h-fit w-screen flex-col overflow-hidden pb-25 md:w-full">
    <div v-if="isStarted" id="map" class="w-full h-100 inset-0"></div>
    <div v-if="isStarted" class="w-full grid grid-cols-2 gap-2 p-4">
      <h1 class="w-full col-span-2 text-center font-semibold">Serviço em andamento</h1>
      <SearchCard
        class="col-span-2"
        v-if="serviceProviderId"
        :id="serviceProviderId"
        :full_name="serviceProviderName"
        :service="serviceServiceType"
        :link="`/provider/${serviceProviderId}/`"
      />
      <InfoCard icon="mdi mdi-clock-outline" description="Tempo" info="00:31:29"/>
      <InfoCard icon="mdi mdi-map-outline" description="Distância" :info="currentDistance"/>
      <h2 class="w-full col-span-2 font-semibold mt-4">Pets no passeio:</h2>
      <ul class="col-span-2 grid grid-cols-2 gap-2">
        <li v-for="pet in servicePets" :key="pet.id">
          <PetCard :name="pet.name" :pet_picture="pet.pet_picture" :breed="pet.breed"/>
        </li>
      </ul>
    </div>
  </div>
</template>

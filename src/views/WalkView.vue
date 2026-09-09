<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import InfoCard from '@/components/cards/InfoCard.vue'
import SearchCard from '@/components/cards/SearchCard.vue'
import { computed, nextTick, onMounted, ref } from 'vue'

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
  <div class="relative flex h-screen w-screen flex-col overflow-hidden md:w-full">
    <div v-if="isStarted" id="map" class="w-full h-1/2 inset-0"></div>
    <div class="w-full flex flex-col gap-2 p-4">
      <h1 v-if="isStarted" class="w-full text-center font-semibold">Serviço em andamento</h1>
      <SearchCard
        v-if="serviceProviderId"
        :id="serviceProviderId"
        :full_name="serviceProviderName"
        :service="serviceServiceType"
        :link="`/provider/${serviceProviderId}/`"
      />
    </div>
  </div>
</template>

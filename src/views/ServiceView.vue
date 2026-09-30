<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/buttons/AppButton.vue'
import ServiceActions from '@/components/service/ServiceActions.vue'
import ServiceActiveWalk from '@/components/service/ServiceActiveWalk.vue'
import ServiceDetailsPanel from '@/components/service/ServiceDetailsPanel.vue'
import ServiceErrorState from '@/components/service/ServiceErrorState.vue'
import ServiceLoadingState from '@/components/service/ServiceLoadingState.vue'
import ServiceRouteMap from '@/components/service/ServiceRouteMap.vue'
import ServiceStatusBadge from '@/components/service/ServiceStatusBadge.vue'

import { useAuthStore } from '@/stores/auth'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { useServiceWebSocket } from '@/composables/useServiceWebSocket'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const serviceWebSocketStore = useServiceWebSocketStore()

const serviceId = computed(() => route.params.id)

const pageLoading = ref(true)
const pageError = ref(null)

const { connect, disconnect, startTracking, stopTracking } = useServiceWebSocket(serviceId, {})

const role = computed(() => {
  if (authStore.isClient) return 'client'
  if (authStore.isProvider) return 'provider'
  return 'stranger'
})

const isParticipant = computed(() => {
  if (!serviceWebSocketStore.service) return false

  if (role.value === 'provider') {
    return serviceWebSocketStore.providerId === authStore.user?.provider_profile?.id
  }

  if (role.value === 'client') {
    return serviceWebSocketStore.clientId === authStore.user?.client_profile?.id
  }

  return false
})

const statusInfo = computed(() => {
  if (serviceWebSocketStore.isReview) {
    return {
      title: 'Nova solicitação',
      subtitle:
        role.value === 'provider'
          ? 'Confirme ou recuse este passeio.'
          : 'Aguarde a resposta do profissional.',
    }
  }

  if (serviceWebSocketStore.isWaiting) {
    return {
      title: 'Passeio confirmado',
      subtitle:
        role.value === 'provider'
          ? 'Quando estiver pronto, inicie o passeio.'
          : 'Aguarde o profissional iniciar o passeio.',
    }
  }

  if (serviceWebSocketStore.isCancelled) {
    return {
      title: 'Passeio cancelado',
      subtitle: 'Este passeio foi cancelado.',
    }
  }

  if (serviceWebSocketStore.isRejected) {
    return {
      title: 'Solicitação recusada',
      subtitle:
        role.value === 'provider'
          ? 'Você recusou esta solicitação.'
          : 'O profissional recusou esta solicitação.',
    }
  }

  return { title: 'Serviço', subtitle: '' }
})

const showActions = computed(() => serviceWebSocketStore.isReview || serviceWebSocketStore.isWaiting)

async function load() {
  pageLoading.value = true
  pageError.value = null

  try {
    await serviceWebSocketStore.getService(serviceId.value)

    if (!serviceWebSocketStore.service) {
      pageError.value = 'Serviço não encontrado.'
      return
    }

    if (isParticipant.value) {
      connect()
    }

    if (serviceWebSocketStore.isFinished) {
      await loadRoute()
    }
  } catch {
    pageError.value = serviceWebSocketStore.error || 'Não foi possível carregar o serviço.'
  } finally {
    pageLoading.value = false
  }
}

async function loadRoute() {
  try {
    await serviceWebSocketStore.getRoute()
  } catch {
    // erro já tratado na store
  }
}

watch(
  () => serviceWebSocketStore.service,
  () => {
    if (role.value !== 'provider') return

    if (serviceWebSocketStore.inProgress) {
      startTracking()
    } else {
      stopTracking()
    }
  },
  { immediate: true }
)

watch(
  () => serviceWebSocketStore.isFinished,
  (finished) => {
    if (finished) loadRoute()
  }
)

watch(serviceId, () => {
  disconnect()
  load()
})

load()
</script>

<template>
  <div class="relative w-full min-h-0">
    <ServiceLoadingState v-if="pageLoading" />

    <ServiceErrorState v-else-if="pageError" :message="pageError" @retry="load" />

    <div
      v-else-if="!isParticipant"
      class="w-full h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <span class="mdi mdi-shield-off-outline text-5xl text-doggo-green"></span>
      <p class="text-doggo-black/70 font-semibold">Você não tem acesso a este serviço.</p>
      <AppButton text="Voltar à página inicial" mode="outline" @event="router.push('/')" />
    </div>

    <ServiceActiveWalk
      v-else-if="serviceWebSocketStore.inProgress"
      :role="role"
      @complete="serviceWebSocketStore.completeService"
      @cancel="serviceWebSocketStore.cancelService"
    />

    <ServiceRouteMap v-else-if="serviceWebSocketStore.isFinished" :role="role" />

    <div v-else class="w-full flex flex-col items-center gap-4 p-4 pb-30 md:p-8 md:pb-4">
      <div class="w-full max-w-160 flex flex-col gap-4">
        <header class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-2xl font-bold">{{ statusInfo.title }}</h1>
          <ServiceStatusBadge :status="serviceWebSocketStore.status" />
          <p class="text-doggo-black/50 font-semibold">{{ statusInfo.subtitle }}</p>
        </header>

        <ServiceDetailsPanel :role="role" />

        <ServiceActions
          v-if="showActions"
          :role="role"
          :status="serviceWebSocketStore.status"
          :busy="serviceWebSocketStore.loading"
          @confirm="serviceWebSocketStore.confirmService"
          @reject="serviceWebSocketStore.rejectService"
          @start="serviceWebSocketStore.startService"
          @cancel="serviceWebSocketStore.cancelService"
        />
      </div>
    </div>
  </div>
</template>
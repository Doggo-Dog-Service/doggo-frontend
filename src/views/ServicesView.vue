<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AlertCircle, Footprints, SearchX } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import ServiceCard from '@/components/cards/ServiceCard.vue'
import { serviceStatus } from '@/utils/serviceStatus'
import { filterServices } from '@/utils/serviceFilters'
import { useServiceStore } from '@/stores/services'

const route = useRoute()
const serviceStore = useServiceStore()

// Filtro vindo da rota (/hoje, /pedidos) ou de ?filtro=. Sem filtro: lista completa + chips de status.
const routeFilter = computed(() => route.meta.filter ?? route.query.filtro ?? 'todos')
const hasRouteFilter = computed(() => ['ativos', 'pendentes'].includes(routeFilter.value))

const selectedStatus = ref(0)

const services = computed(() => filterServices(serviceStore.serivces, routeFilter.value))

const TITLES = {
  1: 'Serviços Em Análise',
  2: 'Serviços Confirmados',
  3: 'Serviços Em Andamento',
  4: 'Serviços Concluídos',
  5: 'Serviços Cancelados',
  6: 'Serviços Recusados',
}
const titleLabel = computed(() => {
  if (routeFilter.value === 'ativos') return 'Passeios de hoje'
  if (routeFilter.value === 'pendentes') return 'Pedidos'
  return TITLES[selectedStatus.value] ?? 'Todos os Serviços'
})

const emptyText = computed(() => {
  if (routeFilter.value === 'ativos') return 'Nenhum passeio confirmado ou em andamento.'
  if (routeFilter.value === 'pendentes') return 'Nenhum pedido aguardando resposta.'
  return 'Nenhum serviço encontrado.'
})

const isSelected = (statusId) => selectedStatus.value === statusId
function select(statusId) {
  selectedStatus.value = statusId === selectedStatus.value ? 0 : statusId
}

const statusById = (statusId) => serviceStatus.find((status) => status.id === statusId)

function load() {
  if (hasRouteFilter.value || selectedStatus.value === 0) return serviceStore.getServices()
  return serviceStore.getServices({ status: selectedStatus.value })
}

onMounted(load)
watch(selectedStatus, load)
</script>

<template>
  <section class="flex flex-col gap-5">
    <h1 class="hidden text-display text-fg md:block">{{ titleLabel }}</h1>

    <ul
      v-if="!hasRouteFilter"
      class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
      aria-label="Filtrar por status"
    >
      <li v-for="status in serviceStatus" :key="status.id" class="shrink-0">
        <button
          type="button"
          :aria-pressed="isSelected(status.id)"
          :class="[
            'min-h-11 cursor-pointer rounded-full border px-4 text-body font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary',
            isSelected(status.id)
              ? 'border-primary bg-primary text-primary-fg'
              : 'border-line bg-surface text-fg hover:bg-surface-muted',
          ]"
          @click="select(status.id)"
        >
          {{ status.name }}
        </button>
      </li>
    </ul>

    <div v-if="serviceStore.loading" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando serviços">
      <UiSkeleton v-for="n in 3" :key="n" shape="rect" />
    </div>
    <UiEmptyState
      v-else-if="serviceStore.serviceError"
      :icon="AlertCircle"
      title="Não foi possível carregar os passeios"
    >
      <template #action>
        <AppButton text="Tentar novamente" @event="load" />
      </template>
    </UiEmptyState>
    <ul v-else-if="services.length > 0" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <li v-for="service in services" :key="service.id">
        <ServiceCard
          :id="service.id"
          :client-name="service.client_name"
          :client-picture="service.client_picture"
          :provider-name="service.provider_name"
          :provider-picture="service.provider_picture"
          :service-type="service.service_type"
          :pets="service.pets"
          :price="service.price"
          :status="statusById(service.status)?.name"
          :start-date-time="service.start_datetime"
          :end-date-time="service.end_datetime"
          :created-at="service.created_at"
          :color="statusById(service.status)?.color"
        />
      </li>
    </ul>
    <UiEmptyState
      v-else
      :icon="hasRouteFilter ? Footprints : SearchX"
      :title="emptyText"
    />
  </section>
</template>

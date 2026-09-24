<script setup>
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import { serviceStatus } from '@/utils/serviceStatus'
import { useServiceStore } from '@/stores/services'
import { computed, onMounted, ref, watch } from 'vue'
import ServiceCard from '@/components/cards/ServiceCard.vue'

const serviceStore = useServiceStore()

const services = computed(() => serviceStore.serivces)
const selectedStatus = ref(0)

const isSelected = (statusId) => selectedStatus.value === statusId
function select(statusId) {
  if (statusId === selectedStatus.value) {
    selectedStatus.value = 0
    return
  }
  selectedStatus.value = statusId
}

function getStatusName(statusId) {
  const status = serviceStatus.find((status) => status.id === statusId)
  return status.name
}

function getStatusColor(statusId) {
  const status = serviceStatus.find((status) => status.id === statusId)
  return status.color
}

onMounted(async () => {
  await serviceStore.getServices()
})

watch(selectedStatus, async (newSelected) => {
  if (newSelected === 0) {
    await serviceStore.getServices()
    return
  }

  await serviceStore.getServices({
    status: newSelected,
  })
})
</script>

<template>
  <div class="grid grid-cols-1 w-full p-6 gap-5">
    <h1 class="text-3xl md:text-4xl font-bold text-doggo-black">
      Serviços
      <span class="mdi mdi-dog-service text-doggo-green"></span>
    </h1>
    <ul class="flex gap-2 overflow-x-auto pb-4">
      <li v-for="status in serviceStatus" :key="status.id">
        <ChoseButton
          :text="status.name"
          :selected="isSelected(status.id)"
          @select="select(status.id)"
        />
      </li>
    </ul>
    <div v-if="serviceStore.loading" class="w-full grid gap-2 justify-center text-doggo-green">
      <span class="mdi mdi-loading text-6xl text-center animate-spin"></span>
      <p>Carregando</p>
    </div>
    <ul v-else-if="services.length > 0" class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
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
          :status="getStatusName(service.status)"
          :start-date-time="service.start_datetime"
          :end-date-time="service.end_datetime"
          :created-at="service.created_at"
          :color="getStatusColor(service.status)"
        />
      </li>
    </ul>
    <div v-else class="w-full grid gap-2 justify-center text-doggo-green">
      <span class="mdi mdi-magnify text-6xl text-center"></span>
      <p>Nenhum serviço encontrado</p>
    </div>
  </div>
</template>

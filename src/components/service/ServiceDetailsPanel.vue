<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import ServicePartyCard from '@/components/service/ServicePartyCard.vue'
import ServicePetsList from '@/components/service/ServicePetsList.vue'

import { computed } from 'vue'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/time'

const store = useServiceWebSocketStore()

defineProps({
  role: {
    type: String,
    required: true,
  },
})

const priceLabel = computed(() => formatCurrency(store.price))
const startLabel = computed(() => formatDateTime(store.startDatetime))
const endLabel = computed(() => formatDateTime(store.endDatetime))
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <ServicePartyCard :role="role" />
    <div class="grid grid-cols-2 gap-2">
      <InfoCard icon="mdi mdi-cash" description="Preço" :info="priceLabel" />
      <InfoCard icon="mdi mdi-calendar-clock" description="Início" :info="startLabel" />
      <InfoCard v-if="store.endDatetime" icon="mdi mdi-clock-outline" description="Fim" :info="endLabel" />
    </div>
    <ServicePetsList />
  </div>
</template>
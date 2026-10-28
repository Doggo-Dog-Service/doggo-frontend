<script setup>
import { computed } from 'vue'
import { Dog } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import ServiceStatusBadge from '@/components/service/ServiceStatusBadge.vue'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/time'

const props = defineProps({
  id: { type: Number, required: true },
  participantName: { type: String, required: true },
  participantPicture: { type: String, default: '' },
  pets: { type: Array, default: () => [] },
  price: { type: [String, Number], required: true },
  status: { type: Number, required: true },
  startDateTime: { type: String, default: '' },
})

const link = computed(() => `/service/${props.id}`)
const petNames = computed(() => props.pets.map((pet) => pet.name).join(', '))
</script>

<template>
  <RouterLink
    :to="link"
    class="flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
  >
    <UiAvatar :src="props.participantPicture" :name="props.participantName" size="lg" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-subtitle text-fg">{{ props.participantName }}</p>
      <p v-if="petNames" class="flex items-center gap-1 truncate text-caption text-fg-muted">
        <Dog :size="14" :stroke-width="2" class="shrink-0" aria-hidden="true" />
        <span class="truncate">{{ petNames }}</span>
      </p>
      <p class="truncate text-caption text-fg-muted">{{ formatDateTime(props.startDateTime) }}</p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-1">
      <span class="text-title text-fg">{{ formatCurrency(props.price) }}</span>
      <ServiceStatusBadge :status="props.status" />
    </div>
  </RouterLink>
</template>

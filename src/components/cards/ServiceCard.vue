<script setup>
import { computed } from 'vue'
import { Briefcase, Dog } from 'lucide-vue-next'
import { formatDateTime } from '@/utils/time'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPicture: {
    type: String,
    required: false,
  },
  providerName: {
    type: String,
    required: true,
  },
  providerPicture: {
    type: String,
    required: false,
  },
  serviceType: {
    type: String,
    required: true,
  },
  pets: {
    type: Array,
    required: true,
  },
  price: {
    type: [String, Number],
    required: true,
  },
  status: {
    type: [String, Number],
    required: true,
  },
  startDateTime: {
    type: String,
    required: true,
  },
  endDateTime: {
    type: String,
    required: false,
  },
  createdAt: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    validator: (value) => ['yellow', 'blue', 'green', 'red'].includes(value),
  },
})

const link = computed(() => `/service/${props.id}`)

const ACCENTS = {
  yellow: { bar: 'border-l-warning lg:border-t-warning', text: 'text-warning' },
  blue: { bar: 'border-l-info lg:border-t-info', text: 'text-info' },
  green: { bar: 'border-l-success lg:border-t-success', text: 'text-success' },
  red: { bar: 'border-l-danger lg:border-t-danger', text: 'text-danger' },
}
const accent = computed(() => ACCENTS[props.color])
</script>

<template>
  <RouterLink
    :to="link"
    :class="[
      'grid h-50 w-full grid-rows-2 rounded-card border border-l-4 border-line bg-surface p-4 shadow-card transition-transform hover:scale-98 active:scale-99 focus-visible:ring-2 focus-visible:ring-primary lg:border-l lg:border-t-4',
      accent.bar,
    ]"
  >
    <div class="row-span-1 flex justify-between gap-2">
      <h2 class="flex min-w-0 items-start gap-2 text-subtitle text-fg">
        <Briefcase :size="20" :stroke-width="2" :class="['mt-0.5 shrink-0', accent.text]" aria-hidden="true" />
        <span class="truncate">{{ props.serviceType }}</span>
      </h2>
      <ul class="flex shrink-0">
        <li v-for="(pet, index) in props.pets" :key="pet.id" :class="[index > 0 && '-ml-6']">
          <img
            v-if="pet.pet_picture"
            :src="pet.pet_picture"
            :alt="pet.name"
            class="size-10 rounded-full border-2 border-surface object-cover"
          />
          <div
            v-else
            class="grid size-10 items-center justify-center rounded-full border-2 border-surface bg-primary-soft text-primary"
            role="img"
            :aria-label="pet.name"
          >
            <Dog :size="20" :stroke-width="2" aria-hidden="true" />
          </div>
        </li>
      </ul>
    </div>
    <div class="flex w-full min-w-0 items-end gap-2">
      <ul class="w-full min-w-0 text-caption text-fg-muted">
        <li class="w-full truncate">Profissional: {{ props.providerName }}</li>
        <li class="w-full truncate">Cliente: {{ props.clientName }}</li>
        <li class="w-full truncate">Início: {{ formatDateTime(props.startDateTime) }}</li>
        <li v-if="props.endDateTime" class="w-full truncate">
          Fim: {{ formatDateTime(props.endDateTime) }}
        </li>
      </ul>
      <ul class="grid justify-end text-right">
        <li class="flex gap-1 text-title text-fg">
          <span>R$</span>
          <p>{{ props.price }}</p>
        </li>
        <li>
          <span :class="['text-caption font-semibold text-nowrap', accent.text]">{{ props.status }}</span>
        </li>
      </ul>
    </div>
  </RouterLink>
</template>

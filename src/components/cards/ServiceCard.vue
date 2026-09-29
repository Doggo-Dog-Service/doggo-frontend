<script setup>
import { computed } from 'vue'
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
const isYellow = computed(() => props.color === 'yellow')
const isBlue = computed(() => props.color === 'blue')
const isGreen = computed(() => props.color === 'green')
const isRed = computed(() => props.color === 'red')
</script>

<template>
  <RouterLink
    :to="link"
    :class="[
      'grid grid-rows-2 w-full h-50 rounded-xl p-4 bg-white border-l-4 border border-doggo-gray lg:border-l lg:border-l-doggo-gray lg:border-t-4 transition-transform hover:scale-98 active:scale-99',
      isYellow && 'border-l-yellow-400 lg:border-t-yellow-400',
      isBlue && 'border-l-blue-400 lg:border-t-blue-400',
      isGreen && 'border-l-doggo-green lg:border-t-doggo-green',
      isRed && 'border-l-red-400 lg:border-t-red-400',
    ]"
  >
    <div class="flex justify-between row-span-1">
      <h2 class="text-xl font-semibold">
        <span
          :class="[
            'mdi mdi-briefcase-variant',
            isYellow && 'text-yellow-400',
            isBlue && 'text-blue-400',
            isGreen && 'text-doggo-green',
            isRed && 'text-red-400',
          ]"
        ></span>
        {{ props.serviceType }}
      </h2>
      <ul class="flex">
        <li v-for="(pet, index) in props.pets" :key="pet.id" :class="[index > 0 && '-ml-6']">
          <img
            v-if="pet.pet_picture"
            :src="pet.pet_picture"
            :alt="pet.name"
            class="rounded-full w-10 h-10 object-cover"
          />
          <div
            class="grid justify-center items-center h-10 w-10 bg-doggo-light-green text-doggo-green rounded-full"
            v-else
          >
            <span class="mdi mdi-dog text-xl"></span>
          </div>
        </li>
      </ul>
    </div>
    <div class="w-full flex items-end gap-2 min-w-0">
      <ul class="w-full min-w-0">
        <li class="w-full truncate">Profissional: {{ props.providerName }}</li>
        <li class="w-full truncate">Cliente: {{ props.clientName }}</li>
        <li class="w-full truncate">Início: {{ formatDateTime(props.startDateTime) }}</li>
        <li v-if="props.endDateTime" class="w-full truncate">
          Fim: {{ formatDateTime(props.endDateTime) }}
        </li>
      </ul>
      <ul class="grid justify-end">
        <li class="flex gap-1 text-xl">
          <span>R$</span>
          <p>{{ props.price }}</p>
        </li>
        <li>
          <span
            :class="[
              'font-semibold text-nowrap',
              isYellow && 'text-yellow-400',
              isBlue && 'text-blue-400',
              isGreen && 'text-doggo-green',
              isRed && 'text-red-400',
            ]"
            >{{ props.status }}</span
          >
        </li>
      </ul>
    </div>
  </RouterLink>
</template>

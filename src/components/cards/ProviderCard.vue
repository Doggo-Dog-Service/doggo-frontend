<script setup>
import { computed } from 'vue'
import { formatDistance } from '@/utils/distance'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  service_name: {
    type: String,
    default: '',
  },
  profile_photo: {
    type: String,
    default: '',
  },
  price_per_hour: {
    type: [String, Number],
    default: null,
  },
  price_per_day: {
    type: [String, Number],
    default: null,
  },
  classification: {
    type: [String, Number],
    default: null,
  },
  distance: {
    type: Number,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: false,
  },
})

const formatPrice = (value) => {
  const number = Number(value)
  if (Number.isNaN(number)) return ''
  return number.toFixed(2).replace('.', ',').replace(/,00$/, '')
}

const priceLabel = computed(() => {
  if (props.price_per_hour != null && props.price_per_hour !== '') {
    return `R$ ${formatPrice(props.price_per_hour)}/h`
  }
  if (props.price_per_day != null && props.price_per_day !== '') {
    return `R$ ${formatPrice(props.price_per_day)}/dia`
  }
  return 'A combinar'
})

const ratingLabel = computed(() => {
  if (props.classification == null) return ''
  const rating = Number(props.classification)
  if (Number.isNaN(rating)) return ''
  return rating.toFixed(1).replace('.', ',')
})

const distanceLabel = computed(() => {
  const label = formatDistance(props.distance)
  return label ? `${label} de você` : ''
})
</script>

<template>
  <RouterLink
    class="w-full flex justify-between bg-white p-4 border border-doggo-gray rounded-xl transition-all duration-200 active:scale-98 active:opacity-70 hover:scale-99"
    :to="`/provider/${props.id}`"
  >
    <div class="flex items-center gap-4 min-w-0">
      <img
        v-if="props.profile_photo"
        class="h-15 w-15 rounded-xl object-cover shrink-0"
        :src="props.profile_photo"
        :alt="`${props.full_name.toLowerCase()}-photo`"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-15 w-15 rounded-xl bg-doggo-light-green shrink-0"
      >
        <p class="text-white text-xl">{{ props.full_name.charAt() }}</p>
      </div>
      <div class="min-w-0">
        <h3 class="text-base font-semibold truncate">{{ props.full_name }}</h3>
        <div v-if="distanceLabel" class="flex items-center gap-1 mt-0.5">
          <span class="mdi mdi-map-marker text-sm text-doggo-green"></span>
          <p class="text-sm text-zinc-400 truncate">{{ distanceLabel }}</p>
        </div>
        <div v-if="props.service_name" class="flex items-center text-sm text-zinc-400 gap-2">
          <span class="mdi mdi-briefcase-variant"></span>
          <p class="truncate">{{ props.service_name }}</p>
        </div>
        <div v-if="ratingLabel" class="flex items-center text-sm gap-1">
          <span class="mdi mdi-star text-amber-400"></span>
          <p class="font-semibold">{{ ratingLabel }}</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-between items-end shrink-0">
      <div
        :class="[
          'flex items-center gap-1 text-sm rounded-full px-2',
          props.is_active ? 'text-doggo-green' : 'text-red-700',
        ]"
      >
        <span class="mdi mdi-circle text-[10px]"></span>
        <p>{{ props.is_active ? 'Online' : 'Offline' }}</p>
      </div>
      <p class="text-doggo-green text-sm font-semibold whitespace-nowrap">
        {{ priceLabel }}
      </p>
    </div>
  </RouterLink>
</template>

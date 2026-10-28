<script setup>
import { computed } from 'vue'
import { BriefcaseBusiness, Circle, MapPin, Star } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { formatDistance } from '@/utils/distance'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  profile_photo: {
    type: String,
    default: '',
  },
  full_name: {
    type: String,
    required: true,
  },
  service_name: {
    type: String,
    default: '',
  },
  distance: {
    type: Number,
    default: null,
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
    type: [Number, String],
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
  return 'indefinido'
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
    class="flex w-full justify-between gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition-colors duration-200 hover:bg-surface-muted active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    :to="`/provider/${props.id}`"
  >
    <div class="flex min-w-0 items-center gap-4">
      <UiAvatar :src="props.profile_photo" :name="props.full_name" size="lg" />
      <div class="min-w-0">
        <h3 class="w-full truncate text-subtitle text-fg">{{ props.full_name }}</h3>
        <div v-if="distanceLabel" class="mt-0.5 flex items-center gap-1 text-caption text-fg-muted">
          <MapPin :size="14" :stroke-width="2" class="shrink-0 text-primary" aria-hidden="true" />
          <p class="truncate">{{ distanceLabel }}</p>
        </div>
        <div v-if="props.service_name" class="flex items-center gap-1 text-caption text-fg-muted">
          <BriefcaseBusiness :size="14" :stroke-width="2" class="shrink-0" aria-hidden="true" />
          <p class="truncate">{{ props.service_name }}</p>
        </div>
        <div class="flex items-center gap-1 text-caption text-fg">
          <Star :size="14" :stroke-width="2" fill="currentColor" class="text-warning" aria-hidden="true" />
          <p class="font-semibold">{{ ratingLabel || '--' }}</p>
        </div>
      </div>
    </div>
    <div class="flex shrink-0 flex-col items-end justify-between">
      <div
        :class="[
          'flex items-center gap-1 text-caption font-semibold',
          props.is_active ? 'text-success' : 'text-danger',
        ]"
      >
        <Circle :size="10" :stroke-width="2" fill="currentColor" aria-hidden="true" />
        <p>{{ props.is_active ? 'Online' : 'Offline' }}</p>
      </div>
      <p class="text-body font-semibold text-primary">
        {{ priceLabel }}
      </p>
    </div>
  </RouterLink>
</template>

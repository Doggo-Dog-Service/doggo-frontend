<script setup>
import { MapPin, Star } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { formatCurrency } from '@/utils/currency'
import { formatDistance } from '@/utils/distance'

defineProps({
  providers: { type: Array, required: true },
})

const rating = (p) => {
  const n = Number(p.classification)
  return p.classification == null || Number.isNaN(n) ? '--' : n.toFixed(1).replace('.', ',')
}

const price = (p) => {
  if (p.price_per_hour != null && p.price_per_hour !== '') return `${formatCurrency(p.price_per_hour)}/h`
  if (p.price_per_day != null && p.price_per_day !== '') return `${formatCurrency(p.price_per_day)}/dia`
  return ''
}
</script>

<template>
  <ul
    class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
  >
    <li
      v-for="provider in providers"
      :key="provider.id"
      data-testid="nearby-provider"
      class="w-44 shrink-0 snap-start sm:w-auto"
    >
      <RouterLink
        :to="`/provider/${provider.id}`"
        class="flex h-full flex-col items-center gap-2 rounded-card border border-line bg-surface p-4 text-center shadow-card transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <UiAvatar :src="provider.profile_picture" :name="provider.full_name" size="lg" />
        <p class="w-full truncate text-subtitle text-fg">{{ provider.full_name }}</p>
        <p class="flex items-center gap-1 text-caption text-fg">
          <UiIcon :icon="Star" :size="14" class="fill-current text-warning" />
          <span class="font-semibold">{{ rating(provider) }}</span>
        </p>
        <p v-if="formatDistance(provider.distance)" class="flex items-center gap-1 text-caption text-fg-muted">
          <UiIcon :icon="MapPin" :size="14" class="text-primary" />
          {{ formatDistance(provider.distance) }}
        </p>
        <p v-if="price(provider)" class="text-body font-semibold text-primary">{{ price(provider) }}</p>
      </RouterLink>
    </li>
  </ul>
</template>

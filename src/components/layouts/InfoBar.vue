<script setup>
import { Clock, MessagesSquare, Star } from 'lucide-vue-next'
import InfoCard from '../cards/InfoCard.vue'
import { useProvider } from '@/composables/useProvider'
import { useReviewStore } from '@/stores/review.js'

const { experienceTime, experienceLabel } = useProvider()
const reviewStore = useReviewStore()
</script>

<template>
  <div class="flex w-full items-stretch gap-2">
    <InfoCard :info="reviewStore.media" description="Nota" :icon="Star" />
    <InfoCard
      :info="reviewStore.reviews.length !== 0 ? reviewStore.reviews.length : '--'"
      description="Avaliações"
      :icon="MessagesSquare"
    />
    <InfoCard :info="`${experienceTime} ${experienceLabel}`" description="Experiência" :icon="Clock" />
  </div>
</template>

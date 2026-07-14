<script setup>
import InfoCard from '../cards/InfoCard.vue'
import { useProvider } from '@/composables/useProvider'
import { useReviewStore } from '@/stores/review.js'

const { experienceTime, experienceLabel } = useProvider()
const reviewStore = useReviewStore()
</script>

<template>
  <div
    class="flex items-center w-full gap-2"
  >
    <InfoCard :info="reviewStore.media" description="Nota" icon="mdi mdi-star-outline"/>
    <InfoCard :info="reviewStore.reviews.length !== 0 ? reviewStore.reviews.length : '--'" description="Avaliações" icon="mdi mdi-comment-multiple-outline"/>
    <InfoCard :info="`${experienceTime} ${experienceLabel}`" description="Experiência" icon="mdi mdi-clock-outline"/>
  </div>
</template>

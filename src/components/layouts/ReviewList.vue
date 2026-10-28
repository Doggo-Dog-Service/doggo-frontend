<script setup>
import ReviewCard from '../cards/ReviewCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { MessagesSquare } from 'lucide-vue-next'
import { useReviewStore } from '@/stores/review.js'

const reviewStore = useReviewStore()
</script>
<template>
  <section class="flex h-120 flex-col gap-4 overflow-y-auto">
    <h2 class="text-title text-fg">Avaliações ({{ reviewStore.reviews.length }})</h2>
    <ReviewCard v-for="review in reviewStore.reviews" :key="review.id" :review="review" />
    <UiEmptyState
      v-if="reviewStore.reviews.length === 0"
      :icon="MessagesSquare"
      title="Este prestador ainda não possui avaliações."
    />
  </section>
</template>

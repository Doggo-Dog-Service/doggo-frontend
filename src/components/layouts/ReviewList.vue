<script setup>
import ReviewCard from '../cards/ReviewCard.vue';

defineProps({
  reviews: {
    type: Array,
    default: () => [],
  },
})
</script>
<template>
  <div class="flex flex-col gap-4 mx-2 h-120 overflow-y-auto">
    <h2 class="text-xl">
      Avaliações ({{ reviews.length }})
    </h2>
    <ReviewCard
      v-for="review in reviews"
      :key="review.id"
      :review="review"
    />
    <p v-if="reviews.length === 0" class="ml-5 mt-2 text-doggo-green font-semibold">
      Este prestador ainda não possui avaliações.
    </p>
  </div>
</template>

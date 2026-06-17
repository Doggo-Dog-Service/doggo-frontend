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
  <div class="flex flex-col gap-4 mx-2">
    <h2 class="text-xl">
      Avaliações
    </h2>
    <ReviewCard
      v-for="review in reviews"
      :key="review.id"
      :review="review"
    />
    <p v-if="reviews.length === 0" class="ml-5 mt-2">
      Este prestador ainda não possui avaliações.
    </p>
  </div>
</template>

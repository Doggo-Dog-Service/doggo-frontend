import { defineStore } from 'pinia'
import * as reviewService from '@/services/reviews'
import { computed, ref } from 'vue'

export const useReviewStore = defineStore('reviewStore', () => {
  const loading = ref(false)
  const reviews = ref([])
  const media = computed(() => {
    if(reviews.value.length <= 0) return '--'
    let total = 0
    reviews.value.forEach((review) => total+=review.rating)
    return (total / reviews.value.length).toFixed(1)
  })

  async function getReviews(params) {
    loading.value = true
    const response = await reviewService.getReviews(params)
    reviews.value = response.results
    loading.value = false
  }

  return {
    loading,
    reviews,
    media,
    getReviews,
  }
})

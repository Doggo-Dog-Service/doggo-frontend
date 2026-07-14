import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import * as reviewService from '@/services/reviews'
import { computed, ref } from 'vue'

export const useReviewStore = defineStore('reviewStore', () => {
  const $toast = useToast()

  const loading = ref(false)
  const reviews = ref([])
  const media = computed(() => {
    if(reviews.value.length <= 0) return '--'
    let total = 0
    reviews.value.forEach((review) => total+=review.rating)
    return total
  })

  async function getReviews(params) {
    loading.value = true
    const response = await reviewService.getReviews(params)
    reviews.value = response.results
    loading.value = false
  }

  async function postReview(data) {
    try {
      loading.value = true
      const response = await reviewService.postReview(data)
      $toast.success('Agradecemos pelo feedback!', {
        type: 'success',
        position: 'top-right',
        duration: 3000,
      })
      return response
    } catch (error) {
      $toast.error(error.message, {
        type: 'error',
        position: 'top-right',
        duration: 3000,
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    reviews,
    media,
    getReviews,
    postReview,
  }
})

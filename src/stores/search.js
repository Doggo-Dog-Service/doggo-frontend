import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as searchService from '@/services/searchService'

export const useSearchStore = defineStore('searchStore', () => {
  const loading = ref(false)
  const searched = ref({})

  const globalSearch = async (query) => {
    try {
      loading.value = true
      const response = await searchService.globalSearchService(query)
      console.log(response)
      searched.value = response
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    searched,
    globalSearch,
  }
})

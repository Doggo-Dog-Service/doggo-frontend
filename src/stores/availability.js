import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as availabilityService from '@/services/availabilityService'
import { toDateParam } from '@/utils/date'

export const useAvailabilityStore = defineStore('availabilityStore', () => {
  const loading = ref(false)
  const error = ref('')
  const slots = ref([])
  const slotsDate = ref(null)

  // Contador não reativo usado para invalidar respostas obsoletas:
  // só a última requisição em andamento pode gravar estado.
  let lastRequestId = 0

  const getSlots = async (providerId, date) => {
    const dateParam = toDateParam(date)

    lastRequestId += 1
    const requestId = lastRequestId

    slots.value = []
    error.value = ''
    slotsDate.value = dateParam || null

    if (!providerId || !dateParam) return

    try {
      loading.value = true
      const data = await availabilityService.getAvailabilitySlots({
        provider: providerId,
        date: dateParam,
      })

      if (requestId !== lastRequestId) return

      slots.value = data.available_slots ?? []
    } catch (err) {
      if (requestId !== lastRequestId) return

      error.value = err.message
      slots.value = []
    } finally {
      if (requestId === lastRequestId) {
        loading.value = false
      }
    }
  }

  const clearSlots = () => {
    lastRequestId += 1
    slots.value = []
    slotsDate.value = null
    error.value = ''
    loading.value = false
  }

  return {
    loading,
    error,
    slots,
    slotsDate,
    getSlots,
    clearSlots,
  }
})

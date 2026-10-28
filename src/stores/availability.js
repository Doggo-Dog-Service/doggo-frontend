import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as availabilityService from '@/services/availabilityService'
import { toDateParam } from '@/utils/date'
import notify from '@/utils/notify'

export const useAvailabilityStore = defineStore('availabilityStore', () => {
  const loading = ref(false)
  const error = ref('')
  const slots = ref([])
  const slotsDate = ref(null)

  // Agenda semanal do passeador (intervalos de disponibilidade).
  const intervals = ref([])
  const intervalsLoading = ref(false)
  const intervalsError = ref('')

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

  const fetchMine = async () => {
    intervalsLoading.value = true
    intervalsError.value = ''
    try {
      intervals.value = await availabilityService.getMyAvailability()
    } catch (err) {
      intervals.value = []
      intervalsError.value = err.message
    } finally {
      intervalsLoading.value = false
    }
  }

  const create = async (payload) => {
    try {
      const created = await availabilityService.createAvailability(payload)
      intervals.value = [...intervals.value, created]
      return created
    } catch (err) {
      notify.error(err.message)
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await availabilityService.removeAvailability(id)
      intervals.value = intervals.value.filter((i) => i.id !== id)
    } catch (err) {
      notify.error(err.message)
      throw err
    }
  }

  return {
    intervals,
    intervalsLoading,
    intervalsError,
    fetchMine,
    create,
    remove,
    loading,
    error,
    slots,
    slotsDate,
    getSlots,
    clearSlots,
  }
})

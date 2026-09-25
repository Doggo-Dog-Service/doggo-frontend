import { computed } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { storeToRefs } from 'pinia'

export function useProvider() {
  const store = useProviderStore()

  const { currentProvider } = storeToRefs(store)

  const experienceDays = computed(() => {
    if (!currentProvider.value?.created_at) return 0

    const difference =
      Date.now() - new Date(currentProvider.value.created_at).getTime()

    return Math.floor(difference / (1000 * 60 * 60 * 24))
  })

  const experienceTime = computed(() => {
    if (experienceDays.value < 30) return experienceDays.value

    else if (
      experienceDays.value >= 30 &&
      experienceDays.value < 365
    ) {
      return Math.floor(experienceDays.value / 30)
    }

    else {
      return Math.floor(experienceDays.value / 365)
    }
  })

  const experienceLabel = computed(() => {
    if (experienceDays.value < 30) {
      if (experienceTime.value == 1) return 'dia'
      else return 'dias'
    }

    else if (
      experienceDays.value >= 30 &&
      experienceDays.value < 365
    ) {
      if (experienceTime.value == 1) return 'mês'
      else return 'meses'
    }

    else {
      if (experienceTime.value == 1) return 'ano'
      else return 'anos'
    }
  })

  return {
    experienceTime,
    experienceLabel,
  }
}

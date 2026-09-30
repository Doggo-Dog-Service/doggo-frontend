<script setup>
import { computed } from 'vue'

import TimeSlotButton from '@/components/calendar/TimeSlotButton.vue'
import { groupSlotsByPeriod } from '@/utils/time'

const props = defineProps({
  slots: {
    type: Array,
    default: () => [],
  },
  hasDate: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const selectedTime = defineModel({ type: String, default: null })

const periods = computed(() => groupSlotsByPeriod(props.slots))
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-lg font-bold">Horários disponíveis</h2>

    <p v-if="!props.hasDate" class="text-doggo-black/50 text-sm">
      Selecione uma data para ver os horários disponíveis
    </p>

    <div v-else-if="props.loading" class="flex justify-center py-6">
      <div class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"></div>
    </div>

    <p v-else-if="props.error" class="text-red-700 text-sm font-semibold">
      {{ props.error }}
    </p>

    <p v-else-if="periods.length === 0" class="text-doggo-black/50 text-sm">
      Não há horários disponíveis para este dia. Escolha outra data.
    </p>

    <div v-else class="flex flex-col gap-4">
      <div v-for="period in periods" :key="period.label" class="flex flex-col gap-2">
        <p class="text-sm text-doggo-black/50 font-semibold">{{ period.label }}</p>
        <div class="flex flex-wrap gap-2">
          <TimeSlotButton
            v-for="slot in period.slots"
            :key="slot"
            :time="slot"
            :selected="selectedTime === slot"
            @select="selectedTime = slot"
          />
        </div>
      </div>
    </div>
  </section>
</template>

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
    <h2 class="text-subtitle text-fg">Horários disponíveis</h2>

    <p v-if="!props.hasDate" class="text-caption text-fg-muted">
      Selecione uma data para ver os horários disponíveis
    </p>

    <div v-else-if="props.loading" role="status" aria-label="Carregando" class="flex flex-wrap gap-2">
      <div v-for="n in 6" :key="n" class="h-11 w-20 animate-pulse rounded-control bg-surface-muted"></div>
    </div>

    <p v-else-if="props.error" role="alert" class="text-caption font-semibold text-danger">
      {{ props.error }}
    </p>

    <p v-else-if="periods.length === 0" class="text-caption text-fg-muted">
      Não há horários disponíveis para este dia. Escolha outra data.
    </p>

    <div v-else class="flex flex-col gap-4">
      <div v-for="period in periods" :key="period.label" class="flex flex-col gap-2">
        <p class="text-caption font-semibold text-fg-muted">{{ period.label }}</p>
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
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
